import { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { router } from "expo-router";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../src/utils/haptics";

const { width } = Dimensions.get("window");
const COMPASS_SIZE = width * 0.75;
const RING_SIZE = COMPASS_SIZE + 40;

function calculateQibla(lat: number, lng: number): number {
  const meccaLat = (21.4225 * Math.PI) / 180;
  const meccaLng = (39.8262 * Math.PI) / 180;
  const userLat = (lat * Math.PI) / 180;
  const userLng = (lng * Math.PI) / 180;
  const y = Math.sin(meccaLng - userLng);
  const x = Math.cos(userLat) * Math.tan(meccaLat) - Math.sin(userLat) * Math.cos(meccaLng - userLng);
  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

function getDirectionLabel(deg: number): string {
  const dirs = ["Kuzey", "Kuzeydoğu", "Doğu", "Güneydoğu", "Güney", "Güneybatı", "Batı", "Kuzeybatı"];
  return dirs[Math.round(deg / 45) % 8];
}

export default function QiblaScreen() {
  const insets = useSafeAreaInsets();
  const [heading, setHeading] = useState(0);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const compassRotation = useSharedValue(0);
  const wasAlignedRef = useRef(false);

  const [permError, setPermError] = useState("");

  useEffect(() => {
    let headingSub: Location.LocationSubscription | null = null;

    (async () => {
      // İzin kontrolü
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermError("Kıble yönünü belirlemek için konum izni gereklidir. Ayarlar > Ümmet > Konum");
        return;
      }

      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          const a = calculateQibla(lastKnown.coords.latitude, lastKnown.coords.longitude);
          setQiblaAngle(a);
          setReady(true);
        }

        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          .then((loc) => {
            const a = calculateQibla(loc.coords.latitude, loc.coords.longitude);
            setQiblaAngle(a);
            setReady(true);
          })
          .catch(() => {});

        headingSub = await Location.watchHeadingAsync((data) => {
          const h = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          setHeading(h);
          compassRotation.value = withSpring(-h, { damping: 20, stiffness: 90 });
        });
      } catch {
        setPermError("Konum veya pusula erişiminde hata oluştu.");
      }
    })();

    return () => headingSub?.remove();
  }, []);

  const qiblaRelative = qiblaAngle !== null ? ((qiblaAngle - heading + 360) % 360) : 0;
  const angleDiff = qiblaRelative > 180 ? 360 - qiblaRelative : qiblaRelative;
  const isAligned = qiblaAngle !== null && angleDiff < 8;

  useEffect(() => {
    if (isAligned && !wasAlignedRef.current) {
      hapticNotification(NotificationFeedbackType.Success);
    }
    wasAlignedRef.current = isAligned;
  }, [isAligned]);

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));

  const accent = isAligned ? "#40C057" : "#D4AF37";

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      {/* Üst bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#D4AF37" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Kıble Pusulası</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Ana içerik */}
      <View style={styles.content}>
        {/* Durum mesajı */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: accent }]} />
          <Text style={[styles.statusText, { color: accent }]}>
            {!ready
              ? "Konum alınıyor..."
              : isAligned
              ? "Kıble yönündesiniz"
              : angleDiff < 15
              ? "Neredeyse! Biraz daha dönün"
              : "Telefonu Kıble yönüne çevirin"}
          </Text>
        </View>

        {/* Derece göstergesi */}
        <Text style={[styles.bigDegree, { color: accent }]}>
          {Math.round(angleDiff)}°
        </Text>

        {/* Pusula bölgesi */}
        <View style={styles.compassArea}>
          {/* Telefonun baktığı yönü gösteren sabit gösterge */}
          <View style={styles.fixedIndicator}>
            <View style={[styles.indicatorTriangle, { borderBottomColor: accent }]} />
          </View>

          {/* Dış dekoratif halka — sabit */}
          <View style={[styles.outerDecoRing, { borderColor: `${accent}15` }]} />

          {/* Pusula gövdesi */}
          <Animated.View style={[styles.compassBody, compassStyle]}>
            {/* Ana çember */}
            <View style={[styles.mainCircle, { borderColor: `${accent}30` }]} />


            {/* Yön etiketleri */}
            {[
              { label: "K", deg: 0 },
              { label: "D", deg: 90 },
              { label: "G", deg: 180 },
              { label: "B", deg: 270 },
            ].map(({ label, deg }) => {
              const rad = ((deg - 90) * Math.PI) / 180;
              const r = COMPASS_SIZE / 2 - 30;
              return (
                <Text
                  key={label}
                  style={{
                    position: "absolute",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: "600",
                    fontSize: 14,
                    left: COMPASS_SIZE / 2 + Math.cos(rad) * r - 7,
                    top: COMPASS_SIZE / 2 + Math.sin(rad) * r - 9,
                  }}
                >
                  {label}
                </Text>
              );
            })}

            {/* Kıble yönü işareti */}
            {qiblaAngle !== null && (
              <View
                style={{
                  position: "absolute",
                  left: COMPASS_SIZE / 2 - 20,
                  top: COMPASS_SIZE / 2 - 20,
                  width: 40,
                  height: 40,
                  transform: [{ rotate: `${qiblaAngle}deg` }, { translateY: -(COMPASS_SIZE / 2 - 12) }],
                }}
              >
                <LinearGradient
                  colors={isAligned ? ["#40C057", "#2B8A3E"] : ["#D4AF37", "#AA8A20"]}
                  style={styles.qiblaIcon}
                >
                  <MaterialCommunityIcons name="mosque" size={18} color="#FFF" />
                </LinearGradient>
              </View>
            )}
          </Animated.View>

          {/* Merkez noktası — sabit */}
          <View style={styles.centerPoint}>
            <View style={[styles.centerInner, { backgroundColor: accent }]} />
          </View>
        </View>

        {/* Alt bilgi kutuları */}
        <View style={styles.infoBoxes}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>YÖNÜNÜZ</Text>
            <Text style={styles.infoVal}>{Math.round(heading)}°</Text>
            <Text style={styles.infoSub}>{getDirectionLabel(heading)}</Text>
          </View>

          <View style={[styles.infoBox, styles.infoBoxCenter, { borderColor: `${accent}25` }]}>
            <Text style={[styles.infoLabel, { color: accent }]}>KIBLE</Text>
            <Text style={[styles.infoVal, { color: accent }]}>
              {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : "..."}
            </Text>
            <Text style={[styles.infoSub, { color: accent }]}>
              {qiblaAngle !== null ? getDirectionLabel(qiblaAngle) : ""}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>FARK</Text>
            <Text style={[styles.infoVal, { color: isAligned ? "#40C057" : "#FFFFFF" }]}>
              {Math.round(angleDiff)}°
            </Text>
            <Text style={styles.infoSub}>
              {isAligned ? "Hizalı" : angleDiff < 45 ? "Yakın" : "Uzak"}
            </Text>
          </View>
        </View>
      </View>

      {/* Alt not */}
      <View style={[styles.bottomNote, { paddingBottom: insets.bottom + 12 }]}>
        <MaterialCommunityIcons name="information-outline" size={14} color="#6B7280" />
        <Text style={styles.noteText}>
          Telefonu yere paralel tutun ve metal nesnelerden uzak durun
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0E17" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: { fontSize: 15, fontWeight: "600" },
  bigDegree: {
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -3,
    marginBottom: 20,
  },
  compassArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  fixedIndicator: {
    position: "absolute",
    top: -2,
    zIndex: 10,
    alignItems: "center",
  },
  indicatorTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  outerDecoRing: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1,
  },
  compassBody: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  mainCircle: {
    position: "absolute",
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
  },
  qiblaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  centerPoint: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0A0E17",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.15)",
  },
  centerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  infoBoxes: {
    flexDirection: "row",
    marginTop: 28,
    paddingHorizontal: 20,
    gap: 10,
  },
  infoBox: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: "rgba(10,24,18,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  infoBoxCenter: {
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  infoLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoVal: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  infoSub: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  bottomNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingTop: 8,
  },
  noteText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
});

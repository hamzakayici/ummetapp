import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import {
  fetchPrayerTimes,
  requestLocationPermission,
  getNextPrayerIndex,
  getTimeRemaining,
  getCachedPrayerTimes,
  cacheLocationName,
  getCachedLocationName,
  type PrayerTimeEntry,
} from "../../src/services/prayerTimes";
import { playEzan, stopEzan, isEzanPlaying } from "../../src/services/audioService";
import { scheduleAllNotifications, sendImmediateNotifications } from "../../src/services/ezanNotification";
import { useSettingsStore, useWeeklyStore } from "../../src/stores/appStore";
import { getDailyVerse } from "../../src/data/dailyVerses";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateWidgetData } from "../../src/services/widgetService";
import { toHijri } from "../../src/utils/hijriCalendar";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../../src/utils/haptics";
import SunArcCard from "../../src/components/SunArcCard";

const { width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 85 : 65;

type MoodType = {
  id: string;
  label: string;
  icon: string;
  color: string;
  message: string;
};

const MOODS: MoodType[] = [
  { id: "huzursuz", label: "Huzursuz", icon: "weather-windy", color: "#64748B", 
    message: "Allah şöyle buyurur: 'Kalpler ancak Allah'ı anmakla huzur bulur.' (Ra'd, 28). Biraz zikir çekmek sana iyi gelebilir." },
  { id: "stresli", label: "Stresli", icon: "weather-lightning", color: "#F43F5E",
    message: "Peygamberimiz (sav) sıkıntılı anlarında şöyle dua ederdi: 'Yâ Hayyü yâ Kayyûm! Rahmetinle yardımını dilerim.' (Tirmizî)" },
  { id: "sukur", label: "Şükür Dolu", icon: "weather-sunny", color: "#40C057",
    message: "'Eğer şükrederseniz, size olan nimetimi elbette artırırım...' (İbrahim, 7). Elhamdülillah demeyi unutma." },
  { id: "kederli", label: "Üzgün", icon: "water", color: "#3B82F6",
    message: "'Gevşemeyin, hüzünlenmeyin. Eğer gerçekten inanıyorsanız üstün gelecek olan sizsiniz.' (Âl-i İmran, 139)" },
  { id: "yalniz", label: "Yalnız", icon: "account-question", color: "#8B5CF6",
    message: "'Kullarım sana beni sorduklarında bilsinler ki şüphesiz ben onlara çok yakınım...' (Bakara, 186)" },
];

// ─── Quick Action Tanımları ────────────────
const QUICK_ACTIONS: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  color: string;
  bg: string;
  label: string;
  route: string;
  params?: Record<string, string>;
}[] = [
  { icon: "compass-outline", color: "#40C057", bg: "rgba(27,67,50,0.35)", label: "Kıble", route: "/qibla" },
  { icon: "hands-pray", color: "#D4AF37", bg: "rgba(212,175,55,0.12)", label: "Dualar", route: "/duas" },
  { icon: "calendar-month", color: "#A78BFA", bg: "rgba(167,139,250,0.12)", label: "Takvim", route: "/hijri-calendar" },
  { icon: "moon-new", color: "#F0D060", bg: "rgba(240,208,96,0.12)", label: "Ramazan", route: "/ramazan-hub" },
  { icon: "calculator-variant", color: "#22D3EE", bg: "rgba(34,211,238,0.1)", label: "Hesapla", route: "/calculator", params: { type: "zekat" } },
  { icon: "book-open-page-variant", color: "#E8A87C", bg: "rgba(232,168,124,0.12)", label: "Delâil", route: "/delailul-hayrat" },

];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [prayers, setPrayers] = useState<PrayerTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Konum alınıyor...");
  const [, setTick] = useState(0);
  const pulseValue = useSharedValue(1);
  const ezanCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeEzanPrayer, setActiveEzanPrayer] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const weeklyStore = useWeeklyStore();

  // Günün Ayeti
  const verse = getDailyVerse();
  const hijri = toHijri();

  useEffect(() => {
    loadPrayerTimes();

    const timer = setInterval(() => setTick((t) => t + 1), 30000);

    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    return () => {
      clearInterval(timer);
      if (ezanCheckRef.current) clearInterval(ezanCheckRef.current);
    };
  }, []);

  async function loadPrayerTimes() {
    try {
      const cached = await getCachedPrayerTimes();
      const cachedLoc = await getCachedLocationName();
      if (cached && cached.prayers.length > 0) {
        setPrayers(cached.prayers);
        setLoading(false);
        if (cachedLoc) setLocationName(cachedLoc);
      }

      const location = await requestLocationPermission();
      if (!location) {
        if (!cached) setLocationName("Konum izni verilmedi");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = location.coords;
      const altitude = location.coords.altitude ?? 0;

      fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`
      )
        .then((r) => r.json())
        .then((geoData) => {
          const city = geoData.city || geoData.locality || "";
          const country = geoData.countryName || "";
          const name = city ? `${city}, ${country}` : country;
          setLocationName(name);
          cacheLocationName(name);
        })
        .catch(() => {});

      const { calculationMethod } = useSettingsStore.getState();
      const data = await fetchPrayerTimes(latitude, longitude, altitude, calculationMethod);
      setPrayers(data);
      setLoading(false);

      // Koordinatları cache'le (SunArcCard önceki/sonraki gün için kullanır)
      AsyncStorage.setItem("@ummet_prayer_coords", JSON.stringify({ lat: latitude, lon: longitude })).catch(() => {});

      const { notificationsEnabled } = useSettingsStore.getState();
      await scheduleAllNotifications(latitude, longitude, data, notificationsEnabled);

      const firstRunKey = "@ummet_notif_first_run";
      const hasRun = await AsyncStorage.getItem(firstRunKey);
      if (!hasRun) {
        await sendImmediateNotifications(data);
        await AsyncStorage.setItem(firstRunKey, "true");
      }

      updateWidgetData(data);
    } catch {
      setLocationName("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const nextPrayer = prayers.length > 0 ? getNextPrayerIndex(prayers) : 0;

  const handlePlayEzan = async (prayerKey: string) => {
    hapticImpact(ImpactFeedbackStyle.Medium);
    if (activeEzanPrayer === prayerKey) {
      await stopEzan();
      setActiveEzanPrayer(null);
    } else {
      await stopEzan();
      setActiveEzanPrayer(prayerKey);
      await playEzan(prayerKey);
      if (ezanCheckRef.current) clearInterval(ezanCheckRef.current);
      ezanCheckRef.current = setInterval(() => {
        if (!isEzanPlaying()) {
          setActiveEzanPrayer(null);
          if (ezanCheckRef.current) { clearInterval(ezanCheckRef.current); ezanCheckRef.current = null; }
        }
      }, 1000);
    }
  };

  // Haftalık tracker — gerçek veri
  const trackerDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const today = new Date();
  const todayIdx = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const trackerData = trackerDays.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (todayIdx - i));
    const key = d.toISOString().split("T")[0];
    return weeklyStore.trackedDays?.[key] || false;
  });
  const completedCount = trackerData.filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}
      >
        {/* ═══ HEADER + HERO ═══ */}
        <LinearGradient
          colors={["#1B4332", "#0F1A14", "#0A0E17"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingTop: insets.top + 8, paddingBottom: 16 }}
        >
          {/* Top Bar */}
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {prayers.length > 0 && (
                  <>
                    <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(212,175,55,0.12)", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                      <MaterialCommunityIcons name={prayers[nextPrayer].iconName as any} size={20} color="#D4AF37" />
                    </View>
                    <View>
                      <Text style={{ color: "#D4AF37", fontSize: 11, fontWeight: "600" }}>Sonraki Vakit</Text>
                      <Text style={{ color: "#ECDFCC", fontSize: 18, fontWeight: "800" }}>{prayers[nextPrayer].nameTr}</Text>
                    </View>
                  </>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(27,67,50,0.3)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                  <Ionicons name="location-sharp" size={11} color="#D4AF37" />
                  <Text style={{ color: "#8A9BA8", fontSize: 11, marginLeft: 4, maxWidth: 110 }} numberOfLines={1}>{locationName}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <MaterialCommunityIcons name="moon-waning-crescent" size={11} color="#A78BFA" />
                  <Text style={{ color: "#A78BFA", fontSize: 10, marginLeft: 3, fontWeight: "500" }}>{hijri.formatted}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Next Prayer Hero — Sun Arc */}
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <ActivityIndicator size="large" color="#D4AF37" />
              <Text style={{ color: "#8A9BA8", fontSize: 13, marginTop: 10 }}>Namaz vakitleri yükleniyor...</Text>
            </View>
          ) : prayers.length > 0 ? (
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <SunArcCard prayers={prayers} nextPrayer={nextPrayer} locationName={locationName} />
            </Animated.View>
          ) : null}
        </LinearGradient>

        {/* ═══ GÜNÜN AYETİ ═══ */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginHorizontal: 20, marginTop: 16 }}>
          <View style={{ padding: 16, borderRadius: 16, backgroundColor: "rgba(18,26,36,0.6)", borderWidth: 1, borderColor: "rgba(27,67,50,0.15)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <MaterialCommunityIcons name="book-open-variant" size={14} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "700", marginLeft: 6 }}>Günün Ayeti</Text>
              <View style={{ flex: 1 }} />
              <Text style={{ color: "#5A6B78", fontSize: 10 }}>{verse.surah} {verse.reference}</Text>
            </View>
            <Text style={{ color: "#ECDFCC", fontSize: 18, textAlign: "right", lineHeight: 30, fontFamily: "Amiri_400Regular" }}>
              {verse.arabic}
            </Text>
            <Text style={{ color: "#8A9BA8", fontSize: 12, marginTop: 8, lineHeight: 18, fontStyle: "italic" }}>
              "{verse.turkish}"
            </Text>
          </View>
        </Animated.View>




        {/* ═══ HAFTALIK TAKİP ═══ */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={{ marginHorizontal: 20, marginTop: 20 }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/streak" as any)}>
            <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, backgroundColor: "rgba(18,26,36,0.6)", borderWidth: 1, borderColor: "rgba(27,67,50,0.08)" }}>
              {/* Sol — Streak Bilgisi */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <MaterialCommunityIcons name="fire" size={16} color="#F97316" />
                  <Text style={{ color: "#ECDFCC", fontSize: 14, fontWeight: "700", marginLeft: 6 }}>Haftalık İbadet</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={{ color: "#F97316", fontSize: 13, fontWeight: "700" }}>{completedCount}/7</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {trackerDays.map((day, i) => (
                    <View key={day} style={{ flex: 1, alignItems: "center" }}>
                      <Text style={{ color: "#5A6B78", fontSize: 9, fontWeight: "600", marginBottom: 4 }}>{day}</Text>
                      <View style={{
                        width: 28, height: 28, borderRadius: 8,
                        alignItems: "center", justifyContent: "center",
                        borderWidth: i === todayIdx ? 1.5 : 0,
                        borderColor: i === todayIdx ? "#D4AF37" : "transparent",
                        backgroundColor: trackerData[i] ? "rgba(27,67,50,0.6)" : i < todayIdx ? "rgba(229,57,53,0.1)" : "rgba(18,26,36,0.4)",
                      }}>
                        <Ionicons
                          name={trackerData[i] ? "checkmark" : i <= todayIdx ? "close" : "ellipse-outline"}
                          size={13}
                          color={trackerData[i] ? "#40C057" : i < todayIdx ? "#E53935" : "#5A6B78"}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              {/* Sağ OK */}
              <Ionicons name="chevron-forward" size={18} color="#5A6B78" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ═══ NASIL HİSSEDİYORSUNUZ? ═══ */}
        <Animated.View entering={FadeInDown.delay(550).springify()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#ECDFCC", fontSize: 17, fontWeight: "700", paddingHorizontal: 20, marginBottom: 12 }}>
            Nasıl Hissediyorsunuz?
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {MOODS.map((m) => (
              <TouchableOpacity key={m.id} activeOpacity={0.7} onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); setSelectedMood(m); }}>
                <View style={{ alignItems: "center", paddingVertical: 14, paddingHorizontal: 18, borderRadius: 18, backgroundColor: "rgba(18,26,36,0.6)", borderWidth: 1, borderColor: `${m.color}30` }}>
                  <MaterialCommunityIcons name={m.icon as any} size={28} color={m.color} />
                  <Text style={{ color: "#ECDFCC", fontSize: 13, fontWeight: "600", marginTop: 8 }}>{m.label}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ═══ HIZLI ERİŞİM ═══ */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={{ marginTop: 20, paddingHorizontal: 20 }}>
          <Text style={{ color: "#ECDFCC", fontSize: 17, fontWeight: "700", marginBottom: 12 }}>Hızlı Erişim</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {QUICK_ACTIONS.map((action, i) => (
              <TouchableOpacity
                key={action.label}
                activeOpacity={0.7}
                onPress={() => router.push({ pathname: action.route as any, params: action.params })}
                style={{ width: (width - 40 - 20) / 3, alignItems: "center", paddingVertical: 16, borderRadius: 14, backgroundColor: "rgba(18,26,36,0.6)", borderWidth: 1, borderColor: "rgba(27,67,50,0.08)" }}
              >
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: action.bg, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={{ color: "#ECDFCC", fontSize: 11, fontWeight: "600" }}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

      </ScrollView>

      {/* MOOD MODAL OVERLAY */}
      {selectedMood && (
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            position: "absolute",
            bottom: 0, left: 0, right: 0, top: 0,
            backgroundColor: "rgba(10,14,23,0.9)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            zIndex: 100
          }}
        >
          <View style={{ backgroundColor: "#1B4332", padding: 24, borderRadius: 24, width: "100%", borderWidth: 1, borderColor: "rgba(212,175,55,0.3)", alignItems: "center" }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `${selectedMood.color}20`, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <MaterialCommunityIcons name={selectedMood.icon as any} size={36} color={selectedMood.color} />
            </View>
            <Text style={{ color: "#ECDFCC", fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 12 }}>{selectedMood.label}</Text>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, lineHeight: 26, textAlign: "center", fontStyle: "italic" }}>
              {selectedMood.message}
            </Text>
            
            <TouchableOpacity onPress={() => setSelectedMood(null)} activeOpacity={0.8} style={{ marginTop: 24, backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16 }}>
              <Text style={{ color: "#D4AF37", fontWeight: "700", fontSize: 16 }}>Teşekkürler, Kapatalım</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../src/utils/haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  fetchPrayerTimes,
  requestLocationPermission,
  type PrayerTimeEntry,
} from "../src/services/prayerTimes";
import { toHijri } from "../src/utils/hijriCalendar";

const { width } = Dimensions.get("window");
const STORAGE_KEY = "@ummet_ramazan_fasting";

// Ramazan duaları
const RAMAZAN_DUAS = [
  {
    title: "İftar Duası",
    arabic: "اللّٰهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ",
    turkish: "Allah'ım! Senin rızan için oruç tuttum, sana inandım ve senin rızkınla orucumu açtım.",
    icon: "food" as const,
  },
  {
    title: "Sahur Duası",
    arabic: "نَوَيْتُ أَنْ أَصُومَ غَدًا مِنْ شَهْرِ رَمَضَانَ",
    turkish: "Ramazan ayının yarınki gününde oruç tutmaya niyet ettim.",
    icon: "weather-night" as const,
  },
  {
    title: "Kadir Gecesi Duası",
    arabic: "اللّٰهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    turkish: "Allah'ım! Sen affedicisin, affetmeyi seversin, beni de affet.",
    icon: "star-crescent" as const,
  },
];

export default function RamazanHubScreen() {
  const insets = useSafeAreaInsets();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeEntry[]>([]);
  const [fastingDays, setFastingDays] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(new Date());
  const hijri = useMemo(() => toHijri(), []);
  const isRamazan = hijri.month === 9;

  // Ramazan geri sayımı veya kaçıncı gün
  const ramazanInfo = useMemo(() => {
    if (isRamazan) {
      return { status: "active", day: hijri.day, remaining: 30 - hijri.day };
    }
    // Ramazan'a kaç gün kaldığını tahmin et
    const monthsToRamazan = hijri.month < 9 ? 9 - hijri.month : 9 + 12 - hijri.month;
    const daysApprox = Math.round(monthsToRamazan * 29.5 - hijri.day);
    return { status: "upcoming", day: 0, remaining: daysApprox };
  }, [hijri]);

  // Namaz vakitlerini al
  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      if (!granted) return;
      const loc = await import("expo-location").then((m) => m.getLastKnownPositionAsync());
      if (loc) {
        const { useSettingsStore } = await import("../src/stores/appStore");
        const { calculationMethod } = useSettingsStore.getState();
        const times = await fetchPrayerTimes(loc.coords.latitude, loc.coords.longitude, loc.coords.altitude || 0, calculationMethod);
        if (times) setPrayerTimes(times);
      }
    })();
  }, []);

  // Oruç takip verilerini yükle
  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) setFastingDays(parsed);
        }
      } catch {}
    })();
  }, []);

  // Saat güncelle
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // İftar ve Sahur vakitleri
  const iftarTime = useMemo(() => {
    const maghrib = prayerTimes.find((p) => p.name === "Maghrib");
    return maghrib?.time || "--:--";
  }, [prayerTimes]);

  const sahurTime = useMemo(() => {
    const fajr = prayerTimes.find((p) => p.name === "Fajr");
    return fajr?.time || "--:--";
  }, [prayerTimes]);

  // İftar geri sayımı
  const iftarCountdown = useMemo(() => {
    const maghrib = prayerTimes.find((p) => p.name === "Maghrib");
    if (!maghrib) return null;
    const [h, m] = maghrib.time.split(":").map(Number);
    const target = new Date(now);
    target.setHours(h, m, 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, mins };
  }, [prayerTimes, now]);

  // Bugün oruç tutuldu mu
  const todayKey = now.toISOString().split("T")[0];
  const todayFasted = fastingDays[todayKey] || false;
  const totalFasted = Object.values(fastingDays).filter(Boolean).length;

  const toggleFasting = useCallback(async () => {
    hapticImpact(ImpactFeedbackStyle.Medium);
    const updated = { ...fastingDays, [todayKey]: !todayFasted };
    setFastingDays(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [fastingDays, todayKey, todayFasted]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      {/* Header */}
      <LinearGradient
        colors={["#5C3410", "#0A0E17"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 18, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#F0D060" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>
              Ramazan Hub
            </Text>
            <Text style={{ color: "rgba(240,208,96,0.6)", fontSize: 13, marginTop: 2 }}>
              {isRamazan
                ? `Ramazan ${ramazanInfo.day}. gün — ${ramazanInfo.remaining} gün kaldı`
                : `Ramazan'a ${ramazanInfo.remaining} gün`}
            </Text>
          </View>
          <MaterialCommunityIcons name="moon-waning-crescent" size={28} color="#F0D060" />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* İftar & Sahur Hero */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={{ marginHorizontal: 16, marginTop: 14, flexDirection: "row", gap: 10 }}>
            {/* İftar kartı */}
            <View style={{ flex: 1 }}>
              <LinearGradient
                colors={["rgba(240,208,96,0.15)", "rgba(10,24,18,0.7)"]}
                style={{
                  padding: 18,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(240,208,96,0.15)",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons name="weather-sunset-down" size={28} color="#F0D060" />
                <Text style={{ color: "#F0D060", fontSize: 12, fontWeight: "600", marginTop: 8, letterSpacing: 1 }}>
                  İFTAR
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800", marginTop: 4 }}>
                  {iftarTime}
                </Text>
                {iftarCountdown && (
                  <Text style={{ color: "rgba(240,208,96,0.6)", fontSize: 12, marginTop: 4 }}>
                    {iftarCountdown.hours}s {iftarCountdown.mins}dk kaldı
                  </Text>
                )}
              </LinearGradient>
            </View>

            {/* Sahur kartı */}
            <View style={{ flex: 1 }}>
              <LinearGradient
                colors={["rgba(167,139,250,0.12)", "rgba(10,24,18,0.7)"]}
                style={{
                  padding: 18,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(167,139,250,0.1)",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons name="weather-night" size={28} color="#A78BFA" />
                <Text style={{ color: "#A78BFA", fontSize: 12, fontWeight: "600", marginTop: 8, letterSpacing: 1 }}>
                  SAHUR
                </Text>
                <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800", marginTop: 4 }}>
                  {sahurTime}
                </Text>
                <Text style={{ color: "rgba(167,139,250,0.5)", fontSize: 12, marginTop: 4 }}>
                  İmsak vakti
                </Text>
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Oruç takibi */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 14,
              padding: 18,
              borderRadius: 16,
              backgroundColor: "rgba(10,24,18,0.8)",
              borderWidth: 1,
              borderColor: "rgba(240,208,96,0.08)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>Oruç Takibi</Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
                  {totalFasted} / 30 gün oruç tutuldu
                </Text>
              </View>
              <TouchableOpacity onPress={toggleFasting} activeOpacity={0.7}>
                <LinearGradient
                  colors={todayFasted ? ["#2D6A4F", "#1B4332"] : ["#744210", "#5C3410"]}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    borderRadius: 14,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name={todayFasted ? "checkmark-circle" : "add-circle-outline"}
                    size={18}
                    color={todayFasted ? "#40C057" : "#F0D060"}
                  />
                  <Text
                    style={{
                      color: todayFasted ? "#40C057" : "#F0D060",
                      fontSize: 14,
                      fontWeight: "700",
                      marginLeft: 6,
                    }}
                  >
                    {todayFasted ? "Tutuldu" : "Tuttum"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* 30 gün progress */}
            <View style={{ marginTop: 14 }}>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.08)" }}>
                <LinearGradient
                  colors={["#F0D060", "#40C057"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 8,
                    borderRadius: 4,
                    width: `${Math.min((totalFasted / 30) * 100, 100)}%`,
                  }}
                />
              </View>
              <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 4, textAlign: "right" }}>
                %{Math.round((totalFasted / 30) * 100)} tamamlandı
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Günlük vakitler */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginHorizontal: 16, marginTop: 18, marginBottom: 10 }}>
            Günlük Vakitler
          </Text>
          {prayerTimes.length > 0 ? (
            <View style={{ marginHorizontal: 16 }}>
              {prayerTimes.map((prayer, idx) => {
                const turkishNames: Record<string, string> = {
                  Fajr: "İmsak",
                  Sunrise: "Güneş",
                  Dhuhr: "Öğle",
                  Asr: "İkindi",
                  Maghrib: "Akşam (İftar)",
                  Isha: "Yatsı",
                };
                const name = turkishNames[prayer.name] || prayer.name;
                const isIftar = prayer.name === "Maghrib";
                const isSahur = prayer.name === "Fajr";

                return (
                  <View
                    key={prayer.name}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderBottomWidth: idx < prayerTimes.length - 1 ? 1 : 0,
                      borderBottomColor: "rgba(27,67,50,0.1)",
                      backgroundColor: isIftar
                        ? "rgba(240,208,96,0.06)"
                        : isSahur
                        ? "rgba(167,139,250,0.06)"
                        : "transparent",
                      borderRadius: isIftar || isSahur ? 10 : 0,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MaterialCommunityIcons
                        name={prayer.iconName as any}
                        size={18}
                        color={isIftar ? "#F0D060" : isSahur ? "#A78BFA" : "rgba(255,255,255,0.6)"}
                      />
                      <Text
                        style={{
                          color: isIftar ? "#F0D060" : isSahur ? "#A78BFA" : "rgba(255,255,255,0.6)",
                          fontSize: 15,
                          fontWeight: isIftar || isSahur ? "700" : "500",
                          marginLeft: 10,
                        }}
                      >
                        {name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: isIftar ? "#F0D060" : isSahur ? "#A78BFA" : "#FFFFFF",
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      {prayer.time}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ marginHorizontal: 16, padding: 20, borderRadius: 14, backgroundColor: "rgba(10,24,18,0.7)", alignItems: "center" }}>
              <Text style={{ color: "#6B7280", fontSize: 14 }}>Vakitler yükleniyor...</Text>
            </View>
          )}
        </Animated.View>

        {/* Ramazan Duaları */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginHorizontal: 16, marginTop: 18, marginBottom: 10 }}>
            Ramazan Duaları
          </Text>
          {RAMAZAN_DUAS.map((dua, idx) => (
            <View
              key={idx}
              style={{
                marginHorizontal: 16,
                marginBottom: 10,
                padding: 16,
                borderRadius: 16,
                backgroundColor: "rgba(10,24,18,0.8)",
                borderWidth: 1,
                borderColor: "rgba(240,208,96,0.06)",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(240,208,96,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons name={dua.icon} size={18} color="#F0D060" />
                </View>
                <Text style={{ color: "#F0D060", fontSize: 16, fontWeight: "700", marginLeft: 10 }}>
                  {dua.title}
                </Text>
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 20,
                  textAlign: "right",
                  lineHeight: 34,
                  marginBottom: 8,
                }}
              >
                {dua.arabic}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 22 }}>{dua.turkish}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Ramazan bilgileri */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 8,
              padding: 16,
              borderRadius: 16,
              backgroundColor: "rgba(10,24,18,0.7)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <MaterialCommunityIcons name="lightbulb-outline" size={18} color="#F0D060" />
              <Text style={{ color: "#F0D060", fontSize: 15, fontWeight: "700", marginLeft: 8 }}>
                Ramazan Bilgileri
              </Text>
            </View>
            {[
              "Sahura kalkmak sünnettir, geç sahur yapmak müstehaptır",
              "İftar vaktinde acele etmek sünnettir",
              "Ramazan'da Kuran okumak çok faziletlidir",
              "Teravih namazı 20 rekattır (8 rekat da kılınabilir)",
              "Son 10 gün itikaf sünnettir",
            ].map((info, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 6 }}>
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#F0D060", marginTop: 7, marginRight: 10 }} />
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 22, flex: 1 }}>{info}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

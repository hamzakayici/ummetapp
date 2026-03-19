import { useMemo, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useWeeklyStore } from "../src/stores/appStore";

// ViewShot — native modül yoksa null döner
let ViewShot: any = null;
try {
  ViewShot = require("react-native-view-shot").default;
} catch {}

export default function StreakScreen() {
  const insets = useSafeAreaInsets();
  const weeklyStore = useWeeklyStore();
  const viewShotRef = useRef<any>(null);

  const shareStreak = async () => {
    try {
      if (!ViewShot) {
        Alert.alert("Paylaşım", "Bu özellik production build'de aktif olacaktır.");
        return;
      }
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        try {
          const Sharing = await import("expo-sharing");
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              mimeType: "image/png",
              dialogTitle: "Başarımı Paylaş",
              UTI: "public.png",
            });
          } else {
            Alert.alert("Paylaşım", "Bu cihazda paylaşım desteklenmiyor.");
          }
        } catch {
          Alert.alert("Paylaşım", "Paylaşım özelliği production build'de aktif olacaktır.");
        }
      }
    } catch {
      Alert.alert("Hata", "Ekran görüntüsü alınamadı.");
    }
  };

  // Son 42 gün (6 hafta)
  const calendarDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 41; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days.push({ key, date: d, done: weeklyStore.trackedDays?.[key] || false });
    }
    return days;
  }, [weeklyStore.trackedDays]);

  // Mevcut streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (weeklyStore.trackedDays?.[key]) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [weeklyStore.trackedDays]);

  // En uzun streak
  const longestStreak = useMemo(() => {
    const tracked = weeklyStore.trackedDays || {};
    const keys = Object.keys(tracked).filter((k) => tracked[k]).sort();
    if (keys.length === 0) return 0;
    let max = 1;
    let current = 1;
    for (let i = 1; i < keys.length; i++) {
      const prev = new Date(keys[i - 1]);
      const curr = new Date(keys[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 1;
      }
    }
    return max;
  }, [weeklyStore.trackedDays]);

  const totalDays = Object.values(weeklyStore.trackedDays || {}).filter(Boolean).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#5C2D10", "#0A0E17"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 18, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#F97316" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>Streak Takibi</Text>
            <Text style={{ color: "rgba(249,115,22,0.6)", fontSize: 13, marginTop: 2 }}>Ardışık gün sayacınız</Text>
          </View>
          <MaterialCommunityIcons name="fire" size={32} color="#F97316" />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Streak Hero */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          {ViewShot ? (
            <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: "#0A0E17", marginHorizontal: 16, marginTop: 14, borderRadius: 20 }}>
              <LinearGradient
                colors={["rgba(249,115,22,0.15)", "rgba(10,24,18,0.8)"]}
                style={{ padding: 24, borderRadius: 20, alignItems: "center", width: "100%", borderWidth: 1, borderColor: "rgba(249,115,22,0.15)" }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
                  <MaterialCommunityIcons name="fire" size={48} color="#F97316" />
                  <View style={{ backgroundColor: "rgba(249,115,22,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: "#F97316", fontSize: 10, fontWeight: "700" }}>IslamicApp</Text>
                  </View>
                </View>
                <Text style={{ color: "#FFFFFF", fontSize: 56, fontWeight: "800", marginTop: -10, letterSpacing: -2 }}>{currentStreak}</Text>
                <Text style={{ color: "#F97316", fontSize: 16, fontWeight: "700" }}>Günlük Streak</Text>
                <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
                  {currentStreak === 0 ? "Bugün başlayın!" : `${currentStreak} gün ardışık ibadet`}
                </Text>
              </LinearGradient>
            </ViewShot>
          ) : (
            <View style={{ backgroundColor: "#0A0E17", marginHorizontal: 16, marginTop: 14, borderRadius: 20 }}>
              <LinearGradient
                colors={["rgba(249,115,22,0.15)", "rgba(10,24,18,0.8)"]}
                style={{ padding: 24, borderRadius: 20, alignItems: "center", width: "100%", borderWidth: 1, borderColor: "rgba(249,115,22,0.15)" }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
                  <MaterialCommunityIcons name="fire" size={48} color="#F97316" />
                  <View style={{ backgroundColor: "rgba(249,115,22,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: "#F97316", fontSize: 10, fontWeight: "700" }}>IslamicApp</Text>
                  </View>
                </View>
                <Text style={{ color: "#FFFFFF", fontSize: 56, fontWeight: "800", marginTop: -10, letterSpacing: -2 }}>{currentStreak}</Text>
                <Text style={{ color: "#F97316", fontSize: 16, fontWeight: "700" }}>Günlük Streak</Text>
                <Text style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
                  {currentStreak === 0 ? "Bugün başlayın!" : `${currentStreak} gün ardışık ibadet`}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Share Button */}
          <View style={{ marginHorizontal: 16, marginTop: 12 }}>
            <TouchableOpacity onPress={shareStreak} activeOpacity={0.8}>
               <View style={{ backgroundColor: "rgba(249,115,22,0.15)", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(249,115,22,0.3)" }}>
                 <Ionicons name="share-social" size={20} color="#F97316" />
                 <Text style={{ color: "#F97316", fontSize: 15, fontWeight: "700", marginLeft: 8 }}>Hikayede Paylaş</Text>
               </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stat kartları */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={{ flexDirection: "row", marginHorizontal: 16, marginTop: 10, gap: 10 }}>
            <View style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "rgba(10,24,18,0.8)", alignItems: "center" }}>
              <MaterialCommunityIcons name="trophy" size={22} color="#EAB308" />
              <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginTop: 6 }}>{longestStreak}</Text>
              <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "600" }}>En Uzun</Text>
            </View>
            <View style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "rgba(10,24,18,0.8)", alignItems: "center" }}>
              <MaterialCommunityIcons name="calendar-check" size={22} color="#10B981" />
              <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginTop: 6 }}>{totalDays}</Text>
              <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "600" }}>Toplam Gün</Text>
            </View>
            <View style={{ flex: 1, padding: 16, borderRadius: 14, backgroundColor: "rgba(10,24,18,0.8)", alignItems: "center" }}>
              <MaterialCommunityIcons name="percent" size={22} color="#3B82F6" />
              <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "800", marginTop: 6 }}>{calendarDays.length > 0 ? Math.round((calendarDays.filter((d) => d.done).length / calendarDays.length) * 100) : 0}</Text>
              <Text style={{ color: "#6B7280", fontSize: 12, fontWeight: "600" }}>6 Hafta %</Text>
            </View>
          </View>
        </Animated.View>

        {/* Takvim */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginHorizontal: 16, marginTop: 18, marginBottom: 10 }}>
            Son 6 Hafta
          </Text>
          <View style={{ marginHorizontal: 16, padding: 16, borderRadius: 16, backgroundColor: "rgba(10,24,18,0.8)", borderWidth: 1, borderColor: "rgba(249,115,22,0.06)" }}>
            {/* Gün başlıkları */}
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 8 }}>
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                <Text key={d} style={{ color: "#6B7280", fontSize: 10, fontWeight: "600", width: 30, textAlign: "center" }}>{d}</Text>
              ))}
            </View>
            {/* Hücreler */}
            {Array.from({ length: 6 }).map((_, week) => (
              <View key={week} style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 4 }}>
                {Array.from({ length: 7 }).map((_, day) => {
                  const idx = week * 7 + day;
                  const item = calendarDays[idx];
                  if (!item) return <View key={day} style={{ width: 30, height: 30 }} />;
                  return (
                    <View
                      key={day}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        backgroundColor: item.done ? "#F97316" : "rgba(255,255,255,0.06)",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: item.done ? 1 : 0.3,
                      }}
                    >
                      <Text style={{ color: item.done ? "#FFF" : "#6B7280", fontSize: 10, fontWeight: "700" }}>
                        {item.date.getDate()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

import { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useKazaStore, useWeeklyStore } from "../src/stores/appStore";

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const kazaStore = useKazaStore();
  const weeklyStore = useWeeklyStore();

  // Haftalık namaz verisi
  const weekDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
      days.push({ key, label: dayNames[d.getDay()], done: weeklyStore.trackedDays?.[key] || false });
    }
    return days;
  }, [weeklyStore.trackedDays]);

  const weeklyCompleted = weekDays.filter((d) => d.done).length;

  // Toplam kaza
  const totalKazaOwed = Object.values(kazaStore.prayers || {}).reduce(
    (sum, p: any) => sum + ((p?.total || 0) - (p?.completed || 0)),
    0
  );
  const totalKazaDone = Object.values(kazaStore.prayers || {}).reduce(
    (sum, p: any) => sum + (p?.completed || 0),
    0
  );

  const stats = [
    { label: "Haftalık Namaz", value: `${weeklyCompleted}/7`, icon: "calendar-check" as const, color: "#40C057", sublabel: "gün tamamlandı" },
    { label: "Kaza Kılınan", value: `${totalKazaDone}`, icon: "check-circle-outline" as const, color: "#D4AF37", sublabel: "toplam namaz" },
    { label: "Kaza Kalan", value: `${totalKazaOwed}`, icon: "clock-alert-outline" as const, color: "#E53935", sublabel: "namaz borcu" },
    { label: "Oruç Borcu", value: `${(kazaStore.fasting?.totalOwed || 0) - (kazaStore.fasting?.completed || 0)}`, icon: "food-off" as const, color: "#F97316", sublabel: "gün kaldı" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#0D3320", "#0A0E17"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 18, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#10B981" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>İbadet Analitik</Text>
            <Text style={{ color: "rgba(16,185,129,0.6)", fontSize: 13, marginTop: 2 }}>Haftalık performansınız</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Haftalık takvim */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={{ marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: 16, backgroundColor: "rgba(10,24,18,0.8)", borderWidth: 1, borderColor: "rgba(16,185,129,0.08)" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Bu Hafta</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {weekDays.map((day) => (
                <View key={day.key} style={{ alignItems: "center" }}>
                  <Text style={{ color: "#6B7280", fontSize: 11, fontWeight: "600", marginBottom: 6 }}>{day.label}</Text>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: day.done ? "rgba(16,185,129,0.15)" : "rgba(10,24,18,0.7)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: day.done ? "#10B981" : "rgba(27,67,50,0.1)" }}>
                    {day.done ? (
                      <Ionicons name="checkmark" size={18} color="#10B981" />
                    ) : (
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#6B7280" }} />
                    )}
                  </View>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 12, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" }}>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: "#10B981", width: `${(weeklyCompleted / 7) * 100}%` }} />
            </View>
            <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 6, textAlign: "right" }}>%{Math.round((weeklyCompleted / 7) * 100)}</Text>
          </View>
        </Animated.View>

        {/* İstatistik kartlar */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, marginTop: 10, gap: 10 }}>
          {stats.map((stat, idx) => (
            <Animated.View key={idx} entering={FadeInDown.delay(200 + idx * 80).springify()} style={{ width: "47%" }}>
              <View style={{ padding: 16, borderRadius: 16, backgroundColor: "rgba(10,24,18,0.8)", borderWidth: 1, borderColor: `${stat.color}10`, alignItems: "center" }}>
                <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
                <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800", marginTop: 8 }}>{stat.value}</Text>
                <Text style={{ color: stat.color, fontSize: 13, fontWeight: "600", marginTop: 2 }}>{stat.label}</Text>
                <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 2 }}>{stat.sublabel}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Kaza detay */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginHorizontal: 16, marginTop: 18, marginBottom: 10 }}>
            Kaza Namaz Detayı
          </Text>
          {["Sabah", "Öğle", "İkindi", "Akşam", "Yatsı", "Vitir"].map((name, idx) => {
            const key = name.toLowerCase();
            const prayer = (kazaStore.prayers as any)?.[key] || { total: 0, completed: 0 };
            const remaining = Math.max(0, (prayer.total || 0) - (prayer.completed || 0));
            const percent = prayer.total > 0 ? Math.round(((prayer.completed || 0) / prayer.total) * 100) : 0;
            return (
              <View key={idx} style={{ marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 12, backgroundColor: "rgba(10,24,18,0.7)", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: "600" }}>{name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 60, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <View style={{ height: 5, borderRadius: 3, backgroundColor: percent >= 100 ? "#40C057" : "#D4AF37", width: `${Math.min(percent, 100)}%` }} />
                  </View>
                  <Text style={{ color: remaining === 0 ? "#40C057" : "#FFFFFF", fontSize: 13, fontWeight: "700", minWidth: 30, textAlign: "right" }}>{remaining}</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

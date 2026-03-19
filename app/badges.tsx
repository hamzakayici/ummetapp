import { useState, useEffect, useMemo, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useKazaStore, useWeeklyStore } from "../src/stores/appStore";

type Badge = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  check: () => boolean;
};

const BADGE_STORAGE = "@ummet_badges_seen";

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const kazaStore = useKazaStore();
  const weeklyStore = useWeeklyStore();
  const [seenIds, setSeenIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(BADGE_STORAGE).then((d) => d && setSeenIds(JSON.parse(d)));
  }, []);

  const totalTracked = Object.values(weeklyStore.trackedDays || {}).filter(Boolean).length;
  const totalKazaDone = Object.values(kazaStore.prayers || {}).reduce((s, p: any) => s + (p?.completed || 0), 0);

  const badges: Badge[] = useMemo(
    () => [
      { id: "first_day", name: "İlk Adım", desc: "İlk gününü tamamla", icon: "shoe-print", color: "#10B981", check: () => totalTracked >= 1 },
      { id: "streak_3", name: "3 Gün", desc: "3 gün ardışık ibadet", icon: "fire", color: "#F97316", check: () => totalTracked >= 3 },
      { id: "streak_7", name: "Bir Hafta", desc: "7 gün ardışık ibadet", icon: "fire", color: "#F97316", check: () => totalTracked >= 7 },
      { id: "streak_30", name: "Bir Ay", desc: "30 gün ibadet et", icon: "fire", color: "#EF4444", check: () => totalTracked >= 30 },
      { id: "kaza_1", name: "İlk Kaza", desc: "İlk kaza namazını kıl", icon: "check-circle", color: "#D4AF37", check: () => totalKazaDone >= 1 },
      { id: "kaza_10", name: "10 Kaza", desc: "10 kaza namazı kıl", icon: "check-decagram", color: "#D4AF37", check: () => totalKazaDone >= 10 },
      { id: "kaza_100", name: "100 Kaza", desc: "100 kaza namazı kıl", icon: "star-circle", color: "#D4AF37", check: () => totalKazaDone >= 100 },
      { id: "oruç_1", name: "İlk Oruç", desc: "İlk orucu tut", icon: "food-apple", color: "#8B5CF6", check: () => (kazaStore.fasting?.completed || 0) >= 1 },
      { id: "explorer", name: "Kaşif", desc: "Uygulamayı keşfet", icon: "compass", color: "#3B82F6", check: () => true },
      { id: "adak_1", name: "Sadık", desc: "1 adak orucu tut", icon: "heart", color: "#EC4899", check: () => (kazaStore.fasting?.adakCompleted || 0) >= 1 },
      { id: "streak_100", name: "Yüzüncü Gün", desc: "100 gün ibadet et", icon: "trophy", color: "#EAB308", check: () => totalTracked >= 100 },
      { id: "streak_365", name: "Bir Yıl", desc: "365 gün ibadet et", icon: "crown", color: "#FFD700", check: () => totalTracked >= 365 },
    ],
    [totalTracked, totalKazaDone, kazaStore.fasting]
  );

  const unlockedCount = badges.filter((b) => b.check()).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#5C4A10", "#0A0E17"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 18, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#EAB308" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>Rozetler</Text>
            <Text style={{ color: "rgba(234,179,8,0.6)", fontSize: 13, marginTop: 2 }}>{unlockedCount}/{badges.length} rozet açıldı</Text>
          </View>
          <MaterialCommunityIcons name="trophy" size={28} color="#EAB308" />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 10 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 10 }}>
          {badges.map((badge, idx) => {
            const unlocked = badge.check();
            return (
              <Animated.View key={badge.id} entering={FadeInDown.delay(idx * 60).springify()} style={{ width: "47%" }}>
                <View
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: unlocked ? `${badge.color}10` : "rgba(10,24,18,0.7)",
                    borderWidth: 1,
                    borderColor: unlocked ? `${badge.color}30` : "rgba(255,255,255,0.08)",
                    alignItems: "center",
                    opacity: unlocked ? 1 : 0.5,
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      backgroundColor: unlocked ? `${badge.color}20` : "rgba(10,15,20,0.4)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unlocked ? (
                      <MaterialCommunityIcons name={badge.icon as any} size={26} color={badge.color} />
                    ) : (
                      <Ionicons name="lock-closed" size={20} color="#6B7280" />
                    )}
                  </View>
                  <Text style={{ color: unlocked ? "#FFFFFF" : "#6B7280", fontSize: 14, fontWeight: "700", marginTop: 10, textAlign: "center" }}>
                    {badge.name}
                  </Text>
                  <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 4, textAlign: "center" }}>{badge.desc}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { analyticsTrack } from "../src/services/analytics";
import { getAnnouncementsCached, refreshAnnouncements, type Announcement } from "../src/services/remoteConfig";

const READ_KEY = "ummet:announcements:read_v1";

async function loadReadSet(): Promise<Record<string, true>> {
  const raw = await AsyncStorage.getItem(READ_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, true>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function markRead(id: string) {
  const set = await loadReadSet();
  set[String(id)] = true;
  await AsyncStorage.setItem(READ_KEY, JSON.stringify(set));
}

function badge(type?: string) {
  if (type === "warning") return { text: "Uyarı", color: "#F97316" };
  if (type === "update") return { text: "Güncelleme", color: "#3B82F6" };
  return { text: "Bilgi", color: "#D4AF37" };
}

export default function AnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Announcement[]>([]);
  const [readSet, setReadSet] = useState<Record<string, true>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cached, read] = await Promise.all([getAnnouncementsCached(), loadReadSet()]);
      if (cancelled) return;
      setItems(cached);
      setReadSet(read);

      await refreshAnnouncements({ force: true, limit: 20 });
      const fresh = await getAnnouncementsCached();
      if (!cancelled) setItems(fresh);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = useMemo(() => items.filter((a) => !readSet[a.id]).length, [items, readSet]);

  return (
    <View className="flex-1 bg-bg">
      <LinearGradient
        colors={["#1B4332", "#0A0F14"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <Animated.View entering={FadeInUp.delay(80).springify()}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="chevron-back" size={18} color="#8A9BA8" />
                <Text style={{ color: "#8A9BA8", fontSize: 13, fontWeight: "700" }}>Geri</Text>
              </View>
            </TouchableOpacity>
            {unreadCount > 0 ? (
              <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(212,175,55,0.12)", borderWidth: 1, borderColor: "rgba(212,175,55,0.22)" }}>
                <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "800" }}>{unreadCount} yeni</Text>
              </View>
            ) : null}
          </View>

          <Text style={{ color: "#ECDFCC", fontSize: 22, fontWeight: "800", marginTop: 14 }}>Duyurular</Text>
          <Text style={{ color: "#8A9BA8", fontSize: 13, marginTop: 6 }}>
            Admin panelden yayınlanan duyurular burada görünür.
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "ios" ? 32 : 24 }}>
        {items.length === 0 ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
            <View style={{ padding: 16, borderRadius: 16, backgroundColor: "rgba(18, 26, 36, 0.6)", borderWidth: 1, borderColor: "rgba(27, 67, 50, 0.2)" }}>
              <Text style={{ color: "#ECDFCC", fontSize: 14, fontWeight: "800" }}>Henüz duyuru yok</Text>
              <Text style={{ color: "#8A9BA8", fontSize: 12, marginTop: 6, lineHeight: 18 }}>
                Yeni bir duyuru yayınlanınca burada göreceksin.
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20, paddingTop: 18, gap: 10 }}>
            {items.map((a, idx) => {
              const isRead = !!readSet[a.id];
              const b = badge(a.type);
              return (
                <Animated.View key={a.id} entering={FadeInDown.delay(60 + idx * 35).springify()}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={async () => {
                      await markRead(a.id);
                      const next = await loadReadSet();
                      setReadSet(next);
                      void analyticsTrack({ name: "announcement_open", props: { id: a.id, type: a.type ?? "info" } });
                    }}
                  >
                    <View
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        backgroundColor: "rgba(18, 26, 36, 0.65)",
                        borderWidth: 1,
                        borderColor: isRead ? "rgba(27, 67, 50, 0.18)" : "rgba(212,175,55,0.22)",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                          <MaterialCommunityIcons name="bullhorn-outline" size={16} color={b.color} />
                          <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: `${b.color}1A`, borderWidth: 1, borderColor: `${b.color}33` }}>
                            <Text style={{ color: b.color, fontSize: 11, fontWeight: "800" }}>{b.text}</Text>
                          </View>
                          {!isRead ? (
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#D4AF37", marginLeft: 4 }} />
                          ) : null}
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#5A6B78" />
                      </View>

                      <Text style={{ color: "#ECDFCC", fontSize: 15, fontWeight: "800", marginTop: 10 }}>
                        {a.title}
                      </Text>
                      {!!a.content ? (
                        <Text style={{ color: "#8A9BA8", fontSize: 12, marginTop: 6, lineHeight: 18 }}>
                          {a.content}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}


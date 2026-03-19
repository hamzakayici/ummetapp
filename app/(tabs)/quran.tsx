import { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";
import { ALL_SURAHS } from "../../src/data/surahs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../../src/utils/haptics";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 85 : 65;
const FAV_KEY = "@ummet_favorite_surahs";

type TabType = "sureler" | "cuzler" | "favoriler";

// 30 Cüz — hangi sureden başlıyor
const JUZ_DATA: { juz: number; startSurah: number; startAyah: number; endSurah: number; endAyah: number }[] = [
  { juz: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { juz: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { juz: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { juz: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { juz: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { juz: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { juz: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { juz: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { juz: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { juz: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { juz: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { juz: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { juz: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { juz: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { juz: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { juz: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { juz: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { juz: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { juz: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { juz: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { juz: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { juz: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { juz: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { juz: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { juz: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { juz: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { juz: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { juz: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { juz: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { juz: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
];

// Memoized Sure kartı
const SurahItem = memo(function SurahItem({
  surah,
  isFav,
  onToggleFav,
}: {
  surah: (typeof ALL_SURAHS)[0];
  isFav: boolean;
  onToggleFav: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/quran-detail",
          params: { id: surah.id.toString(), nameTr: surah.nameTr },
        })
      }
    >
      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 8,
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderRadius: 16,
          backgroundColor: "rgba(18,26,36,0.6)",
          borderWidth: 1,
          borderColor: "rgba(27,67,50,0.1)",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(27,67,50,0.3)",
            marginRight: 12,
          }}
        >
          <Text style={{ color: "#D4AF37", fontSize: 15, fontWeight: "700" }}>{surah.id}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ECDFCC", fontSize: 17, fontWeight: "700" }}>{surah.nameTr}</Text>
          <Text style={{ color: "#8A9BA8", fontSize: 13, marginTop: 3 }}>
            {surah.meaning} · {surah.verses} ayet · {surah.type}
          </Text>
        </View>

        {/* Favori */}
        <TouchableOpacity
          onPress={() => {
            hapticImpact(ImpactFeedbackStyle.Light);
            onToggleFav();
          }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ marginRight: 10 }}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? "#E74C3C" : "#5A6B78"}
          />
        </TouchableOpacity>

        <Text style={{ color: "#D4AF37", fontSize: 22, fontFamily: "NotoNaskhArabic_700Bold" }}>
          {surah.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// Cüz kartı
const JuzItem = memo(function JuzItem({
  juz,
}: {
  juz: (typeof JUZ_DATA)[0];
}) {
  const startSurah = ALL_SURAHS.find((s) => s.id === juz.startSurah);
  const endSurah = ALL_SURAHS.find((s) => s.id === juz.endSurah);

  // Cüzdeki sureleri bul
  const surahsInJuz = ALL_SURAHS.filter(
    (s) => s.id >= juz.startSurah && s.id <= juz.endSurah
  );

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        borderRadius: 16,
        backgroundColor: "rgba(18,26,36,0.6)",
        borderWidth: 1,
        borderColor: "rgba(27,67,50,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Cüz başlığı */}
      <LinearGradient
        colors={["rgba(27,67,50,0.3)", "rgba(18,26,36,0.4)"]}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "rgba(212,175,55,0.15)",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
          }}
        >
          <Text style={{ color: "#D4AF37", fontSize: 17, fontWeight: "800" }}>{juz.juz}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ECDFCC", fontSize: 17, fontWeight: "700" }}>
            {juz.juz}. Cüz
          </Text>
          <Text style={{ color: "#8A9BA8", fontSize: 13, marginTop: 3 }}>
            {startSurah?.nameTr} {juz.startAyah}. ayet — {endSurah?.nameTr} {juz.endAyah}. ayet
          </Text>
        </View>
        <Text style={{ color: "rgba(212,175,55,0.5)", fontSize: 12 }}>
          {surahsInJuz.length} sure
        </Text>
      </LinearGradient>

      {/* Suredeki sureler */}
      <View style={{ paddingHorizontal: 14, paddingVertical: 8 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {surahsInJuz.map((s) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/quran-detail",
                  params: { id: s.id.toString(), nameTr: s.nameTr },
                })
              }
            >
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: "rgba(27,67,50,0.2)",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text style={{ color: "#D4AF37", fontSize: 11, fontWeight: "700" }}>{s.id}</Text>
                <Text style={{ color: "#ECDFCC", fontSize: 13, fontWeight: "500" }}>{s.nameTr}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("sureler");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Favorileri yükle
  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((raw) => {
      if (raw) {
        try {
          setFavorites(new Set(JSON.parse(raw)));
        } catch {}
      }
    });
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      AsyncStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const favoriteSurahs = ALL_SURAHS.filter((s) => favorites.has(s.id));

  const tabs: { key: TabType; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] }[] = [
    { key: "sureler", label: "Sureler", icon: "book-open-page-variant" },
    { key: "cuzler", label: "Cüzler", icon: "book-multiple" },
    { key: "favoriler", label: "Favoriler", icon: "heart" },
  ];

  const renderSurah = useCallback(
    ({ item }: { item: (typeof ALL_SURAHS)[0] }) => (
      <SurahItem surah={item} isFav={favorites.has(item.id)} onToggleFav={() => toggleFavorite(item.id)} />
    ),
    [favorites, toggleFavorite]
  );

  const renderJuz = useCallback(
    ({ item }: { item: (typeof JUZ_DATA)[0] }) => <JuzItem juz={item} />,
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient
        colors={["#1B4332", "#0A0F14"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#ECDFCC", fontSize: 24, fontWeight: "700" }}>Kuran-ı Kerim</Text>
              <Text style={{ color: "#8A9BA8", fontSize: 14, marginTop: 4 }}>
                114 Sure · 30 Cüz · 6236 Ayet
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/quran-reader")}
              style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(212,175,55,0.12)", flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <MaterialCommunityIcons name="book-open-variant" size={16} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 13, fontWeight: "700" }}>Toplu Oku</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 14,
          padding: 4,
          borderRadius: 14,
          backgroundColor: "rgba(18,26,36,0.8)",
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{ flex: 1 }}
            activeOpacity={0.7}
          >
            <View
              style={{
                paddingVertical: 12,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activeTab === tab.key ? "#1B4332" : "transparent",
              }}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={16}
                color={activeTab === tab.key ? "#D4AF37" : "#8A9BA8"}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  fontWeight: "700",
                  color: activeTab === tab.key ? "#D4AF37" : "#8A9BA8",
                }}
              >
                {tab.label}
              </Text>
              {tab.key === "favoriler" && favorites.size > 0 && (
                <View
                  style={{
                    marginLeft: 4,
                    backgroundColor: "#E74C3C",
                    borderRadius: 8,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>
                    {favorites.size}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* İçerik */}
      {activeTab === "sureler" && (
        <FlatList
          data={ALL_SURAHS}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSurah}
          extraData={favorites}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={10}
        />
      )}

      {activeTab === "cuzler" && (
        <FlatList
          data={JUZ_DATA}
          keyExtractor={(item) => item.juz.toString()}
          renderItem={renderJuz}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
        />
      )}

      {activeTab === "favoriler" && (
        <>
          {favoriteSurahs.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
              <Ionicons name="heart-outline" size={56} color="rgba(212,175,55,0.3)" />
              <Text style={{ color: "#8A9BA8", fontSize: 17, fontWeight: "600", marginTop: 16, textAlign: "center" }}>
                Henüz favori sure eklemediniz
              </Text>
              <Text style={{ color: "#5A6B78", fontSize: 14, marginTop: 8, textAlign: "center", lineHeight: 22 }}>
                Sureler sekmesinde kalp ikonuna basarak favori ekleyebilirsiniz
              </Text>
            </View>
          ) : (
            <FlatList
              data={favoriteSurahs}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSurah}
              extraData={favorites}
              style={{ marginTop: 12 }}
              contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
}

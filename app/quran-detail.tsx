import { useEffect, useState, useCallback, useRef, memo } from "react";
import { View, Text, FlatList, ActivityIndicator, Platform, TouchableOpacity, LayoutAnimation, UIManager } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { playAyah, stopQuranAudio, isQuranPlaying, getCurrentAyahNumber } from "../src/services/audioService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../src/utils/haptics";
import * as ScreenOrientation from "expo-screen-orientation";
import { useQuranSettingsStore, QURAN_THEMES, ARABIC_FONTS } from "../src/stores/appStore";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Ayah = { number: number; text: string; numberInSurah: number };
type AyahTr = { number: number; text: string; numberInSurah: number };
type SurahMeta = { name: string; englishName: string; numberOfAyahs: number; revelationType: string };

// Memoized ayet kartı — gereksiz re-render önlenir
const AyahCard = memo(function AyahCard({
  ayah,
  trText,
  showTranslation,
  isPlaying,
  onPlay,
  fontFamily,
  lineHeight,
  isZenMode,
}: {
  ayah: Ayah;
  trText?: string;
  showTranslation: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  fontFamily: string;
  lineHeight: number;
  isZenMode: boolean;
}) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: isZenMode ? 0 : 10,
        padding: isZenMode ? 10 : 16,
        borderRadius: 16,
        backgroundColor: isPlaying ? "rgba(212,175,55,0.18)" : isZenMode ? "transparent" : "rgba(10,24,18,0.8)",
        borderWidth: isPlaying ? 2 : isZenMode ? 0 : 1,
        borderColor: isPlaying ? "rgba(212,175,55,0.6)" : "rgba(27,67,50,0.1)",
        marginBottom: isZenMode ? 24 : 0,
      }}
    >
      {/* Header */}
      {!isZenMode && (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: isPlaying ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: isPlaying ? "#D4AF37" : "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: "700" }}>
              {ayah.numberInSurah}
            </Text>
          </View>

          <TouchableOpacity onPress={onPlay} activeOpacity={0.6} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isPlaying ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.08)",
              }}
            >
              <Ionicons name={isPlaying ? "stop" : "play"} size={16} color={isPlaying ? "#D4AF37" : "rgba(255,255,255,0.6)"} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Arapça */}
      <Text
        style={{
          color: isPlaying ? "#FFD700" : "#FFFFFF",
          fontSize: isZenMode ? 32 : 28,
          lineHeight: isZenMode ? lineHeight * 1.2 : lineHeight,
          textAlign: "right",
          fontFamily: fontFamily,
          fontWeight: isPlaying ? "600" : "400",
        }}
      >
        {ayah.text} {isZenMode && <Text style={{ color: "rgba(212,175,55,0.6)", fontSize: 18 }}>﴿{ayah.numberInSurah}﴾</Text>}
      </Text>

      {/* Türkçe */}
      {showTranslation && trText && (
        <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: isPlaying ? "rgba(212,175,55,0.3)" : "rgba(27,67,50,0.15)" }}>
          <Text
            style={{
              color: isPlaying ? "#F5E6B8" : "rgba(180,195,210,0.9)",
              fontSize: 17,
              lineHeight: 28,
              fontWeight: isPlaying ? "600" : "400",
            }}
          >
            {trText}
          </Text>
        </View>
      )}
    </View>
  );
});

export default function QuranDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, nameTr } = useLocalSearchParams<{ id: string; nameTr: string }>();
  const { arabicFont } = useQuranSettingsStore();
  const fontConfig = ARABIC_FONTS[arabicFont];
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [ayahsTr, setAyahsTr] = useState<AyahTr[]>([]);
  const [meta, setMeta] = useState<SurahMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [playingAyah, setPlayingAyah] = useState(0);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const playAllRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const ayahLayoutsRef = useRef<Record<number, number>>({});

  const toggleZenMode = () => {
    hapticImpact(ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsZenMode((prev) => !prev);
  };

  // Ekran döndürme — bu sayfada yatay/dikey serbest
  useEffect(() => {
    ScreenOrientation.unlockAsync();
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  useEffect(() => {
    fetchSurah();
  }, [id]);

  async function fetchSurah() {
    const cacheKey = `@ummet_surah_${id}`;
    try {
      const [arResponse, trResponse] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${id}`),
        fetch(`https://api.alquran.cloud/v1/surah/${id}/tr.diyanet`),
      ]);
      const arData = await arResponse.json();
      const trData = await trResponse.json();

      if (arData.code === 200) {
        setMeta(arData.data);
        setAyahs(arData.data.ayahs);
      }
      if (trData.code === 200) {
        setAyahsTr(trData.data.ayahs);
      }
      if (arData.code === 200 && trData.code === 200) {
        AsyncStorage.setItem(cacheKey, JSON.stringify({
          meta: arData.data, ayahs: arData.data.ayahs, ayahsTr: trData.data.ayahs,
        }));
      }
    } catch {
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          setMeta(data.meta);
          setAyahs(data.ayahs);
          setAyahsTr(data.ayahsTr);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  // Ses takip — çalan ayet değiştiğinde otomatik scroll
  const scrollToAyah = useCallback((ayahNumber: number) => {
    if (!ayahs.length) return;
    const index = ayahs.findIndex((a) => a.number === ayahNumber);
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.3,
      });
    }
  }, [ayahs]);

  // Tek ayet çal
  const singleCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePlayAyah = useCallback(async (ayahNumber: number) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    // Önceki interval'ı temizle
    if (singleCheckRef.current) { clearInterval(singleCheckRef.current); singleCheckRef.current = null; }

    if (playingAyah === ayahNumber) {
      await stopQuranAudio();
      setPlayingAyah(0);
    } else {
      if (playAllRef.current) {
        playAllRef.current = false;
        await stopQuranAudio();
        setIsPlayingAll(false);
      }
      setPlayingAyah(ayahNumber);
      scrollToAyah(ayahNumber);
      await playAyah(ayahNumber);
      // Bitince state temizle
      singleCheckRef.current = setInterval(() => {
        if (!isQuranPlaying()) {
          setPlayingAyah(0);
          if (singleCheckRef.current) { clearInterval(singleCheckRef.current); singleCheckRef.current = null; }
        }
      }, 500);
    }
  }, [playingAyah, scrollToAyah]);

  // Tüm sureyi sırayla çal
  const handlePlayAll = useCallback(async () => {
    if (playAllRef.current) {
      playAllRef.current = false;
      await stopQuranAudio();
      setPlayingAyah(0);
      setIsPlayingAll(false);
      return;
    }

    playAllRef.current = true;
    setIsPlayingAll(true);

    for (let i = 0; i < ayahs.length; i++) {
      if (!playAllRef.current) break;

      const ayah = ayahs[i];
      setPlayingAyah(ayah.number);

      // Ayet'e scroll
      flatListRef.current?.scrollToIndex({
        index: i,
        animated: true,
        viewPosition: 0.3,
      });

      await playAyah(ayah.number);

      // Ayetin bitmesini bekle
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (!isQuranPlaying() || !playAllRef.current) {
            clearInterval(check);
            resolve();
          }
        }, 500);
      });
    }

    playAllRef.current = false;
    setPlayingAyah(0);
    setIsPlayingAll(false);
  }, [ayahs]);

  // Cleanup — tüm interval ve audio temizle
  useEffect(() => {
    return () => {
      playAllRef.current = false;
      if (singleCheckRef.current) { clearInterval(singleCheckRef.current); singleCheckRef.current = null; }
      stopQuranAudio();
    };
  }, []);

  // Besmele header
  const ListHeader = useCallback(() => (
    <View>
      {Number(id) !== 9 && Number(id) !== 1 && (
        <View style={{ marginTop: 16, marginHorizontal: 20, padding: 14, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.06)", borderWidth: 1, borderColor: "rgba(212,175,55,0.15)", alignItems: "center" }}>
          <Text style={{ color: "#D4AF37", fontSize: 22, lineHeight: 38, fontFamily: fontConfig.family }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </Text>
          {showTranslation && (
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6, textAlign: "center" }}>
              Rahmân ve Rahîm olan Allah'ın adıyla
            </Text>
          )}
        </View>
      )}
      <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <MaterialCommunityIcons name="microphone" size={10} color="#6B7280" />
        <Text style={{ color: "#6B7280", fontSize: 10, marginLeft: 4 }}>Kari: Mishary Rashid Alafasy · Meal: Diyanet İşleri</Text>
      </View>
    </View>
  ), [id, showTranslation, fontConfig]);

  const renderAyah = useCallback(({ item, index }: { item: Ayah; index: number }) => {
    const trText = ayahsTr[index]?.text;
    return (
      <AyahCard
        ayah={item}
        trText={trText}
        showTranslation={showTranslation}
        isPlaying={playingAyah === item.number}
        onPlay={() => handlePlayAyah(item.number)}
        fontFamily={fontConfig.family}
        lineHeight={28 * fontConfig.lineHeightMultiplier}
        isZenMode={isZenMode}
      />
    );
  }, [ayahsTr, showTranslation, playingAyah, handlePlayAyah, fontConfig, isZenMode]);

  const keyExtractor = useCallback((item: Ayah) => String(item.number), []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      
      {!isZenMode && (
        <LinearGradient
          colors={["#1B4332", "#2D6A4F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => { stopQuranAudio(); router.back(); }}
              style={{ marginRight: 12 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color="#D4AF37" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700" }}>{nameTr || "Sure"}</Text>
              {meta && (
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 }}>
                  {meta.numberOfAyahs} ayet · {meta.revelationType === "Meccan" ? "Mekki" : "Medeni"}
                </Text>
              )}
            </View>
            <Text style={{ color: "#D4AF37", fontSize: 22, fontFamily: fontConfig.family }}>{meta?.name}</Text>
          </View>

          {/* Kontrol butonları */}
          <View style={{ flexDirection: "row", marginTop: 10, gap: 8 }}>
            <TouchableOpacity onPress={handlePlayAll} activeOpacity={0.7} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: isPlayingAll ? "rgba(212,175,55,0.25)" : "rgba(27,67,50,0.4)",
                }}
              >
                <Ionicons name={isPlayingAll ? "stop" : "play"} size={14} color={isPlayingAll ? "#D4AF37" : "#FFFFFF"} />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 13,
                    fontWeight: "700",
                    color: isPlayingAll ? "#D4AF37" : "#FFFFFF",
                  }}
                >
                  {isPlayingAll ? "Durdur" : "Tümünü Dinle"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowTranslation(!showTranslation)} activeOpacity={0.7} style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: showTranslation ? "rgba(212,175,55,0.15)" : "rgba(27,67,50,0.4)",
                }}
              >
                <MaterialCommunityIcons name="translate" size={14} color={showTranslation ? "#D4AF37" : "rgba(255,255,255,0.6)"} />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 13,
                    fontWeight: "700",
                    color: showTranslation ? "#D4AF37" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {showTranslation ? "Meal Açık" : "Meal Kapalı"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleZenMode} activeOpacity={0.7} style={{ width: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "rgba(27,67,50,0.4)" }}>
              <MaterialCommunityIcons name="eye-outline" size={18} color="#D4AF37" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 12 }}>Sure yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={ayahs}
          renderItem={renderAyah}
          keyExtractor={keyExtractor}
          extraData={playingAyah}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={11}
          removeClippedSubviews={false}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
        />
      )}

      {/* Zen Mode Kapatıcı Buton (Floating) */}
      {isZenMode && (
        <TouchableOpacity
          onPress={toggleZenMode}
          style={{
            position: "absolute",
            bottom: 40,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "rgba(212,175,55,0.2)",
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.5)",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#D4AF37",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          }}
        >
          <MaterialCommunityIcons name="eye-off-outline" size={24} color="#D4AF37" />
        </TouchableOpacity>
      )}
    </View>
  );
}

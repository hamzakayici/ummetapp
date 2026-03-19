import { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, FlatList, ActivityIndicator, Platform, TouchableOpacity, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
import { hapticImpact, ImpactFeedbackStyle } from "../src/utils/haptics";
import { useQuranSettingsStore, QURAN_THEMES, ARABIC_FONTS } from "../src/stores/appStore";
import type { QuranTheme, ArabicFontKey } from "../src/stores/appStore";
import { playAyah, stopQuranAudio, isQuranPlaying } from "../src/services/audioService";

const CACHE_KEY = "@ummet_mushaf_full_v2";
const TOTAL_PAGES = 604;

type PageAyah = {
  number: number;
  text: string;
  textTr: string;
  surahNumber: number;
  surahName: string;
  numberInSurah: number;
};

type MushafPage = {
  page: number;
  ayahs: PageAyah[];
};

export default function QuranReaderScreen() {
  const insets = useSafeAreaInsets();
  const { theme, fontSize, arabicFont, lastPage, setTheme, setFontSize, setArabicFont, setLastPage } = useQuranSettingsStore();
  const colors = QURAN_THEMES[theme];
  const fontConfig = ARABIC_FONTS[arabicFont];
  const [pages, setPages] = useState<MushafPage[]>([]);
  const [currentPage, setCurrentPage] = useState(lastPage || 1);
  const [loading, setLoading] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showMeal, setShowMeal] = useState(false);
  const [playingAyah, setPlayingAyah] = useState(0);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playAllRef = useRef(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      playAllRef.current = false;
      stopQuranAudio();
    };
  }, []);

  useEffect(() => { loadAllPages(); }, []);

  async function loadAllPages() {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length === TOTAL_PAGES) {
            setPages(parsed);
            setLoading(false);
            return;
          }
        } catch {}
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const [arRes, trRes] = await Promise.all([
        fetch("https://api.alquran.cloud/v1/quran/quran-uthmani", { signal: controller.signal }),
        fetch("https://api.alquran.cloud/v1/quran/tr.diyanet", { signal: controller.signal }),
      ]);
      clearTimeout(timeoutId);
      const [arData, trData] = await Promise.all([arRes.json(), trRes.json()]);

      if (arData.code !== 200 || trData.code !== 200) throw new Error("API error");

      const pageMap: Record<number, PageAyah[]> = {};
      const trMap: Record<number, string> = {};

      // Türkçe meal haritası
      for (const surah of trData.data.surahs) {
        for (const ayah of surah.ayahs) {
          trMap[ayah.number] = ayah.text;
        }
      }

      for (const surah of arData.data.surahs) {
        for (const ayah of surah.ayahs) {
          if (!pageMap[ayah.page]) pageMap[ayah.page] = [];
          pageMap[ayah.page].push({
            number: ayah.number,
            text: ayah.text,
            textTr: trMap[ayah.number] || "",
            surahNumber: surah.number,
            surahName: surah.name,
            numberInSurah: ayah.numberInSurah,
          });
        }
      }

      const mushafPages: MushafPage[] = [];
      for (let i = 1; i <= TOTAL_PAGES; i++) {
        mushafPages.push({ page: i, ayahs: pageMap[i] || [] });
      }

      setPages(mushafPages);
      setLoading(false);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(mushafPages)).catch(() => {});
    } catch {
      setLoading(false);
    }
  }

  const toArabicNumeral = (n: number): string => {
    const d = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(n).split("").map((c) => d[parseInt(c, 10)]).join("");
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setLastPage(page);
  }, [setLastPage]);

  // Sesli okuma — tek ayet
  const handlePlayAyah = useCallback(async (ayahNumber: number) => {
    if (isQuranPlaying() && playingAyah === ayahNumber) {
      stopQuranAudio();
      setPlayingAyah(0);
      return;
    }
    hapticImpact(ImpactFeedbackStyle.Light);
    setPlayingAyah(ayahNumber);
    await playAyah(ayahNumber);
    // Bitince sıfırla
    const checkDone = setInterval(() => {
      if (!isQuranPlaying()) {
        setPlayingAyah(0);
        clearInterval(checkDone);
      }
    }, 500);
  }, [playingAyah]);

  // Tüm sayfayı sesli oku
  const handlePlayPage = useCallback(async () => {
    if (isPlayingAll) {
      playAllRef.current = false;
      stopQuranAudio();
      setPlayingAyah(0);
      setIsPlayingAll(false);
      return;
    }

    const page = pages[currentPage - 1];
    if (!page || page.ayahs.length === 0) return;

    playAllRef.current = true;
    setIsPlayingAll(true);
    hapticImpact(ImpactFeedbackStyle.Medium);

    for (const ayah of page.ayahs) {
      if (!playAllRef.current) break;
      setPlayingAyah(ayah.number);
      await playAyah(ayah.number);
      // Bitene kadar bekle
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (!isQuranPlaying() || !playAllRef.current) {
            clearInterval(check);
            resolve();
          }
        }, 300);
      });
    }

    playAllRef.current = false;
    setPlayingAyah(0);
    setIsPlayingAll(false);
  }, [currentPage, pages, isPlayingAll]);

  const renderPage = useCallback(({ item }: { item: MushafPage }) => {
    // Ayetleri segmentlere ayır: header + ayet grubu + meal
    type Segment =
      | { type: "header"; surahName: string; surahNum: number }
      | { type: "ayahGroup"; ayahs: PageAyah[] }
      | { type: "meal"; items: { numberInSurah: number; tr: string }[] };

    const segments: Segment[] = [];
    let currentGroup: PageAyah[] = [];

    for (let i = 0; i < item.ayahs.length; i++) {
      const ayah = item.ayahs[i];
      if (ayah.numberInSurah === 1) {
        // Önceki grubu kaydet
        if (currentGroup.length > 0) {
          segments.push({ type: "ayahGroup", ayahs: [...currentGroup] });
          if (showMeal) {
            segments.push({ type: "meal", items: currentGroup.map((a) => ({ numberInSurah: a.numberInSurah, tr: a.textTr })) });
          }
          currentGroup = [];
        }
        segments.push({ type: "header", surahName: ayah.surahName, surahNum: ayah.surahNumber });
      }
      currentGroup.push(ayah);
    }
    if (currentGroup.length > 0) {
      segments.push({ type: "ayahGroup", ayahs: currentGroup });
      if (showMeal) {
        segments.push({ type: "meal", items: currentGroup.map((a) => ({ numberInSurah: a.numberInSurah, tr: a.textTr })) });
      }
    }

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => { setShowHeader(!showHeader); setShowSettings(false); }}
      >
        <View style={{
          minHeight: Dimensions.get("window").height - (showHeader ? 130 : 40),
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 50,
          backgroundColor: colors.bg,
        }}>
          <View style={{ height: 2, backgroundColor: colors.accent, opacity: 0.15, marginBottom: 8, borderRadius: 1 }} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14, paddingHorizontal: 2 }}>
            <Text style={{ color: colors.secondary, fontSize: 11, fontWeight: "600" }}>
              {item.ayahs.length > 0 ? item.ayahs[0].surahName : ""}
            </Text>
            <Text style={{ color: lastPage === item.page ? colors.accent : colors.secondary, fontSize: 11, fontWeight: "600" }}>
              {item.page}
            </Text>
          </View>

          {segments.map((seg, idx) => {
            if (seg.type === "header") {
              return (
                <View key={`h-${idx}`} style={{
                  alignItems: "center", marginVertical: 14, paddingVertical: 14, borderRadius: 12,
                  backgroundColor: `${colors.accent}08`, borderWidth: 1.5, borderColor: `${colors.accent}20`,
                }}>
                  <Text style={{ color: colors.accent, fontSize: fontSize + 6, fontFamily: fontConfig.family }}>
                    {seg.surahName}
                  </Text>
                  {seg.surahNum !== 9 && seg.surahNum !== 1 && (
                    <Text style={{ color: `${colors.accent}80`, fontSize: fontSize - 2, marginTop: 10, fontFamily: fontConfig.family }}>
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </Text>
                  )}
                </View>
              );
            }

            if (seg.type === "meal") {
              return (
                <View key={`ml-${idx}`} style={{ marginBottom: 8 }}>
                  {seg.items.map((m, mi) => (
                    <Text key={mi} style={{
                      color: colors.secondary, fontSize: 13, lineHeight: 20, marginBottom: 3, paddingLeft: 8,
                      borderLeftWidth: 2, borderLeftColor: `${colors.accent}20`,
                    }}>
                      {m.numberInSurah}. {m.tr}
                    </Text>
                  ))}
                </View>
              );
            }

            // Ayet grubu — iç içe Text ile her ayet ayrı renklendirilir
            return (
              <Text
                key={`ag-${idx}`}
                style={{
                  fontSize: fontSize,
                  lineHeight: fontSize * fontConfig.lineHeightMultiplier,
                  textAlign: "center",
                  writingDirection: "rtl",
                  fontFamily: fontConfig.family,
                  color: colors.text,
                }}
              >
                {seg.ayahs.map((ayah) => {
                  const isActive = playingAyah === ayah.number;
                  return (
                    <Text
                      key={ayah.number}
                      style={isActive ? {
                        color: colors.accent,
                        backgroundColor: `${colors.accent}15`,
                      } : undefined}
                    >
                      {ayah.text} ﴿{toArabicNumeral(ayah.numberInSurah)}﴾{" "}
                    </Text>
                  );
                })}
              </Text>
            );
          })}

          <View style={{ height: 2, backgroundColor: colors.accent, opacity: 0.1, marginTop: 16, borderRadius: 1 }} />
        </View>
      </TouchableOpacity>
    );
  }, [showHeader, lastPage, fontSize, colors, fontConfig, showMeal, playingAyah]);

  const keyExtractor = useCallback((item: MushafPage) => String(item.page), []);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      handlePageChange(viewableItems[0].item.page);
    }
  }).current;

  const themeKeys: QuranTheme[] = ["dark", "light", "sepia", "cream", "green"];
  const fontKeys: ArabicFontKey[] = ["noto", "scheherazade", "amiri"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {showHeader && (
        <View style={{ backgroundColor: colors.bg, paddingTop: insets.top + 4, paddingBottom: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: `${colors.accent}15` }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => { stopQuranAudio(); router.back(); }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.accent}12`, alignItems: "center", justifyContent: "center" }}
            >
              <Ionicons name="chevron-back" size={20} color={colors.accent} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>Mushaf-ı Şerif</Text>
              <Text style={{ color: colors.secondary, fontSize: 11, marginTop: 1 }}>
                Sayfa {currentPage} / {TOTAL_PAGES}
              </Text>
            </View>

            {/* Kontroller */}
            <View style={{ flexDirection: "row", gap: 4 }}>
              {/* Sesli Oku */}
              <TouchableOpacity
                onPress={handlePlayPage}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isPlayingAll ? `${colors.accent}25` : `${colors.secondary}12`, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name={isPlayingAll ? "stop" : "play"} size={16} color={isPlayingAll ? colors.accent : colors.secondary} />
              </TouchableOpacity>

              {/* Meal */}
              <TouchableOpacity
                onPress={() => setShowMeal(!showMeal)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: showMeal ? `${colors.accent}20` : `${colors.secondary}12`, alignItems: "center", justifyContent: "center" }}
              >
                <MaterialCommunityIcons name="translate" size={16} color={showMeal ? colors.accent : colors.secondary} />
              </TouchableOpacity>

              {/* Ayarlar */}
              <TouchableOpacity
                onPress={() => setShowSettings(!showSettings)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: showSettings ? `${colors.accent}20` : `${colors.secondary}12`, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="settings-outline" size={16} color={showSettings ? colors.accent : colors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Ayarlar paneli */}
          {showSettings && (
            <View style={{ marginTop: 12, padding: 14, borderRadius: 14, backgroundColor: `${colors.secondary}10`, borderWidth: 1, borderColor: `${colors.accent}10` }}>
              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>Arkaplan Teması</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                {themeKeys.map((t) => (
                  <TouchableOpacity key={t} onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); setTheme(t); }} style={{ flex: 1, alignItems: "center" }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: QURAN_THEMES[t].bg, borderWidth: theme === t ? 2.5 : 1, borderColor: theme === t ? colors.accent : `${colors.secondary}30`, alignItems: "center", justifyContent: "center" }}>
                      {theme === t && <Ionicons name="checkmark" size={16} color={QURAN_THEMES[t].accent} />}
                    </View>
                    <Text style={{ color: theme === t ? colors.accent : colors.secondary, fontSize: 10, marginTop: 4, fontWeight: "600" }}>{QURAN_THEMES[t].name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: "600", marginBottom: 8 }}>Yazı Boyutu</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <TouchableOpacity onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); setFontSize(Math.max(16, fontSize - 2)); }} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${colors.secondary}15`, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>A−</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: `${colors.secondary}20` }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.accent, width: `${((fontSize - 16) / 24) * 100}%` }} />
                </View>
                <TouchableOpacity onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); setFontSize(Math.min(40, fontSize + 2)); }} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${colors.secondary}15`, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>A+</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: colors.secondary, fontSize: 11, textAlign: "center", marginTop: 6 }}>{fontSize}pt</Text>

              <Text style={{ color: colors.secondary, fontSize: 12, fontWeight: "600", marginTop: 14, marginBottom: 8 }}>Yazı Tipi</Text>
              <View style={{ gap: 6 }}>
                {fontKeys.map((fk) => {
                  const f = ARABIC_FONTS[fk];
                  const isSelected = arabicFont === fk;
                  return (
                    <TouchableOpacity key={fk} onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); setArabicFont(fk); }}>
                      <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, backgroundColor: isSelected ? `${colors.accent}12` : `${colors.secondary}08`, borderWidth: isSelected ? 1.5 : 1, borderColor: isSelected ? `${colors.accent}40` : `${colors.secondary}15` }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: isSelected ? colors.accent : colors.text, fontSize: 13, fontWeight: "700" }}>{f.name}</Text>
                          <Text style={{ color: colors.secondary, fontSize: 10, marginTop: 2 }}>{f.desc}</Text>
                        </View>
                        <Text style={{ color: colors.text, fontSize: 18, fontFamily: f.family }}>بِسْمِ اللَّهِ</Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.accent} style={{ marginLeft: 8 }} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={{ color: colors.secondary, fontSize: 14, marginTop: 14 }}>Mushaf yükleniyor...</Text>
          <Text style={{ color: `${colors.secondary}80`, fontSize: 11, marginTop: 8 }}>İlk açılışta yüklenir, sonra anında açılır</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={pages}
          renderItem={renderPage}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          initialScrollIndex={Math.max(0, (lastPage || 1) - 1)}
          getItemLayout={(_, index) => ({
            length: Dimensions.get("window").height,
            offset: Dimensions.get("window").height * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
        />
      )}

      {/* Sesli oku ve sayfa göstergesi */}
      {!showHeader && (
        <View style={{ position: "absolute", top: insets.top + 4, right: 16, flexDirection: "row", gap: 6 }}>
          <TouchableOpacity
            onPress={handlePlayPage}
            style={{ backgroundColor: `${colors.bg}DD`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: `${colors.accent}15`, flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Ionicons name={isPlayingAll ? "stop" : "play"} size={12} color={colors.accent} />
            <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "600" }}>{isPlayingAll ? "Durdur" : "Dinle"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowHeader(true)}
            style={{ backgroundColor: `${colors.bg}DD`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: `${colors.accent}15` }}
          >
            <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600" }}>{currentPage}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

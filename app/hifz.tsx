import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, FlatList, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../src/utils/haptics";

const STORAGE_KEY = "@ummet_hifz_progress";

const SURAHS = [
  { id: 1, name: "Fâtiha", ayahCount: 7, arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ" },
  { id: 2, name: "Bakara", ayahCount: 286, arabic: "الم" },
  { id: 3, name: "Âl-i İmrân", ayahCount: 200, arabic: "الم" },
  { id: 4, name: "Nisâ", ayahCount: 176, arabic: "يا أَيُّهَا النَّاسُ" },
  { id: 5, name: "Mâide", ayahCount: 120, arabic: "يا أَيُّهَا الَّذِينَ آمَنُوا" },
  { id: 6, name: "En’âm", ayahCount: 165, arabic: "الْحَمْدُ لِلَّهِ" },
  { id: 7, name: "A’râf", ayahCount: 206, arabic: "المص" },
  { id: 8, name: "Enfâl", ayahCount: 75, arabic: "يَسْأَلُونَكَ عَنِ الْأَنفَالِ" },
  { id: 9, name: "Tevbe", ayahCount: 129, arabic: "بَرَاءَةٌ مِنَ اللَّهِ" },
  { id: 10, name: "Yûnus", ayahCount: 109, arabic: "الر" },
  { id: 11, name: "Hûd", ayahCount: 123, arabic: "الر" },
  { id: 12, name: "Yûsuf", ayahCount: 111, arabic: "الر" },
  { id: 13, name: "Ra’d", ayahCount: 43, arabic: "المر" },
  { id: 14, name: "İbrâhîm", ayahCount: 52, arabic: "الر" },
  { id: 15, name: "Hicr", ayahCount: 99, arabic: "الر" },
  { id: 16, name: "Nahl", ayahCount: 128, arabic: "أَتَىٰ أَمْرُ اللَّهِ" },
  { id: 17, name: "İsrâ", ayahCount: 111, arabic: "سُبْحَانَ الَّذِي" },
  { id: 18, name: "Kehf", ayahCount: 110, arabic: "الْحَمْدُ لِلَّهِ" },
  { id: 19, name: "Meryem", ayahCount: 98, arabic: "كهيعص" },
  { id: 20, name: "Tâhâ", ayahCount: 135, arabic: "طه" },
  { id: 21, name: "Enbiyâ", ayahCount: 112, arabic: "اقْتَرَبَ لِلنَّاسِ" },
  { id: 22, name: "Hac", ayahCount: 78, arabic: "يا أَيُّهَا النَّاسُ" },
  { id: 23, name: "Mü’minûn", ayahCount: 118, arabic: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ" },
  { id: 24, name: "Nûr", ayahCount: 64, arabic: "سُورَةٌ أَنزَلْنَاهَا" },
  { id: 25, name: "Furkân", ayahCount: 77, arabic: "تَبَارَكَ الَّذِي" },
  { id: 26, name: "Şuarâ", ayahCount: 227, arabic: "طسم" },
  { id: 27, name: "Neml", ayahCount: 93, arabic: "طس" },
  { id: 28, name: "Kasas", ayahCount: 88, arabic: "طسم" },
  { id: 29, name: "Ankebût", ayahCount: 69, arabic: "الم" },
  { id: 30, name: "Rûm", ayahCount: 60, arabic: "الم" },
  { id: 31, name: "Lokmân", ayahCount: 34, arabic: "الم" },
  { id: 32, name: "Secde", ayahCount: 30, arabic: "الم" },
  { id: 33, name: "Ahzâb", ayahCount: 73, arabic: "يا أَيُّهَا النَّبِيُّ" },
  { id: 34, name: "Sebe’", ayahCount: 54, arabic: "الْحَمْدُ لِلَّهِ" },
  { id: 35, name: "Fâtır", ayahCount: 45, arabic: "الْحَمْدُ لِلَّهِ" },
  { id: 36, name: "Yâsîn", ayahCount: 83, arabic: "يس" },
  { id: 37, name: "Sâffât", ayahCount: 182, arabic: "وَالصَّافَّاتِ صَفًّا" },
  { id: 38, name: "Sâd", ayahCount: 88, arabic: "ص" },
  { id: 39, name: "Zümer", ayahCount: 75, arabic: "تَنزِيلُ الْكِتَابِ" },
  { id: 40, name: "Mü’min", ayahCount: 85, arabic: "حم" },
  { id: 41, name: "Fussilet", ayahCount: 54, arabic: "حم" },
  { id: 42, name: "Şûrâ", ayahCount: 53, arabic: "حم" },
  { id: 43, name: "Zuhruf", ayahCount: 89, arabic: "حم" },
  { id: 44, name: "Duhân", ayahCount: 59, arabic: "حم" },
  { id: 45, name: "Câsiye", ayahCount: 37, arabic: "حم" },
  { id: 46, name: "Ahkâf", ayahCount: 35, arabic: "حم" },
  { id: 47, name: "Muhammed", ayahCount: 38, arabic: "الَّذِينَ كَفَرُوا" },
  { id: 48, name: "Fetih", ayahCount: 29, arabic: "إِنَّا فَتَحْنَا" },
  { id: 49, name: "Hucurât", ayahCount: 18, arabic: "يا أَيُّهَا الَّذِينَ آمَنُوا" },
  { id: 50, name: "Kâf", ayahCount: 45, arabic: "ق" },
  { id: 51, name: "Zâriyât", ayahCount: 60, arabic: "وَالذَّارِيَاتِ ذَرْوًا" },
  { id: 52, name: "Tûr", ayahCount: 49, arabic: "وَالطُّورِ" },
  { id: 53, name: "Necm", ayahCount: 62, arabic: "وَالنَّجْمِ" },
  { id: 54, name: "Kamer", ayahCount: 55, arabic: "اقْتَرَبَتِ السَّاعَةُ" },
  { id: 55, name: "Rahmân", ayahCount: 78, arabic: "الرَّحْمَنُ" },
  { id: 56, name: "Vâkıa", ayahCount: 96, arabic: "إِذَا وَقَعَتِ الْوَاقِعَةُ" },
  { id: 57, name: "Hadîd", ayahCount: 29, arabic: "سَبَّحَ لِلَّهِ" },
  { id: 58, name: "Mücâdele", ayahCount: 22, arabic: "قَدْ سَمِعَ اللَّهُ" },
  { id: 59, name: "Haşr", ayahCount: 24, arabic: "سَبَّحَ لِلَّهِ" },
  { id: 60, name: "Mümtehine", ayahCount: 13, arabic: "يا أَيُّهَا الَّذِينَ آمَنُوا" },
  { id: 61, name: "Saff", ayahCount: 14, arabic: "سَبَّحَ لِلَّهِ" },
  { id: 62, name: "Cuma", ayahCount: 11, arabic: "يُسَبِّحُ لِلَّهِ" },
  { id: 63, name: "Münâfikûn", ayahCount: 11, arabic: "إِذَا جَاءَكَ الْمُنَافِقُونَ" },
  { id: 64, name: "Tegâbün", ayahCount: 18, arabic: "يُسَبِّحُ لِلَّهِ" },
  { id: 65, name: "Talâk", ayahCount: 12, arabic: "يا أَيُّهَا النَّبِيُّ" },
  { id: 66, name: "Tahrîm", ayahCount: 12, arabic: "يا أَيُّهَا النَّبِيُّ" },
  { id: 67, name: "Mülk", ayahCount: 30, arabic: "تَبَارَكَ الَّذِي" },
  { id: 68, name: "Kalem", ayahCount: 52, arabic: "ن" },
  { id: 69, name: "Hâkka", ayahCount: 52, arabic: "الْحَاقَّةُ" },
  { id: 70, name: "Meâric", ayahCount: 44, arabic: "سَأَلَ سَائِلٌ" },
  { id: 71, name: "Nûh", ayahCount: 28, arabic: "إِنَّا أَرْسَلْنَا" },
  { id: 72, name: "Cin", ayahCount: 28, arabic: "قُلْ أُوحِيَ إِلَيَّ" },
  { id: 73, name: "Müzzemmil", ayahCount: 20, arabic: "ya أَيُّهَا الْمُزَّمِّلُ" },
  { id: 74, name: "Müddessir", ayahCount: 56, arabic: "ya أَيُّهَا الْمُدَّثِّرُ" },
  { id: 75, name: "Kıyâme", ayahCount: 40, arabic: "لَا أُقْسِمُ" },
  { id: 76, name: "İnsan", ayahCount: 31, arabic: "هَلْ أَتَىٰ" },
  { id: 77, name: "Mürselât", ayahCount: 50, arabic: "وَالْمُرْسَلَاتِ" },
  { id: 78, name: "Nebe’", ayahCount: 40, arabic: "عَمَّ يَتَسَاءَلُونَ" },
  { id: 79, name: "Nâziât", ayahCount: 46, arabic: "وَالنَّازِعَاتِ" },
  { id: 80, name: "Abese", ayahCount: 42, arabic: "عَبَسَ وَتَوَلَّىٰ" },
  { id: 81, name: "Tekvîr", ayahCount: 29, arabic: "إِذَا الشَّمْسُ كُوِّرَتْ" },
  { id: 82, name: "İnfitâr", ayahCount: 19, arabic: "إِذَا السَّمَاءُ انفَطَرَتْ" },
  { id: 83, name: "Mutaffifîn", ayahCount: 36, arabic: "وَيْلٌ لِلْمُطَفِّفِينَ" },
  { id: 84, name: "İnşikâk", ayahCount: 25, arabic: "إِذَا السَّمَاءُ انشَقَّتْ" },
  { id: 85, name: "Burûc", ayahCount: 22, arabic: "وَالسَّمَاءِ ذَاتِ الْبُرُوجِ" },
  { id: 86, name: "Târık", ayahCount: 17, arabic: "وَالسَّمَاءِ وَالطَّارِقِ" },
  { id: 87, name: "A’lâ", ayahCount: 19, arabic: "سَبِّحِ اسْمَ رَبِّكَ" },
  { id: 88, name: "Gâşive", ayahCount: 26, arabic: "هَلْ أَتَاكَ" },
  { id: 89, name: "Fecr", ayahCount: 30, arabic: "وَالْفَجْرِ" },
  { id: 90, name: "Beled", ayahCount: 20, arabic: "لَا أُقْسِمُ" },
  { id: 91, name: "Şems", ayahCount: 15, arabic: "وَالشَّمْسِ وَضُحَاهَا" },
  { id: 92, name: "Leyl", ayahCount: 21, arabic: "وَاللَّيْلِ" },
  { id: 93, name: "Duhâ", ayahCount: 11, arabic: "وَالضُّحَىٰ" },
  { id: 94, name: "İnşirâh", ayahCount: 8, arabic: "أَلَمْ نَشْرَحْ" },
  { id: 95, name: "Tîn", ayahCount: 8, arabic: "وَالتِّينِ" },
  { id: 96, name: "Alak", ayahCount: 19, arabic: "اقْرَأْ" },
  { id: 97, name: "Kadir", ayahCount: 5, arabic: "إِنَّا أَنزَلْنَاهُ" },
  { id: 98, name: "Beyyine", ayahCount: 8, arabic: "لَمْ يَكُنِ" },
  { id: 99, name: "Zilzâl", ayahCount: 8, arabic: "إِذَا زُلْزِلَتِ" },
  { id: 100, name: "Âdiyât", ayahCount: 11, arabic: "وَالْعَادِيَاتِ" },
  { id: 101, name: "Kâria", ayahCount: 11, arabic: "الْقَارِعَةُ" },
  { id: 102, name: "Tekâsür", ayahCount: 8, arabic: "أَلْهَاكُمُ التَّكَاثُرُ" },
  { id: 103, name: "Asr", ayahCount: 3, arabic: "وَالْعَصْرِ" },
  { id: 104, name: "Hümeze", ayahCount: 9, arabic: "وَيْلٌ لِكُلِّ هُمَزَةٍ" },
  { id: 105, name: "Fîl", ayahCount: 5, arabic: "أَلَمْ تَرَ كَيْفَ" },
  { id: 106, name: "Kureyş", ayahCount: 4, arabic: "لِإِيلَافِ قُرَيْشٍ" },
  { id: 107, name: "Mâûn", ayahCount: 7, arabic: "أَرَأَيْتَ الَّذِي" },
  { id: 108, name: "Kevser", ayahCount: 3, arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ" },
  { id: 109, name: "Kâfirûn", ayahCount: 6, arabic: "قُلْ يا أَيُّهَا الْكَافِرُونَ" },
  { id: 110, name: "Nasr", ayahCount: 3, arabic: "إِذَا جَاءَ نَصْرُ اللَّهِ" },
  { id: 111, name: "Tebbet", ayahCount: 5, arabic: "تَبَّتْ يَدَا أَبِي لَهَبٍ" },
  { id: 112, name: "İhlâs", ayahCount: 4, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ" },
  { id: 113, name: "Felâk", ayahCount: 5, arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ" },
  { id: 114, name: "Nâs", ayahCount: 6, arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ" },
];

type HifzData = Record<number, { memorized: boolean; repeatCount: number }>;

export default function HifzScreen() {
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<HifzData>({});

  useEffect(() => {
    (async () => {
      try {
        const d = await AsyncStorage.getItem(STORAGE_KEY);
        if (d) {
          const parsed = JSON.parse(d);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) setProgress(parsed);
        }
      } catch {}
    })();
  }, []);

  const save = useCallback(async (data: HifzData) => {
    setProgress(data);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const toggleMemorized = useCallback((id: number) => {
    hapticImpact(ImpactFeedbackStyle.Medium);
    const current = progress[id] || { memorized: false, repeatCount: 0 };
    save({ ...progress, [id]: { ...current, memorized: !current.memorized } });
  }, [progress, save]);

  const incrementRepeat = useCallback((id: number) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    const current = progress[id] || { memorized: false, repeatCount: 0 };
    save({ ...progress, [id]: { ...current, repeatCount: current.repeatCount + 1 } });
  }, [progress, save]);

  const resetRepeat = useCallback((id: number) => {
    Alert.alert("Sıfırla", "Tekrar sayacını sıfırlamak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sıfırla",
        style: "destructive",
        onPress: () => {
          const current = progress[id] || { memorized: false, repeatCount: 0 };
          save({ ...progress, [id]: { ...current, repeatCount: 0 } });
        },
      },
    ]);
  }, [progress, save]);

  const memorizedCount = SURAHS.filter((s) => progress[s.id]?.memorized).length;
  const totalPercent = Math.round((memorizedCount / SURAHS.length) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#5C1A3A", "#0A0E17"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#F43F5E" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>Hıfz Modu</Text>
            <Text style={{ color: "rgba(244,63,94,0.6)", fontSize: 13, marginTop: 2 }}>Kuran ezberleme planı</Text>
          </View>
        </View>

        {/* Genel ilerleme */}
        <View style={{ marginTop: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>{memorizedCount}/{SURAHS.length} sure ezber</Text>
            <Text style={{ color: "#F43F5E", fontSize: 14, fontWeight: "700" }}>%{totalPercent}</Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.08)" }}>
            <LinearGradient
              colors={["#F43F5E", "#EC4899"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 8, borderRadius: 4, width: `${totalPercent}%` }}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20, paddingTop: 10 }}>
        {SURAHS.map((surah, idx) => {
          const data = progress[surah.id] || { memorized: false, repeatCount: 0 };
          return (
            <View key={surah.id}>
              <View style={{ marginHorizontal: 16, marginBottom: 10, padding: 16, borderRadius: 16, backgroundColor: data.memorized ? "rgba(244,63,94,0.08)" : "rgba(10,24,18,0.8)", borderWidth: 1, borderColor: data.memorized ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.08)" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: data.memorized ? "rgba(244,63,94,0.15)" : "rgba(10,24,18,0.7)", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: data.memorized ? "#F43F5E" : "#6B7280", fontSize: 13, fontWeight: "800" }}>{idx + 1}</Text>
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>{surah.name}</Text>
                      <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>{surah.ayahCount} ayet</Text>
                    </View>
                  </View>
                  <Text style={{ color: data.memorized ? "#F43F5E" : "#6B7280", fontSize: 16, textAlign: "right", flex: 1 }} numberOfLines={1}>
                    {surah.arabic}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 }}>
                  <TouchableOpacity onPress={() => toggleMemorized(surah.id)} activeOpacity={0.7} style={{ flex: 1 }}>
                    <LinearGradient
                      colors={data.memorized ? ["#2D6A4F", "#1B4332"] : ["#5C1A3A", "#3E1028"]}
                      style={{ paddingVertical: 10, borderRadius: 10, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
                    >
                      <Ionicons name={data.memorized ? "checkmark-circle" : "ellipse-outline"} size={16} color={data.memorized ? "#40C057" : "#F43F5E"} />
                      <Text style={{ color: data.memorized ? "#40C057" : "#F43F5E", fontSize: 13, fontWeight: "700", marginLeft: 6 }}>
                        {data.memorized ? "Ezber" : "Ezberle"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => incrementRepeat(surah.id)} onLongPress={() => resetRepeat(surah.id)} activeOpacity={0.7} style={{ flex: 1 }}>
                    <View style={{ paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(10,24,18,0.7)", alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                      <MaterialCommunityIcons name="repeat" size={16} color="rgba(255,255,255,0.6)" />
                      <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700", marginLeft: 6 }}>
                        {data.repeatCount}x tekrar
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

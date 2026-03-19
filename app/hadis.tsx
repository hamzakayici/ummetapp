import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hapticImpact, ImpactFeedbackStyle } from "../src/utils/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Hadis = { id: number; arabic: string; turkish: string; source: string; category: string };

const CATEGORIES = ["Tümü", "İman", "Ahlak", "İbadet", "Dua", "Sabır", "İlim", "Aile"];

const HADISLER: Hadis[] = [
  { id: 1, arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", turkish: "Ameller ancak niyetlere göredir. Herkesin niyet ettiği ne ise eline geçecek olan odur.", source: "Buhârî, Müslim", category: "İman" },
  { id: 2, arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", turkish: "Sizden biriniz kendisi için sevdiğini kardeşi için de sevmedikçe iman etmiş olmaz.", source: "Buhârî, Müslim", category: "İman" },
  { id: 3, arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", turkish: "Müslüman, dilinden ve elinden diğer Müslümanların güvende olduğu kimsedir.", source: "Buhârî, Müslim", category: "Ahlak" },
  { id: 4, arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", turkish: "Allah'a ve ahiret gününe iman eden kimse ya hayır söylesin ya da sussun.", source: "Buhârî, Müslim", category: "Ahlak" },
  { id: 5, arabic: "لا تَغْضَبْ", turkish: "Kızma!", source: "Buhârî", category: "Ahlak" },
  { id: 6, arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ", turkish: "Temizlik imanın yarısıdır.", source: "Müslim", category: "İbadet" },
  { id: 7, arabic: "صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي", turkish: "Namazı benim kıldığım gibi kılın.", source: "Buhârî", category: "İbadet" },
  { id: 8, arabic: "الصِّيَامُ جُنَّةٌ", turkish: "Oruç bir kalkandır.", source: "Buhârî, Müslim", category: "İbadet" },
  { id: 9, arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ", turkish: "Dua ibadetin özüdür.", source: "Tirmizî", category: "Dua" },
  { id: 10, arabic: "ادْعُوا اللَّهَ وَأَنْتُمْ مُوقِنُونَ بِالإِجَابَةِ", turkish: "Kabul edileceğine kesin inanarak Allah'a dua edin.", source: "Tirmizî", category: "Dua" },
  { id: 11, arabic: "مَا أَصَابَ مُسْلِمًا مِنْ هَمٍّ إِلَّا كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ", turkish: "Müslümanın başına gelen her sıkıntı, günahlarına kefaret olur.", source: "Buhârî, Müslim", category: "Sabır" },
  { id: 12, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", turkish: "Zorlukla beraber kolaylık vardır. Sabırlı olun.", source: "Müslim", category: "Sabır" },
  { id: 13, arabic: "اطْلُبُوا الْعِلْمَ مِنَ الْمَهْدِ إِلَى اللَّحْدِ", turkish: "İlmi beşikten mezara kadar arayın.", source: "Beyhakî", category: "İlim" },
  { id: 14, arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", turkish: "Kim ilim elde etmek için bir yola girerse, Allah onun cennet yolunu kolaylaştırır.", source: "Müslim", category: "İlim" },
  { id: 15, arabic: "خَيْرُكُمْ خَيْرُكُمْ لأَهْلِهِ", turkish: "Sizin en hayırlınız ailesine en hayırlı olanınızdır.", source: "Tirmizî", category: "Aile" },
  { id: 16, arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ", turkish: "Allah refiktir, her işte yumuşaklığı sever.", source: "Buhârî, Müslim", category: "Ahlak" },
  { id: 17, arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ", turkish: "Din kardeşine gülümsemen sadakadır.", source: "Tirmizî", category: "Ahlak" },
  { id: 18, arabic: "مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ", turkish: "İnsanlara teşekkür etmeyen Allah'a da şükretmez.", source: "Tirmizî", category: "Ahlak" },
  { id: 19, arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ", turkish: "Güçlü mümin, zayıf müminden daha hayırlı ve Allah'a daha sevimlidir.", source: "Müslim", category: "İman" },
  { id: 20, arabic: "إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى أَجْسَامِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ", turkish: "Allah sizin bedenlerinize değil, kalplerinize bakar.", source: "Müslim", category: "İman" },
  { id: 21, arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ", turkish: "İnsanların en hayırlısı, insanlara en faydalı olanıdır.", source: "Taberânî", category: "Ahlak" },
  { id: 22, arabic: "إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلاَّ مِنْ ثَلاَثٍ", turkish: "İnsan öldüğünde üç şey hariç ameli kesilir: sadaka-i cariye, faydalı ilim, dua eden salih evlat.", source: "Müslim", category: "İlim" },
  { id: 23, arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", turkish: "Allah'a en sevimli amel, az da olsa devamlı olanıdır.", source: "Buhârî, Müslim", category: "İbadet" },
  { id: 24, arabic: "لاَ يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ", turkish: "Kalbinde zerre kadar kibir bulunan kimse cennete giremez.", source: "Müslim", category: "Ahlak" },
  { id: 25, arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", turkish: "Kim inanarak ve sevabını umarak Ramazan orucunu tutarsa, geçmiş günahları bağışlanır.", source: "Buhârî, Müslim", category: "İbadet" },
];

const STORAGE_KEY = "@ummet_hadis_favs";

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>["name"]> = {
  "Tümü": "book-open-variant",
  "İman": "heart-pulse",
  "Ahlak": "hand-heart",
  "İbadet": "mosque",
  "Dua": "hands-pray",
  "Sabır": "shield-half-full",
  "İlim": "school",
  "Aile": "home-heart",
};

export default function HadisScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [favIds, setFavIds] = useState<number[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((d) => d && setFavIds(JSON.parse(d)));
  }, []);

  const toggleFav = useCallback(async (id: number) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    const updated = favIds.includes(id) ? favIds.filter((f) => f !== id) : [...favIds, id];
    setFavIds(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [favIds]);

  const filtered = useMemo(() => {
    let list = HADISLER;
    if (category !== "Tümü") list = list.filter((h) => h.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((h) => h.turkish.toLowerCase().includes(q) || h.source.toLowerCase().includes(q));
    }
    return list;
  }, [category, search]);

  const renderHadis = useCallback(({ item: hadis }: { item: Hadis }) => {
    const isFav = favIds.includes(hadis.id);
    return (
      <View style={{
        marginHorizontal: 16, marginBottom: 12, borderRadius: 16,
        backgroundColor: "rgba(10,24,18,0.7)", borderWidth: 1,
        borderColor: "rgba(139,92,246,0.06)", overflow: "hidden",
      }}>
        {/* Üst — Kategori + Favori */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(139,92,246,0.1)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
            <MaterialCommunityIcons name={CATEGORY_ICONS[hadis.category] || "tag"} size={12} color="#8B5CF6" />
            <Text style={{ color: "#8B5CF6", fontSize: 11, fontWeight: "700", marginLeft: 5 }}>{hadis.category}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFav(hadis.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#E53935" : "rgba(255,255,255,0.25)"} />
          </TouchableOpacity>
        </View>

        {/* Arapça */}
        <Text style={{ color: "#FFFFFF", fontSize: 19, textAlign: "right", lineHeight: 34, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 }}>
          {hadis.arabic}
        </Text>

        {/* Çizgi */}
        <View style={{ height: 1, backgroundColor: "rgba(139,92,246,0.06)", marginHorizontal: 16 }} />

        {/* Türkçe */}
        <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 22, paddingHorizontal: 16, paddingTop: 10 }}>
          {hadis.turkish}
        </Text>

        {/* Kaynak */}
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 }}>
          <MaterialCommunityIcons name="book-open-page-variant-outline" size={12} color="rgba(255,255,255,0.25)" />
          <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: "600", marginLeft: 5 }}>{hadis.source}</Text>
        </View>
      </View>
    );
  }, [favIds, toggleFav]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />

      {/* Header */}
      <LinearGradient colors={["#2D1B69", "#0A0E17"]} style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#8B5CF6" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>Hadis Koleksiyonu</Text>
            <Text style={{ color: "rgba(139,92,246,0.6)", fontSize: 13, marginTop: 2 }}>{HADISLER.length} sahih hadis</Text>
          </View>
        </View>

        {/* Arama */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, backgroundColor: "rgba(10,24,18,0.8)", borderRadius: 12, paddingHorizontal: 14, height: 44 }}>
          <Ionicons name="search" size={16} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Hadis ara..."
            placeholderTextColor="#6B7280"
            style={{ flex: 1, color: "#FFFFFF", fontSize: 15, marginLeft: 10 }}
          />
        </View>
      </LinearGradient>

      {/* Kategoriler */}
      <View style={{ paddingVertical: 14 }}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          renderItem={({ item: c }) => (
            <TouchableOpacity onPress={() => { setCategory(c); hapticImpact(ImpactFeedbackStyle.Light); }} activeOpacity={0.7}>
              <View style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: category === c ? "#8B5CF6" : "rgba(10,24,18,0.8)",
                borderWidth: 1,
                borderColor: category === c ? "#8B5CF6" : "rgba(139,92,246,0.1)",
              }}>
                <MaterialCommunityIcons name={CATEGORY_ICONS[c] || "tag"} size={14} color={category === c ? "#FFF" : "rgba(255,255,255,0.5)"} />
                <Text style={{
                  color: category === c ? "#FFF" : "rgba(255,255,255,0.7)",
                  fontSize: 14, fontWeight: "600", marginLeft: 6,
                }}>{c}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Hadisler */}
      <FlatList
        data={filtered}
        keyExtractor={(h) => String(h.id)}
        renderItem={renderHadis}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <MaterialCommunityIcons name="book-search" size={48} color="#6B7280" />
            <Text style={{ color: "#6B7280", fontSize: 15, marginTop: 12 }}>Hadis bulunamadı</Text>
          </View>
        }
      />
    </View>
  );
}

import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const PRAYERS = [
  {
    name: "Sabah Namazı",
    icon: "weather-sunset-up" as const,
    color: "#F97316",
    totalRakat: 4,
    time: "Fecr-i sadıktan güneş doğana kadar",
    details: [
      { type: "Sünnet", rakat: 2, kind: "sunnet", desc: "2 rekat sünnet-i müekkede — sessiz okunur. Hz. Peygamber (s.a.v) hiç terk etmemiştir." },
      { type: "Farz", rakat: 2, kind: "farz", desc: "2 rekat farz — Fâtiha ve sure sesli okunur. İmamın arkasında sadece Fâtiha okunur." },
    ],
  },
  {
    name: "Öğle Namazı",
    icon: "white-balance-sunny" as const,
    color: "#EAB308",
    totalRakat: 10,
    time: "Güneş tepe noktasını geçtikten sonra",
    details: [
      { type: "İlk Sünnet", rakat: 4, kind: "sunnet", desc: "4 rekat sünnet-i müekkede — sessiz okunur. 2. rekatta oturulur (ilk ka'de)." },
      { type: "Farz", rakat: 4, kind: "farz", desc: "4 rekat farz — tamamı sessiz okunur. 2. rekatta Ettehiyyat okunur." },
      { type: "Son Sünnet", rakat: 2, kind: "sunnet", desc: "2 rekat sünnet-i müekkede — sessiz okunur." },
    ],
  },
  {
    name: "İkindi Namazı",
    icon: "weather-partly-cloudy" as const,
    color: "#3B82F6",
    totalRakat: 8,
    time: "Her şeyin gölgesi iki misline ulaştığında",
    details: [
      { type: "Sünnet", rakat: 4, kind: "gayri", desc: "4 rekat sünnet-i gayri müekkede — kılınması tavsiye edilir ama terk edilmesi günah değildir." },
      { type: "Farz", rakat: 4, kind: "farz", desc: "4 rekat farz — tamamı sessiz okunur. 2. rekatta oturulur." },
    ],
  },
  {
    name: "Akşam Namazı",
    icon: "weather-sunset-down" as const,
    color: "#E53935",
    totalRakat: 5,
    time: "Güneş batımından şafak kaybolana kadar",
    details: [
      { type: "Farz", rakat: 3, kind: "farz", desc: "3 rekat farz — ilk 2 rekatta Fâtiha ve sure sesli okunur. 3. rekatta yalnız Fâtiha sessiz okunur." },
      { type: "Sünnet", rakat: 2, kind: "sunnet", desc: "2 rekat sünnet-i müekkede — sessiz okunur." },
    ],
  },
  {
    name: "Yatsı Namazı",
    icon: "weather-night" as const,
    color: "#6366F1",
    totalRakat: 13,
    time: "Şafak kaybolmasından fecre kadar",
    details: [
      { type: "İlk Sünnet", rakat: 4, kind: "gayri", desc: "4 rekat sünnet-i gayri müekkede — kılınması tavsiye edilir." },
      { type: "Farz", rakat: 4, kind: "farz", desc: "4 rekat farz — ilk 2 rekat sesli, son 2 rekat sessiz okunur." },
      { type: "Son Sünnet", rakat: 2, kind: "sunnet", desc: "2 rekat sünnet-i müekkede — sessiz okunur." },
      { type: "Vitir", rakat: 3, kind: "vacip", desc: "3 rekat vitir vacip — her rekatta Fâtiha + sure okunur. 3. rekatta kunut duası okunur." },
    ],
  },
];

const NAMAZ_ADIMLARI = [
  {
    step: "Abdest",
    emoji: "💧",
    icon: "water" as const,
    desc: "Eller 3 kez yıkanır, ağza ve buruna 3'er kez su verilir, yüz 3 kez yıkanır, kollar dirseklere kadar yıkanır, başa mesh yapılır, kulaklar meshedilir ve ayaklar topuklara kadar yıkanır.",
    tip: "Abdesti bozan haller: idrar, gaz çıkışı, kan akması, uyku, bayılma.",
  },
  {
    step: "Niyet",
    emoji: "🤲",
    icon: "heart-outline" as const,
    desc: "Kılınacak namazın türünü (farz, sünnet, vitir) ve vaktini kalben belirlemektir. Dil ile söylemek sünnettir.",
    tip: "Niyet, tekbirden hemen önce yapılmalıdır.",
  },
  {
    step: "İftitah Tekbiri",
    emoji: "🙌",
    icon: "hand-front-right" as const,
    desc: "Ayakta durarak \"Allahu Ekber\" denir ve eller kulakların hizasına kaldırılır (hanımlar omuz hizasına). Eller bağlanır.",
    tip: "Tekbir esnasında parmaklar açık ve kıbleye dönük olmalıdır.",
  },
  {
    step: "Kıyam (Ayakta Durma)",
    emoji: "🧍",
    icon: "human-male" as const,
    desc: "Ayakta durarak sırasıyla: Sübhaneke duası, Eûzü-Besmele, Fâtiha suresi ve ardından bir sure (veya 3 kısa ayet) okunur.",
    tip: "Gözler secde yerine bakmalı, eller göbek altında bağlı olmalıdır.",
  },
  {
    step: "Rükû (Eğilme)",
    emoji: "🙇",
    icon: "human" as const,
    desc: "\"Allahu Ekber\" diyerek eğilinir. Eller dizleri kavrar, sırt düz tutulur. 3 kez \"Sübhâne Rabbiye'l-Azîm\" denir. Doğrulurken \"Semi'allâhu limen hamideh\" denir.",
    tip: "Rükûda baş ile sırt aynı hizada olmalıdır.",
  },
  {
    step: "Secde (Yere Kapanma)",
    emoji: "🕌",
    icon: "arrow-down-bold" as const,
    desc: "\"Allahu Ekber\" diyerek alnı, burnu, iki eli, iki dizi ve iki ayağı yere koyarak secdeye varılır. 3 kez \"Sübhâne Rabbiye'l-A'lâ\" denir. İki secde arasında kısa oturulur.",
    tip: "Secde, namazın en faziletli anıdır. Bol dua edin!",
  },
  {
    step: "Ka'de (Oturuş)",
    emoji: "🪑",
    icon: "seat" as const,
    desc: "Son rekatta oturulur. Sırasıyla: Ettehiyyatü, Allahümme salli, Allahümme bârik ve Rabbenâ âtinâ duaları okunur.",
    tip: "Son oturuşta sağ ayak dikili, sol ayak yatık olmalıdır.",
  },
  {
    step: "Selam",
    emoji: "👋",
    icon: "hand-wave" as const,
    desc: "Başı sağa çevirerek \"Esselâmu aleyküm ve rahmetullâh\" denir, ardından sola çevirerek aynısı tekrarlanır.",
    tip: "Selam verirken omzunuzdaki meleklere selam verdiğinizi düşünün.",
  },
];

function KindBadge({ kind }: { kind: string }) {
  const config = {
    farz: { label: "Farz", bg: "rgba(220,38,38,0.15)", color: "#EF4444" },
    sunnet: { label: "Sünnet", bg: "rgba(34,197,94,0.15)", color: "#22C55E" },
    gayri: { label: "Gayri Müekkede", bg: "rgba(59,130,246,0.15)", color: "#3B82F6" },
    vacip: { label: "Vacip", bg: "rgba(168,85,247,0.15)", color: "#A855F7" },
  }[kind] || { label: kind, bg: "rgba(255,255,255,0.1)", color: "#FFF" };

  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: config.bg }}>
      <Text style={{ color: config.color, fontSize: 10, fontWeight: "700" }}>{config.label}</Text>
    </View>
  );
}

export default function NamazRehberiScreen() {
  const insets = useSafeAreaInsets();
  const [expandedPrayer, setExpandedPrayer] = useState<number | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#1B3A5C", "#0A0E17"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 18, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#3B82F6" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>Namaz Rehberi</Text>
            <Text style={{ color: "rgba(59,130,246,0.6)", fontSize: 13, marginTop: 2 }}>Adım adım namaz kılmayı öğrenin</Text>
          </View>
          <MaterialCommunityIcons name="mosque" size={28} color="rgba(59,130,246,0.3)" />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>

        {/* Hızlı Bilgi Kartı */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={["rgba(59,130,246,0.12)", "rgba(10,24,18,0.8)"]}
            style={{ marginHorizontal: 16, marginTop: 14, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(59,130,246,0.15)" }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#3B82F6" />
              <Text style={{ color: "#3B82F6", fontSize: 15, fontWeight: "700", marginLeft: 6 }}>Günlük Namaz Özeti</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {[
                { label: "Farz", count: "17", color: "#EF4444" },
                { label: "Sünnet", count: "12", color: "#22C55E" },
                { label: "Vitir", count: "3", color: "#A855F7" },
                { label: "Toplam", count: "40", color: "#D4AF37" },
              ].map((item) => (
                <View key={item.label} style={{ alignItems: "center" }}>
                  <Text style={{ color: item.color, fontSize: 22, fontWeight: "800" }}>{item.count}</Text>
                  <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "600" }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Adımlar */}
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginHorizontal: 16, marginTop: 18, marginBottom: 10 }}>
          Namazın Adımları
        </Text>
        {NAMAZ_ADIMLARI.map((item, idx) => (
          <Animated.View key={idx} entering={FadeInDown.delay(200 + idx * 60).springify()}>
            <View style={{ marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 14, backgroundColor: "rgba(10,24,18,0.8)", borderWidth: 1, borderColor: "rgba(59,130,246,0.06)" }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(59,130,246,0.12)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <MaterialCommunityIcons name={item.icon} size={22} color="#3B82F6" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}>{item.step}</Text>
                    <View style={{ marginLeft: 8, backgroundColor: "rgba(59,130,246,0.15)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ color: "#3B82F6", fontSize: 10, fontWeight: "700" }}>{idx + 1}/8</Text>
                    </View>
                  </View>
                  <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 4, lineHeight: 20 }}>{item.desc}</Text>
                  {/* İpucu */}
                  <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 8, backgroundColor: "rgba(212,175,55,0.06)", padding: 10, borderRadius: 10 }}>
                    <MaterialCommunityIcons name="lightbulb-outline" size={14} color="#D4AF37" style={{ marginTop: 1 }} />
                    <Text style={{ color: "#D4AF37", fontSize: 12, lineHeight: 18, marginLeft: 6, flex: 1, fontWeight: "500" }}>{item.tip}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* Vakitlere göre */}
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "700", marginHorizontal: 16, marginTop: 18, marginBottom: 10 }}>
          Vakit Namazları
        </Text>
        {PRAYERS.map((prayer, idx) => (
          <Animated.View key={idx} entering={FadeInDown.delay(700 + idx * 80).springify()}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setExpandedPrayer(expandedPrayer === idx ? null : idx)}
              style={{ marginHorizontal: 16, marginBottom: 10 }}
            >
              <View style={{ padding: 16, borderRadius: 16, backgroundColor: expandedPrayer === idx ? "rgba(255,255,255,0.05)" : "rgba(10,24,18,0.8)", borderWidth: 1, borderColor: expandedPrayer === idx ? `${prayer.color}30` : "rgba(255,255,255,0.08)" }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${prayer.color}18`, alignItems: "center", justifyContent: "center" }}>
                      <MaterialCommunityIcons name={prayer.icon} size={22} color={prayer.color} />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>{prayer.name}</Text>
                      <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>{prayer.time}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "center", marginRight: 8 }}>
                    <Text style={{ color: prayer.color, fontSize: 20, fontWeight: "800" }}>{prayer.totalRakat}</Text>
                    <Text style={{ color: "#6B7280", fontSize: 10 }}>rekat</Text>
                  </View>
                  <Ionicons name={expandedPrayer === idx ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
                </View>

                {expandedPrayer === idx && (
                  <View style={{ marginTop: 14, gap: 8 }}>
                    {prayer.details.map((d, i) => (
                      <View key={i} style={{ padding: 12, borderRadius: 12, backgroundColor: `${prayer.color}08`, borderLeftWidth: 3, borderLeftColor: prayer.color }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Text style={{ color: prayer.color, fontSize: 14, fontWeight: "700" }}>{d.type}</Text>
                            <KindBadge kind={d.kind} />
                          </View>
                          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "800" }}>{d.rakat} Rekat</Text>
                        </View>
                        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6, lineHeight: 20 }}>{d.desc}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Önemli Bilgiler */}
        <Animated.View entering={FadeInDown.delay(1100).springify()}>
          <View style={{ marginHorizontal: 16, marginTop: 8, padding: 16, borderRadius: 16, backgroundColor: "rgba(10,24,18,0.7)", borderWidth: 1, borderColor: "rgba(27,67,50,0.1)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <MaterialCommunityIcons name="star-crescent" size={18} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 15, fontWeight: "700", marginLeft: 6 }}>Namaz Hakkında</Text>
            </View>
            {[
              "Namaz, İslâm'ın beş şartından biridir ve her Müslümana farzdır.",
              "Günde 5 vakit namazda toplam 17 rekat farz, 12 rekat sünnet-i müekkede kılınır.",
              "Cuma namazı, Cuma günü öğle namazının yerine kılınır ve erkeklere farzdır.",
              "Seferi (yolcu) olan kişi 4 rekatlık farzları 2 rekat olarak kılar.",
              "Namazın şartları: Hadesten taharet, necasetten taharet, setr-i avret, istikbal-i kıble, vakit ve niyet.",
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#2D6A4F", marginRight: 10, marginTop: 7 }} />
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 20, flex: 1 }}>{item}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

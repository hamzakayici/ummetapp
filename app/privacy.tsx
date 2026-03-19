import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const SECTIONS = [
  {
    title: "1. Toplanan Veriler",
    content: "Ümmet uygulaması, yalnızca namaz vakitlerini hesaplamak amacıyla konum bilginizi kullanır. Konum veriniz cihazınızda yerel olarak saklanır ve üçüncü taraflarla paylaşılmaz. Kişisel bilgileriniz (ad, e-posta vb.) yalnızca iletişim formunda siz paylaştığınızda toplanır.",
  },
  {
    title: "2. Verilerin Kullanımı",
    content: "Toplanan konum verisi yalnızca namaz vakitlerini ve kıble yönünü hesaplamak için kullanılır. İletişim formu verileri yalnızca destek taleplerine yanıt vermek için kullanılır. Uygulama içi kullanım istatistikleri anonim olarak toplanabilir.",
  },
  {
    title: "3. Verilerin Saklanması",
    content: "Namaz vakitleri ve tercihleriniz cihazınızda yerel olarak (AsyncStorage) saklanır. Sunuculara herhangi bir kişisel veri aktarılmaz. İlahi verileri Supabase altyapısında güvenli şekilde barındırılır.",
  },
  {
    title: "4. Üçüncü Taraf Hizmetler",
    content: "Uygulama, namaz vakitleri için Aladhan API'sini, konum adı için BigDataCloud API'sini kullanır. Bu hizmetlere yalnızca konum koordinatları gönderilir, kişisel bilgi paylaşılmaz.",
  },
  {
    title: "5. Çocukların Gizliliği",
    content: "Uygulamamız tüm yaş grupları için uygundur ve çocuklardan bilerek kişisel bilgi toplamaz.",
  },
  {
    title: "6. Değişiklikler",
    content: "Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler uygulama içi bildirim ile duyurulacaktır.",
  },
  {
    title: "7. İletişim",
    content: "Gizlilik politikamız hakkında sorularınız için destek@ummetapp.com adresinden bize ulaşabilirsiniz.",
  },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient colors={["#1B4332", "#2D6A4F"]} style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={22} color="#D4AF37" />
            </TouchableOpacity>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginLeft: 12 }}>Gizlilik Politikası</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 20 }}>Son güncelleme: 27 Şubat 2026</Text>
        </Animated.View>

        {SECTIONS.map((section, i) => (
          <Animated.View key={section.title} entering={FadeInDown.delay(200 + i * 50).springify()} style={{ marginBottom: 20 }}>
            <Text style={{ color: "#D4AF37", fontSize: 15, fontWeight: "700", marginBottom: 6 }}>{section.title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 20 }}>{section.content}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

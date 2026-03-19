import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const SECTIONS = [
  {
    title: "1. Kabul",
    content: "Ümmet uygulamasını indirip kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız uygulamayı kullanmayınız.",
  },
  {
    title: "2. Hizmet Tanımı",
    content: "Ümmet, namaz vakitleri, Kuran okuma, dua, zikir, kıble pusulası ve hicri takvim gibi İslami yaşam araçları sunan bir mobil uygulamadır.",
  },
  {
    title: "3. Kullanım Koşulları",
    content: "Uygulamayı yalnızca yasal amaçlarla kullanabilirsiniz. İçerikleri kopyalayamaz, değiştiremez veya ticari amaçla dağıtamazsınız. Uygulamanın güvenliğini tehlikeye atacak herhangi bir girişimde bulunamazsınız.",
  },
  {
    title: "4. İçerik",
    content: "Uygulamadaki Kuran metinleri, dualar, hadisler ve İslami içerikler güvenilir kaynaklardan derlenmiştir. İçeriklerin doğruluğu için azami özen gösterilmekle birlikte, dini konularda alim görüşüne başvurmanız tavsiye edilir.",
  },
  {
    title: "5. Özellikler",
    content: "Uygulamanın tüm özellikleri şu an ücretsiz olarak sunulmaktadır. İleride ek özellikler sunulabilir.",
  },
  {
    title: "6. Sorumluluk Sınırı",
    content: "Namaz vakitleri ve kıble yönü hesaplamaları konum ve internet bağlantısına bağlıdır. Olası yanlışlıklar için sorumluluk kabul edilmez. Uygulama 'olduğu gibi' sunulmaktadır.",
  },
  {
    title: "7. Fikri Mülkiyet",
    content: "Ümmet uygulamasının tasarımı, logosu ve özgün içerikleri telif hakkı ile korunmaktadır. İzinsiz kullanım yasaktır.",
  },
  {
    title: "8. Değişiklikler",
    content: "Bu kullanım şartları önceden bildirimde bulunulmaksızın değiştirilebilir. Güncel şartlar her zaman uygulama içinden erişilebilir olacaktır.",
  },
  {
    title: "9. İletişim",
    content: "Kullanım şartları hakkında sorularınız için destek@ummetapp.com adresinden bize ulaşabilirsiniz.",
  },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient colors={["#1B4332", "#2D6A4F"]} style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(27,67,50,0.06)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={22} color="#D4AF37" />
            </TouchableOpacity>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginLeft: 12 }}>Kullanım Şartları</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <Text style={{ color: "#6B7B8D", fontSize: 12, marginBottom: 20 }}>Son güncelleme: 27 Şubat 2026</Text>
        </Animated.View>

        {SECTIONS.map((section, i) => (
          <Animated.View key={section.title} entering={FadeInDown.delay(200 + i * 50).springify()} style={{ marginBottom: 20 }}>
            <Text style={{ color: "#D4AF37", fontSize: 15, fontWeight: "700", marginBottom: 6 }}>{section.title}</Text>
            <Text style={{ color: "#6B7B8D", fontSize: 13, lineHeight: 20 }}>{section.content}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

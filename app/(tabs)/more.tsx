import { View, Text, ScrollView, TouchableOpacity, Platform, Alert, Linking, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { router } from "expo-router";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 85 : 65;

type MenuItem = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  title: string;
  subtitle: string;
  route?: string;
  routeParams?: Record<string, string>;
};

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: "İbadet Araçları",
    items: [
      { icon: "mosque", iconColor: "#40C057", title: "Yakındaki Camiler", subtitle: "Konumunuza en yakın camiler", route: "/mosques" },
      { icon: "compass-outline", iconColor: "#40C057", title: "Kıble Pusulası", subtitle: "Kıble yönünü bulun", route: "/qibla" },
      { icon: "hands-pray", iconColor: "#D4AF37", title: "Dua Kitabı", subtitle: "100+ kategorize dua", route: "/duas" },
      { icon: "calendar-month", iconColor: "#A78BFA", title: "İslami Takvim", subtitle: "Hicri takvim & önemli günler", route: "/hijri-calendar" },
      { icon: "moon-new", iconColor: "#F0D060", title: "Ramazan Hub", subtitle: "İftar, sahur & hatim planı", route: "/ramazan-hub" },
    ],
  },
  {
    title: "Öğrenme",
    items: [
      { icon: "school-outline", iconColor: "#3B82F6", title: "Namaz Rehberi", subtitle: "Adım adım namaz öğrenin", route: "/namaz-rehberi" },
      { icon: "brain", iconColor: "#F43F5E", title: "Hıfz Modu", subtitle: "Kuran ezberleme planı", route: "/hifz" },
      { icon: "bookshelf", iconColor: "#8B5CF6", title: "Hadis Koleksiyonu", subtitle: "Sahih hadisler", route: "/hadis" },
    ],
  },
  {
    title: "İstatistikler",
    items: [
      { icon: "chart-line", iconColor: "#10B981", title: "İbadet Analitik", subtitle: "Haftalık & aylık performans", route: "/analytics" },
      { icon: "fire", iconColor: "#F97316", title: "Streak Takibi", subtitle: "Ardışık gün sayacı", route: "/streak" },
      { icon: "trophy", iconColor: "#EAB308", title: "Rozetler", subtitle: "Başarı rozet sistemi", route: "/badges" },
    ],
  },
  {
    title: "Araçlar",
    items: [
      { icon: "cash-multiple", iconColor: "#22D3EE", title: "Zekat Hesaplayıcı", subtitle: "Zekat miktarı hesaplama", route: "/calculator", routeParams: { type: "zekat" } },
      { icon: "grain", iconColor: "#84CC16", title: "Fitre Hesaplayıcı", subtitle: "Fitre miktarını öğrenin", route: "/calculator", routeParams: { type: "fitre" } },
      { icon: "calculator-variant", iconColor: "#F59E0B", title: "Kefaret Hesaplayıcı", subtitle: "Oruç kefareti hesaplama", route: "/calculator", routeParams: { type: "kefaret" } },
    ],
  },
  {
    title: "Destek & İletişim",
    items: [
      { icon: "email-outline", iconColor: "#3B82F6", title: "Bize Yazın", subtitle: "Öneri ve şikayetlerinizi iletin", route: "/contact" },
      { icon: "star-outline", iconColor: "#F59E0B", title: "Uygulamayı Değerlendir", subtitle: "App Store'da bizi değerlendirin", route: "rate" },
      { icon: "share-variant-outline", iconColor: "#10B981", title: "Arkadaşlarınla Paylaş", subtitle: "Ümmet'i sevdiklerinle paylaş", route: "share" },
      { icon: "shield-check-outline", iconColor: "#8A9BA8", title: "Gizlilik Politikası", subtitle: "Verileriniz güvende", route: "/privacy" },
      { icon: "file-document-outline", iconColor: "#A78BFA", title: "Kullanım Şartları", subtitle: "Hizmet koşulları", route: "/terms" },
    ],
  },
  {
    title: "Hesap & Ayarlar",
    items: [
      { icon: "cog-outline", iconColor: "#8A9BA8", title: "Ayarlar", subtitle: "Bildirimler, dil & hesaplama", route: "/settings" },
    ],
  },
];

function MenuItemComponent({ item, index, sectionIndex }: { item: MenuItem; index: number; sectionIndex: number }) {
  const handlePress = () => {
    if (!item.route) return;

    if (item.route === "rate") {
      const storeUrl = Platform.OS === "ios"
        ? "https://apps.apple.com/app/id6760871547"
        : "https://play.google.com/store/apps/details?id=com.ummet.app";
      Linking.openURL(storeUrl);
      return;
    }
    if (item.route === "share") {
      Share.share({
        message: "Ümmet - İslami yaşam uygulaması. Namaz vakitleri, Kuran, dua ve daha fazlası! İndir: https://apps.apple.com/app/id6760871547",
      });
      return;
    }

    router.push({ pathname: item.route as any, params: item.routeParams });
  };

  return (
    <Animated.View entering={FadeInDown.delay(100 + sectionIndex * 60 + index * 40).springify()}>
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 20,
            marginBottom: 6,
            paddingHorizontal: 14,
            paddingVertical: 14,
            borderRadius: 16,
            backgroundColor: "rgba(18, 26, 36, 0.6)",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              backgroundColor: "rgba(27, 67, 50, 0.25)",
            }}
          >
            <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-text-primary font-reem-medium text-base">{item.title}</Text>
            <Text className="text-text-secondary font-inter text-xs" style={{ marginTop: 2 }}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#5A6B78" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg">
      <LinearGradient colors={["#1B4332", "#0A0F14"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingBottom: 20, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Text className="text-text-primary font-reem-bold text-2xl">Diğer</Text>
          <Text className="text-text-secondary font-inter text-sm" style={{ marginTop: 4 }}>Araçlar, ayarlar & daha fazlası</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <View key={section.title} style={{ marginTop: 20 }}>
            <Text
              className="text-text-secondary font-reem-medium text-xs"
              style={{ paddingHorizontal: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}
            >
              {section.title}
            </Text>
            {section.items.map((item, index) => (
              <MenuItemComponent key={item.title} item={item} index={index} sectionIndex={sectionIndex} />
            ))}
          </View>
        ))}

        {/* Version */}
        <View style={{ alignItems: "center", marginTop: 32, marginBottom: 16 }}>
          <Text className="text-text-muted font-inter text-xs">Ümmet v1.0.0</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <MaterialCommunityIcons name="star-crescent" size={10} color="#5A6B78" />
            <Text className="text-text-muted font-inter" style={{ fontSize: 10, marginLeft: 4 }}>Bismillahirrahmanirrahim</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

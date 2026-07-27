import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  getSupportPackagesResult,
  getPurchasesInitError,
  isExpoGo,
  isPurchasesConfigured,
  isPurchasesNativeModuleLinked,
  purchaseSupportOption,
  restorePurchases,
  trackPaywallShown,
  type SupportPackageOption,
} from "../src/services/purchases";
import { useProStore } from "../src/stores/appStore";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../src/utils/haptics";

const FREE_FEATURES = [
  "Namaz vakitleri ve ezan bildirimleri",
  "Kuran, meal ve dua kitabı",
  "Kıble, zikir ve kaza takibi",
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const isPro = useProStore((s) => s.isPro);
  const [packages, setPackages] = useState<SupportPackageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSource, setLoadSource] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const configured = isPurchasesConfigured();
  const nativeLinked = isPurchasesNativeModuleLinked();
  const expoGo = isExpoGo();

  const loadPackages = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await getSupportPackagesResult();
      setPackages(result.items);
      setLoadSource(result.source);
      setLoadError(result.error ?? null);
    } catch {
      setPackages([]);
      setLoadError("Destek paketleri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void trackPaywallShown("support_screen");
    void loadPackages();
  }, [loadPackages]);

  const handlePurchase = async (item: SupportPackageOption) => {
    hapticImpact(ImpactFeedbackStyle.Medium);
    setPurchasingId(item.productId);
    try {
      const ok = await purchaseSupportOption(item);
      if (ok) {
        hapticNotification(NotificationFeedbackType.Success);
        Alert.alert(
          "Teşekkür ederiz",
          "Desteğiniz Ümmet'in gelişimine katkı sağlıyor. Allah razı olsun.",
          [{ text: "Tamam" }]
        );
      }
    } catch {
      hapticNotification(NotificationFeedbackType.Error);
      Alert.alert("Satın alma başarısız", "Lütfen daha sonra tekrar deneyin veya App Store hesabınızı kontrol edin.");
    } finally {
      setPurchasingId(null);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const restored = await restorePurchases();
      Alert.alert(
        restored ? "Geri yüklendi" : "Kayıt bulunamadı",
        restored
          ? "Ümmet Pro erişiminiz geri yüklendi."
          : "Bu Apple/Google hesabına bağlı aktif bir Ümmet Pro aboneliği bulunamadı."
      );
    } catch {
      Alert.alert("Hata", "Satın almalar geri yüklenemedi.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient
        colors={["#1B4332", "#0A0E17"]}
        locations={[0, 0.55]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginLeft: 12 }}>
            Ümmet'i Destekle
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
      >
        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <View
            style={{
              borderRadius: 20,
              padding: 20,
              backgroundColor: "rgba(10,24,18,0.85)",
              borderWidth: 1,
              borderColor: "rgba(212,175,55,0.18)",
            }}
          >
            <MaterialCommunityIcons name="heart-outline" size={28} color="#D4AF37" />
            <Text style={{ color: "#ECDFCC", fontSize: 18, fontWeight: "700", marginTop: 12, lineHeight: 26 }}>
              Çekirdek ibadet özellikleri her zaman ücretsiz kalacak.
            </Text>
            <Text style={{ color: "#8A9BA8", fontSize: 14, marginTop: 10, lineHeight: 22 }}>
              Ümmet'i tek kişilik bir ekip geliştiriyor. Desteğiniz sunucu masraflarını karşılıyor ve yeni özellikleri mümkün kılıyor.
            </Text>

            {isPro ? (
              <View
                style={{
                  marginTop: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: "rgba(64,192,87,0.12)",
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ color: "#40C057", fontSize: 12, fontWeight: "700" }}>ÜMMET PRO AKTİF</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Text
            style={{
              color: "rgba(212,175,55,0.55)",
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 1.2,
              marginTop: 24,
              marginBottom: 10,
              textTransform: "uppercase",
            }}
          >
            Her zaman ücretsiz
          </Text>
          {FREE_FEATURES.map((feature) => (
            <View key={feature} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Ionicons name="checkmark-circle" size={16} color="#40C057" />
              <Text style={{ color: "#ECDFCC", fontSize: 14, marginLeft: 10 }}>{feature}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify()}>
          <Text
            style={{
              color: "rgba(212,175,55,0.55)",
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 1.2,
              marginTop: 24,
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            Gönüllü destek
          </Text>

          {!configured ? (
            <View
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: "rgba(10,24,18,0.7)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Text style={{ color: "#ECDFCC", fontSize: 14, lineHeight: 22 }}>
                Satın alma henüz yapılandırılmadı. RevenueCat API anahtarları eklendiğinde bu ekran aktif olacak.
              </Text>
            </View>
          ) : loading ? (
            <ActivityIndicator color="#D4AF37" style={{ marginTop: 24 }} />
          ) : packages.length === 0 ? (
            <View
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: "rgba(10,24,18,0.7)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Text style={{ color: "#8A9BA8", fontSize: 14, lineHeight: 22 }}>
                {loadError ??
                  getPurchasesInitError() ??
                  "Destek paketleri yüklenemedi. RevenueCat panelinde ürünlerin App Store'a bağlı olduğundan emin olun."}
              </Text>
              <TouchableOpacity
                onPress={() => void loadPackages()}
                style={{
                  marginTop: 14,
                  alignSelf: "flex-start",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: "rgba(212,175,55,0.12)",
                  borderWidth: 1,
                  borderColor: "rgba(212,175,55,0.25)",
                }}
              >
                <Text style={{ color: "#D4AF37", fontSize: 13, fontWeight: "700" }}>Tekrar dene</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {expoGo ? (
                <View
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: "rgba(212,175,55,0.08)",
                    borderWidth: 1,
                    borderColor: "rgba(212,175,55,0.2)",
                  }}
                >
                  <Text style={{ color: "#D4AF37", fontSize: 12, lineHeight: 18 }}>
                    Expo Go ile gerçek satın alma çalışmaz. Telefonda kurulu Ümmet uygulamasını kullanın.
                  </Text>
                </View>
              ) : !nativeLinked ? (
                <View
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: "rgba(212,175,55,0.08)",
                    borderWidth: 1,
                    borderColor: "rgba(212,175,55,0.2)",
                  }}
                >
                  <Text style={{ color: "#D4AF37", fontSize: 12, lineHeight: 18 }}>
                    Native modül bu derlemede yok. npx expo run:ios --device ile yeniden derleyin.
                  </Text>
                </View>
              ) : null}

              {loadError && loadSource === "static" ? (
                <View
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 12,
                    backgroundColor: "rgba(212,175,55,0.08)",
                    borderWidth: 1,
                    borderColor: "rgba(212,175,55,0.2)",
                  }}
                >
                  <Text style={{ color: "#D4AF37", fontSize: 12, lineHeight: 18 }}>{loadError}</Text>
                </View>
              ) : null}

              {packages.map((item, index) => {
              const featured = item.productId === "ummet_support_standard";
              const busy = purchasingId === item.productId;

              return (
                <TouchableOpacity
                  key={item.productId}
                  activeOpacity={0.85}
                  disabled={!!purchasingId}
                  onPress={() => void handlePurchase(item)}
                  style={{ marginBottom: 12 }}
                >
                  <View
                    style={{
                      borderRadius: 18,
                      padding: 16,
                      backgroundColor: featured ? "rgba(212,175,55,0.08)" : "rgba(10,24,18,0.75)",
                      borderWidth: 1,
                      borderColor: featured ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    {featured ? (
                      <Text
                        style={{
                          color: "#D4AF37",
                          fontSize: 12,
                          fontWeight: "800",
                          letterSpacing: 1,
                          marginBottom: 8,
                        }}
                      >
                        EN POPÜLER
                      </Text>
                    ) : null}

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontSize: 28, marginRight: 12 }}>{item.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#ECDFCC", fontSize: 16, fontWeight: "700" }}>{item.title}</Text>
                        <Text style={{ color: "#8A9BA8", fontSize: 13, marginTop: 2 }}>{item.subtitle}</Text>
                      </View>
                      {busy ? (
                        <ActivityIndicator color="#D4AF37" />
                      ) : (
                        <Text style={{ color: "#D4AF37", fontSize: 16, fontWeight: "800" }}>{item.priceString}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
            </>
          )}
        </Animated.View>

        <TouchableOpacity
          onPress={() => void handleRestore()}
          disabled={restoring || !configured}
          style={{ marginTop: 20, alignItems: "center", paddingVertical: 12 }}
        >
          {restoring ? (
            <ActivityIndicator color="#8A9BA8" />
          ) : (
            <Text style={{ color: "#8A9BA8", fontSize: 13, fontWeight: "600" }}>Satın almaları geri yükle</Text>
          )}
        </TouchableOpacity>

        <Text style={{ color: "#8A9BA8", fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 8 }}>
          Destek satın alımları gönüllüdür; ibadet özelliklerini açmaz veya kilitlemez.
          {Platform.OS === "ios" ? " Ödeme Apple ID hesabınıza yansır." : " Ödeme Google Play hesabınıza yansır."}
        </Text>
      </ScrollView>
    </View>
  );
}

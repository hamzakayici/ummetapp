import "../global.css";
import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator, Text, TouchableOpacity, AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { playEzan, stopEzan } from "../src/services/audioService";
import { registerPushToken } from "../src/services/pushTokenService";
import {
  useFonts,
  Amiri_400Regular,
  Amiri_400Regular_Italic,
  Amiri_700Bold,
} from "@expo-google-fonts/amiri";
import {
  ReemKufi_400Regular,
  ReemKufi_500Medium,
  ReemKufi_600SemiBold,
  ReemKufi_700Bold,
} from "@expo-google-fonts/reem-kufi";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_500Medium,
  NotoNaskhArabic_600SemiBold,
  NotoNaskhArabic_700Bold,
} from "@expo-google-fonts/noto-naskh-arabic";
import * as SplashScreen from "expo-splash-screen";
import { router, usePathname } from "expo-router";
import { analyticsEndSession, analyticsStartSession, analyticsTrack } from "../src/services/analytics";
import { refreshAnnouncements, refreshRemoteConfig } from "../src/services/remoteConfig";
import { useForcedUpdate } from "../src/hooks/useForcedUpdate";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const forced = useForcedUpdate();
  const [fontsLoaded, fontError] = useFonts({
    Amiri_400Regular,
    Amiri_400Regular_Italic,
    Amiri_700Bold,
    ReemKufi_400Regular,
    ReemKufi_500Medium,
    ReemKufi_600SemiBold,
    ReemKufi_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_500Medium,
    NotoNaskhArabic_600SemiBold,
    NotoNaskhArabic_700Bold,
    ScheherazadeNew: require("../assets/fonts/ScheherazadeNew-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      // Push token'ı Supabase'e kaydet (arka planda)
      registerPushToken();
      // Analytics: session + app_open
      void analyticsStartSession().then(() => {
        void analyticsTrack({ name: "app_open" });
      });
      // Remote config + announcements (admin yönetimi)
      void refreshRemoteConfig();
      void refreshAnnouncements();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") {
        void analyticsEndSession();
      }
      if (state === "active") {
        void analyticsStartSession();
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    void analyticsTrack({ name: "screen_view", pathname });
  }, [pathname]);

  // ─── Ezan Bildirim Listener ───
  // Kilitli ekran: bildirim kendi .wav sesiyle 29s ezan çalıyor (iOS limiti).
  // Uygulama açık: tam ezan çalar (local MP3, kırpılmamış).
  useEffect(() => {
    // Foreground: bildirim gelince tam ezan çal
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data?.type === "ezan" && data?.prayerName) {
        playEzan(data.prayerName as string);
      }
    });

    // Kullanıcı bildirimi tıkladığında: tam ezan çal
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type === "ezan" && data?.prayerName) {
        playEzan(data.prayerName as string);
      }
      if (data?.campaign_id) {
        void analyticsTrack({
          name: "push_open",
          props: {
            campaign_id: String(data.campaign_id),
            ab: data?.ab ? String(data.ab) : undefined,
            route: data?.route ? String(data.route) : undefined,
            pathname: data?.pathname ? String(data.pathname) : undefined,
          },
        });
      }

      // Push ile yönlendirme (admin tarafında data içine route/pathname eklenebilir)
      const target = data?.route || data?.pathname;
      if (typeof target === "string" && target.trim()) {
        try {
          router.push(target.trim() as any);
        } catch {
          // ignore
        }
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  if (forced.required) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0F14", paddingHorizontal: 22, justifyContent: "center" }}>
        <View
          style={{
            padding: 18,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.22)",
            backgroundColor: "rgba(18, 26, 36, 0.75)",
          }}
        >
          <Text style={{ color: "#D4AF37", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 10 }}>
            GÜNCELLEME GEREKLİ
          </Text>
          <Text style={{ color: "#ECDFCC", fontSize: 20, fontWeight: "800", marginBottom: 10 }}>
            Yeni sürüme geç
          </Text>
          <Text style={{ color: "#8A9BA8", fontSize: 14, lineHeight: 20 }}>
            {forced.message}
          </Text>
          <View style={{ marginTop: 10 }}>
            {forced.currentVersion ? (
              <Text style={{ color: "#5A6B78", fontSize: 12 }}>
                Mevcut sürüm: {forced.currentVersion}
              </Text>
            ) : null}
            {forced.minVersion ? (
              <Text style={{ color: "#5A6B78", fontSize: 12, marginTop: forced.currentVersion ? 4 : 0 }}>
                Minimum sürüm: {forced.minVersion}
              </Text>
            ) : null}
          </View>

          <View style={{ marginTop: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={forced.openStore}
              activeOpacity={0.85}
              style={{
                height: 48,
                borderRadius: 14,
                backgroundColor: "#D4AF37",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#0A0F14", fontSize: 14, fontWeight: "800" }}>Güncelle</Text>
            </TouchableOpacity>

            {forced.releaseNotesUrl ? (
              <TouchableOpacity
                onPress={forced.openReleaseNotes}
                activeOpacity={0.85}
                style={{
                  height: 46,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(212,175,55,0.22)",
                  backgroundColor: "rgba(18, 26, 36, 0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#D4AF37", fontSize: 13, fontWeight: "800" }}>Sürüm notları</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0F14" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="qibla" />
        <Stack.Screen name="quran-detail" />
        <Stack.Screen name="duas" />
        <Stack.Screen name="calculator" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}

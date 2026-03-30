import "../global.css";
import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
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
import { usePathname } from "expo-router";
import { analyticsStartSession, analyticsTrack } from "../src/services/analytics";
import { refreshAnnouncements, refreshRemoteConfig } from "../src/services/remoteConfig";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
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

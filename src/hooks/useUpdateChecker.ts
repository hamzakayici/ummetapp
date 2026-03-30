import { useEffect, useCallback } from "react";
import { Alert, Platform, Linking, AppState } from "react-native";
import * as Updates from "expo-updates";
import * as Application from "expo-application";

const APP_STORE_ID = "6760871547";
const STORE_URL = Platform.select({
  ios: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  android: `https://play.google.com/store/apps/details?id=com.ummet.app`,
}) ?? "";

/**
 * Uygulama içi güncelleme kontrolü
 * 
 * 1. OTA (Over-The-Air): JS değişikliklerini arka planda indirir, 
 *    uygulama yeniden başlatıldığında otomatik uygular.
 * 
 * 2. App Store sürüm kontrolü: Native değişiklikler için
 *    kullanıcıya "Yeni sürüm var" popup'ı gösterir.
 */
export function useUpdateChecker() {
  // OTA güncelleme kontrolü
  const checkOTAUpdate = useCallback(async () => {
    if (__DEV__) return; // Development modunda çalışmaz

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        // Bir sonraki açılışta otomatik uygulanır
        // İsterseniz hemen yeniden başlatmak için:
        // await Updates.reloadAsync();
      }
    } catch {
      // Sessizce devam et — güncelleme kontrolü başarısız olursa uygulamayı bozmamalı
    }
  }, []);

  // App Store sürüm kontrolü (iOS)
  const checkStoreUpdate = useCallback(async () => {
    if (__DEV__ || !APP_STORE_ID) return;

    try {
      const currentVersion = Application.nativeApplicationVersion;
      if (!currentVersion) return;

      // iTunes Lookup API ile mağazadaki sürümü kontrol et
      const response = await fetch(
        `https://itunes.apple.com/lookup?bundleId=com.ummet.app&country=tr`
      );
      const data = await response.json();

      if (data.resultCount > 0) {
        const storeVersion = data.results[0].version;

        if (isNewerVersion(storeVersion, currentVersion)) {
          Alert.alert(
            "Yeni Güncelleme",
            `Ümmet ${storeVersion} sürümü yayınlandı. Yeni özellikler ve iyileştirmeler için güncelleyin.`,
            [
              { text: "Daha Sonra", style: "cancel" },
              {
                text: "Güncelle",
                onPress: () => Linking.openURL(STORE_URL),
              },
            ]
          );
        }
      }
    } catch {
      // Sessizce devam et
    }
  }, []);

  useEffect(() => {
    // Uygulama açıldığında kontrol et
    checkOTAUpdate();
    checkStoreUpdate();

    // Uygulama arka plandan ön plana geldiğinde tekrar kontrol et
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkOTAUpdate();
      }
    });

    return () => subscription.remove();
  }, [checkOTAUpdate, checkStoreUpdate]);
}

/**
 * v2 > v1 ise true döner
 */
function isNewerVersion(v1: string, v2: string): boolean {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

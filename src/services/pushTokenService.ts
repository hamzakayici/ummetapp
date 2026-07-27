import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { api } from "./api";
import * as Application from "expo-application";
import { getAnalyticsDeviceId } from "./analytics";
import { captureError } from "./errorTracking";

/**
 * Expo Push Token al ve sunucuya kaydet.
 * Uygulama her açılışta çağrılır — token değiştiyse günceller (upsert).
 */
export async function registerPushToken(): Promise<string | null> {
  try {
    // 1. Bildirim izni kontrol
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    // 2. Expo Push Token al
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    const expoPushToken = tokenData.data;
    const deviceId = await getAnalyticsDeviceId();
    const appVersion = Application.nativeApplicationVersion ?? null;

    // 3. Sunucuya kaydet — aynı token varsa güncellenir
    await api.post("/push-tokens", {
      expo_push_token: expoPushToken,
      platform: Platform.OS,
      device_id: deviceId,
      app_version: appVersion,
    });

    return expoPushToken;
  } catch (e) {
    captureError("pushToken:register", e);
    return null;
  }
}

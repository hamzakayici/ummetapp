import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import {
  fetchPrayerTimes,
  type PrayerTimeEntry,
} from "./prayerTimes";
import { getDailyVerse } from "../data/dailyVerses";
import { channelIdFor, GENERAL_CHANNEL_ID, DAILY_VERSE_CHANNEL_ID, setupNotificationChannels } from "./notificationChannels";
import { Platform } from "react-native";
import { captureError } from "./errorTracking";

// Bildirim handler — ezan kapalıysa ezan bildiriminin sesini çalma
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isEzan = data?.type === "ezan" || data?.type === "ezan_test";
    let ezanEnabled = true;
    if (isEzan) {
      const { useSettingsStore } = await import("../stores/appStore");
      ezanEnabled = useSettingsStore.getState().notificationsEnabled;
    }
    return {
      shouldPlaySound: !isEzan || ezanEnabled,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

// Namaz vakti → ezan bildirim eşleştirmesi (custom sound)
const PRAYER_NOTIFICATION_MAP: Record<string, { title: string; body: string; sound: string }> = {
  Fajr: { title: "🌅 İmsak Vakti", body: "Sabah namazı vakti girdi. Haydi namaza!", sound: "ezan_fajr.caf" },
  Dhuhr: { title: "☀️ Öğle Vakti", body: "Öğle namazı vakti girdi.", sound: "ezan_dhuhr.caf" },
  Asr: { title: "🌤️ İkindi Vakti", body: "İkindi namazı vakti girdi.", sound: "ezan_asr.caf" },
  Maghrib: { title: "🌅 Akşam Vakti", body: "Akşam namazı vakti girdi.", sound: "ezan_maghrib.caf" },
  Isha: { title: "🌙 Yatsı Vakti", body: "Yatsı namazı vakti girdi.", sound: "ezan_isha.caf" },
};

/**
 * Bildirim izni iste
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });

  return status === "granted";
}

/**
 * Tüm bildirimleri iptal et
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Geriye uyumluluk
export const cancelAllEzanNotifications = cancelAllNotifications;

/**
 * Namaz vakitleri için ezan bildirimlerini zamanla
 */
export async function scheduleEzanNotifications(
  latitude: number,
  longitude: number,
): Promise<number> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return 0;

  try {
    const { useSettingsStore } = await import("../stores/appStore");
    const { calculationMethod } = useSettingsStore.getState();
    const prayers = await fetchPrayerTimes(latitude, longitude, 0, calculationMethod);
    let scheduled = 0;

    for (const prayer of prayers) {
      const notifInfo = PRAYER_NOTIFICATION_MAP[prayer.name];
      if (!notifInfo) continue;

      const [hours, minutes] = prayer.time.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notifInfo.title,
          body: notifInfo.body,
          // iOS sesi bildirimden alır; Android sesi KANALDAN alır (bkz. notificationChannels.ts)
          sound: Platform.OS === "ios" ? notifInfo.sound : undefined,
          data: { type: "ezan", prayerName: prayer.name },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: channelIdFor(prayer.name),
        },
      });
      scheduled++;
    }
    return scheduled;
  } catch (e) {
    captureError("ezanNotification:schedule", e);
    return 0;
  }
}

/**
 * Namaz vakitlerini kilit ekranında göster — sabah 05:00'te tüm vakitler tek bildirimde
 */
export async function schedulePrayerTimesLockscreen(
  prayers: PrayerTimeEntry[],
): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  // Tüm vakitleri tek bir bildirimde göster
  const lines = prayers
    .filter(p => p.name !== "Sunrise")
    .map(p => `${p.nameTr}: ${p.time}`)
    .join(" · ");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🕌 Bugünün Namaz Vakitleri",
      body: lines,
      sound: "default",
      data: { type: "prayer_times" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 5,
      minute: 0,
      channelId: GENERAL_CHANNEL_ID,
    },
  });
}

/**
 * Günlük ayet bildirimi — her sabah 07:00'de kilit ekranında
 */
export async function scheduleDailyVerseNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const verse = getDailyVerse();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📖 Günün Ayeti — ${verse.surah} ${verse.reference}`,
      subtitle: verse.arabic,
      body: verse.turkish,
      sound: "default",
      data: { type: "daily_verse", reference: verse.reference },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 7,
      minute: 0,
      channelId: DAILY_VERSE_CHANNEL_ID,
    },
  });
}

/**
 * Cuma Günü Kehf Suresi Hatırlatıcısı — Her Cuma 10:00
 */
export async function scheduleFridayKehfNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Cumanız Mübarek Olsun 🕌",
      body: "Bugün Cuma! Peygamberimiz (sav)'in sünneti olan Kehf Suresi'ni okumayı unutmayın.",
      sound: "default",
      color: "#40C057",
      data: { type: "friday_kehf" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 6, // 1: Sunday, 2: Monday... 6: Friday 
      hour: 10,
      minute: 0,
      channelId: GENERAL_CHANNEL_ID,
    },
  });
}

/**
 * Günlük İbadet (Streak) Hatırlatıcısı — Her Akşam 21:00
 */
export async function scheduleStreakReminderNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Haftalık Serini Bozma! ⭐️",
      body: "Bugün Allah'ı ne kadar zikrettin? Günlük zikrini tamamla ve maneviyatını güçlü tut.",
      sound: "default",
      color: "#D4AF37",
      data: { type: "streak_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
      channelId: GENERAL_CHANNEL_ID,
    },
  });
}

/**
 * Ayarlara göre bildirimleri senkronize et.
 * Ezan kapatıldığında OS'teki zamanlanmış ezan bildirimlerini hemen iptal eder.
 */
export async function syncPrayerNotifications(
  prayers?: PrayerTimeEntry[],
): Promise<void> {
  const { useSettingsStore } = await import("../stores/appStore");
  const { notificationsEnabled, calculationMethod } = useSettingsStore.getState();

  const coordsRaw = await AsyncStorage.getItem("@ummet_prayer_coords");
  if (!coordsRaw) {
    if (!notificationsEnabled) {
      await cancelAllNotifications();
    }
    return;
  }

  let latitude: number;
  let longitude: number;
  try {
    const parsed = JSON.parse(coordsRaw) as { lat?: number; lon?: number };
    if (typeof parsed.lat !== "number" || typeof parsed.lon !== "number") {
      if (!notificationsEnabled) await cancelAllNotifications();
      return;
    }
    latitude = parsed.lat;
    longitude = parsed.lon;
  } catch {
    if (!notificationsEnabled) await cancelAllNotifications();
    return;
  }

  let prayerList = prayers;
  if (!prayerList?.length) {
    try {
      prayerList = await fetchPrayerTimes(latitude, longitude, 0, calculationMethod);
    } catch {
      if (!notificationsEnabled) await cancelAllNotifications();
      return;
    }
  }

  await scheduleAllNotifications(latitude, longitude, prayerList, notificationsEnabled);
}

/**
 * Tüm bildirimleri bir seferde zamanla (uygulama açıldığında çağrılır)
 */
export async function scheduleAllNotifications(
  latitude: number,
  longitude: number,
  prayers: PrayerTimeEntry[],
  ezanEnabled: boolean,
): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  // Önce tüm eski bildirimleri temizle
  await cancelAllNotifications();

  // 1. Günlük ayet — artık push notification ile gönderiliyor (Edge Function)
  // scheduleDailyVerseNotification() kaldırıldı — çift bildirim olmasın

  // 2. Namaz vakitleri kilit ekranı — her zaman (05:00)
  await schedulePrayerTimesLockscreen(prayers);

  // 3. Ezan bildirimleri — yalnızca ayar açıksa
  if (ezanEnabled) {
    await scheduleEzanNotifications(latitude, longitude);
  }

  // 4. Akıllı Bildirimler (Context-Aware)
  await scheduleFridayKehfNotification();
  await scheduleStreakReminderNotification();
}

/**
 * Hemen bildirim gönder — ilk kurulumda test için
 */
export async function sendImmediateNotifications(prayers: PrayerTimeEntry[]): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const verse = getDailyVerse();

  // Günlük ayet — hemen
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📖 Günün Ayeti — ${verse.surah} ${verse.reference}`,
      subtitle: verse.arabic,
      body: verse.turkish,
      sound: "default",
      data: { type: "daily_verse" },
    },
    trigger: null,
  });

  // Namaz vakitleri — 2 saniye sonra
  const lines = prayers
    .filter(p => p.name !== "Sunrise")
    .map(p => `${p.nameTr}: ${p.time}`)
    .join(" · ");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🕌 Bugünün Namaz Vakitleri",
      body: lines,
      sound: false,
      data: { type: "prayer_times" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, repeats: false, channelId: DAILY_VERSE_CHANNEL_ID },
  });

  // Akıllı Bildirim Demo — 5 saniye sonra
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Haftalık Serini Bozma! ⭐️",
      body: "Bugün Allah'ı ne kadar zikrettin? Günlük zikrini tamamla ve maneviyatını güçlü tut.",
      sound: "default",
      color: "#D4AF37",
      data: { type: "streak_reminder" },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false, channelId: DAILY_VERSE_CHANNEL_ID },
  });
}

/**
 * Bildirim sayısını al
 */
export async function getScheduledNotificationCount(): Promise<number> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  return notifications.length;
}

/**
 * Ezan sesini test et — seçilen vakit için hemen bildirim gönderir
 * prayerKey: "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"
 */
export async function testEzanSound(prayerKey: string): Promise<void> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  const notifInfo = PRAYER_NOTIFICATION_MAP[prayerKey];
  if (!notifInfo) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🔔 TEST — ${notifInfo.title}`,
      body: notifInfo.body,
      sound: notifInfo.sound,
      data: { type: "ezan_test", prayerName: prayerKey },
    },
    trigger: null, // hemen gönder
  });
}

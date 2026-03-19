import * as Notifications from "expo-notifications";
import {
  fetchPrayerTimes,
  type PrayerTimeEntry,
} from "./prayerTimes";
import { getDailyVerse } from "../data/dailyVerses";

// Bildirim handler ayarla — uygulama foreground'dayken de göster + sesi çal
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
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
          sound: notifInfo.sound,
          data: { type: "ezan", prayerName: prayer.name },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
      scheduled++;
    }
    return scheduled;
  } catch {
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
    },
  });
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

  // 1. Günlük ayet — her zaman (07:00)
  await scheduleDailyVerseNotification();

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
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, repeats: false },
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
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, repeats: false },
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

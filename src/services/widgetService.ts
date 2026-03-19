import { Platform } from "react-native";
import { getDailyVerse } from "../data/dailyVerses";
import type { PrayerTimeEntry } from "./prayerTimes";

let WidgetData: {
  setItem: (key: string, value: string) => Promise<void>;
  reloadWidgets: () => Promise<void>;
} | null = null;

// Sadece iOS'ta widget modülünü yükle
if (Platform.OS === "ios") {
  try {
    WidgetData = require("../../modules/widget-data").default;
  } catch {
    // Widget modülü yüklenemedi — simulator veya eski iOS olabilir
  }
}

/**
 * Widget verilerini güncelle — günlük ayet + namaz vakitleri
 * Home ekranı her yüklendiğinde çağrılmalı
 */
export async function updateWidgetData(prayers: PrayerTimeEntry[]): Promise<void> {
  if (!WidgetData) return;

  try {
    // Günlük ayet
    const verse = getDailyVerse();
    await WidgetData.setItem("verse_arabic", verse.arabic);
    await WidgetData.setItem("verse_turkish", verse.turkish);
    await WidgetData.setItem("verse_ref", `${verse.surah} ${verse.reference}`);

    // Namaz vakitleri — JSON formatında
    const prayerData = prayers
      .filter((p) => p.name !== "Sunrise")
      .map((p) => ({ name: p.nameTr, time: p.time }));

    await WidgetData.setItem("prayer_times", JSON.stringify(prayerData));

    // Widget'ları yenile
    await WidgetData.reloadWidgets();
  } catch {
    // Widget güncelleme hatası — sessizce geç
  }
}

import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type PrayerTimesData = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type PrayerTimeEntry = {
  name: string;
  nameTr: string;
  time: string;
  iconName: string;
};

const PRAYER_MAP: { key: keyof PrayerTimesData; nameTr: string; iconName: string }[] = [
  { key: "Fajr", nameTr: "İmsak", iconName: "moon-waning-crescent" },
  { key: "Sunrise", nameTr: "Güneş", iconName: "weather-sunset-up" },
  { key: "Dhuhr", nameTr: "Öğle", iconName: "white-balance-sunny" },
  { key: "Asr", nameTr: "İkindi", iconName: "weather-partly-cloudy" },
  { key: "Maghrib", nameTr: "Akşam", iconName: "weather-sunset-down" },
  { key: "Isha", nameTr: "Yatsı", iconName: "weather-night" },
];

const CACHE_KEY_PRAYERS = "@ummet_prayer_times_v2";
const CACHE_KEY_LOCATION = "@ummet_location_name";

export async function requestLocationPermission(): Promise<Location.LocationObject | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }
  // Önce son bilinen konumu dene (anında döner)
  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown) return lastKnown;
  // Yoksa Balanced doğruluk ile al (High'dan çok daha hızlı)
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return location;
}

/**
 * Namaz vakitlerini cache'e kaydet
 */
async function cachePrayerTimes(prayers: PrayerTimeEntry[], date: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY_PRAYERS, JSON.stringify({ date, prayers }));
  } catch {
    // Cache yazma hatası
  }
}

/**
 * Cache'den namaz vakitlerini oku
 */
export async function getCachedPrayerTimes(): Promise<{ date: string; prayers: PrayerTimeEntry[] } | null> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY_PRAYERS);
    if (cached) return JSON.parse(cached);
  } catch {
    // Cache okuma hatası
  }
  return null;
}

/**
 * Konum adını cache'e kaydet
 */
export async function cacheLocationName(name: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY_LOCATION, name);
  } catch {
    // Cache yazma hatası
  }
}

/**
 * Cache'den konum adını oku
 */
export async function getCachedLocationName(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CACHE_KEY_LOCATION);
  } catch {
    return null;
  }
}

// Lock: aynı anda birden fazla API isteği yapılmasını önler
let fetchLock = false;

export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  altitude: number = 0,
  method: number = 13 // Diyanet hesaplama yöntemi
): Promise<PrayerTimeEntry[]> {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const dateKey = `${dd}-${mm}-${yyyy}`;

  // Cache kontrol — bugünün verileri varsa direkt dön
  const cached = await getCachedPrayerTimes();
  if (cached && cached.date === dateKey) {
    return cached.prayers;
  }

  // Lock — aynı anda birden fazla API isteği engelle
  if (fetchLock) {
    // Lock varsa cache döndür (dünkü bile olsa)
    if (cached) return cached.prayers;
    // Bekle ve tekrar dene
    await new Promise((r) => setTimeout(r, 2000));
    return fetchPrayerTimes(latitude, longitude, altitude, method);
  }
  fetchLock = true;

  // method=13 = Diyanet İşleri Başkanlığı (ek tune yok — saf Diyanet hesaplaması)
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    method: method.toString(),
    ...(altitude > 0 ? { altitude: Math.round(altitude).toString() } : {}),
  });

  const url = `https://api.aladhan.com/v1/timings/${dateKey}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.code !== 200 || !data.data?.timings) {
      throw new Error("Namaz vakitleri alınamadı");
    }

    const timings: PrayerTimesData = data.data.timings;
    const prayers = PRAYER_MAP.map((prayer) => ({
      name: prayer.key,
      nameTr: prayer.nameTr,
      time: timings[prayer.key].replace(/\s*\(.*\)/, ""),
      iconName: prayer.iconName,
    }));

    // Cache'e kaydet
    await cachePrayerTimes(prayers, dateKey);

    return prayers;
  } catch {
    // İnternet yoksa cache'den dön (dünkü bile olsa yaklaşık doğru)
    if (cached) {
      return cached.prayers;
    }
    throw new Error("Namaz vakitleri alınamadı ve cache bulunamadı");
  } finally {
    fetchLock = false;
  }
}

/**
 * Belirli bir tarih için namaz vakitlerini çek (cache'siz, hafif)
 */
export async function fetchPrayerTimesForDate(
  latitude: number,
  longitude: number,
  date: Date,
  method: number = 13
): Promise<PrayerTimeEntry[]> {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const dateKey = `${dd}-${mm}-${yyyy}`;

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    method: method.toString(),
  });

  const url = `https://api.aladhan.com/v1/timings/${dateKey}?${params.toString()}`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();

    if (data.code !== 200 || !data.data?.timings) return [];

    const timings: PrayerTimesData = data.data.timings;
    return PRAYER_MAP.map((prayer) => ({
      name: prayer.key,
      nameTr: prayer.nameTr,
      time: timings[prayer.key].replace(/\s*\(.*\)/, ""),
      iconName: prayer.iconName,
    }));
  } catch {
    return [];
  }
}

export function getNextPrayerIndex(prayers: PrayerTimeEntry[]): number {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < prayers.length; i++) {
    const [h, m] = prayers[i].time.split(":").map(Number);
    if (currentMinutes < h * 60 + m) return i;
  }
  return 0;
}

export function getTimeRemaining(timeStr: string): string {
  const now = new Date();
  const parts = timeStr.split(":").map(Number);
  const h = parts[0];
  const m = parts[1];
  // NaN kontrolü — geçersiz zaman formatı
  if (isNaN(h) || isNaN(m)) return "--";
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  // Eğer hedef geçmişse yarın say
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  const diffMs = target.getTime() - now.getTime();
  const totalMins = Math.ceil(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hours === 0) return `${mins} dk`;
  return `${hours} sa ${mins} dk`;
}

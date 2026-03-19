import { Audio } from "expo-av";

// Her vakit için local ezan ses dosyaları (bundle'dan)
const EZAN_SOUNDS: Record<string, any> = {
  Fajr: require("../../assets/sounds/ezan_fajr.mp3"),
  Dhuhr: require("../../assets/sounds/ezan_dhuhr.mp3"),
  Asr: require("../../assets/sounds/ezan_asr.mp3"),
  Maghrib: require("../../assets/sounds/ezan_maghrib.mp3"),
  Isha: require("../../assets/sounds/ezan_isha.mp3"),
};

// Makam bilgisi (UI için)
export const EZAN_MAKAM: Record<string, { name: string; nameTr: string }> = {
  Fajr: { name: "Saba", nameTr: "Saba Makamı" },
  Dhuhr: { name: "Rast", nameTr: "Rast Makamı" },
  Asr: { name: "Hicaz", nameTr: "Hicaz Makamı" },
  Maghrib: { name: "Segah", nameTr: "Segah Makamı" },
  Isha: { name: "Bayati", nameTr: "Bayatî Makamı" },
};

let currentSound: Audio.Sound | null = null;
let isPlaying = false;
let ezanLock = false;

export async function playEzan(prayerKey?: string): Promise<void> {
  if (ezanLock) return;
  ezanLock = true;
  try {
    // Önceki ses çalıyorsa durdur
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch {}
      currentSound = null;
      isPlaying = false;
    }

    // Ses modunu ayarla
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // Local MP3 dosyasını seç
    const soundSource = prayerKey && EZAN_SOUNDS[prayerKey]
      ? EZAN_SOUNDS[prayerKey]
      : EZAN_SOUNDS.Fajr; // fallback

    const { sound } = await Audio.Sound.createAsync(
      soundSource,
      { shouldPlay: true, volume: 1.0 }
    );

    currentSound = sound;
    isPlaying = true;

    // Bitince temizle
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        isPlaying = false;
        sound.unloadAsync().catch(() => {});
        currentSound = null;
      }
    });
  } catch {
    isPlaying = false;
  } finally {
    ezanLock = false;
  }
}

export async function stopEzan(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // Ses zaten durmuş olabilir
    }
    currentSound = null;
    isPlaying = false;
  }
}

export function isEzanPlaying(): boolean {
  return isPlaying;
}

// Kuran ayet ses çalma servisi
let quranSound: Audio.Sound | null = null;
let quranIsPlaying = false;
let currentAyahNumber = 0;

export async function playAyah(ayahNumber: number): Promise<void> {
  try {
    if (quranSound) {
      await quranSound.stopAsync();
      await quranSound.unloadAsync();
      quranSound = null;
    }

    // Önce flag'leri ayarla — polling race condition'ı önle
    quranIsPlaying = true;
    currentAyahNumber = ayahNumber;

    // Kur'an api'sinde ayet numarasına göre Alafasy tilaveti
    // ayahNumber: mutlak ayet numarası (1-6236)
    const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, volume: 1.0 }
    );

    quranSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        quranIsPlaying = false;
        sound.unloadAsync();
        quranSound = null;
        currentAyahNumber = 0;
      }
    });
  } catch {
    quranIsPlaying = false;
    currentAyahNumber = 0;
  }
}

export async function stopQuranAudio(): Promise<void> {
  if (quranSound) {
    try {
      await quranSound.stopAsync();
      await quranSound.unloadAsync();
    } catch {
      // zaten durmuş
    }
    quranSound = null;
    quranIsPlaying = false;
    currentAyahNumber = 0;
  }
}

export function isQuranPlaying(): boolean {
  return quranIsPlaying;
}

export function getCurrentAyahNumber(): number {
  return currentAyahNumber;
}

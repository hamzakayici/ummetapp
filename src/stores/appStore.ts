import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── KAZA NAMAZ ───
type PrayerType = "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi" | "vitir";

type KazaState = {
  prayers: Record<PrayerType, { total: number; completed: number }>;
  fasting: { totalOwed: number; completed: number; adak: number; adakCompleted: number };
  incrementPrayer: (type: PrayerType) => void;
  decrementPrayer: (type: PrayerType) => void;
  setPrayerTotal: (type: PrayerType, total: number) => void;
  incrementFasting: () => void;
  incrementAdak: () => void;
  setFastingTotal: (total: number) => void;
  setAdakTotal: (total: number) => void;
};

export const useKazaStore = create<KazaState>()(
  persist(
    (set) => ({
      prayers: {
        sabah: { total: 0, completed: 0 },
        ogle: { total: 0, completed: 0 },
        ikindi: { total: 0, completed: 0 },
        aksam: { total: 0, completed: 0 },
        yatsi: { total: 0, completed: 0 },
        vitir: { total: 0, completed: 0 },
      },
      fasting: { totalOwed: 0, completed: 0, adak: 0, adakCompleted: 0 },
      incrementPrayer: (type) =>
        set((state) => ({
          prayers: { ...state.prayers, [type]: { ...state.prayers[type], completed: state.prayers[type].completed + 1 } },
        })),
      decrementPrayer: (type) =>
        set((state) => ({
          prayers: { ...state.prayers, [type]: { ...state.prayers[type], completed: Math.max(0, state.prayers[type].completed - 1) } },
        })),
      setPrayerTotal: (type, total) =>
        set((state) => ({
          prayers: { ...state.prayers, [type]: { ...state.prayers[type], total } },
        })),
      incrementFasting: () =>
        set((state) => ({ fasting: { ...state.fasting, completed: state.fasting.completed + 1 } })),
      incrementAdak: () =>
        set((state) => ({ fasting: { ...state.fasting, adakCompleted: state.fasting.adakCompleted + 1 } })),
      setFastingTotal: (total) =>
        set((state) => ({ fasting: { ...state.fasting, totalOwed: total } })),
      setAdakTotal: (total) =>
        set((state) => ({ fasting: { ...state.fasting, adak: total } })),
    }),
    { name: "ummet-kaza", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── ZİKİR ───
type DhikrState = {
  dailyCounts: Record<string, number>; // "2026-02-24": 245
  incrementDaily: (amount?: number) => void;
  getTodayCount: () => number;
};

const getTodayKey = () => new Date().toISOString().split("T")[0];

export const useDhikrStore = create<DhikrState>()(
  persist(
    (set, get) => ({
      dailyCounts: {},
      incrementDaily: (amount = 1) =>
        set((state) => {
          const key = getTodayKey();
          return { dailyCounts: { ...state.dailyCounts, [key]: (state.dailyCounts[key] || 0) + amount } };
        }),
      getTodayCount: () => get().dailyCounts[getTodayKey()] || 0,
    }),
    { name: "ummet-dhikr", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── HAFTALIK TAKİP ───
type WeeklyState = {
  trackedDays: Record<string, boolean>; // "2026-02-24": true
  markToday: () => void;
  unmarkToday: () => void;
  getWeekData: () => boolean[];
};

export const useWeeklyStore = create<WeeklyState>()(
  persist(
    (set, get) => ({
      trackedDays: {},
      markToday: () =>
        set((state) => ({ trackedDays: { ...state.trackedDays, [getTodayKey()]: true } })),
      unmarkToday: () =>
        set((state) => {
          const newDays = { ...state.trackedDays };
          delete newDays[getTodayKey()];
          return { trackedDays: newDays };
        }),
      getWeekData: () => {
        const state = get();
        const result: boolean[] = [];
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

        for (let i = 0; i < 7; i++) {
          const day = new Date(now);
          day.setDate(now.getDate() + mondayOffset + i);
          const key = day.toISOString().split("T")[0];
          result.push(!!state.trackedDays[key]);
        }
        return result;
      },
    }),
    { name: "ummet-weekly", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── AYARLAR ───
type SettingsState = {
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  calculationMethod: number;
  toggleHaptic: () => void;
  toggleNotifications: () => void;
  setCalculationMethod: (method: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hapticEnabled: true,
      notificationsEnabled: true,
      calculationMethod: 13,
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      setCalculationMethod: (method) => set({ calculationMethod: method }),
    }),
    { name: "ummet-settings", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── ÜMMET PRO ───
type ProState = {
  isPro: boolean;
  activatedAt: string | null;
  togglePro: () => void;
};

export const useProStore = create<ProState>()(
  persist(
    (set) => ({
      isPro: false,
      activatedAt: null,
      togglePro: () =>
        set((state) => ({
          isPro: !state.isPro,
          activatedAt: !state.isPro ? new Date().toISOString() : null,
        })),
    }),
    { name: "ummet-pro", storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── KURAN OKUMA AYARLARI ───
export type QuranTheme = "dark" | "light" | "sepia" | "cream" | "green";
export type ArabicFontKey = "noto" | "scheherazade" | "amiri";

type QuranSettingsState = {
  theme: QuranTheme;
  fontSize: number;
  arabicFont: ArabicFontKey;
  lastPage: number;
  lastSurah: number;
  lastAyah: number;
  setTheme: (theme: QuranTheme) => void;
  setFontSize: (size: number) => void;
  setArabicFont: (font: ArabicFontKey) => void;
  setLastPage: (page: number) => void;
  setLastPosition: (surah: number, ayah: number) => void;
};

export const QURAN_THEMES: Record<QuranTheme, { bg: string; text: string; accent: string; secondary: string; name: string }> = {
  dark: { bg: "#0A0E17", text: "#ECDFCC", accent: "#D4AF37", secondary: "#5A6B78", name: "Koyu" },
  light: { bg: "#FFFFFF", text: "#1A1A2E", accent: "#1B6B4A", secondary: "#666666", name: "Açık" },
  sepia: { bg: "#F4ECD8", text: "#5B4636", accent: "#8B6914", secondary: "#8B7355", name: "Sepia" },
  cream: { bg: "#FFF8E7", text: "#3D2B1F", accent: "#B8860B", secondary: "#7D6B5D", name: "Krem" },
  green: { bg: "#0D1F17", text: "#D4E7D0", accent: "#40C057", secondary: "#5A7A6B", name: "Yeşil" },
};

export const ARABIC_FONTS: Record<ArabicFontKey, { family: string; name: string; desc: string; lineHeightMultiplier: number }> = {
  noto: { family: "NotoNaskhArabic_700Bold", name: "Noto Naskh", desc: "Modern, net harekeler", lineHeightMultiplier: 2.8 },
  scheherazade: { family: "ScheherazadeNew", name: "Scheherazade", desc: "Geleneksel, zarif", lineHeightMultiplier: 2.6 },
  amiri: { family: "Amiri_700Bold", name: "Amiri", desc: "Klasik, dekoratif", lineHeightMultiplier: 2.4 },
};

export const useQuranSettingsStore = create<QuranSettingsState>()(
  persist(
    (set) => ({
      theme: "dark",
      fontSize: 24,
      arabicFont: "noto",
      lastPage: 1,
      lastSurah: 1,
      lastAyah: 1,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setArabicFont: (arabicFont) => set({ arabicFont }),
      setLastPage: (lastPage) => set({ lastPage }),
      setLastPosition: (surah, ayah) => set({ lastSurah: surah, lastAyah: ayah }),
    }),
    { name: "ummet-quran-settings", storage: createJSONStorage(() => AsyncStorage) }
  )
);

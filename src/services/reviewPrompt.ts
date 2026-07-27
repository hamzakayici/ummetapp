import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { analyticsTrack } from "./analytics";

/**
 * App Store yorum isteme akışı.
 *
 * Native modül (expo-store-review) development build'e eklenmemişse
 * uygulama çökmesin diye dinamik import kullanılır.
 */

const LAST_PROMPT_KEY = "ummet:review:last_prompt_at";
const PROMPT_COUNT_KEY = "ummet:review:prompt_count";
const LAST_VERSION_KEY = "ummet:review:last_version";
const FIRST_OPEN_KEY = "ummet:review:first_open_at";

const MIN_DAYS_BETWEEN_PROMPTS = 120;
const MIN_DAYS_SINCE_INSTALL = 3;
const MAX_PROMPTS_PER_VERSION = 1;

export type ReviewTrigger =
  | "streak_7"
  | "badge_earned"
  | "hatim_completed"
  | "quran_finished";

const DAY_MS = 24 * 60 * 60 * 1000;

type StoreReviewModule = typeof import("expo-store-review");

let storeReviewCache: StoreReviewModule | null | undefined;

async function getStoreReview(): Promise<StoreReviewModule | null> {
  if (storeReviewCache !== undefined) {
    return storeReviewCache;
  }

  try {
    storeReviewCache = await import("expo-store-review");
    return storeReviewCache;
  } catch {
    storeReviewCache = null;
    return null;
  }
}

export async function markFirstOpen(): Promise<void> {
  const existing = await AsyncStorage.getItem(FIRST_OPEN_KEY);
  if (!existing) {
    await AsyncStorage.setItem(FIRST_OPEN_KEY, String(Date.now()));
  }
}

async function shouldPrompt(): Promise<boolean> {
  const StoreReview = await getStoreReview();
  if (!StoreReview || !(await StoreReview.hasAction())) return false;

  const now = Date.now();

  const firstOpen = Number(await AsyncStorage.getItem(FIRST_OPEN_KEY)) || now;
  if (now - firstOpen < MIN_DAYS_SINCE_INSTALL * DAY_MS) return false;

  const lastPrompt = Number(await AsyncStorage.getItem(LAST_PROMPT_KEY)) || 0;
  if (lastPrompt && now - lastPrompt < MIN_DAYS_BETWEEN_PROMPTS * DAY_MS) return false;

  const currentVersion = Application.nativeApplicationVersion ?? "0";
  const lastVersion = await AsyncStorage.getItem(LAST_VERSION_KEY);

  if (lastVersion !== currentVersion) {
    await AsyncStorage.multiSet([
      [LAST_VERSION_KEY, currentVersion],
      [PROMPT_COUNT_KEY, "0"],
    ]);
    return true;
  }

  const count = Number(await AsyncStorage.getItem(PROMPT_COUNT_KEY)) || 0;
  return count < MAX_PROMPTS_PER_VERSION;
}

export async function maybeAskForReview(trigger: ReviewTrigger): Promise<void> {
  try {
    if (!(await shouldPrompt())) return;

    const StoreReview = await getStoreReview();
    if (!StoreReview) return;

    const count = Number(await AsyncStorage.getItem(PROMPT_COUNT_KEY)) || 0;

    await AsyncStorage.multiSet([
      [LAST_PROMPT_KEY, String(Date.now())],
      [PROMPT_COUNT_KEY, String(count + 1)],
    ]);

    void analyticsTrack({ name: "review_prompt_shown", props: { trigger } });
    await StoreReview.requestReview();
  } catch {
    // Yorum istemi hiçbir zaman kullanıcı akışını bozmamalı
  }
}

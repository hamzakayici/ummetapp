import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, clientMeta } from "./api";

type AnalyticsEventName =
  | "app_open"
  | "session_start"
  | "session_end"
  | "screen_view"
  | "error";

type AnalyticsEvent = {
  name: AnalyticsEventName | (string & {});
  ts: string;
  device_id: string;
  session_id?: string;
  platform?: "ios" | "android" | "web" | "other";
  app_version?: string;
  pathname?: string;
  props?: Record<string, unknown>;
};

const DEVICE_ID_KEY = "ummet:analytics:device_id";
const SESSION_ID_KEY = "ummet:analytics:session_id";
const QUEUE_KEY = "ummet:analytics:queue_v1";

/** Sunucu tek istekte en fazla 50 olay kabul ediyor */
const BATCH_SIZE = 25;

function randomId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getOrCreateDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = randomId("dev");
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export async function getAnalyticsDeviceId(): Promise<string> {
  return await getOrCreateDeviceId();
}

async function getOrCreateSessionId(): Promise<string> {
  const existing = await AsyncStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;
  const id = randomId("sess");
  await AsyncStorage.setItem(SESSION_ID_KEY, id);
  return id;
}

async function loadQueue(): Promise<AnalyticsEvent[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as AnalyticsEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: AnalyticsEvent[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-500)));
}

async function enqueue(evt: AnalyticsEvent) {
  const q = await loadQueue();
  q.push(evt);
  await saveQueue(q);
}

export async function analyticsTrack(
  input: Omit<AnalyticsEvent, "device_id" | "ts" | "platform" | "app_version" | "session_id"> & {
    session_id?: string;
  }
) {
  const device_id = await getOrCreateDeviceId();
  const session_id = input.session_id ?? (await getOrCreateSessionId());

  const evt: AnalyticsEvent = {
    ...input,
    device_id,
    session_id,
    ts: new Date().toISOString(),
    ...clientMeta(),
  };

  await enqueue(evt);
  void analyticsFlush();
}

/**
 * Kuyruğu sunucuya boşaltır. Sunucu kabul etmezse kuyruk korunur ve
 * bir sonraki denemede tekrar gönderilir — çevrimdışıyken veri kaybolmaz.
 */
export async function analyticsFlush() {
  const q = await loadQueue();
  if (q.length === 0) return;

  const batch = q.slice(0, BATCH_SIZE);
  const rest = q.slice(BATCH_SIZE);

  const { error } = await api.post("/analytics/events", { events: batch });
  if (error) return; // kuyruğu koru, sonra dene

  await saveQueue(rest);
  if (rest.length > 0) {
    void analyticsFlush();
  }
}

export async function analyticsStartSession() {
  const session_id = randomId("sess");
  await AsyncStorage.setItem(SESSION_ID_KEY, session_id);
  const device_id = await getOrCreateDeviceId();

  // Cihaz kaydı — sunucu tarafında upsert, first_seen_at korunur
  void api.post("/analytics/device", { device_id, ...clientMeta() });

  void api.post("/analytics/session/start", { session_id, device_id, ...clientMeta() });

  await analyticsTrack({ name: "session_start", session_id });
  return session_id;
}

export async function analyticsEndSession() {
  const session_id = await AsyncStorage.getItem(SESSION_ID_KEY);

  if (session_id) {
    await analyticsTrack({ name: "session_end", session_id });
    // Süreyi sunucu hesaplar; uygulama kill edilirse bir cron oturumu kapatır.
    await api.post("/analytics/session/end", { session_id });
  }

  await AsyncStorage.removeItem(SESSION_ID_KEY);
}

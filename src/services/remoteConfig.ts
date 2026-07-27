import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import { getAnalyticsDeviceId } from "./analytics";

export type RemoteConfig = Record<string, string>;

export type Announcement = {
  id: string;
  title: string;
  content?: string | null;
  type?: "info" | "warning" | "update" | string;
};

const RC_CACHE_KEY = "ummet:remote_config:v1";
const RC_CACHE_TS_KEY = "ummet:remote_config:ts:v1";
const ANN_CACHE_KEY = "ummet:announcements:v1";
const ANN_CACHE_TS_KEY = "ummet:announcements:ts:v1";

const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 dk

let memoryRC: RemoteConfig | null = null;
let memoryAnn: Announcement[] | null = null;

async function readJSON<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJSON(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function readTs(key: string): Promise<number> {
  const raw = await AsyncStorage.getItem(key);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

async function writeTs(key: string, ts: number) {
  await AsyncStorage.setItem(key, String(ts));
}

export async function getRemoteConfigCached(): Promise<RemoteConfig> {
  if (memoryRC) return memoryRC;
  const cached = await readJSON<RemoteConfig>(RC_CACHE_KEY);
  memoryRC = cached ?? {};
  return memoryRC;
}

export async function refreshRemoteConfig({ ttlMs = DEFAULT_TTL_MS, force = false }: { ttlMs?: number; force?: boolean } = {}) {
  const last = await readTs(RC_CACHE_TS_KEY);
  if (!force && last && Date.now() - last < ttlMs) return;

  const { data, error } = await api.get<{ data: RemoteConfig }>("/settings");
  if (error || !data?.data) return;

  memoryRC = data.data;
  await writeJSON(RC_CACHE_KEY, memoryRC);
  await writeTs(RC_CACHE_TS_KEY, Date.now());
}

export async function getAnnouncementsCached(): Promise<Announcement[]> {
  if (memoryAnn) return memoryAnn;
  const cached = await readJSON<Announcement[]>(ANN_CACHE_KEY);
  memoryAnn = cached ?? [];
  return memoryAnn;
}

export async function refreshAnnouncements(
  { ttlMs = DEFAULT_TTL_MS, force = false, limit = 5 }: { ttlMs?: number; force?: boolean; limit?: number } = {}
) {
  const last = await readTs(ANN_CACHE_TS_KEY);
  if (!force && last && Date.now() - last < ttlMs) return;

  // Sunucu yalnızca yayında olan duyuruları döndürür
  const { data, error } = await api.get<{ data: Array<Record<string, unknown>> }>("/announcements");
  if (error || !data?.data) return;

  const list: Announcement[] = data.data.slice(0, Math.max(1, Math.min(50, Number(limit) || 5))).map((r) => ({
    id: String(r.id),
    title: String(r.title ?? ""),
    content: (r.content as string | null) ?? null,
    type: (r.type as string) ?? "info",
  }));

  memoryAnn = list;
  await writeJSON(ANN_CACHE_KEY, list);
  await writeTs(ANN_CACHE_TS_KEY, Date.now());
}


/**
 * Duyuru görüntülendi — panelde açılma oranı metriği için.
 *
 * `device_id` gönderiyoruz: sunucu cihaz başına günde bir sayıyor. Bu olmadan
 * uygulamayı gün içinde defalarca açan kullanıcı sayacı şişirir ve açılma oranı
 * %100'ü aşar.
 */
export async function trackAnnouncementOpened(id: string) {
  const device_id = await getAnalyticsDeviceId();
  void api.post(`/announcements/${encodeURIComponent(id)}/opened`, { device_id });
}

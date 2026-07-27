import { api } from "./api";
import { getAnalyticsDeviceId } from "./analytics";

export interface SharedDhikr {
  id: string;
  title: string;
  preset_name: string;
  target_count: number;
  current_count: number;
  share_code: string;
  progress?: number;
  creator_device_id?: string;
  created_at?: string;
}

type Envelope = { data: SharedDhikr };

/**
 * Ortak zikir servisi.
 *
 * NOT: Eski sürüm Supabase Realtime (WebSocket) ile canlı sayaç gösteriyordu.
 * Yeni backend paylaşımlı hostingde çalıştığı için kalıcı WebSocket süreci yok;
 * ekran açıkken `pollSharedDhikr` ile periyodik olarak okuyoruz.
 */

export const createSharedDhikr = async (
  title: string,
  presetName: string,
  targetCount: number,
  deviceId?: string
): Promise<{ data: SharedDhikr | null; error: Error | null }> => {
  const { data, error } = await api.post<Envelope>("/shared-dhikrs", {
    title,
    preset_name: presetName,
    target_count: targetCount,
    device_id: deviceId,
  });

  return { data: data?.data ?? null, error };
};

export const getSharedDhikrByCode = async (
  code: string
): Promise<{ data: SharedDhikr | null; error: Error | null }> => {
  const { data, error } = await api.get<Envelope>(
    `/shared-dhikrs/${encodeURIComponent(code.trim().toUpperCase())}`
  );

  return { data: data?.data ?? null, error };
};

export const getSharedDhikrById = async (
  id: string
): Promise<{ data: SharedDhikr | null; error: Error | null }> => {
  const { data, error } = await api.get<Envelope>(`/shared-dhikrs/${encodeURIComponent(id)}`);

  return { data: data?.data ?? null, error };
};

/**
 * Sayaç artırma. Sunucu tarafında atomik UPDATE ile yapılır —
 * aynı anda yüzlerce kişi bassa da hiçbir katkı kaybolmaz.
 */
export const incrementSharedDhikr = async (
  id: string,
  amount: number,
  deviceId?: string
): Promise<SharedDhikr | null> => {
  const device_id = deviceId ?? (await getAnalyticsDeviceId());

  const { data, error } = await api.post<Envelope>(
    `/shared-dhikrs/${encodeURIComponent(id)}/increment`,
    { amount, device_id }
  );

  if (error) {
    console.warn("Zikir artırma hatası:", error.message);
    return null;
  }

  return data?.data ?? null;
};

/**
 * Realtime yerine periyodik okuma. Ekran açıkken çağrılır, dönen fonksiyon
 * durdurur. Varsayılan 4 sn — canlı hissi verirken sunucuyu yormaz.
 */
export const pollSharedDhikr = (
  id: string,
  onUpdate: (dhikr: SharedDhikr) => void,
  intervalMs = 4000
): (() => void) => {
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    const { data } = await getSharedDhikrById(id);
    if (!stopped && data) onUpdate(data);
  };

  const timer = setInterval(tick, intervalMs);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
};

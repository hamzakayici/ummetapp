import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Application from "expo-application";

/**
 * Laravel API istemcisi.
 *
 * Eski Supabase backend'inin yerini alır. Supabase projesi silindiği için
 * (bkz. docs/06-LARAVEL-PLANI.md §1) uygulama artık kendi sunucumuza bağlanıyor.
 *
 * Taban adres app.json > expo.extra.apiBaseUrl üzerinden ayarlanır.
 * Yerel geliştirmede fiziksel cihazdan test ediyorsanız "localhost" çalışmaz;
 * makinenizin LAN adresini yazın (ör. http://192.168.1.20:8000/api/v1).
 */
const API_BASE_URL: string =
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  "https://ummetapp.com/api/v1";

const DEFAULT_TIMEOUT_MS = 15000;

export type ApiResult<T> = { data: T | null; error: Error | null };

/** Her istekte gönderilen ortak alanlar */
export function clientMeta() {
  return {
    platform: Platform.OS as "ios" | "android" | "web",
    app_version: Application.nativeApplicationVersion ?? undefined,
  };
}

async function request<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; timeoutMs?: number } = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (!response.ok) {
      return { data: null, error: new Error(`HTTP ${response.status}`) };
    }

    // 204 gibi gövdesiz yanıtlar
    const text = await response.text();
    const json = text ? (JSON.parse(text) as T) : (null as T);

    return { data: json, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e : new Error("Ağ hatası") };
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: <T>(path: string, timeoutMs?: number) => request<T>(path, { method: "GET", timeoutMs }),
  post: <T>(path: string, body?: unknown, timeoutMs?: number) =>
    request<T>(path, { method: "POST", body, timeoutMs }),
};

export { API_BASE_URL };

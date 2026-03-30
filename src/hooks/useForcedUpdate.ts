import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Linking, Platform } from "react-native";
import * as Application from "expo-application";
import { getRemoteConfigCached, refreshRemoteConfig } from "../services/remoteConfig";

const APP_STORE_ID = "6760871547";
const STORE_URL =
  Platform.select({
    ios: `https://apps.apple.com/app/id${APP_STORE_ID}`,
    android: `https://play.google.com/store/apps/details?id=com.ummet.app`,
  }) ?? "";

function isNewerVersion(v1: string, v2: string): boolean {
  const parts1 = v1.split(".").map(Number);
  const parts2 = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

export function useForcedUpdate() {
  const [required, setRequired] = useState(false);
  const [message, setMessage] = useState<string>(
    "Yeni sürüm yayınlandı. Devam edebilmek için lütfen uygulamayı güncelleyin."
  );
  const [minVersion, setMinVersion] = useState<string>("");
  const lastShownRef = useRef(false);

  const check = useCallback(async () => {
    if (__DEV__) return;
    try {
      await refreshRemoteConfig({ force: true });
      const rc = await getRemoteConfigCached();

      const enabled = String(rc["force_update_enabled"] ?? "").toLowerCase() === "true";
      const min = String(rc["min_required_version"] ?? "").trim();
      const msg =
        String(rc["force_update_message"] ?? "").trim() ||
        "Yeni sürüm yayınlandı. Devam edebilmek için lütfen uygulamayı güncelleyin.";

      setMessage(msg);
      setMinVersion(min);

      if (!enabled || !min) {
        setRequired(false);
        lastShownRef.current = false;
        return;
      }

      const current = Application.nativeApplicationVersion;
      if (!current) return;

      const needs = isNewerVersion(min, current);
      setRequired(needs);
      if (!needs) lastShownRef.current = false;
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void check();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void check();
    });
    return () => subscription.remove();
  }, [check]);

  const openStore = useCallback(() => {
    if (!STORE_URL) return;
    if (lastShownRef.current) {
      // allow repeated taps without extra side effects
    }
    lastShownRef.current = true;
    void Linking.openURL(STORE_URL);
  }, []);

  return { required, message, minVersion, storeUrl: STORE_URL, openStore };
}


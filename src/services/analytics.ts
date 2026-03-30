import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Application from "expo-application";
import { supabase } from "./supabase";

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

function randomId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getPlatform(): AnalyticsEvent["platform"] {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  if (Platform.OS === "web") return "web";
  return "other";
}

function getAppVersion(): string | undefined {
  return Application.nativeApplicationVersion ?? undefined;
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

export async function analyticsTrack(input: Omit<AnalyticsEvent, "device_id" | "ts" | "platform" | "app_version" | "session_id"> & { session_id?: string }) {
  const device_id = await getOrCreateDeviceId();
  const session_id = input.session_id ?? (await getOrCreateSessionId());
  const evt: AnalyticsEvent = {
    ...input,
    device_id,
    session_id,
    ts: new Date().toISOString(),
    platform: getPlatform(),
    app_version: getAppVersion(),
  };
  await enqueue(evt);
  void analyticsFlush();
}

export async function analyticsFlush() {
  const q = await loadQueue();
  if (q.length === 0) return;

  const batch = q.slice(0, 25);
  const rest = q.slice(25);

  const { error } = await supabase.from("app_events").insert(batch);
  if (error) {
    // keep queue; try later
    return;
  }

  await saveQueue(rest);
  if (rest.length > 0) {
    void analyticsFlush();
  }
}

export async function analyticsStartSession() {
  const session_id = randomId("sess");
  await AsyncStorage.setItem(SESSION_ID_KEY, session_id);
  await analyticsTrack({ name: "session_start", session_id });
  return session_id;
}

export async function analyticsEndSession() {
  const session_id = await AsyncStorage.getItem(SESSION_ID_KEY);
  if (session_id) {
    await analyticsTrack({ name: "session_end", session_id });
  }
  await AsyncStorage.removeItem(SESSION_ID_KEY);
}


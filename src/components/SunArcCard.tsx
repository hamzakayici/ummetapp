import React, { useEffect, useState, useRef } from "react";
import { View, Text, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import Svg, { Path, Circle, G, Line, Defs, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PrayerTimeEntry } from "../services/prayerTimes";
import { fetchPrayerTimesForDate } from "../services/prayerTimes";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ARC_WIDTH = SCREEN_WIDTH + 80;
const ARC_HEIGHT = 140;
const CX = ARC_WIDTH / 2;
const CY = ARC_HEIGHT;
const RX = (ARC_WIDTH - 20) / 2;
const RY = ARC_HEIGHT - 20;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * t: 0..1 → yarım ovalin solundan sağına
 * t=0.5: tepe noktası (güneş burada sabit)
 */
function getArcPoint(t: number): { x: number; y: number } {
  const clamped = Math.max(0, Math.min(1, t));
  const angle = Math.PI * (1 - clamped); // π → 0
  return {
    x: CX + RX * Math.cos(angle),
    y: CY - RY * Math.sin(angle),
  };
}

/**
 * Güneşin gerçek t değeri (0..1 arası, imsak→yatsı)
 */
function getSunT(prayers: PrayerTimeEntry[]): number {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fajr = prayers.find((p) => p.name === "Fajr");
  const isha = prayers.find((p) => p.name === "Isha");
  if (!fajr || !isha) return 0.5;
  const startMin = timeToMinutes(fajr.time);
  const endMin = timeToMinutes(isha.time);
  const range = endMin - startMin;
  if (range <= 0) return 0.5;
  return Math.max(0, Math.min(1, (nowMin - startMin) / range));
}

/**
 * Vaktin gerçek t değeri (0..1 arası, imsak→yatsı)
 */
/**
 * Vaktin yay üzerindeki pozisyonu — ortadaki çizgi (0.5) = şu anki saat.
 * Dakika farkına göre konumlanır: 1 saat ≈ %8 yay genişliği.
 * Geçmiş vakitler sola (< 0.5), gelecek vakitler sağa (> 0.5).
 */
function getPrayerArcT(prayer: PrayerTimeEntry, _prayers: PrayerTimeEntry[], _sunT: number): number {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let pMin = timeToMinutes(prayer.time);

  // Gece yarısını aşan farkları düzelt
  let diff = pMin - nowMin;
  if (diff > 720) diff -= 1440;   // Dünden kalan vakit
  if (diff < -720) diff += 1440;  // Yarına geçen vakit

  // 12 saat = yayın tamamı (0..1), yani 1 dakika = 1/720
  const scale = diff / 720;
  return 0.5 + scale;
}

/**
 * Yarım oval yolu (SVG path)
 */
function createHalfOvalPath(): string {
  return `M ${CX - RX} ${CY} A ${RX} ${RY} 0 0 1 ${CX + RX} ${CY}`;
}

/**
 * Kısmi yay (progress için)
 */
function createPartialArc(t: number, steps: number = 60): string {
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const ct = (i / steps) * t;
    const p = getArcPoint(ct);
    points.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  return points.join(" ");
}

const PRAYER_META: Record<string, { icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string }> = {
  Fajr: { icon: "moon-waning-crescent", label: "İmsak" },
  Sunrise: { icon: "weather-sunset-up", label: "Güneş" },
  Dhuhr: { icon: "white-balance-sunny", label: "Öğle" },
  Asr: { icon: "weather-partly-cloudy", label: "İkindi" },
  Maghrib: { icon: "weather-sunset-down", label: "Akşam" },
  Isha: { icon: "weather-night", label: "Yatsı" },
};

type Props = {
  prayers: PrayerTimeEntry[];
  nextPrayer: number;
  locationName: string;
};

function formatDateLabel(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const d = date.toISOString().split("T")[0];
  if (d === today.toISOString().split("T")[0]) return "Bugün";
  if (d === tomorrow.toISOString().split("T")[0]) return "Yarın";
  if (d === yesterday.toISOString().split("T")[0]) return "Dün";
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function DayPrayerRow({ prayers, label, isToday, nextPrayerIdx }: { prayers: PrayerTimeEntry[]; label: string; isToday: boolean; nextPrayerIdx?: number }) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return (
    <View style={{ width: SCREEN_WIDTH - 40, marginRight: 12 }}>
      <Text style={{ color: isToday ? "#D4AF37" : "#5A6B78", fontSize: 13, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>{label}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {prayers.map((p, i) => {
          const meta = PRAYER_META[p.name];
          if (!meta) return null;
          const isPast = isToday ? timeToMinutes(p.time) <= nowMin : true;
          const isNext = isToday && i === nextPrayerIdx;
          return (
            <View key={p.name} style={{ alignItems: "center", flex: 1 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isNext ? "rgba(212,175,55,0.15)" : isPast ? "rgba(45,106,79,0.15)" : "rgba(30,40,50,0.4)", alignItems: "center", justifyContent: "center" }}>
                <MaterialCommunityIcons name={meta.icon} size={16} color={isNext ? "#D4AF37" : isPast ? "#8A9BA8" : "#3A4550"} />
              </View>
              <Text style={{ color: isNext ? "#D4AF37" : isPast ? "#8A9BA8" : "#3A4550", fontSize: 9, fontWeight: "600", marginTop: 3 }}>{meta.label}</Text>
              <Text style={{ color: isNext ? "#ECDFCC" : isPast ? "#ECDFCC" : "#4A5568", fontSize: 12, fontWeight: isPast || isNext ? "700" : "500", marginTop: 1 }}>{p.time}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function SunArcCard({ prayers, nextPrayer, locationName }: Props) {
  const [, setTick] = useState(0);
  const dayScrollRef = useRef<ScrollView>(null);
  const [prevDay, setPrevDay] = useState<PrayerTimeEntry[]>([]);
  const [nextDay, setNextDay] = useState<PrayerTimeEntry[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem("@ummet_prayer_coords");
        let lat = 41.0, lon = 29.0;
        if (cached) { const c = JSON.parse(cached); lat = c.lat; lon = c.lon; }
        const { calculationMethod } = (await import("../stores/appStore")).useSettingsStore.getState();
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const [prev, next] = await Promise.all([
          fetchPrayerTimesForDate(lat, lon, yesterday, calculationMethod),
          fetchPrayerTimesForDate(lat, lon, tomorrow, calculationMethod),
        ]);
        setPrevDay(prev);
        setNextDay(next);
      } catch {} finally { setLoadingDays(false); }
    })();
  }, []);

  useEffect(() => {
    if (!loadingDays && dayScrollRef.current) {
      setTimeout(() => dayScrollRef.current?.scrollTo({ x: SCREEN_WIDTH - 40 + 12, animated: false }), 100);
    }
  }, [loadingDays]);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const sunT = getSunT(prayers);
  const sunPos = getArcPoint(0.5); // Güneş her zaman ortada (tepe)

  const nextP = prayers[nextPrayer];
  const nextMin = timeToMinutes(nextP.time);
  const diff = nextMin - nowMin;
  const remaining = diff > 0 ? diff : 1440 + diff;
  const remH = Math.floor(remaining / 60);
  const remM = remaining % 60;
  const remainingText = remH > 0 ? `${remH} sa ${remM} dk` : `${remM} dk`;

  const maghrib = prayers.find((p) => p.name === "Maghrib");
  const fajr = prayers.find((p) => p.name === "Fajr");
  const isNight = maghrib && fajr ? nowMin >= timeToMinutes(maghrib.time) || nowMin < timeToMinutes(fajr.time) : false;

  const SVG_HEIGHT = ARC_HEIGHT + 16;

  return (
    <View style={{ marginTop: 55, marginBottom: -15 }}>
      {/* Üst: Saat + Kalan süre */}
      <View style={{ alignItems: "center", marginBottom: 14, paddingHorizontal: 24 }}>
        <Text style={{ color: "#D4AF37", fontSize: 80, fontWeight: "800", letterSpacing: -4, lineHeight: 84 }}>{nextP.time}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
          <MaterialCommunityIcons name="timer-outline" size={20} color="#5A6B78" />
          <Text style={{ color: "#5A6B78", fontSize: 22, marginLeft: 6, fontWeight: "600" }}>{remainingText}</Text>
        </View>
      </View>

      {/* Yarım Oval Güneş Döngüsü */}
      <View style={{ overflow: "hidden", width: SCREEN_WIDTH }}>
        <View style={{ width: ARC_WIDTH, height: SVG_HEIGHT, alignSelf: "center" }}>
          <Svg width={ARC_WIDTH} height={SVG_HEIGHT} viewBox={`0 0 ${ARC_WIDTH} ${SVG_HEIGHT}`}>
            <Defs>
              <SvgGradient id="arcProgress" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="#2D6A4F" stopOpacity="0.6" />
                <Stop offset="0.4" stopColor="#D4AF37" stopOpacity="0.8" />
                <Stop offset="0.6" stopColor="#D4AF37" stopOpacity="0.8" />
                <Stop offset="1" stopColor="#2D6A4F" stopOpacity="0.6" />
              </SvgGradient>
            </Defs>



            {/* Arka plan yay — kesik çizgi */}
            <Path d={createHalfOvalPath()} stroke="rgba(45,106,79,0.12)" strokeWidth={1.5} fill="none" strokeDasharray="8 5" />

            {/* İlerlemiş kısım — sol taraf (geçmiş vakitler) */}
            <Path d={createPartialArc(0.5)} stroke="url(#arcProgress)" strokeWidth={2.5} fill="none" strokeLinecap="round" />

            {/* Vakit pozisyonları — sadece geçmiş + sonraki vakit */}
            {prayers.map((p, i) => {
              const pT = getPrayerArcT(p, prayers, sunT);
              if (pT < -0.05 || pT > 1.05) return null;
              const isPast = timeToMinutes(p.time) <= nowMin;
              const isNext = i === nextPrayer;
              // Gelecek vakitlerden sadece sonrakini göster
              if (!isPast && !isNext) return null;
              const pos = getArcPoint(pT);
              return (
                <G key={p.name}>
                  <Circle cx={pos.x} cy={pos.y} r={1.5} fill="rgba(90,107,120,0.15)" />
                </G>
              );
            })}

            {/* Ortadaki dikey çizgi — şu anki zaman */}
            <Line x1={sunPos.x} y1={sunPos.y - 14} x2={sunPos.x} y2={sunPos.y + 14} stroke="#D4AF37" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          </Svg>

          {/* Native ikonlar — yarım oval üzerinde overlay */}
          {prayers.map((p, i) => {
            const pT = getPrayerArcT(p, prayers, sunT);
            if (pT < -0.05 || pT > 1.05) return null;
            const meta = PRAYER_META[p.name];
            if (!meta) return null;
            const isNext = i === nextPrayer;
            const isPast = timeToMinutes(p.time) <= nowMin;
            // Gelecek vakitlerden sadece sonrakini göster
            if (!isPast && !isNext) return null;
            const pos = getArcPoint(pT);

            const iconSize = isNext ? 28 : 20;
            const boxSize = isNext ? 34 : 26;

            return (
              <View
                key={`icon-${p.name}`}
                style={{
                  position: "absolute",
                  left: pos.x - boxSize / 2,
                  top: pos.y - boxSize / 2,
                  width: boxSize,
                  height: boxSize,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name={meta.icon}
                  size={iconSize}
                  color={isNext ? "#D4AF37" : isPast ? "#ECDFCC" : "#4A5568"}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Vakit Satırları — Yatay Scroll: Dün / Bugün / Yarın */}
      <View style={{ marginTop: -72, marginBottom: 32 }}>
        <ScrollView
          ref={dayScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH - 40 + 12}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {prevDay.length > 0 ? (
            <DayPrayerRow prayers={prevDay} label={formatDateLabel((() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })())} isToday={false} />
          ) : (
            <View style={{ width: SCREEN_WIDTH - 40, marginRight: 12, alignItems: "center", justifyContent: "center", height: 60 }}>
              {loadingDays ? <ActivityIndicator size="small" color="#5A6B78" /> : <Text style={{ color: "#3A4550", fontSize: 12 }}>Veri yok</Text>}
            </View>
          )}
          <DayPrayerRow prayers={prayers} label="Bugün" isToday={true} nextPrayerIdx={nextPrayer} />
          {nextDay.length > 0 ? (
            <DayPrayerRow prayers={nextDay} label={formatDateLabel((() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })())} isToday={false} />
          ) : (
            <View style={{ width: SCREEN_WIDTH - 40, marginRight: 12, alignItems: "center", justifyContent: "center", height: 60 }}>
              {loadingDays ? <ActivityIndicator size="small" color="#5A6B78" /> : <Text style={{ color: "#3A4550", fontSize: 12 }}>Veri yok</Text>}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

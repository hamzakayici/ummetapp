import AsyncStorage from "@react-native-async-storage/async-storage";

export type Mosque = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance: number; // metre
  address?: string;
  phone?: string;
  website?: string;
};

const CACHE_KEY = "@ummet_mosques_cache";
const CACHE_DURATION = 1000 * 60 * 30; // 30 dakika

// Overpass API mirror'ları — GET ile çalışanlar
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/**
 * Yakındaki camileri çeker — önbellek + retry + fallback
 */
export async function fetchNearbyMosques(lat: number, lon: number, radiusMeters: number = 5000): Promise<Mosque[]> {
  // Önbellek kontrolü
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, ts, cLat, cLon, cRadius } = JSON.parse(cached);
      const age = Date.now() - ts;
      const dist = calculateDistance(lat, lon, cLat, cLon);
      // 30 dk içinde, aynı bölge (500m içinde), aynı yarıçap → cache dön
      if (age < CACHE_DURATION && dist < 500 && cRadius === radiusMeters) {
        return data;
      }
    }
  } catch {}

  // Overpass sorgusu
  const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lon}););out center body;`;

  let lastError = "";

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      // GET yöntemi — 403 sorununu azaltır
      const url = `${mirror}?data=${encodeURIComponent(query)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "UmmetApp/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 403 || response.status === 429) {
        lastError = "Sunucu şu an yoğun, lütfen biraz bekleyip tekrar deneyin.";
        continue;
      }

      if (!response.ok) {
        lastError = `Bağlantı sorunu (${response.status})`;
        continue;
      }

      const text = await response.text();

      // HTML hata sayfası kontrolü
      if (text.startsWith("<") || text.includes("<!DOCTYPE")) {
        lastError = "Sunucu geçici olarak yanıt veremiyor.";
        continue;
      }

      const data = JSON.parse(text);

      if (!data.elements || !Array.isArray(data.elements)) {
        lastError = "Veri alınamadı.";
        continue;
      }

      const mosques: Mosque[] = data.elements
        .filter((el: any) => (el.lat ?? el.center?.lat) != null)
        .map((el: any) => {
          const elLat = el.lat ?? el.center?.lat;
          const elLon = el.lon ?? el.center?.lon;
          const tags = el.tags || {};
          return {
            id: el.id,
            name: tags.name || tags["name:tr"] || "Cami",
            lat: elLat,
            lon: elLon,
            distance: calculateDistance(lat, lon, elLat, elLon),
            address: tags["addr:street"]
              ? `${tags["addr:street"]} ${tags["addr:housenumber"] || ""}`.trim()
              : tags["addr:full"] || undefined,
            phone: tags.phone || tags["contact:phone"] || undefined,
            website: tags.website || tags["contact:website"] || undefined,
          };
        });

      mosques.sort((a, b) => a.distance - b.distance);

      // Önbelleğe kaydet
      try {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          data: mosques, ts: Date.now(), cLat: lat, cLon: lon, cRadius: radiusMeters,
        }));
      } catch {}

      return mosques;
    } catch (e: any) {
      lastError = e.name === "AbortError"
        ? "Bağlantı zaman aşımına uğradı."
        : "İnternet bağlantınızı kontrol edin.";
      continue;
    }
  }

  throw new Error(lastError || "Camiler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

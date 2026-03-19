// Hicri takvim hesaplama — Astronomik tabanlı Ummul Qura yaklaşımı

const HIJRI_MONTHS = [
  "Muharrem", "Safer", "Rebîülevvel", "Rebîülâhir",
  "Cemâziyelevvel", "Cemâziyelâhir", "Receb", "Şaban",
  "Ramazan", "Şevval", "Zilkade", "Zilhicce",
];

const HIJRI_MONTHS_AR = [
  "محرّم", "صفر", "ربيع الأوّل", "ربيع الآخر",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوّال", "ذو القعدة", "ذو الحجّة",
];

const WEEKDAYS_TR = [
  "Pazar", "Pazartesi", "Salı", "Çarşamba",
  "Perşembe", "Cuma", "Cumartesi",
];

export type HijriDate = {
  day: number;
  month: number;
  monthName: string;
  monthNameAr: string;
  year: number;
  weekday: string;
  formatted: string;
  formattedShort: string;
};

/**
 * Miladi tarihi Hicri tarihe çevir
 * Kuveytli Astronomik Algoritma (yüksek doğruluk)
 */
export function toHijri(date: Date = new Date()): HijriDate {
  // Intl.DateTimeFormat ile hicri takvim — en güvenilir yöntem
  const hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const parts = hijriFormatter.formatToParts(date);
  const day = parseInt(parts.find((p) => p.type === "day")?.value || "1", 10);
  const month = parseInt(parts.find((p) => p.type === "month")?.value || "1", 10);
  const year = parseInt(parts.find((p) => p.type === "year")?.value || "1446", 10);

  const weekday = WEEKDAYS_TR[date.getDay()];
  const monthName = HIJRI_MONTHS[month - 1] || "";
  const monthNameAr = HIJRI_MONTHS_AR[month - 1] || "";

  return {
    day,
    month,
    monthName,
    monthNameAr,
    year,
    weekday,
    formatted: `${day} ${monthName} ${year}`,
    formattedShort: `${day} ${monthName.substring(0, 3)} ${year}`,
  };
}

/**
 * Belirtilen hicri ayın tüm günlerini miladi karşılıklarıyla döndür
 */
export function getHijriMonthDays(hijriYear: number, hijriMonth: number): { hijriDay: number; gregorian: Date; isToday: boolean }[] {
  // Parametre validasyonu
  if (!Number.isFinite(hijriYear) || !Number.isFinite(hijriMonth) ||
      hijriMonth < 1 || hijriMonth > 12 || hijriYear < 1 || hijriYear > 2000) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: { hijriDay: number; gregorian: Date; isToday: boolean }[] = [];

  // Hedef hicri ay ile bugünkü hicri ay arasındaki farkı hesapla
  const todayH = toHijri(today);
  const monthDiff = (hijriYear - todayH.year) * 12 + (hijriMonth - todayH.month);

  // Miladi başlangıç noktasını farka göre ayarla (hicri ay ≈ 29.5 gün)
  const start = new Date(today);
  start.setDate(start.getDate() + Math.round(monthDiff * 29.5) - 5);

  // 45 gün tara — bir hicri ay max 30 gün + kenar payı
  for (let d = 0; d < 45; d++) {
    const check = new Date(start);
    check.setDate(start.getDate() + d);

    const h = toHijri(check);
    if (h.year === hijriYear && h.month === hijriMonth) {
      const checkClean = new Date(check);
      checkClean.setHours(0, 0, 0, 0);
      days.push({
        hijriDay: h.day,
        gregorian: check,
        isToday: checkClean.getTime() === today.getTime(),
      });
    }
  }

  return days;
}

/**
 * Önemli İslami günler
 */
export type IslamicEvent = {
  month: number;
  day: number;
  name: string;
  description: string;
  icon: string;
};

export const ISLAMIC_EVENTS: IslamicEvent[] = [
  { month: 1, day: 1, name: "Hicri Yılbaşı", description: "İslami yeni yıl", icon: "moon-new" },
  { month: 1, day: 10, name: "Aşure Günü", description: "Muharrem'in 10. günü", icon: "hands-pray" },
  { month: 3, day: 12, name: "Mevlid Kandili", description: "Hz. Muhammed'in doğumu", icon: "mosque" },
  { month: 7, day: 27, name: "Miraç Kandili", description: "İsra ve Miraç gecesi", icon: "star-four-points" },
  { month: 8, day: 15, name: "Berat Kandili", description: "Beraat gecesi", icon: "star-shooting" },
  { month: 9, day: 1, name: "Ramazan Başlangıcı", description: "Oruç ayı başlangıcı", icon: "moon-waning-crescent" },
  { month: 9, day: 27, name: "Kadir Gecesi", description: "Bin aydan hayırlı gece", icon: "star-crescent" },
  { month: 10, day: 1, name: "Ramazan Bayramı", description: "3 gün bayram", icon: "party-popper" },
  { month: 12, day: 9, name: "Arefe Günü", description: "Kurban Bayramı arefesi", icon: "calendar-star" },
  { month: 12, day: 10, name: "Kurban Bayramı", description: "4 gün bayram", icon: "mosque" },
];

export { HIJRI_MONTHS, HIJRI_MONTHS_AR, WEEKDAYS_TR };

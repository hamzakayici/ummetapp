/**
 * Gün anahtarı üretimi — streak, rozet ve günlük takibin temeli.
 *
 * ⚠️ NEDEN BU DOSYA VAR
 *
 * Önceden `new Date().toISOString().split("T")[0]` kullanılıyordu. `toISOString()`
 * **UTC** döndürür. Türkiye UTC+3 olduğu için yerel saat 00:00–03:00 arasında
 * yapılan her kayıt bir ÖNCEKİ güne yazılıyordu.
 *
 * Pratikte: yatsı sonrası veya teheccüd vaktinde ibadet eden kullanıcı — yani
 * en sadık kullanıcı segmenti — zikrini çekiyor ama streak'i ilerlemiyordu.
 *
 * Bu dosyadaki fonksiyonlar cihazın YEREL tarihini kullanır. Tarihle ilgili
 * her yerde bunları kullanın, `toISOString()` çağırmayın.
 */

/** Bir Date nesnesinin yerel tarihini "YYYY-AA-GG" biçiminde verir */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Bugünün yerel tarih anahtarı */
export function getTodayKey(): string {
  return toDateKey(new Date());
}

/** Bugünden `offset` gün önce/sonra (negatif = geçmiş) */
export function getDateKeyOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

/**
 * İçinde bulunulan haftanın Pazartesi'den Pazar'a tarih anahtarları.
 * JS'te getDay() Pazar = 0 döndürür; Türkiye'de hafta Pazartesi başlar.
 */
export function getWeekKeys(): string[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() + mondayOffset + i);
    return toDateKey(day);
  });
}

/** Haftanın kaçıncı günündeyiz (Pazartesi = 0, Pazar = 6) */
export function getTodayWeekIndex(): number {
  const dayOfWeek = new Date().getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

/**
 * Eski UTC tabanlı anahtar — SADECE geriye dönük okuma için.
 *
 * Mevcut kullanıcıların verisi UTC anahtarlarıyla kaydedilmişti. Geçmiş
 * kayıtları kaybetmemek için okuma yaparken her iki anahtarı da kontrol
 * ediyoruz. Yeni yazımlar her zaman yerel anahtarla yapılır.
 */
export function getLegacyUtcKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Bir günün işaretli olup olmadığını, eski UTC anahtarını da hesaba katarak
 * kontrol eder. Geçiş dönemi için — birkaç sürüm sonra kaldırılabilir.
 */
export function isDayMarked(record: Record<string, unknown>, date: Date): boolean {
  return Boolean(record[toDateKey(date)] ?? record[getLegacyUtcKey(date)]);
}

/**
 * Bir günün sayacını, eski UTC anahtarını da hesaba katarak okur.
 */
export function readDayCount(record: Record<string, number>, date: Date): number {
  return record[toDateKey(date)] ?? record[getLegacyUtcKey(date)] ?? 0;
}

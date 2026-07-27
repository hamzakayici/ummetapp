# Ümmet — Mobil Uygulama Mimarisi

> Hazırlanma tarihi: 26 Temmuz 2026
> Expo SDK 54 · React Native 0.81.5 · React 19 · expo-router 6 · TypeScript (strict)

---

## 1. Klasör Yapısı

```
app/                      expo-router — dosya yolu = rota
  _layout.tsx             kök layout: font yükleme, oturum başlatma, push kaydı,
                          zorunlu güncelleme kontrolü, deep link
  (tabs)/                 alt sekmeler
    index.tsx             ana sayfa — vakitler, günün ayeti, haftalık takip, ruh hâli
    quran.tsx             sure / cüz / favori listesi
    dhikr.tsx             tesbih + ortak zikir
    tracker.tsx           kaza namazı, oruç, günlük takip
    more.tsx              menü
  quran-reader.tsx        604 sayfa mushaf okuyucu
  quran-detail.tsx        sure detayı + meal
  shared-dhikr/[id].tsx   ortak zikir odası (deep link: ummet://shared-dhikr/[id])
  ...20 ekran daha

src/
  services/               dış dünya ile temas eden her şey
  stores/appStore.ts      7 Zustand store, AsyncStorage'a persist
  data/                   statik içerik (sure listesi, günün ayetleri, Delâil)
  utils/                  hijriCalendar, haptics
  components/             SunArcCard
  constants/theme.ts      tasarım token'ları

modules/widget-data/      iOS widget'a veri geçiren özel Expo modülü
targets/widget/           UmmetWidget.swift
plugins/                  withWidget, withEzanSounds (config plugin)
```

---

## 2. Servis Katmanı

Tüm ağ ve cihaz erişimi `src/services/` altında toplanır. Ekranlar doğrudan `fetch` çağırmaz.

| Servis | Sorumluluk |
|---|---|
| `api.ts` | **Laravel API istemcisi.** Taban adres, timeout, hata sarmalama. Tüm backend çağrıları buradan geçer |
| `analytics.ts` | Olay kuyruğu (AsyncStorage, son 500), batch gönderim, oturum yönetimi |
| `remoteConfig.ts` | Duyurular + remote config, 10 dk TTL, bellek + disk cache |
| `pushTokenService.ts` | Expo push token alma ve sunucuya kaydetme |
| `sharedDhikr.ts` | Ortak zikir CRUD + `pollSharedDhikr` (Realtime yerine polling) |
| `prayerTimes.ts` | aladhan API, konum izni, offline cache |
| `ezanNotification.ts` | Vakit bildirimleri, vakte özel ezan sesi |
| `audioService.ts` | Ezan ve ayet sesi çalma, arka plan modu |
| `mosqueService.ts` | Overpass API — yakındaki camiler |
| `widgetService.ts` | iOS widget'a veri yazma |

### Backend geçişi (26 Temmuz 2026)

Supabase projesi silindiği için 5 servis Laravel API'ye taşındı. `src/services/supabase.ts` **kaldırıldı**, `@supabase/supabase-js` bağımlılığı çıkarıldı.

| Önce | Sonra |
|---|---|
| Supabase Realtime (ortak zikir) | `pollSharedDhikr` — 4 sn'de bir okuma |
| Supabase presence (canlı kullanıcı) | `GET /stats/online` — 30 sn'de bir |
| Anon key ile doğrudan DB yazma | Doğrulamalı + hız sınırlı API uçları |
| İstemcinin hesapladığı oturum süresi | Sunucu hesaplar |

---

## 3. State Yönetimi

Zustand + `persist` → AsyncStorage. Yedi ayrı store, yedi ayrı depolama anahtarı:

| Store | Anahtar | Tutulan |
|---|---|---|
| `useKazaStore` | `ummet-kaza` | Kaza namazı (6 vakit), oruç, adak |
| `useDhikrStore` | `ummet-dhikr` | Günlük zikir sayaçları |
| `useSharedDhikrStore` | `ummet-shared-dhikr` | Katılınan ortak zikirler + kendi katkın |
| `useWeeklyStore` | `ummet-weekly` | Günlük ibadet işaretleri |
| `useSettingsStore` | `ummet-settings` | Haptik, bildirim, hesaplama yöntemi |
| `useProStore` | `ummet-pro` | **Ölü kod** — satın alma eklenirken yeniden yazılacak |
| `useQuranSettingsStore` | `ummet-quran-settings` | Tema, font, punto, son konum |

**Sunucuya senkron yok.** Telefon değişince tüm veri kaybolur — en güçlü Pro özelliği adayı (`08-OZELLIK-ENVANTERI.md`).

### ⚠️ Bilinen hata

`src/stores/appStore.ts:64` — `getTodayKey()` `toISOString()` kullanıyor, yani **UTC**. Türkiye UTC+3 olduğu için yerel saat 00:00–03:00 arasındaki kayıtlar bir önceki güne yazılıyor. Streak, rozet ve analitik bundan etkileniyor.

---

## 4. Veri Akışları

### Namaz vakitleri
```
Konum izni → koordinat → cache'ten göster (anında)
                       → aladhan API → state + AsyncStorage cache
                                     → bildirimleri zamanla
                                     → iOS widget'a yaz
```
Offline: son cache gösterilir. Ters coğrafi kodlama (şehir adı) `bigdatacloud`, başarısız olursa sessizce atlanır.

### Analytics
```
analyticsTrack() → AsyncStorage kuyruğu (son 500)
                 → 25'lik batch → POST /analytics/events
                 → başarısızsa kuyrukta kalır, sonra tekrar
```
Çevrimdışıyken veri kaybolmaz.

### Ortak zikir
```
Basma → yerel sayaç anında artar (akıcı UX)
      → 1 sn hareketsizlikte biriken miktar sunucuya (batch)
Ekran açık → 4 sn'de bir GET → sunucu değeriyle senkron
```

---

## 5. Native Katman

| Parça | Ne yapar |
|---|---|
| `targets/widget/UmmetWidget.swift` | iOS ana ekran widget'ı — sıradaki vakit |
| `modules/widget-data/` | JS'ten widget'a veri geçiren özel Expo modülü |
| `plugins/withWidget.js` | Widget target'ını prebuild'e ekler |
| `plugins/withEzanSounds.js` | Ezan `.caf` dosyalarını bildirim sesi olarak kaydeder |

`ios/` ve `android/` klasörleri **prebuild çıktısıdır**, gitignore'dadır. Native değişiklik elle değil config plugin üzerinden yapılır.

**Android eksiği:** ezan bildirimleri için notification channel kurulumu yok. Play Store yayını öncesi tek gerçek geliştirme işi.

---

## 6. Sürüm ve Güncelleme

- **OTA:** `expo-updates`. JS-only değişiklikler App Review'sız gider.
- **Zorunlu güncelleme:** `useForcedUpdate` → `min_supported_version` remote config anahtarını okur, eskiyse engelleyici ekran gösterir.
- **Sürüm artırma:** elle düzenlemeyin → `npm run version:patch` (app.json + package.json + commit).

> `app/(tabs)/more.tsx:212` sürümü hardcoded `v1.0.0` gösteriyor, `app.json` `1.0.1`. `expo-application`'dan okunmalı.

---

## 7. Konvansiyonlar

- Arayüz dili **Türkçe**, i18n altyapısı yok — metinler JSX içine gömülü
- Kod yorumları Türkçe, commit mesajları Türkçe (conventional commits)
- Stil: NativeWind + inline `style` karışık. Yeni kodda çevredeki dosyaya uyun
- Renkler `theme.ts`'te tanımlı ama kod boyunca hex tekrar ediyor — yeni kodda token kullanın
- Haptik doğrudan `expo-haptics` değil, `utils/haptics.ts` üzerinden
- Path alias'ları tanımlı (`@/*`, `@services/*` …) ama mevcut kod göreli yol kullanıyor

---

## 8. Teknik Borç

| Konu | Yer |
|---|---|
| Zaman dilimi hatası | `stores/appStore.ts:64` |
| Kuran runtime indirme + sessiz hata | `app/quran-reader.tsx:73-118` |
| Ölü `useProStore` | `stores/appStore.ts:201` |
| Hardcoded sürüm | `app/(tabs)/more.tsx:212` |
| Overpass rate-limit riski | `services/mosqueService.ts` |
| Test yok, crash izleme yok | — |
| 43 MB ses bundle | `assets/sounds/` |

Detay ve öncelik: `00-PROJE-ANALIZI.md` §5, `01-IYILESTIRME-YOL-HARITASI.md`.

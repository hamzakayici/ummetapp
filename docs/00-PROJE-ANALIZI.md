# Ümmet — Proje Analizi (Mevcut Durum)

> Hazırlanma tarihi: 26 Temmuz 2026
> Kaynak: `islamic_app` deposu, commit `8b2d38b` (main)
> Kapsam: Mobil uygulama + backend + admin/landing.
>
> ⚠️ **Bu bir tarihsel anlık görüntüdür** — projenin 26 Temmuz 2026'da *bulunduğu* hâli anlatır.
> O tarihten sonra iki şey kökten değişti:
> 1. Supabase projesinin silindiği tespit edildi → backend Laravel + MySQL'e taşındı (`06-LARAVEL-PLANI.md` §1)
> 2. Next.js/Payload landing kaldırıldı → yerini Laravel + Filament aldı (`web/`)
>
> Güncel mimari için: `10-MOBIL-MIMARI.md`, `11-BACKEND-API.md`, `13-ADMIN-VE-VERI-KAYNAKLARI.md`

---

## 1. Tek Cümlede

Ümmet, Türkiye pazarına yönelik, içerik derinliği rakiplerinin üstünde olan, teknik altyapısı (push segmentasyonu, remote config, analytics, OTA, zorunlu güncelleme) şaşırtıcı derecede olgun ama **hiçbir gelir mekanizması olmayan** bir İslami yaşam uygulaması.

En kritik tespit: Uygulamada `useProStore` adında bir "Pro" state'i tanımlı (`src/stores/appStore.ts:201`) ama **hiçbir ekranda kullanılmıyor**. Yani monetizasyon niyeti var, uygulaması sıfır.

---

## 2. Teknik Mimari

| Katman | Teknoloji |
|---|---|
| Mobil | Expo SDK 54, React Native 0.81.5, React 19, expo-router 6, TypeScript |
| Stil | NativeWind 4 (Tailwind) + yoğun inline `style` — karışık kullanım |
| State | Zustand 5 + `persist` middleware → AsyncStorage (7 ayrı store) |
| Backend | Supabase (Postgres + RLS + Realtime + Edge Functions) |
| Admin/Web | Next.js 16 + Payload CMS 3 + Mantine 8 (`landing/`) |
| Native | iOS Widget (Swift, `targets/widget/UmmetWidget.swift`), özel Expo modülü `modules/widget-data` |
| Dağıtım | EAS Build, expo-updates (OTA), özel zorunlu güncelleme akışı |

**Kod hacmi:** 48 TS/TSX dosyası, ~10.800 satır (app + src). 25 ekran. Ayrıca ayrı bir Next.js projesi.

**Dış servis bağımlılıkları:**

| Servis | Kullanım | Risk |
|---|---|---|
| `api.aladhan.com` | Namaz vakitleri | Orta — ücretsiz, SLA yok |
| `api.alquran.cloud` | Kuran metni (Uthmani) + Diyanet meali | **Yüksek** — 604 sayfa mushaf runtime'da indiriliyor |
| `cdn.islamic.network` | Ayet ses dosyaları (Alafasy) | Orta |
| `api.bigdatacloud.net` | Ters coğrafi kodlama (şehir adı) | Düşük |
| `overpass-api.de` / `overpass.kumi.systems` | Yakındaki camiler | **Yüksek** — agresif rate-limit'li public endpoint |
| Supabase | Analytics, push token, ortak zikir, remote config, duyuru | Kendi altyapımız |

---

## 3. Özellik Envanteri

**İbadet çekirdeği**
- Namaz vakitleri (13 hesaplama metodu, konum bazlı, offline cache)
- 5 vakit için ayrı makamda ezan sesi (Saba/Rast/Hicaz/Segah/Bayatî) — **ayırt edici, rakiplerde nadir**
- Ezan bildirimleri (custom sound, arka planda ses)
- Kıble pusulası (manyetometre)
- Güneş yayı kartı (`SunArcCard`) — görsel vakit göstergesi

**Kuran**
- 604 sayfa mushaf okuyucu, 5 tema, 3 Arapça font, font boyutu, yatay mod
- Sure/cüz/favori listesi, meal, ayet ayet sesli okuma, kaldığın yerden devam

**Takip & oyunlaştırma**
- Kaza namazı takibi (6 vakit), kaza orucu, adak
- Günlük/haftalık ibadet takibi, streak sayacı, rozetler, ibadet analitiği
- Hıfz (ezber) planı

**Sosyal**
- **Ortak zikir**: paylaşılabilir kod ile grup zikri, Supabase Realtime canlı sayaç, deep link (`ummet://shared-dhikr/[id]`) — **doğal viral döngü, ama üstüne gidilmemiş**

**İçerik & araçlar**
- 100+ kategorize dua, hadis koleksiyonu, Delâil-ül Hayrat, namaz rehberi
- Hicri takvim + önemli günler, Ramazan Hub (iftar/sahur/hatim planı)
- Zekat / fitre / kefaret hesaplayıcı, yakındaki camiler
- "Nasıl hissediyorsunuz?" → ruh hâline göre ayet/dua önerisi

**Operasyon altyapısı (gizli güç)**
- Supabase tabanlı analytics: cihaz, oturum, event, retention, cohort, top screens
- Payload admin panelinden: duyuru yayınlama, remote config, segmentli push, A/B test push, açılma oranı metrikleri
- OTA güncelleme + eski sürümde zorunlu güncelleme ekranı
- SEO'lu web sitesi (`ummetapp.com`): zekat, dualar, Kuran, tesbih, namaz rehberi, hicri takvim sayfaları

---

## 4. Güçlü Yanlar

1. **İçerik derinliği Türkiye'ye özgü.** Kaza namazı takibi, Delâil-ül Hayrat, makam bazlı ezan, fitre/kefaret hesaplayıcı — Muslim Pro gibi global rakiplerde ya yok ya yüzeysel. Bu, TR pazarında savunulabilir bir konum.
2. **Monetizasyon altyapısı zaten hazır.** Remote config + segmentli push + A/B test + analytics var. Paywall varyantı denemek için ek altyapı gerekmiyor; sadece paywall'un kendisi eksik.
3. **Viral çekirdek mevcut.** Ortak zikir link paylaşımı organik edinim kanalı — şu an ölçülmüyor ve teşvik edilmiyor.
4. **Web ayağı SEO'lu.** Ücretsiz organik trafik kanalı zaten kurulmuş; app install funnel'ına bağlanmamış.
5. **Widget + arka plan ses + custom notification sound** gibi native işler çözülmüş. Bunlar genelde en çok vakit yiyen kısımlar.

---

## 5. Kritik Sorunlar ve Teknik Borç

Öncelik sırasına göre. Her biri dosya:satır referanslı, doğrulanmış.

### P0 — Gelire/veriye doğrudan zarar veren

**5.1 Monetizasyon sıfır**
`src/stores/appStore.ts:201-214` — `useProStore` tanımlı, hiçbir ekranda import edilmiyor (ölü kod). `package.json`'da IAP/RevenueCat/reklam paketi yok. Uygulama App Store'da ücretsiz ve gelirsiz.

**5.2 Zaman dilimi hatası — oyunlaştırmanın tamamını bozuyor**
`src/stores/appStore.ts:64`
```ts
const getTodayKey = () => new Date().toISOString().split("T")[0];
```
`toISOString()` UTC döndürür. Türkiye UTC+3 olduğu için **yerel saat 00:00–03:00 arasında yapılan zikir, günlük takip ve haftalık işaretlemeler bir önceki güne yazılıyor.** Yatsı sonrası / teheccüd vaktinde ibadet eden kullanıcı — yani en sadık kullanıcı segmenti — streak'ini kaybediyor. Streak, rozet ve analitiğin tamamı bu fonksiyona dayanıyor. Abonelik satacaksak, satacağımız şeyin çekirdek metriği bozuk.

**5.3 Kuran okuyucu offline çalışmıyor ve sessizce hata veriyor**
`app/quran-reader.tsx:73-118` — Tüm mushaf (Arapça + Türkçe meal, ~604 sayfa) her ilk açılışta iki ayrı API'den indiriliyor, tek bir JSON olarak AsyncStorage'a yazılıyor (~6-10 MB tek satır). 30 saniyelik timeout var; hata durumunda `catch { setLoading(false) }` → kullanıcı **boş beyaz ekran** görüyor, hiçbir mesaj yok. Umrede, uçakta, zayıf bağlantıda Kuran açılmıyor.
Ek olarak: bu kadar büyük JSON'ı AsyncStorage'a yazmak/okumak düşük donanımlı Android cihazlarda ciddi gecikme ve OOM riski demek.

**5.4 Android yayında değil**
`app.json` Android yapılandırması eksiksiz (`com.ummet.app`, versionCode 2, izinler), `android/` klasörü mevcut, ama Play Store'da yayın yok. Türkiye'de Android pazar payı **~%75-80**. Yani şu an potansiyel kullanıcı tabanının dörtte üçü kapalı. Bu, listedeki en yüksek getiri/efor oranına sahip madde.

### P1 — Büyümeyi ve retention'ı sınırlayan

**5.5 Tek dil (Türkçe), i18n altyapısı yok**
Tüm metinler JSX içine gömülü. İngilizce/Arapça/Endonezyaca çıkmak şu an mimari bir refactor gerektiriyor. Global İslami app pazarının %90'ı erişilemez durumda.

**5.6 Hesap sistemi ve bulut yedek yok**
Tüm veri (kaza borcu, hıfz planı, streak, rozet) sadece cihazda AsyncStorage'da. **Telefon değiştiren kullanıcı yıllarca biriktirdiği kaza takibini kaybediyor.** Bu hem retention katili hem de abonelik satarken iade sebebi. Aynı zamanda en güçlü Pro özelliği adayı.

**5.7 Uygulama boyutu — 43 MB sadece ses**
`assets/sounds/` 43 MB. Ayrıca 4 adet ~1.1 MB PNG ikon (optimize edilmemiş). Hücresel veriyle indirme eşiğine yaklaşıyor → indirme dönüşümünü düşürüyor. Ezan sesleri talep üzerine indirilebilir hale getirilirse hem boyut düşer hem "ek ezan sesleri" bir Pro özelliği olur.

**5.8 Crash/hata izleme yok**
Sentry veya muadili yok. Kod boyunca `catch {}` ile sessizce yutulan hatalar var (`quran-reader.tsx:69`, `index.tsx:154`, `audioService.ts:36`). Şu anda kaç kullanıcının hangi ekranda çöktüğünü bilmenin yolu yok.

### P2 — Kalite / veri bütünlüğü

**5.9 Analytics client'tan doğrudan yazılıyor**
`src/services/analytics.ts:129` — `anon` key ile doğrudan `app_events` insert. RLS anon insert'e açıksa üçüncü taraf metrikleri şişirebilir. Ayrıca `session_end` tamamen client'a bağlı; uygulama çökerse veya kill edilirse oturum hiç kapanmıyor → **ortalama oturum süresi metriği olduğundan uzun görünüyor.** Gelir kararlarını bu sayılara dayandıracaksak sunucu tarafında doğrulama gerekli.

**5.10 `app_devices` upsert yerine insert-then-update**
`src/services/analytics.ts:49-63` — Insert dener, hata alırsa update eder. Postgres `upsert`/`onConflict` varken gereksiz; yarış durumu ve hata gürültüsü üretiyor.

**5.11 Sürüm numarası iki yerde, tutarsız**
`app/(tabs)/more.tsx:212` `"Ümmet v1.0.0"` hardcoded; `app.json` `1.0.1`. Kullanıcıya yanlış sürüm gösteriliyor. `expo-application` zaten projede var, oradan okunmalı.

**5.12 Cami verisi kırılgan**
`src/services/mosqueService.ts` — Overpass API public endpoint'leri kullanıyor. Bunlar ağır rate-limit uygular ve gönüllü altyapıdır; kullanıcı sayısı arttıkça özellik sessizce çalışmayı bırakır.

**5.13 Test yok, CI yok**
Hiç test dosyası yok. Ödeme akışı ekleneceği düşünülürse en azından entitlement mantığı ve tarih/streak hesaplamaları için test şart.

**5.14 Stil tutarsızlığı**
NativeWind sınıfları ve inline `style` objeleri aynı bileşende karışık (`more.tsx`, `index.tsx`). Tema renkleri (`#D4AF37`, `#0A0E17`, `#8A9BA8`…) `src/constants/theme.ts` varken onlarca dosyada string olarak tekrarlanıyor. Tema değişikliği veya açık mod desteği şu an her dosyayı elle düzenlemek demek.

---

## 6. Rekabet Konumu (TR)

| Rakip | Güçlü | Ümmet'in avantajı |
|---|---|---|
| Muslim Pro | Global marka, geniş dil, güçlü ASO | Kaza takibi, Delâil, makam bazlı ezan, TR'ye özgü hesaplayıcılar |
| Diyanet uygulamaları | Kurumsal güven, resmî vakitler | Modern arayüz, oyunlaştırma, sosyal zikir |
| Namaz Vakti / Ezan Vakti tipi yerel app'ler | Sade, hafif, yüksek indirme | İçerik derinliği ve ürün kalitesi |

**Boşluk:** TR pazarında "modern ürün kalitesi + yerel içerik derinliği + sosyal" üçlüsünü aynı anda sunan yok. Ümmet buraya oturuyor. Ama şu an **görünürlük** sorunu var (bkz. ASO, `01-IYILESTIRME-YOL-HARITASI.md` §5).

---

## 7. Sonraki Adım

Bu doküman "ne var" sorusunu yanıtlıyor. Devamı:
- `01-IYILESTIRME-YOL-HARITASI.md` — ne yapmalı, hangi sırayla
- `02-MONETIZASYON.md` — nasıl para kazanılır, fiyat, paywall, uygulama planı
- `03-VERI-VE-OLCUM.md` — hangi veriye ihtiyaç var, App Store Connect'ten ne lazım
- `04-LANDING-PAGE.md` — ummetapp.com değerlendirmesi ve yeniden yapım planı

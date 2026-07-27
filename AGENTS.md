# Ümmet — Agent Rehberi

Bu dosya Claude Code, Cursor ve diğer AI ajanları içindir. Kod yazmadan önce oku.

---

## Proje Nedir

**Ümmet** — Türkçe İslami yaşam uygulaması. iOS'ta yayında (App Store ID `6760871547`), Android hazır ama **yayında değil**.

Depoda **iki proje** var:

| Klasör | Nedir | Stack |
|---|---|---|
| kök (`app/`, `src/`) | Mobil uygulama | Expo SDK 54, RN 0.81, React 19, expo-router 6, TypeScript |
| `web/` | **Yeni:** landing + admin paneli + mobil API | Laravel 13, Filament v5, PHP 8.3, MySQL |

> ## 🚨 KRİTİK — ÖNCE BUNU OKU (26 Temmuz 2026)
>
> **Supabase projesi `txvqxjrjbmjwhgddztma` SİLİNMİŞ.** DNS NXDOMAIN (yerel, 8.8.8.8, 1.1.1.1 ile doğrulandı).
> App Store'daki canlı sürüm hâlâ oraya bağlanmaya çalışıyor. Hatalar sessizce yutulduğu için uygulama çökmüyor ama şunlar **çalışmıyor**: analytics, push token kaydı, duyurular, remote config ve **ortak zikir** (kullanıcının gördüğü arıza).
>
> **Durum (26 Tem 2026): mobil taraf Laravel API'ye taşındı.** `src/services/supabase.ts` silindi, `@supabase/supabase-js` kaldırıldı. 5 servis (`api.ts`, `analytics.ts`, `remoteConfig.ts`, `pushTokenService.ts`, `sharedDhikr.ts`) artık `/api/v1` kullanıyor. Realtime yerine polling.
>
> **Kalan iş:** Laravel'i cPanel'e deploy etmek ve yeni bir App Store sürümü çıkarmak. O sürüm çıkana kadar mağazadaki uygulama arızalı kalmaya devam ediyor.
> Detay: `docs/06-LARAVEL-PLANI.md` §1, `docs/11-BACKEND-API.md`.

Backend: **Laravel API + MySQL** (`web/`). Mobil uygulama `app.json > expo.extra.apiBaseUrl` üzerinden bağlanır.

### Laravel tarafı (`web/`)

- **Yerel geliştirme: XAMPP + MySQL (MariaDB 10.4).** XAMPP sadece veritabanı sunucusu olarak kullanılır; Laravel `php artisan serve` ile çalışır, Apache vhost yapılandırmasına girilmez.
  Bağlantı: `127.0.0.1:3306`, veritabanı `ummet`, kullanıcı `root`, parola yok (XAMPP varsayılanı). Sadece yereldir — üretimde asla bu yapılandırma kullanılmaz.
- **PHP 8.3 kullanın.** cPanel 8.3.0 çalıştırıyor; yerelde Homebrew `php@8.3` (8.3.19) kurulu ve tüm eklentileri (`pdo_pgsql`, `pgsql`, `mbstring`, `intl`, `bcmath`, `gd`, `zip`) içeriyor. `export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"` — aksi halde sistem varsayılanı 8.4.4 devreye girer.
- **Tek veritabanı: MySQL.** Supabase projesi silindiği için ikinci bağlantıya gerek kalmadı. Şema: `docs/12-VERITABANI.md`.
- **Realtime yok.** Paylaşımlı hosting kalıcı WebSocket süreci tutamaz. Ortak zikir ve "canlı kullanıcı" sayacı polling ile çalışır.
- 🚨 **Yerelden canlı push gönderilmesin.** `PUSH_ENABLED=false` (varsayılan) iken yalnızca `PUSH_TEST_TOKENS` listesine gider. `true` yaparsanız App Store'daki **gerçek kullanıcılara** bildirim gider ve geri alınamaz.
- Çalıştırma: `cd web && php artisan serve` → panel `/admin`. API referansı: `docs/11-BACKEND-API.md`.

---

## Komutlar

```bash
# Mobil uygulama
npm start                 # Expo dev server
npm run ios               # iOS'ta çalıştır
npm run android           # Android'de çalıştır
npm run version:patch     # app.json + package.json sürümünü artırır ve commit eder

# Web: landing + admin + API (web/ içinde)
export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"
php artisan serve         # http://localhost:8000 · panel: /admin
npm run build             # Vite (Tailwind 4)

# App Store Connect analitik verisi (bağımlılık yok, Node 18+)
export ASC_ISSUER_ID="..."                        # tek eksik değer
node scripts/appstore-analytics.mjs check         # kimlik doğrulama testi
node scripts/appstore-analytics.mjs request       # rapor talebi (bir kez)
node scripts/appstore-analytics.mjs list          # üretilen raporlar
node scripts/appstore-analytics.mjs fetch         # indir → data/appstore/
```

Test yok, lint yapılandırması yok. Test eklerseniz tarih/streak hesapları ve (geldiğinde) entitlement mantığıyla başlayın.

---

## Yapı

```
app/                    # expo-router — dosya = rota
  (tabs)/               # index (ana sayfa), quran, dhikr, tracker, more
  quran-reader.tsx      # 604 sayfalık mushaf okuyucu
  shared-dhikr/[id].tsx # ortak zikir, deep link: ummet://shared-dhikr/[id]
  ...20 ekran daha
src/
  stores/appStore.ts    # 7 Zustand store, hepsi AsyncStorage'a persist
  services/             # api (Laravel istemcisi), prayerTimes, audioService,
                        # ezanNotification, analytics, remoteConfig, sharedDhikr,
                        # pushTokenService, mosqueService, widgetService
  data/                 # surahs, dailyVerses, delailulHayrat (statik içerik)
  utils/                # hijriCalendar, haptics
  components/           # SunArcCard
  constants/theme.ts    # ⚠️ tanımlı ama neredeyse hiç kullanılmıyor
modules/widget-data/    # iOS widget'a veri geçiren özel Expo modülü
targets/widget/         # UmmetWidget.swift
plugins/                # withWidget, withEzanSounds (config plugin'leri)
web/                    # Laravel: landing + admin + /api/v1
```

**Path alias'ları** (`tsconfig.json`): `@/*` → `src/*`, ayrıca `@components/*`, `@services/*`, `@stores/*`, `@hooks/*`, `@constants/*`, `@utils/*`.
Mevcut kod çoğunlukla göreli yol kullanıyor (`../../src/...`). Yeni kodda alias tercih edin ama mevcut dosyaları bu yüzden toplu değiştirmeyin.

---

## Konvansiyonlar

- **Arayüz dili Türkçe.** Tüm kullanıcıya görünen metin Türkçe. i18n altyapısı **yok**, string'ler JSX içine gömülü.
- **Kod yorumları Türkçe**, commit mesajları Türkçe (`feat(admin): …` formatında conventional commits).
- **Stil:** NativeWind (Tailwind sınıfları) ve inline `style` objeleri karışık kullanılıyor. Yeni kodda çevredeki dosyanın hangisini kullandığına bakıp ona uyun.
- **Renkler:** `#D4AF37` (altın), `#0A0E17` (arka plan), `#1B4332` (yeşil), `#ECDFCC` (birincil metin), `#8A9BA8` (ikincil), `#5A6B78` (soluk). Kod boyunca string olarak tekrar ediyor.
- **Animasyon:** `react-native-reanimated`, `FadeInDown`/`FadeInUp` + `.delay(n).springify()` deseni.
- **State:** Zustand + `persist`. Yeni kalıcı state için `src/stores/appStore.ts`'e store ekleyin.
- **Haptics:** doğrudan `expo-haptics` çağırmayın — `src/utils/haptics.ts` kullanın (kullanıcı ayarına saygı duyuyor).
- **Bildirimler:** Android'de ses BİLDİRİMDEN değil KANALDAN gelir. Yeni bildirim eklerken `channelId` vermeyi unutmayın (`src/services/notificationChannels.ts`). Kanal sesi sonradan değiştirilemez — ses değişirse kanal id'sindeki sürüm ekini (`_v1`) artırın.
- **Tarih anahtarları:** `toISOString()` ile gün anahtarı üretmeyin — UTC döndürür ve TR'de 00:00–03:00 arası kayıtları bir önceki güne yazar. Her zaman `src/utils/dateKey.ts` kullanın.
- **Yorum isteme:** `maybeAskForReview()` yalnızca pozitif bir olay TAMAMLANDIKTAN sonra, kutlama bitince çağrılır. Apple yılda 3 istem gösteriyor — boşa harcamayın.

---

## Bilinen Hatalar — Düzeltilmeden Önce Oku

Bunlar tespit edildi, henüz düzeltilmedi. Bu alanlara dokunuyorsanız haberiniz olsun:

| Yer | Sorun |
|---|---|
| `src/stores/appStore.ts:201` | `useProStore` ölü kod. Hiçbir yerde kullanılmıyor. Satın alma eklenirken `togglePro()` **silinmeli** — kalırsa Pro'yu bedava açan kapı olur |
| `app/quran-reader.tsx` | Mushaf hâlâ runtime'da API'den indiriliyor. Hata ekranı + tekrar deneme **eklendi**, ama metin bundle'a gömülmediği için ilk açılış internet istiyor |
| `src/services/mosqueService.ts` | Public Overpass endpoint'leri — rate-limit'li gönüllü altyapı, ölçekte sessizce çalışmayı bırakır |

**Genel kural:** Kod boyunca çok sayıda sessiz `catch {}` var. Yeni yazdığınız her `catch` ya kullanıcıya bir şey göstermeli ya da `captureError()` ile bildirmeli:

```ts
import { captureError } from "@/services/errorTracking";

try { ... } catch (e) {
  captureError("nerede:ne", e);   // "prayerTimes:fetch" gibi
}
```

Cache okuma/yazma gibi meşru geri düşüşlerde sessiz kalmak doğru — her hatayı göndermek gürültü üretir ve gerçek sinyali gizler.

---

## Dikkat Edilecekler

- **Depoda gizli anahtar yok** — `src/services/supabase.ts`'teki anon key public olması gereken bir anahtar. Ama `.p8`, `.jks`, `.env*.local` asla commit edilmemeli (`.gitignore`'da tanımlı).
- **`ios/` ve `android/` gitignore'da** ama diskte var (prebuild çıktısı). Config plugin'leri (`plugins/`) bu klasörleri üretir — native değişiklikleri elle değil plugin üzerinden yapın.
- **Ses dosyaları 43 MB** (`assets/sounds/`). Yenisini eklerken uygulama boyutunu düşünün.
- **Sürüm artırma:** elle düzenlemeyin, `npm run version:patch` kullanın (app.json + package.json + commit).
- **OTA güncelleme aktif** (`expo-updates`). JS-only değişiklikler App Review'sız gidebilir; native değişiklikler yeni build ister.
- **Canlı kullanıcılar var.** `src/services/` altındaki değişiklikler App Store'daki mevcut sürümü etkileyebilir — Supabase şeması değişiyorsa eski sürümlerle geriye uyumluluğu koruyun.

---

## Öncelikler (26 Temmuz 2026)

Gerçek veri (26 Tem 2026): **4 ayda 58 indirme**, %67'si App Store aramasından,
web sitesinden **0**. Sorun gelir değil, **görünürlük**. Sıralama:

1. ASO — ad/altyazı/anahtar kelime (arama zaten baskın kanal, kelimeler yanlış)
2. Ekran görüntüleri + önizleme videosu
3. Play Store yayını (TR'de Android %75-80)
4. Yeni site + 81 il SEO sayfası (web'den 4 ayda 0 kurulum)
5. Hatim grupları — tek viral döngü
6. ~~RevenueCat/Pro~~ **ERTELENDİ** — 3.000-5.000 MAU'ya kadar anlamsız

Detay: `docs/15-VERI-ANALIZI.md`

---

## Dokümanlar

Bir şey planlamadan önce `docs/` altına bakın:

| Doküman | İçerik |
|---|---|
| `docs/00-PROJE-ANALIZI.md` | Mimari, özellik envanteri, teknik borç |
| `docs/01-IYILESTIRME-YOL-HARITASI.md` | Ne yapılmalı, hangi sırayla |
| `docs/02-MONETIZASYON.md` | Gelir modeli, fiyatlandırma, paywall |
| `docs/03-VERI-VE-OLCUM.md` | Metrikler, App Store Connect erişimi |
| `docs/04-LANDING-PAGE.md` | ummetapp.com değerlendirmesi |
| `docs/05-ALTYAPI-KARARI.md` | Neden Laravel + cPanel (karar kaydı) |
| `docs/06-LARAVEL-PLANI.md` | Laravel/Filament uygulama planı |
| `docs/07-GELIR-YOL-HARITASI.md` | **30/60/90 günlük gelir planı** |
| `docs/08-OZELLIK-ENVANTERI.md` | Ne var / ne yok, hangisi para kazandırır |
| `docs/14-BUYUME-SENARYOSU.md` | **Kullanıcı kazanımı planı — hatim grupları, Ramazan** |
| `docs/09-TASARIM-DILI.md` | **Renk, tipografi, aralık, bileşen kalıpları, ton** — UI yazmadan önce oku |
| `docs/10-MOBIL-MIMARI.md` | Servis katmanı, state, veri akışları |
| `docs/11-BACKEND-API.md` | `/api/v1` uç referansı |
| `docs/12-VERITABANI.md` | Tablo şeması ve karar notları |
| `docs/13-ADMIN-VE-VERI-KAYNAKLARI.md` | Panel, RevenueCat webhook, ASC senkronu, veri tazeliği |
| `web/README.md` | Laravel projesini çalıştırma |

Önemli bir karar verdiğinizde veya bir varsayım değiştiğinde ilgili dokümanı güncelleyin. Bu dosyalar projenin hafızası.

---

## İçerik Hassasiyeti

Bu dini bir uygulama. İki kural:

1. **İbadetin kendisi asla paywall'ın arkasına konmaz.** Namaz vakitleri, ezan, Kuran, meal, dua, kıble her zaman ücretsiz kalır. Satılan şey kolaylık, kişiselleştirme ve veri katmanıdır.
2. **Dini içerik uydurulmaz.** Ayet, hadis ve meal metinleri güvenilir kaynaktan gelmeli. Emin değilseniz eklemeyin, sorun.

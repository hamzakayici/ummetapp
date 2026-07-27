# Laravel + Filament + cPanel — Uygulama Planı

> Hazırlanma tarihi: 26 Temmuz 2026
> **Karar alındı:** Landing + admin tek Laravel uygulaması, cPanel'de barındırılacak, MySQL kullanılacak.
> Stack: Laravel 12 + Filament v5 + PHP 8.2+ + cPanel MySQL

---

## 1. 🚨 Supabase Projesi Silinmiş — Mimari Yeniden Belirlendi

**Doğrulama tarihi: 26 Temmuz 2026**

Supabase projesi `txvqxjrjbmjwhgddztma` **artık mevcut değil**. Üç bağımsız kontrolle doğrulandı:

| Test | Sonuç |
|---|---|
| Postgres pooler bağlantısı | `FATAL: (ENOTFOUND) tenant/user postgres.txvqxjrjbmjwhgddztma not found` |
| DNS (yerel, 8.8.8.8, 1.1.1.1) | **NXDOMAIN** — alan adı hiç çözülmüyor |
| REST API (`/rest/v1/...`) | Bağlantı kurulamıyor |

Duraklatılmış (paused) bir projede DNS çözülmeye devam eder. NXDOMAIN **silinmiş** demektir.

### Bunun anlamı: canlı uygulama şu anda kısmen bozuk

App Store'daki mevcut sürüm hâlâ Supabase'e bağlanmaya çalışıyor. Kod tüm hataları sessizce yuttuğu için uygulama **çökmüyor**, ama şunlar çalışmıyor:

| Özellik | Durum |
|---|---|
| Analytics (`app_events`, `app_devices`, `app_sessions`) | ❌ Hiç veri kaydedilmiyor. Event'ler cihazda kuyrukta birikiyor (son 500 ile sınırlı) |
| Push token kaydı | ❌ Yeni kullanıcılara push gönderilemiyor |
| Duyurular | ❌ Yüklenmiyor (son cache'lenen görünüyor) |
| Remote config | ❌ Güncellenmiyor |
| **Ortak zikir** | ❌ **Tamamen bozuk** — oluşturma, katılma, sayaç. Kullanıcının gördüğü bir arıza |
| Payload admin paneli | ❌ Veritabanına bağlanamıyor (Vercel'de "Needs Attention" uyarısının sebebi) |

### Karar: tamamen MySQL — ama kapsam büyüyor

Önceki plandaki "iki veritabanı bağlantısı" önerisi **canlı bir Supabase olduğu varsayımına** dayanıyordu. O varsayım geçersiz. Korunacak veri yok, korunacak Realtime yok. Dolayısıyla **her şeyi cPanel MySQL'e almak artık doğru karar.**

Ancak dürüst olalım — bu kapsamı büyütüyor:

```
ÖNCE (varsayım):  Mobil → Supabase          |  Laravel → landing + admin
ŞİMDİ (gerçek):   Mobil → Laravel API → MySQL  |  Laravel → landing + admin + API
```

**Laravel artık sadece landing + admin değil, uygulamanın backend'i.**

Eklenen işler:

| İş | Neden | Süre |
|---|---|---|
| Laravel API katmanı | Mobil doğrudan MySQL'e bağlanamaz. Endpoint'ler: analytics ingest, push token kaydı, duyurular, remote config, ortak zikir | 4-5 gün |
| Mobil uygulamada 5 servisin yeniden yazımı | `supabase.ts`, `analytics.ts`, `remoteConfig.ts`, `pushTokenService.ts`, `sharedDhikr.ts` | 2-3 gün |
| **Yeni App Store sürümü** | Kaçınılmaz — mevcut sürüm ölü bir sunucuya bağlanıyor | +App Review |
| Ortak zikir: Realtime → polling | WebSocket yok. Ekran açıkken 3-5 sn'de bir sorgu yeterli | 1 gün |
| API güvenliği | Cihaz token'ı + rate limiting. Eski `anon key` modelinden **daha iyi** | 1 gün |
| `send-daily-verse` Edge Function | Laravel scheduler'a taşınır | 0,5 gün |

### Bunu fırsata çevirin

Nasılsa yeni bir App Store sürümü çıkmak zorunda. **Tek sürümde toplayın:**
- Supabase → Laravel API geçişi
- RevenueCat + "Destek Ol" IAP (ilk gelir)
- Zaman dilimi hatası düzeltmesi
- Sürüm numarası düzeltmesi
- Sentry

Böylece bir App Review turunda hem arızayı kapatır hem geliri açarsınız.

### Ayrıca

- **Analytics'iniz şu an sıfır.** İlk taraf veriniz yok; tek veri kaynağı App Store Connect. `03-VERI-VE-OLCUM.md`'deki API kurulumu bu yüzden daha da kritik.
- **Kuyruktaki event'ler kurtarılabilir.** Cihazlarda `ummet:analytics:queue_v1` altında son 500 event duruyor. Yeni API'ye geçince flush olur — bir miktar geçmiş veri geri gelir.
- **`pdo_pgsql` artık gerekmiyor.** cPanel doğrulaması listeden düştü; sadece `pdo_mysql` yeterli.
- **Bölge notu:** Silinen proje `ap-southeast-2` (Sydney) bölgesindeydi — Türkiye'deki kullanıcılar için zaten yüksek gecikmeliydi. cPanel Türkiye'deyse bu bir iyileşme.

---

## 2. Uygulama Yapısı

Tek Laravel projesi, iki yüz:

```
ummetapp.com/            → Landing (public, SEO)
ummetapp.com/admin       → Filament paneli (korumalı)
```

```
ummet-web/
├── app/
│   ├── Filament/
│   │   ├── Resources/          # Duyuru, Ayar, Push, Ortak Zikir, Blog
│   │   ├── Widgets/            # Analytics dashboard widget'ları
│   │   └── Pages/              # Hızlı push gönder
│   ├── Models/
│   │   ├── Mysql/              # Post, Subscriber, ContactMessage, User
│   │   └── Supabase/           # Announcement, AppSetting, PushToken,
│   │                           # PushNotification, SharedDhikr,
│   │                           # AppEvent, AppDevice, AppSession
│   ├── Services/
│   │   ├── ExpoPushService.php     # expoPush.ts portu
│   │   ├── PrayerTimeService.php   # aladhan API + cache
│   │   └── AnalyticsService.php    # dashboard SQL sorguları
│   └── Http/Controllers/       # Landing sayfaları
├── resources/views/
│   ├── layouts/
│   ├── pages/                  # ana sayfa, özellikler, sss, hakkımızda…
│   ├── tools/                  # zekat, tesbih, kıble, hicri takvim
│   └── prayer/                 # il bazlı namaz vakti sayfaları
├── config/database.php         # mysql (varsayılan) + pgsql (Supabase)
└── public/                     # cPanel document root buraya
```

---

## 3. Filament Kaynakları — Payload'dan Eşleme

Mevcut panelde ne varsa karşılığı:

| Payload koleksiyonu | Filament karşılığı | Bağlantı | Not |
|---|---|---|---|
| `Announcements` (124 sat.) | `AnnouncementResource` | pgsql | Açılma/unique/24s metrikleri widget olarak |
| `AppSettings` (32) | `AppSettingResource` | pgsql | Remote config — key/value |
| `PushNotifications` (398) | `PushNotificationResource` | pgsql | **En büyük iş.** Segment, A/B, açılma oranı |
| `PushTokens` (57) | `PushTokenResource` | pgsql | Salt okunur liste |
| `SharedDhikrs` (52) | `SharedDhikrResource` | pgsql | Salt okunur + moderasyon |
| `AppDevices` / `AppSessions` / `AppEvents` (211) | Resource + widget | pgsql | Ham veri listesi + metrikler |
| `Users` (16) | Filament yerleşik auth | mysql | Payload auth'u yeniden yazmaya gerek yok |
| `AnalyticsDashboard.tsx` (411) | `AnalyticsOverview` widget'ları | pgsql | **SQL sorguları aynen taşınır — en kolay kısım** |
| `QuickPushSender.tsx` (230) | Filament Page + form | pgsql | |
| `expoPush.ts` (225) | `ExpoPushService.php` | — | Expo Push API sadece HTTP POST, zor değil |
| — | `SubscriptionResource` | mysql | **Yeni.** RevenueCat webhook verisi (Faz 2) |

**Kolay taşınan:** Analytics dashboard'ın SQL'i. `AnalyticsDashboard.tsx` içindeki sorgular Postgres SQL — Laravel'de `DB::connection('pgsql')->select(...)` ile birebir çalışır. Yeniden yazılan sadece sunum katmanı.

**Zor taşınan:** `PushNotifications.ts` (398 satır). Segment mantığı, A/B varyant dağıtımı, açılma takibi. Buraya en az 3-4 gün ayırın ve **taşımadan önce mevcut davranışı not alın** — bu kod canlıda çalışıyor.

---

## 4. Landing — Yeni Sayfa Planı

`04-LANDING-PAGE.md`'deki plan Blade'e uyarlanmış hali. Kritik düzeltmeler (uydurma yorumlar, "premium duvarı yok" kopyası, yanlış çevrimdışı iddiası) yeni sitede baştan doğru yazılacak.

**Statik sayfalar:** ana sayfa, özellikler, SSS, hakkımızda, gizlilik, kullanım şartları, yol haritası

**Etkileşimli araçlar** (Laravel'in asıl kazandırdığı yer):

| Sayfa | Sunucu tarafı |
|---|---|
| `/namaz-vakitleri/{il}` | aladhan API + **cache** (81 il × günlük 1 istek). Programatik üretim, en yüksek getirili SEO işi |
| `/zekat-hesaplayici` | Canlı altın/gümüş fiyatı, sunucuda cache'li |
| `/hicri-takvim` | Sunucu tarafı dönüştürme + kandil takvimi |
| `/tesbih`, `/kible-pusulasi` | Client-side JS, Blade kabuğu |
| `/blog` + `/blog/{slug}` | MySQL'de `posts`, Filament'ten yönetilir — **gerçek içerik** |
| `/iletisim` | Form → `contact_messages` + SMTP mail (cPanel'de native) |
| E-posta yakalama | `subscribers` tablosu |

**Teknik:** Apple Smart App Banner, JSON-LD `SoftwareApplication`, OG görseli, sitemap (il sayfaları dahil), analytics, mağaza butonları için tek `<x-store-buttons>` bileşeni.

---

## 4.5 Yerel Geliştirme Ortamı — XAMPP

**Karar: Yerel geliştirmede XAMPP + MySQL (MariaDB) kullanılacak.**

### Makinede doğrulanan durum (26 Temmuz 2026)

| | Sürüm | Notlar |
|---|---|---|
| **cPanel PHP** | **8.3.0** | Üretim sürümü — referans budur |
| **Homebrew php@8.3** | **8.3.19** ✅ | **Kullanılacak sürüm.** `pdo_pgsql`, `pgsql`, `pdo_mysql`, `mbstring`, `intl`, `bcmath`, `gd`, `zip` — Laravel 12 için eksiksiz |
| XAMPP PHP | 8.2.4 | Sadece MySQL sunucusu için; PHP'si kullanılmayacak |
| XAMPP MySQL | **MariaDB 10.4.28** | `ummet` veritabanı mevcut ve boş |
| Homebrew PHP (varsayılan) | 8.4.4 | cPanel'den ileride, kullanmayın |

**Sürüm kararı:** cPanel 8.3.0 çalıştırıyor, Homebrew'da `php@8.3` (8.3.19) zaten kurulu ve gerekli tüm eklentileri içeriyor. **Yerelde php@8.3 kullanın** — üretimle aynı minor sürüm, "yerelde çalışıyordu" sınıfı sürprizleri önler. XAMPP'ın 8.2.4'ü ve varsayılan Homebrew 8.4.4 kullanılmayacak.

### Önerilen kurulum

**XAMPP'ı sadece veritabanı sunucusu olarak kullanın.** Apache vhost yapılandırmasıyla uğraşmayın:

```bash
# 1) XAMPP Manager'dan sadece MySQL'i başlatın (Apache'ye gerek yok)

# 2) Kabuğunuzda php@8.3'ü öne alın
export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"
php -v          # PHP 8.3.19 görmelisiniz

# 3) Laravel'i kendi sunucusuyla çalıştırın
php artisan serve      # http://localhost:8000
```

`export PATH=...` satırını `~/.zshrc`'ye ekleyin, her seferinde yazmayın.

**Veritabanı durumu (26 Temmuz 2026):** MariaDB çalışıyor, `ummet` veritabanı mevcut ve **boş** — Laravel migration'ları için temiz sayfa.

`.env` (yerel — doğrulanmış değerler):
```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ummet
DB_USERNAME=root
DB_PASSWORD=            # XAMPP varsayılanı: parola yok

# Supabase (ikinci bağlantı)
PG_HOST=...supabase.co
PG_PORT=6543            # pooler
PG_DATABASE=postgres
PG_USERNAME=...
PG_PASSWORD=...
```

phpMyAdmin: `http://localhost/phpmyadmin` (Apache açıksa)

### ⚠️ Dikkat Edilecek Üç Şey

**1. ✅ PHP sürümü çözüldü.**
cPanel 8.3.0 → yerelde Homebrew `php@8.3` (8.3.19). `PATH`'i yukarıdaki gibi ayarlamayı unutmayın; aksi halde sistem varsayılanı 8.4.4 devreye girer ve üretimde olmayan davranışlar görürsünüz.

**2. MariaDB ↔ MySQL farkı.**
XAMPP MariaDB 10.4 veriyor; cPanel MySQL 8 veya MariaDB olabilir. Çoğu iş için fark yok, ama JSON kolon davranışı, `utf8mb4` collation varsayılanları ve bazı fonksiyonlarda ayrışırlar. Migration'larda egzotik özellik kullanmayın; `config/database.php`'de collation'ı açıkça belirtin.

**3. 🚨 Yerelden canlı kullanıcılara push gitmesin.**
Yerel Laravel, canlı Supabase'e bağlanacak. Push gönderme formunu yerelde denerken **App Store'daki gerçek kullanıcılara bildirim gitme riski var.** Bu geri alınamaz.

Zorunlu önlem — `.env`'de bir bayrak ve serviste sert kontrol:

```dotenv
# yerel .env
PUSH_ENABLED=false
PUSH_TEST_TOKENS="ExponentPushToken[kendi-cihazin]"
```

```php
// ExpoPushService içinde, gönderimden ÖNCE
if (! config('push.enabled')) {
    // yalnızca test token'larına gönder, gerisini logla ve at
    $tokens = array_intersect($tokens, config('push.test_tokens'));
}
```

Bunu Faz 1'de, push kodunu yazmadan **önce** ekleyin. Sonra eklerim demeyin.

Aynı mantık duyuru yayınlama için de geçerli: yerelde test duyurusu oluşturmak canlı uygulamada görünür. Ya `is_active=false` ile çalışın ya da ayrı bir Supabase dev projesi açın.

---

## 5. cPanel Deploy

**Klasör düzeni** (`.env` ve `vendor/` asla web'den erişilebilir olmamalı):

```
/home/kullanici/
├── ummet-web/           ← Laravel projesi (public_html DIŞINDA)
│   ├── .env             ← DB şifreleri burada, web'den erişilemez
│   ├── app/ config/ ...
│   └── public/
└── public_html/         ← document root'u ummet-web/public'e yönlendirin
```

cPanel → *Domains* → document root'u `/home/kullanici/ummet-web/public` yapın. Bu mümkün değilse `public/` içeriğini `public_html`'e kopyalayıp `index.php`'deki yolları düzeltin (daha kötü ama çalışır).

**Deploy akışı (SSH varsa):**
```bash
cd ~/ummet-web
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache && php artisan route:cache && php artisan view:cache
php artisan filament:optimize
```

**SSH yoksa:** `vendor/` klasörünü lokalde oluşturup FTP ile yükleyin. Acılı ama mümkün. SSH'ı hosting sağlayıcısından isteyin — büyük fark yaratır.

**Cron (tek satır, Laravel scheduler'ı çalıştırır):**
```
* * * * * cd /home/kullanici/ummet-web && php artisan schedule:run >> /dev/null 2>&1
```

Scheduler'a bağlanacaklar:
- Push kuyruğu: `queue:work --stop-when-empty` (paylaşımlı hostingde daemon çalıştıramazsınız, cron ile tetikleyin)
- Namaz vakti cache yenileme (günlük)
- **Açık kalmış oturumları kapatma** (`03-VERI-VE-OLCUM.md` §3.1'deki metrik hatası)

**Kuyruk:** `QUEUE_CONNECTION=database`. Push gönderimi Expo'ya 100'lük batch'ler halinde gider; binlerce token'da senkron gönderim timeout yer, kuyruk şart.

---

## 6. Fazlar

**Faz 1 — İskelet (2-3 gün)**
- Laravel 12 + Filament v5 kurulumu
- `config/database.php`: mysql (varsayılan) + pgsql (Supabase)
- Supabase tabloları için Eloquent modelleri — **migration yazmayın, tablolar zaten var**, `$table` ve `$connection` tanımlayıp geçin
- cPanel'de deploy hattı, SSL, ilk boş deploy

**Faz 2 — Landing (4-6 gün)**
- Layout, ana sayfa (§4 ve `04-LANDING-PAGE.md`)
- Statik sayfalar + araç sayfaları
- 81 il namaz vakti sayfaları + sitemap
- İletişim formu, e-posta yakalama, blog
- Yayına al → eski Next landing'i kapat

**Faz 3 — Admin (5-8 gün)**
- Filament auth + panel yapılandırması (TR)
- Kolaydan zora: AppSettings → Announcements → SharedDhikrs → PushTokens
- Analytics widget'ları (SQL'ler taşınır)
- **PushNotifications** (en zor, en sona)
- Eski panelle **yan yana** çalıştırıp çıktıları karşılaştırın
- Doğrulandıktan sonra Next uygulamasını kapat

**Faz 4 — Sonra**
- RevenueCat webhook alıcısı + `SubscriptionResource` (Pro çıkınca)
- Payload'ın artık tablolarını temizle (`payload_*` prefix'li)

**Toplam: ~2,5-3,5 hafta.**

---

## 7. Başlamadan Doğrulanacaklar

- [ ] **`pdo_pgsql` + `pgsql` eklentileri** — bu mimarinin temeli. cPanel → *Select PHP Version* → *Extensions*. Test:
      ```php
      <?php var_dump(extension_loaded('pdo_pgsql'), PHP_VERSION);
      ```
      *Yoksa:* hosting sağlayıcısından açmasını isteyin (genelde açarlar). Açmazlarsa alternatif Supabase REST API üzerinden HTTP ile okumak — çalışır ama Filament'in Eloquent avantajı gider, iş süresi ~%40 uzar.
- [ ] **Giden bağlantıya izin var mı?** Bazı paylaşımlı hostingler dış bağlantıları kısıtlar. Supabase (5432/6543) ve Expo Push API'ye (443) erişim şart.
- [x] ~~PHP ≥ 8.2~~ → **8.3.0 doğrulandı** ✅
- [ ] SSH erişimi
- [ ] Cron job tanımlayabilme
- [ ] Document root'u `public/`'e yönlendirebilme
- [ ] MySQL veritabanı + kullanıcı oluşturma yetkisi

---

## 8. Riskler

| Risk | Etki | Önlem |
|---|---|---|
| `pdo_pgsql` yok | Mimari çöker | **Önce doğrula** (§7) |
| Push mantığı taşınırken davranış değişir | Canlı kullanıcılara yanlış bildirim | Eski panelle yan yana çalıştır, önce kendi cihazına gönder |
| Paylaşımlı hosting Supabase'e yavaş bağlanıyor | Admin paneli ağır | Metrikleri cache'le (5-10 dk), her sayfa yüklemesinde sorgulama |
| Deploy sırasında landing kesintisi | SEO/trafik kaybı | Alt alanda hazırla, DNS'i en son çevir |
| Faz 3 uzar, gelir işleri gecikir | Fırsat maliyeti | Landing (Faz 2) yayına girer girmez RevenueCat işine paralel geç — admin taşıması beklemesin |

**Son not:** Faz 2 bittiğinde landing yayında olacak ve gerçek değer üretmiş olacaksınız. Faz 3 (admin taşıma) o noktada acil değil — RevenueCat + Pro işini paralel yürütmek, admin taşımasını beklemekten daha iyi bir sıralama olur.

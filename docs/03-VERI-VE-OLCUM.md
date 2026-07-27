# Ümmet — Veri, Ölçüm ve Erişim İhtiyaçları

> Hazırlanma tarihi: 26 Temmuz 2026
> Bu doküman, "sana erişim veririm, uygulama verilerini incelersin" teklifine cevaptır: neye ihtiyacım var, ne yapabilirim, ne yapamam.

---

## 1. Neden Gerekli

`02-MONETIZASYON.md` §8'deki gelir tablosunun her satırı MAU'ya bağlı. Şu an elimde **hiç gerçek kullanım verisi yok** — o yüzden tabloyu senaryolu bıraktım. Gerçek sayılarla üç şey netleşir:

1. **Fiyat ve model kararı.** 5.000 MAU'da abonelik kurmanın anlamı sınırlı; önce büyüme gerekir. 100.000 MAU'da ise abonelik gecikmesinin her ayı ciddi kayıp.
2. **Nereye yatırım yapılacağı.** D1 retention düşükse onboarding sorunu var, paywall değil. D30 yüksekse doğrudan monetize edilebilir.
3. **Sponsorluk satışı.** Ramazan sponsorluğu satmak için doğrulanabilir impression/MAU verisi ve bir media kit şart.

---

## 2. App Store Connect — Adım Adım

İki yol var. **Yol A ile başlayın** — 15 dakika sürer, hiçbir kimlik bilgisi paylaşmanız gerekmez ve gelir hesabını bugün açar. Yol B kalıcı/otomatik erişim için, sonra kurulur.

---

### Yol A — Manuel export (15 dakika, önerilen ilk adım)

**1. App Analytics'e girin**
[appstoreconnect.apple.com/analytics](https://appstoreconnect.apple.com/analytics) → uygulama olarak **Ümmet**'i seçin.
Sağ üstteki tarih aralığını **mümkün olan en uzun** süreye alın (tercihen son 12 ay).

**2. Metrics sekmesinden şunları indirin**
Her metriğin sağ üst köşesinde bir **export/indirme ikonu** var → CSV olarak inin:

- Impressions
- Product Page Views
- **Conversion Rate** ← ASO'nun durumunu bu söylüyor
- Total Downloads + First-Time Downloads
- **Sessions** ve **Active Devices** ← MAU/DAU, gelir tablosunun temeli
- Crashes

Aynı ekranda kırılım (dimension) olarak **Territory** seçip bir kez daha export alın — yurt dışı Türk kitlesi var mı, i18n kararı buna bağlı.

**3. Retention**
Sol menü → **Retention**. D1 / D7 / D30 eğrisi. Export alın.
Ürün sağlığının tek en önemli göstergesi; D30 %10'un altındaysa önceliğimiz paywall değil retention olur.

**4. Sources / Acquisition**
Sol menü → **Sources**. App Store Search, App Referrers, Web Referrers, Campaigns.
Burada iki şey arıyorum: hangi arama kelimelerinden geliyorlar, ve **ummetapp.com kaç indirme getiriyor**.

**5. Sales and Trends** (ayrı bölüm)
[appstoreconnect.apple.com/trends](https://appstoreconnect.apple.com/trends) → Reports → export.

**6. Ratings and Reviews**
Apps → Ümmet → sol menü **Ratings and Reviews** → ülke filtresini **All Territories** yapın.
Buradan: toplam puan, yorum sayısı ve **son 10-20 gerçek yorumun metni**.
Bu ayrıca acil bir iş: landing'deki 6 uydurma yorumun yerine bunlar konacak (`04-LANDING-PAGE.md` §2.1).

**7. Dosyaları bir klasöre koyun** ve bana yolunu söyleyin. Depoya koymayın.

---

### Yol B — API Key (kalıcı, otomatik çekim)

**1.** [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Users and Access**

**2.** Üst sekmelerden **Integrations** (eski adıyla "Keys" / "API Keys")

**3.** Sol menüde **App Store Connect API** → **Team Keys**

**4. Issuer ID**'yi sayfanın üst kısmından kopyalayın (UUID formatında, örn. `57246542-96fe-1a63-...`)

**5.** **+** butonu → İsim: `Ummet Analytics` → **Access: Admin**

> Neden Admin? Bir Analytics Report türünü **ilk kez talep etmek** Admin rolü gerektiriyor. Rapor bir kez oluşturulduktan sonra indirme işlemi için "Sales and Reports" veya "Finance" rolü yeterli.
> Daha dar yetki isterseniz: Admin key ile bir kez rapor talebi oluşturun, sonra o key'i silip **Sales and Reports** rolüyle kalıcı key üretin.

**6. Generate** → **Download API Key** → `AuthKey_XXXXXXXXXX.p8` dosyası iner

> ⚠️ **Bu dosya sadece bir kez indirilebilir.** Apple kopyasını saklamıyor. Kaybederseniz key'i iptal edip yenisini üretmeniz gerekir.

**7. Key ID**'yi (10 karakterlik alfanümerik) tablodan kopyalayın

**Güvenlik kuralları:**
- `.p8` dosyasını **depoya koymayın** — `.gitignore`'da `*.p8` zaten tanımlı ✅
- **İçeriğini sohbete yapıştırmayın.** Dosyayı bir yere koyup sadece **yolunu** söyleyin
- Önerilen yer: `~/.ummet-secrets/AuthKey_XXXXXXXXXX.p8`, ardından `chmod 600`
- Sızarsa App Store Connect'ten anında iptal edilebilir

**Bana vereceğiniz üç şey:** Issuer ID, Key ID, `.p8` dosyasının yolu.

#### Durum (26 Temmuz 2026) — API kurulumu tamamlandı ✅

| | Değer |
|---|---|
| Issuer ID | ✅ alındı — değer `web/.env` içinde (`ASC_ISSUER_ID`), depoda tutulmuyor |
| Key ID | ✅ alındı — `web/.env` içinde (`ASC_KEY_ID`) |
| `.p8` dosyası | ✅ `~/.ummet-secrets/` altında, `600` izinle. **Depoya asla konmaz** |
| App ID | `6760871547` ✅ |
| Kimlik doğrulama | ✅ test edildi — uygulama adı **"Ümmet — İslami Yaşam"**, bundle `com.ummet.app` |

**Oluşturulan rapor talepleri:**

| Tip | ID | Ne sağlar |
|---|---|---|
| `ONE_TIME_SNAPSHOT` | `db79c171-4f4e-475d-9346-7192584a85f0` | Geçmiş veri |
| `ONGOING` | `adaf8b25-9125-40d2-a640-175f4e2255ee` | Bundan sonra günlük |

**⏳ Bekleniyor:** Rapor tanımları listeleniyor (APP_USAGE 15, APP_STORE_ENGAGEMENT 5, COMMERCE 10, PERFORMANCE 23, FRAMEWORK_USAGE 103) ama **veri dosyaları (instance) henüz 0**. Apple üretimi ilk talepte ~24-48 saat sürebiliyor. Doğrulandı, script hatası değil.

**Yarın çalıştırın:**
```bash
export ASC_ISSUER_ID="..."   # web/.env içindeki değer
node scripts/appstore-analytics.mjs fetch APP_STORE_ENGAGEMENT
node scripts/appstore-analytics.mjs fetch APP_USAGE
node scripts/appstore-analytics.mjs fetch COMMERCE
```

**Bizim için önemli raporlar** (kategori içindeki 150+ rapor arasından):

| Kategori | Rapor | Ne verir |
|---|---|---|
| APP_STORE_ENGAGEMENT | App Store Discovery and Engagement Standard | Impressions, product page views, **conversion rate** → ASO durumu |
| APP_USAGE | App Sessions Standard | Oturum sayısı, **aktif cihaz** → MAU/DAU |
| APP_USAGE | App Store Installation and Deletion Standard | Kurulum ve **silme** → retention sinyali |
| APP_USAGE | App Crashes | Sentry yokken tek çökme kaynağı |
| COMMERCE | App Downloads Standard | İndirme trendi + ülke kırılımı |
| COMMERCE | App Store Subscription Event/State Report | **Pro çıkınca abonelik metrikleri buradan gelecek** |

#### Script

`scripts/appstore-analytics.mjs` yazıldı — bağımlılık yok, Node 18+ yeterli (JWT ES256 imzalama `node:crypto` ile).

```bash
export ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

node scripts/appstore-analytics.mjs check     # kimlik doğrulamayı test et
node scripts/appstore-analytics.mjs request   # rapor talebi oluştur (bir kez)
node scripts/appstore-analytics.mjs list      # üretilen raporları listele
node scripts/appstore-analytics.mjs fetch     # indir → data/appstore/ (gitignore'da)
```

Key ID, `.p8` yolu ve App ID script'te varsayılan olarak tanımlı; sadece `ASC_ISSUER_ID` dışarıdan veriliyor. Hepsi `ASC_*` ortam değişkenleriyle geçersiz kılınabilir.

> Not: Analytics Reports API anlık değil — `request` bir talep oluşturur, Apple raporları **birkaç saat içinde** üretir, sonra `fetch` ile inilir. Bu yüzden ilk bakış için Yol A daha hızlı; ikisini paralel yürütün.

---

### Ne yapamam
- App Store Connect'e sizin adınıza tarayıcıdan giriş yapamam
- 2FA kodlarını giremem
- Apple hesabınızın şifresine ihtiyacım yok, istemeyeceğim de

---

### Özet: hangi metrik ne işe yarıyor

| Metrik | Nerede | Neden |
|---|---|---|
| Impressions, Product Page Views, **Conversion Rate** | Analytics > Metrics | ASO'nun ne kadar kötü/iyi olduğunu gösterir |
| Total Downloads / First-Time Downloads | Analytics > Metrics | Büyüme trendi |
| **Sessions, Active Devices (günlük/aylık)** | Analytics > Metrics | MAU/DAU → gelir tablosunun temeli |
| **Retention (D1, D7, D30)** | Analytics > Retention | Ürün sağlığının tek en önemli göstergesi |
| **Sources / Web Referrers / Search Terms** | Analytics > Acquisition | Hangi kelimeden geliyorlar, landing kaç indirme getiriyor |
| Territory kırılımı | Analytics > Metrics | Sadece TR mi, yurt dışı Türk diasporası var mı → i18n kararı |
| Crashes | Analytics / Xcode Organizer | Sentry yok, tek kaynak bu |
| Ratings & Reviews (puan + adet + son yorumlar) | App Store Connect > Ratings | ASO sıralamasının en büyük girdisi + gerçek sosyal kanıt kaynağı |

---

## 3. Supabase — Zaten Elimizde Olan Veri

Kendi analytics altyapınız çalışıyor (`app_events`, `app_devices`, `app_sessions`) ve admin panelde retention/cohort/top-screens metrikleri var. Bu iyi bir durum.

**Ancak üç uyarı:**

**3.1 Oturum süreleri şişkin.** `src/services/analytics.ts:163` — uygulama kill edilirse `session_end` hiç gönderilmiyor, oturum açık kalıyor. Bu metriği sponsora vermeden önce sunucu tarafında düzeltilmeli (24 saatten uzun açık oturumları son event zamanıyla kapatan bir cron).

**3.2 Veri manipüle edilebilir.** `anon` key ile client'tan doğrudan insert yapılıyor (`analytics.ts:129`). RLS anon insert'e açıksa üçüncü taraf sahte event basabilir. Gelir kararlarına ve sponsorluk satışına temel olacak veri için en azından rate limiting / basit bir doğrulama gerekli.

**3.3 Feature funnel event'leri eksik.** Şu an `app_open`, `session_start/end`, `screen_view`, `error` var. Monetizasyon için eklenecekler:

```
kaza_prayer_logged        dhikr_completed         streak_milestone (3/7/30)
quran_page_read           shared_dhikr_created    shared_dhikr_joined
badge_earned              notification_opened     mosque_searched

// Pro geldiğinde:
paywall_shown (trigger, variant)   paywall_dismissed
purchase_started (plan)            purchase_completed (plan, price)
trial_started                      trial_converted / trial_cancelled
restore_purchases
```

Bunlar olmadan paywall A/B testi yapılamaz.

---

## 4. Karar Almak İçin Bakılacak Metrikler

### Pro'ya geçmeden önce cevaplanacak sorular

| Soru | Metrik | Eşik |
|---|---|---|
| Kitle var mı? | MAU | < 5.000 ise önce büyüme, sonra Pro |
| Kalıyorlar mı? | D30 retention | < %10 ise önce retention |
| Kim ağır kullanıcı? | Haftada 4+ gün açan kullanıcı oranı | Bu segment paywall'un hedefi |
| Hangi özellik tutuyor? | Top screens + feature event'leri | Pro paketinin içeriğini bu belirler |
| ASO ne durumda? | Product page conversion rate | < %25 ise ekran görüntüsü/metin sorunu |

### Pro çıktıktan sonra haftalık takip
- Paywall gösterim → satın alma dönüşümü (tetikleyici bazında)
- Deneme → ücretli dönüşümü
- Aylık/yıllık/lifetime dağılımı
- İptal oranı (churn) ve iade oranı
- ARPU ve LTV
- Pro kullanıcıların retention'ı (ücretsizden ne kadar yüksek)

---

## 5. Sponsorluk Satışı İçin Media Kit

Ramazan sponsorluğu satacaksak (bkz. `02-MONETIZASYON.md` §6.1) bir sayfalık media kit gerekiyor. İçermesi gerekenler — hepsi elimizdeki verilerden üretilebilir:

- MAU / DAU, aylık oturum sayısı, ortalama oturum süresi (§3.1 düzeltildikten sonra)
- Coğrafi ve platform dağılımı
- Ramazan dönemi kullanım artışı (geçen yıl verisi varsa çok değerli)
- Push bildirim erişimi ve ortalama açılma oranı — **bu veri admin panelde zaten var** ve sponsorlar için en ikna edici sayı
- Ekran görüntüleriyle yerleşim örnekleri

---

## 6. Kurulması Gerekenler

| Araç | Amaç | Efor |
|---|---|---|
| **Sentry** | Crash/hata izleme. Ödeme akışından **önce** kurulmalı | 4 saat |
| **RevenueCat** | Abonelik + gelir analitiği (dashboard'u hazır gelir) | Faz 1 ile birlikte |
| **Web analytics** (Plausible/Umami/GA4) | Landing dönüşümü — şu an hiç yok | 1 saat |
| Feature funnel event'leri | §3.3 listesi | 1 gün |
| Oturum kapatma cron'u | Metrik doğruluğu | 2 saat |

---

## 7. Bana Ne Gönderin

Öncelik sırasına göre:

1. **App Store Connect Analytics export'ları** (son 6 ay) — veya API key (Issuer ID + Key ID + `.p8`)
2. **App Store puanı ve yorum sayısı** + son 10-20 gerçek yorumun metni (landing'deki uydurma yorumların yerine gerçeklerini koyacağız — bkz. `04-LANDING-PAGE.md` §2.1)
3. **Supabase'e read-only erişim** veya admin panelden temel metriklerin ekran görüntüsü (MAU, retention, cohort, top screens)
4. Bilinen kısıtlar: bütçe, haftada kaç saat ayırabileceğiniz, Play Console hesabı var mı

Bunlar geldiğinde `02-MONETIZASYON.md` §8'deki tabloyu gerçek sayılarla yeniden yazacağım ve `01-IYILESTIRME-YOL-HARITASI.md`'deki sıralamayı veriye göre güncelleyeceğim.

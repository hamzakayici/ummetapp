# Ümmet — Yönetim Paneli ve Veri Kaynakları

> Hazırlanma tarihi: 26 Temmuz 2026
> Panel: `web/` → `/admin` (Filament v5)

Hedef: projeyle ilgili her şeyi tek panelden takip etmek. Bu doküman neyin mümkün olduğunu, neyin **olmadığını** ve nedenini yazar.

---

## 1. "Anlık" Gerçeği — Önce Bunu Bilin

Dört veri kaynağı var ve **hiçbiri aynı tazelikte değil.** Bir metriğe bakmadan önce nereden geldiğini bilmek şart, yoksa yanlış karar verirsiniz.

| Kaynak | Tazelik | Neden |
|---|---|---|
| **Uygulama verisi** | ✅ **Anlık** | Kendi sunucumuz. Olay geldiği anda tabloda |
| **RevenueCat** | ✅ **Anlık** (webhook) | Satın alma olduğu anda bize POST ediyor |
| **App Store Connect** | ⚠️ **Günlük, 1-2 gün gecikmeli** | Apple canlı akış sunmuyor. Raporlar toplu üretiliyor |
| **Google Play Console** | ⚠️ **Günlük, 1-2 gün gecikmeli** | Google da canlı vermiyor. Raporlar GCS bucket'ına düşüyor |

**Bu bizim tercihimiz değil, Apple ve Google'ın sınırı.** Hiçbir üçüncü parti araç da bunu aşamıyor — "canlı App Store paneli" satan ürünler de aynı gecikmeli raporu gösteriyor.

Panelde **Analitik → Veri kaynakları** sayfası her kaynağın tazeliğini ve son senkron zamanını gösterir. Metriğe bakmadan önce oraya bakın.

---

## 2. Panel Yapısı

### Boş durum davranışı

Panel açıldığında her şey **0** görünüyorsa sebebi belirsiz olmamalı: uygulama mı
veri göndermiyor, entegrasyon mu eksik, yoksa gerçekten kullanıcı mı yok?

Bu yüzden veriye bağlı widget'lar veri yokken **gizlenir** ve yerine
**Kurulum durumu** widget'ı çıkar. Her entegrasyonun durumunu, sebebini ve
ne yapılması gerektiğini tek tek yazar; veri akmaya başlayınca kendiliğinden kaybolur.

| Widget | Veri yokken |
|---|---|
| Kurulum durumu | **Görünür** — ne eksik, ne yapılmalı |
| Hoş geldiniz + kısayollar | Görünür |
| İşletme özeti (duyuru, mesaj, abone) | Görünür — bu veriler uygulamadan bağımsız |
| Uygulama özeti, grafikler, retention, App Store | Gizli |
| Gelir | Yalnızca satın alma varsa |

Terminalden önizleme: `php artisan ummet:dashboard-preview`

```
Gösterge Paneli
├── Uygulama özeti        DAU, MAU, cihaz, oturum, olay, push  (anlık)
├── Gelir                 abone, ödeme yapan, 30 gün gelir     (anlık, RevenueCat)
├── App Store             gösterim, dönüşüm, indirme, çökme    (günlük)
├── Günlük aktif cihaz    30 günlük eğri                       (anlık)
└── En çok kullanılan ekranlar  7 gün                          (anlık)

Uygulama      → Duyurular · Uygulama ayarları (remote config)
Bildirimler   → Push bildirimleri · Bildirim cihazları
Gelir         → Abonelikler · Satın alma olayları
Kullanıcılar  → Ortak zikirler
Analitik      → Veri kaynakları
```

---

## 3. Uygulama Verisi (anlık)

Mobil uygulama `/api/v1/analytics/*` uçlarına yazar, panel doğrudan okur. Gecikme yok.

| Metrik | Nasıl hesaplanıyor |
|---|---|
| Bugün aktif (DAU) | Son 24 saatte olay gönderen ayrık `device_id` |
| Bu ay aktif (MAU) | Son 30 gün, aynı mantık |
| Oturum + ortalama süre | `app_sessions`, süreyi **sunucu** hesaplar |
| En çok kullanılan ekranlar | `screen_view` olayları, 7 gün |

Widget sorguları **5 dakika cache'li** — paylaşımlı hostingde her sayfa yüklemesinde tam tablo taraması yapmamak için.

> **Not:** Pro paketine hangi özelliklerin gireceğine "en çok kullanılan ekranlar" verisi karar vermeli. Tahminle paket yapmayın.

---

## 4. RevenueCat (anlık)

Panelde gerçekten canlı olan tek dış kaynak.

### Kurulum

RevenueCat → **Integrations → Webhooks**:
- URL: `https://ummetapp.com/api/v1/webhooks/revenuecat`
- Authorization header: `.env` içindeki `REVENUECAT_WEBHOOK_SECRET` ile birebir aynı

### İşlenen olaylar

| Olay | Abonelik durumu |
|---|---|
| `INITIAL_PURCHASE`, `RENEWAL`, `TRIAL_CONVERTED`, `UNCANCELLATION`, `PRODUCT_CHANGE` | `active` |
| `TRIAL_STARTED` | `trial` |
| `CANCELLATION`, `TRIAL_CANCELLED` | `cancelled` |
| `EXPIRATION` | `expired` |
| `BILLING_ISSUE` | `grace` |
| `REFUND` | `refunded` + gelir geri alınır |

İki tablo: `purchase_events` (ham olay akışı, denetim izi) ve `subscriptions` (kullanıcı başına güncel durum).

**Gelir panelde ikiye ayrılır:**

| Kalem | Ürün | Neden ayrı |
|---|---|---|
| Abonelik geliri | Ümmet Pro | Tekrarlayan, öngörülebilir |
| Destek geliri | `ummet_support_*` | Tek seferlik, gönüllü, öngörülemez |

Bunları toplamak yanıltıcı olur — tek seferlik bir destek dalgası aboneliği
büyümüş gibi gösterir. Consumable destek ürünleri `subscriptions` tablosuna
hiç yazılmaz, yalnızca `purchase_events`'e düşer.

**Tekrar koruması var** — RevenueCat teslimatı garantilemek için aynı olayı birden çok kez gönderebilir; `event_id` unique olduğu için çift sayılmaz. Test edildi.

> Pro henüz yayında olmadığı için tablolar boş; gelir widget'ı veri gelene kadar gizli.

---

## 5. App Store Connect (günlük)

`ummet:sync-app-store` komutu çeker, `external_metrics` tablosuna yazar. Panel bu tablodan okur — her açılışta Apple'a gitmez.

```bash
php artisan ummet:sync-app-store --setup   # ilk kurulum: rapor talebi oluşturur
php artisan ummet:sync-app-store           # veriyi çeker
```

Cron: günde iki kez (07:00 ve 19:00). Daha sık çekmenin anlamı yok — veri zaten günlük üretiliyor.

### Çekilen metrikler

| Rapor | Metrik |
|---|---|
| App Store Discovery and Engagement | gösterim, sayfa görüntüleme (+ tekil) |
| App Downloads | toplam indirme, ilk kez indiren, yeniden indiren |
| App Sessions | oturum, aktif cihaz, toplam süre |
| App Crashes | çökme, etkilenen cihaz |

**Dönüşüm oranı** = indirme ÷ sayfa görüntüleme. ASO'nun tek en iyi göstergesi; %25'in altındaysa ekran görüntüsü ve metin gözden geçirilmeli.

### Kimlik bilgileri

`.env`: `ASC_ISSUER_ID`, `ASC_KEY_ID`, `ASC_P8_PATH`, `ASC_APP_ID`

`.p8` dosyası **depoya konmaz**, `public_html` dışında ve `chmod 600` tutulur. Bir kez indirilebilir; kaybolursa App Store Connect'ten yeni key üretilir.

> İlk `ONE_TIME_SNAPSHOT` talebinden sonra Apple'ın rapor üretmesi **24-48 saat** sürebilir.

---

## 6. Google Play Console (henüz yok)

Uygulama Play Store'da yayında olmadığı için bağlanmadı. Yayınlandığında:

1. Google Cloud'da servis hesabı → Play Console'da yetkilendirme
2. Play Console rapor bucket'ı (`pubsite_prod_*`) okuma izni
3. `.env`: `PLAY_SERVICE_ACCOUNT_PATH`, `PLAY_REPORT_BUCKET`
4. `ummet:sync-play-store` komutu (ASC komutuyla aynı desen)

Google da günlük CSV veriyor — anlık değil.

---

## 7. Veri Modeli

| Tablo | Ne tutar |
|---|---|
| `external_metrics` | `source · metric · date · value · dimension` — dış kaynakların günlük satırları |
| `sync_states` | Her kaynağın son senkron durumu, hangi güne kadar veri geldiği |
| `subscriptions` | Kullanıcı başına güncel abonelik |
| `purchase_events` | Ham satın alma olay akışı |

`external_metrics` üzerinde `(source, metric, date, dimension)` unique — tekrar çekimde satır katlanmaz, `updateOrCreate` ile güncellenir.

---

## 8. Bilinçli Sınırlar

**Panelde canlı grafik/otomatik yenileme yok.** Paylaşımlı hostingde her 5 saniyede bir sorgu atan bir panel sunucuyu yorar ve hiçbir karara katkısı olmaz. Veriler 1-5 dakika cache'li; sayfayı yenileyerek güncellersiniz.

**App Store/Play verisi için "bugün" göstermiyoruz.** Apple'ın verisi 1-2 gün gecikmeli olduğu için "bugünün indirmesi" diye bir sayı gösterirsek yanlış olur. Onun yerine verinin hangi güne kadar geldiğini açıkça yazıyoruz.

---

## 9. Yapılacaklar

- [ ] `.p8` dosyasının kalıcı konumu → `ASC_P8_PATH` güncellenmeli
- [ ] `REVENUECAT_WEBHOOK_SECRET` (Pro kurulumuyla birlikte)
- [ ] Play Store senkron komutu (yayın sonrası)
- [ ] Kohort/retention grafiği (D1/D7/D30)
- [ ] Paywall funnel widget'ı — `paywall_shown → purchase_completed` (event'ler eklendikten sonra)
- [ ] Panelde ülke kırılımı (i18n kararı için)

# Altyapı Kararı — Laravel Admin Panel, Yeni Landing, cPanel Barındırma

> Hazırlanma tarihi: 26 Temmuz 2026
> **Durum: KARAR VERİLDİ ve UYGULANDI (26 Temmuz 2026) — Seçenek B: Her şey Laravel + cPanel, MySQL ile.**
> Next.js/Payload projesi (`landing/`) kaldırıldı; site, panel ve mobil API artık `web/` altında.
> Uygulama planı: [`06-LARAVEL-PLANI.md`](06-LARAVEL-PLANI.md)
> Bu doküman kararın gerekçesini ve değerlendirilen alternatifleri kaydeder. §6'daki `pdo_pgsql` doğrulaması hâlâ yapılmalıdır.

---

## 1. Soru Aslında Üç Ayrı Karar

Bunlar birbirine karıştırılıyor ama farklı cevapları var:

| Karar | Cevabım |
|---|---|
| Landing sıfırdan yeniden yapılsın mı? | **Evet** |
| cPanel'de barındırılsın mı? | **Landing için evet, admin için hayır (şimdilik)** |
| Admin panel Laravel'e taşınsın mı? | **Şimdi değil. Gelir işleri bittikten sonra, ve §6 doğrulanırsa** |

---

## 2. Mevcut Durumun Envanteri

Elimizdeki `landing/` klasörü tek bir Next.js 16 uygulaması ve **iki işi birden** yapıyor:

```
landing/src/app/
├── (frontend)/   → ummetapp.com   — 17 sayfalık public site
└── (payload)/    → /admin         — Payload CMS admin paneli
```

**Admin tarafında gerçekten yazılmış iş:**

| Dosya | Satır | İçerik |
|---|---|---|
| `PushNotifications.ts` | 398 | Segmentli push, A/B test, açılma metrikleri |
| `AnalyticsDashboard.tsx` | 411 | Retention, cohort, yeni/geri dönen cihaz, top screens |
| `QuickPushSender.tsx` | 230 | Dashboard'dan anlık push |
| `expoPush.ts` | 225 | Expo Push API entegrasyonu |
| `Announcements.ts` | 124 | Duyuru + performans metrikleri |
| Diğer 7 koleksiyon | ~370 | AppDevices, AppSessions, AppEvents, AppSettings, PushTokens, SharedDhikrs, Users |
| **Toplam** | **~1.760** | Son 15 commit'in çıktısı |

Buna ek olarak Payload'ın bedavaya verdiği ve yeniden yazılması gerekecek şeyler: kimlik doğrulama, CRUD arayüzü, erişim kontrolü, TR lokalizasyon, sürüm geçmişi, REST/GraphQL API.

**Veritabanı:** Supabase Postgres. Payload kendi tablolarını orada tutuyor, dashboard'lar ise `app_events`/`app_sessions`/`app_devices` tablolarını doğrudan `pg` bağlantısıyla okuyor (`payload.config.ts:76-85`).

---

## 3. cPanel Gerçeği

Burada net olmak gerekiyor, çünkü teknoloji seçimini asıl belirleyen bu:

**cPanel + PHP/Laravel = doğal uyum.** cPanel zaten PHP/MySQL için tasarlandı. Laravel 12 + Filament v5 paylaşımlı hostingde sorunsuz çalışır. Document root'u `public/`'e almak, cron tanımlamak, composer çalıştırmak standart işler.

**cPanel + Next.js 16 + Payload = sürtünmeli.** Teorik olarak "Setup Node.js App" (Passenger) ile mümkün, pratikte:
- Next 16 (Turbopack, React Compiler) paylaşımlı hostingde build edilemez — RAM yetmez, build'i lokalde alıp yüklemek gerekir
- Passenger arkasında Next'in çalışma modeli kırılgan; her deploy'da yeniden başlatma sorunları
- `sharp` gibi native binary'ler Node sürümü/mimari uyuşmazlığında patlar
- Payload sürekli açık bir Postgres bağlantı havuzu istiyor, paylaşımlı hostingde süreç ömrü buna uygun değil

**Sonuç:** Next+Payload'ı cPanel'e sokmaya çalışmak yanlış iş. Ya Laravel'e geçilir ya da admin cPanel dışında kalır.

---

## 4. İki Temiz Mimari

### Seçenek A — Ayrıştır (kısa vadede önerim)

```
ummetapp.com          → cPanel   → Yeni landing (Laravel veya statik HTML)
admin.ummetapp.com    → Node     → Mevcut Payload paneli, olduğu gibi
Supabase              → Postgres + Realtime + Edge Function (değişmiyor)
Mobil uygulama        → Supabase (değişmiyor)
```

- Landing'i istediğiniz gibi sıfırdan yaparsınız, cPanel'de barındırırsınız
- Mevcut Next app'ten `(frontend)` grubunu silersiniz, admin-only kalır
- **1.760 satır çalışan kod yeniden yazılmaz**
- Maliyet: küçük bir Node barındırma (Vercel hobby ücretsiz, ya da ~₺200/ay VPS)

**Artısı:** Bu hafta başlanabilir, hiçbir şey bozulmaz.
**Eksisi:** İki stack, iki barındırma yeri.

### Seçenek B — Her Şey Laravel + cPanel

```
ummetapp.com          → cPanel → Laravel 12 (landing + Filament admin)
Supabase              → Postgres (Laravel pdo_pgsql ile bağlanır)
Mobil uygulama        → Supabase (değişmiyor)
```

- Tek stack, tek barındırma, tek fatura
- Filament v5 admin panel işini gerçekten iyi yapar — Payload'a göre düşüş değil
- Push gönderimi PHP'de kolay (Expo Push API sadece HTTP POST)

**Artısı:** Sadelik. PHP'ye hakimseniz uzun vadeli bakım maliyeti düşük.
**Eksisi:** ~2-3 hafta iş, sıfır kullanıcı değeri, sıfır gelir. Ve §6'daki doğrulamaya bağlı.

---

## 5. Önerim ve Gerekçesi

**Landing'i sıfırdan yapın, cPanel'de barındırın. Admin'e şimdi dokunmayın.**

Gerekçe: `01-IYILESTIRME-YOL-HARITASI.md`'deki sıralamada önümüzdeki 8 haftanın işi belli — Play Store yayını, ASO, zaman dilimi hatası, Sentry, RevenueCat + Pro. Bunların hepsi doğrudan gelir veya kullanıcı üretiyor. Admin panel yeniden yazımı **çalışan bir şeyi başka dilde tekrar yazmak**; kullanıcı hiçbir fark görmez, gelir tablosunda tek bir satır değişmez.

Landing farklı — o zaten yeniden yazılmayı hak ediyor (uydurma yorumlar, yanlış "premium duvarı yok" kopyası, ürün görseli olmaması, statik araç sayfaları — bkz. `04-LANDING-PAGE.md`). Orada yeniden yazım gerçek değer üretiyor.

**Laravel'e geçiş mantıklı bir hedef, ama sırası Faz 3.** Gelir akmaya başladıktan, Play Store yayınlandıktan sonra, bir konsolidasyon işi olarak yapılır. O noktada zaten admin panelde yeni ihtiyaçlar (abonelik yönetimi, gelir raporları) çıkmış olur ve taşıma sırasında onları da tasarlarsınız — iki kez yazmamış olursunuz.

**Landing'i hangi teknolojiyle?** cPanel'de iki seçenek de iyi:

| | Laravel 12 + Blade | Next.js statik export |
|---|---|---|
| cPanel uyumu | Doğal | Saf HTML, hiç Node yok — kusursuz |
| 81 il namaz vakti sayfası | Sunucu tarafı, cache'li | Build zamanı üretim |
| Etkileşimli araçlar (zekat, tesbih) | Sunucu + Blade | Client-side JS |
| Canlı veri (altın fiyatı, vakitler) | Sunucu cache'i — daha temiz | Client fetch |
| İletişim formu | Native | Ayrı PHP script gerekir |
| Blog/CMS | Filament ile yönetim | Harici CMS gerekir |
| İleride Laravel admin'e geçiş | Zaten oradasınız | Yeniden başlarsınız |

**Laravel öneriyorum** — çünkü ileride admin'i de taşımayı düşünüyorsanız, landing Laravel'de olunca o geçiş neredeyse bedava olur. Blog, iletişim formu ve araçlar için de zaten sunucu tarafı isteyeceksiniz.

---

## 6. Laravel'e Geçmeden Önce Doğrulanması Gereken — Kritik

**`pdo_pgsql` PHP eklentisi cPanel'de açık mı?**

Supabase Postgres kullanıyor. Laravel'in Eloquent ile ona bağlanması için `pdo_pgsql` şart. Paylaşımlı cPanel paketlerinin çoğunda **sadece `pdo_mysql` açıktır.**

Kontrol: cPanel → *Select PHP Version* → *Extensions* sekmesinde `pdo_pgsql` ve `pgsql` aranır. Veya `public_html`'e bir dosya koyup çalıştırın:

```php
<?php var_dump(extension_loaded('pdo_pgsql'), PHP_VERSION);
```

**Yoksa ne olur:** Filament Eloquent modellerine dayanır; Eloquent olmadan Filament'in tüm hız avantajı gider. O durumda seçenekler: hosting sağlayıcısından eklentiyi açmasını istemek, VPS'e geçmek, veya Seçenek A'da kalmak.

### Diğer cPanel kontrol listesi
- [ ] PHP ≥ 8.2 (Laravel 12 için)
- [ ] `pdo_pgsql` + `pgsql` — **kritik**
- [ ] SSH erişimi (composer/artisan için; yoksa süreç çok acılı)
- [ ] Cron job tanımlayabilme (scheduler: push gönderimi, oturum kapatma cron'u)
- [ ] Document root'u `public/` klasörüne yönlendirebilme
- [ ] `.env` dosyasının `public_html` **dışında** kalabilmesi — DB şifresi içeriyor
- [ ] Yeterli disk + RAM (Laravel + vendor ~150 MB)
- [ ] Let's Encrypt / SSL

---

## 7. Laravel'e Geçilirse Yol Haritası (Faz 3)

Şimdi yapılmayacak, ama karar verilince sırası bu:

1. Laravel 12 + Filament v5 kurulumu, cPanel'de deploy hattı (Git + SSH)
2. Supabase'deki mevcut tablolar için Eloquent modelleri (`app_events`, `app_devices`, `app_sessions`, `announcements`, `app_settings`, `push_tokens`, `shared_dhikrs`) — migration yazmayın, tablolar zaten var
3. Filament resource'ları: Duyurular, Ayarlar (remote config), Push Bildirimleri, Ortak Zikirler
4. `expoPush.ts` → PHP servisine port (Expo Push API, HTTP POST — zor değil)
5. `AnalyticsDashboard.tsx`'teki SQL sorguları → Filament widget'ları (sorgular aynen taşınabilir, en kolay kısım)
6. Abonelik yönetimi ekranı (RevenueCat webhook verisi) — **bu yeni, Payload'da yok**
7. Payload'ın kendi tablolarını temizle (`payload_*` prefix'li tablolar)
8. Eski Next app'i kapat

---

## 8. Karar İçin Sorular

1. cPanel'de `pdo_pgsql` var mı? (§6)
2. PHP mi TypeScript mi size daha rahat geliyor? Bakımı siz yapacaksınız, bu ciddi bir kriter.
3. cPanel dışında küçük bir Node barındırma (ücretsiz Vercel dahil) kabul edilebilir mi, yoksa "her şey tek yerde" mi olmalı?
4. Landing'i ne kadar sürede istiyorsunuz? Laravel ile sıfırdan ~1-1,5 hafta, statik export ile ~4-5 gün.

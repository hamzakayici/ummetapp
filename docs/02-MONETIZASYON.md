# Ümmet — Monetizasyon Stratejisi

> Hazırlanma tarihi: 26 Temmuz 2026
> Ön koşul: `00-PROJE-ANALIZI.md` okunmuş olmalı.
> **Uyarı:** Bu dokümandaki gelir projeksiyonları varsayımsaldır. Gerçek MAU/indirme verisi elimde yok. App Store Connect verisi geldiğinde §8 yeniden hesaplanmalı.

---

## 0. Önce Şunu Çözmemiz Lazım

Landing page şu anda **açıkça ve tekrar tekrar** şunu vaat ediyor:

> "Tamamen Ücretsiz — Gizli ücretler, **premium duvarları yok**."
> SSS: "Ümmet uygulaması ücretsiz mi?" → "Evet, tamamen ücretsizdir. Gizli ücret, **premium duvarı veya reklam yoktur**."
> Hero: "100% Ücretsiz · Reklamsız"

Uygulama içi "Tamamen ücretsiz" vaadi kullanıcı yorumlarında da yer alıyor. Bu haliyle bir Pro planı çıkarmak **sözden dönmek** olarak okunur ve dini bir uygulamada bunun itibar maliyeti çok yüksektir — App Store yorumlarında "para için dini kullanıyorlar" tepkisi TR'de çok sert gelir ve puanı kalıcı düşürür.

**Yapılması gereken sıralama:**
1. Bugün: Landing ve uygulama içi kopyayı düzelt → "Çekirdek ibadet özellikleri her zaman ücretsiz" (bkz. `04-LANDING-PAGE.md`)
2. 2–4 hafta: Bu yeni konumlandırmayı yerleştir
3. Sonra: Pro'yu çıkar

Konumlandırma cümlesi (her yerde aynı kullanılmalı):

> **"Namaz vakitleri, ezan, Kuran, meal, dua ve kıble — her zaman ücretsiz kalacak. Ümmet Pro, uygulamayı ayakta tutan ve size ekstra kolaylık sağlayan isteğe bağlı bir destektir."**

Bu hem doğru hem savunulabilir hem de dini içeriği paraya koymadığımızı net söyler.

---

## 1. Model Seçimi

**Ana model: Freemium abonelik (Ümmet Pro).**
İkincil: sponsorluk, affiliate, B2B. Reklam en sona ve şartlı.

Neden abonelik:
- Tekrarlayan gelir, tek seferlik satıştan 5-10x daha değerli
- Altyapı zaten hazır (remote config ile paywall A/B testi yapılabilir)
- Reklamdan çok daha yüksek ARPU ve marka itibarına zarar vermez

Neden reklam ana model değil:
- İslami uygulamada reklam kalitesini kontrol edemezsiniz; namaz ekranında alakasız bir reklam çıkması marka için felaket
- TR eCPM'i düşük (~$0.5–2). 100k MAU'da aylık ancak $500–2.000
- Landing'de "reklamsız" vaadi verilmiş

---

## 2. Ücretsiz / Pro Sınırı

**İlke: İbadetin kendisi asla paywall'ın arkasına konmaz. Satılan şey kolaylık, kişiselleştirme ve veri katmanıdır.**

### Her Zaman Ücretsiz (değişmez taahhüt)
- Namaz vakitleri + ezan bildirimleri (5 makam dahil)
- Kıble pusulası
- Kuran okuma + Türkçe meal (tam mushaf)
- Temel dua kitabı, hadis
- Dijital tesbih, ortak zikir
- Zekat / fitre / kefaret hesaplayıcı
- Hicri takvim, yakındaki camiler

### Ümmet Pro

| Özellik | Neden satılabilir | Geliştirme eforu |
|---|---|---|
| **Bulut yedekleme & çoklu cihaz senkron** | En güçlü kalem. Yıllarca biriken kaza borcu / hıfz planı / streak telefon değişince kayboluyor. Kullanıcı bunu kaybetmemek için öder. | Yüksek (hesap sistemi gerekir) |
| **Sınırsız kaza takibi** (ücretsizde 2 vakit türü) | Kaza takibi ağır kullanıcı özelliği; ödemeye en yatkın segment | Düşük |
| **Tam analitik & sınırsız geçmiş** (ücretsizde son 7 gün) | Veri katmanı, ibadetin kendisi değil | Düşük |
| **Kuran'ı tam offline indir** | Şu an zaten kırık (bkz. analiz §5.3). Düzeltip Pro'ya bağlamak yerine: ücretsizde indir, Pro'da **çoklu kâri sesi + ayet tekrar/hıfz modu** | Orta |
| **Ek ezan sesleri & müezzin kütüphanesi** | 43 MB'lık ses yükünü de çözer: temel 5 makam bundle'da, ek sesler indirilerek | Orta |
| **Gelişmiş widget'lar + Kilit Ekranı widget'ı + Live Activity** | iOS'ta yüksek algılanan değer, rakiplerde nadir | Orta-Yüksek |
| **Delâil-ül Hayrat tam metin + günlük hizb planı** | Niş ama çok sadık kitle | Düşük |
| **Tema & Arapça font paketleri** | Klasik kozmetik satış | Düşük |
| **Rozet/istatistik paylaşım kartları** | Viral döngüyü de besler | Düşük |
| **Reklamsız** | Sadece reklam eklenirse anlamlı | — |

**İlk sürüm için minimum set (hızlı çıkmak için):** Sınırsız kaza + tam analitik geçmişi + tema/font paketleri + ek ezan sesleri + Delâil tam metin. Bunlar hesap sistemi gerektirmiyor; 2-3 haftada çıkarılabilir. Bulut senkron ikinci dalgada gelir ve o zaman fiyat artışı da haklı çıkar.

---

## 3. Fiyatlandırma

App Store bölgesel fiyatlandırma ile TR ve global ayrıştırılmalı. TR'de ödeme gücü düşük, global'de aynı fiyat masada para bırakır.

### Türkiye
| Plan | Fiyat | Not |
|---|---|---|
| Aylık | ₺59,99 | Çıpa görevi görür, asıl amaç yıllığa yönlendirmek |
| **Yıllık** | **₺349,99** | Ana ürün. Aylığa göre "%51 tasarruf" mesajı |
| Ömür Boyu | ₺899,99 | TR'de abonelik yorgunluğu yüksek; lifetime dönüşümü şaşırtıcı derecede iyi çalışır |

### Global (varsayılan / USD)
| Plan | Fiyat |
|---|---|
| Aylık | $4,99 |
| **Yıllık** | **$29,99** |
| Ömür Boyu | $79,99 |

**Deneme:** 7 gün ücretsiz deneme, yıllık planda. Deneme bitiminden 2 gün önce bildirim (Apple bunu zaten yapar ama kendi bildirimimiz iptal oranını düşürür).

**Ramazan kampanyası:** Ramazan ayında yıllık %40 indirim. TR'de dini uygulamalarda Ramazan tek başına yıllık gelirin %30-40'ını getirebilir. 2027 Ramazanı ~Şubat 2027; kampanya altyapısı Aralık 2026'da hazır olmalı.

**Apple komisyonu:** İlk yıl %30, aynı abonenin 1. yılını doldurmasından sonra %15. Small Business Program'a (yıllık < $1M) kayıtlıysanız **baştan %15**. Kayıt olun — bu doğrudan %15 net gelir farkı, 10 dakikalık iş.

---

## 4. Paywall Tasarımı ve Tetikleyiciler

**Onboarding'de paywall gösterme.** Dini uygulamada ilk açılışta para istemek en hızlı 1 yıldız alma yöntemidir. Önce değeri göster.

Tetikleme noktaları (öncelik sırasına göre):
1. **3 günlük streak tamamlandığında** — kullanıcı alışkanlık kazanmış, en yüksek dönüşüm anı
2. **Kaza takibinde 3. vakit türü eklenmeye çalışıldığında** — net bir limit anı
3. **Analitikte "geçmişi gör" tıklandığında** (7 günden eskisi kilitli)
4. **Ek ezan sesi / tema seçildiğinde**
5. **Rozet kazanıldığında** — pozitif duygu anı, "başarını paylaş kartı" Pro
6. **Ramazan Hub'a girişte** (sadece Ramazan'da, kampanya ile)

Paywall ekranı içeriği:
- Başlık: "Ümmet Pro" değil → **"Ümmet'i Destekle"**. Dini bağlamda "destek" çerçevesi "satın al"dan çok daha iyi dönüşür.
- Alt başlık: "Çekirdek özellikler herkes için ücretsiz kalacak. Pro, geliştirmeye devam etmemizi sağlıyor."
- 5 madde fayda listesi (özellik değil fayda: "Verilerin asla kaybolmaz" ≠ "Bulut senkron")
- Yıllık plan varsayılan seçili, "en popüler" rozeti
- Küçük yazı: iptal koşulları, restore butonu (Apple zorunlu)

**A/B testi:** Bu paywall'un başlığını, fiyat vurgusunu ve tetikleyici anını `app_settings` remote config üzerinden varyantlayın — altyapı zaten var (`src/services/remoteConfig.ts`).

---

## 5. Teknik Uygulama

**Araç: RevenueCat** (`react-native-purchases`).
- Aylık $2.500 gelire kadar ücretsiz
- StoreKit 2 / Google Play Billing'i tek API'de toplar
- Restore, grace period, iade, deneme yönetimi hazır gelir
- Webhook ile Supabase'e entitlement yazılabilir → çoklu cihaz Pro erişimi

Adımlar:
1. Small Business Program'a kayıt (%15 komisyon)
2. App Store Connect'te 3 ürün tanımla (aylık/yıllık/lifetime), TR + global fiyat matrisi
3. `npx expo install react-native-purchases` + prebuild (`ios/`, `android/` zaten mevcut, sorun yok)
4. `src/services/purchases.ts` — init, offerings, purchase, restore
5. `useProStore`'u yeniden yaz: **`isPro` artık lokal toggle değil, RevenueCat entitlement'ından türetilmeli.** Şu anki `togglePro()` fonksiyonu silinmeli — kalırsa Pro'yu bedava açan bir kapı olur
6. `<ProGate>` bileşeni: kilitli özellikleri sarmalar, tıklanınca paywall açar
7. RevenueCat webhook → Supabase `subscriptions` tablosu → analytics'e conversion event'i
8. Sandbox'ta tam test: satın alma, iptal, restore, deneme bitişi, iade

**Süre tahmini:** Altyapı 3-5 gün. Paywall UI + gate'ler 3-5 gün. Test + App Review 1 hafta. **Toplam ~3 hafta.**

---

## 6. İkincil Gelir Kalemleri

### 6.1 Ramazan Sponsorluğu — en yüksek marj
TR'de Ramazan'da dijital reklam envanteri patlar. Doğrudan satılabilecek paketler:
- İftar geri sayımı sponsorluğu (Ramazan Hub)
- Günün ayeti kartı sponsorluğu
- Hatim kampanyası sponsorluğu

Hedef sektörler: katılım bankaları, helal gıda markaları, umre/hac acenteleri, yardım dernekleri.
**Fiyat aralığı:** 100k+ MAU'da Ramazan dönemi için ₺150k–500k paketler gerçekçi.
**Takvim:** Kasım 2026'da satış görüşmelerine başlanmalı; Ocak'ta anlaşmalar kapanmalı.
Ön koşul: doğrulanabilir MAU/impression verisi (bkz. `03-VERI-VE-OLCUM.md`) ve bir media kit.

### 6.2 Bağış / Sadaka Akışı — dikkatli
Dini uygulamalarda dönüşümü yüksek ama **Apple kuralı kritik:**
- App Store Review Guideline 3.2.1(vi): Onaylı hayır kurumlarına bağış **IAP ile toplanamaz**; Apple Pay veya başka bir ödeme yöntemiyle uygulama içinden toplanabilir, Apple komisyon almaz.
- Yani: kendi adınıza bağış toplayamazsınız; kayıtlı bir dernek/vakıfla anlaşmanız gerekir.

**Gerçekçi model:** Tanınmış bir yardım derneğiyle iş ortaklığı → uygulama içinden bağış akışı → dernekten tanıtım/aracılık geliri veya sadece marka değeri. Doğrudan büyük gelir beklemeyin ama kullanıcı bağlılığını ciddi artırır ve Ramazan sponsorluk satışında kozdur.

### 6.3 Affiliate
- **Umre/hac paketleri** — yüksek sepet tutarı, komisyon anlamlı. "Yakındaki camiler" ve Ramazan Hub'a doğal oturur.
- İslami kitap, seccade, tesbih e-ticaret — düşük komisyon, dolgu gelir
- Kurban vekâleti (Kurban Bayramı dönemi)

### 6.4 B2B / White-label
Camiler, dernekler, yurt dışı Türk dernekleri, belediyeler için markalı sürüm. Yıllık lisans ₺25k–150k aralığı. Satış döngüsü uzun, ama tek müşteri yüzlerce abone değerinde. Altyapı (remote config, duyuru sistemi, push) zaten çok müşterili çalışmaya yakın.

### 6.5 Web (ummetapp.com)
SEO trafiği zaten var. İki kalem:
- AdSense / display (web'de reklam uygulamadaki kadar hassas değil)
- Asıl değeri: **app install funnel'ı** ve e-posta listesi

---

## 7. Yapılmaması Gerekenler

- ❌ Kuran'ı, meali veya namaz vakitlerini paywall'ın arkasına koymak
- ❌ Onboarding'de zorunlu paywall
- ❌ Namaz / Kuran / dua ekranlarında reklam
- ❌ Kullanıcı verisini üçüncü taraf reklam ağlarına satmak (gizlilik vaadi verilmiş, hem de doğru bir vaat)
- ❌ Sahte aciliyet ("son 3 saat!") — dini bağlamda çok kötü karşılanır
- ❌ İptal etmeyi zorlaştırmak

---

## 8. Gelir Projeksiyonu (senaryolu)

**Bu tablo tahmindir.** Gerçek MAU bilinmiyor. Varsayımlar: TR ağırlıklı kitle, yıllık ₺349,99 ortalama, %15 Apple komisyonu (Small Business), abonelerin %70'i yıllık.

| MAU | Dönüşüm | Abone | Brüt/yıl | Net/yıl |
|---|---|---|---|---|
| 10.000 | %1,5 | 150 | ₺52.500 | ₺44.600 |
| 50.000 | %2,0 | 1.000 | ₺350.000 | ₺297.500 |
| 100.000 | %2,5 | 2.500 | ₺875.000 | ₺743.750 |
| 250.000 | %3,0 | 7.500 | ₺2.625.000 | ₺2.231.250 |

Referans: İslami/yaşam tarzı uygulamalarında freemium dönüşümü tipik olarak **%1–3**. %2,5 iyi bir paywall ve doğru tetikleyicilerle ulaşılabilir; kötü paywall'da %0,5'te kalır.

**Buna eklenecekler:**
- Play Store yayını → kullanıcı tabanını 2–4x büyütür (TR'de Android %75-80). Ancak Android ARPU iOS'un ~1/3'ü. Net etki: gelirde ~+%50–80.
- Ramazan sponsorluğu → tek seferlik ₺150k–500k
- Web AdSense → aylık ₺5k–30k (trafiğe bağlı)

**Kritik nokta:** Bu tablodaki her satır MAU'ya bağlı. Dönüşüm oranını optimize etmeye çalışmadan önce **kullanıcı sayısını büyütmek** (Play Store + ASO + i18n) çok daha yüksek getirili. Bkz. `01-IYILESTIRME-YOL-HARITASI.md`.

---

## 9. Sıralı Aksiyon Planı

**Faz 0 — Zemin (1-2 hafta)**
- [ ] Landing + uygulama içi "tamamen ücretsiz / premium duvarı yok" kopyasını düzelt
- [ ] Sahte kullanıcı yorumlarını kaldır (`04-LANDING-PAGE.md` §2.1 — yasal risk)
- [ ] Zaman dilimi hatasını düzelt (streak paywall'un motoru olacak)
- [ ] Small Business Program kaydı
- [ ] Sentry kur (ödeme akışı öncesi şart)

**Faz 1 — Pro v1 (3 hafta)**
- [ ] RevenueCat + ürün tanımları
- [ ] `useProStore` yeniden yazımı (`togglePro` sil)
- [ ] Paywall ekranı + 4 tetikleyici
- [ ] Minimum Pro seti (kaza limiti, analitik geçmişi, tema/font, ek ezan sesleri, Delâil tam metin)
- [ ] Sandbox testleri, App Review

**Faz 2 — Büyütme (1-2 ay)**
- [ ] Play Store yayını
- [ ] ASO: uygulama adı/altyazı optimizasyonu
- [ ] Paywall A/B testi (remote config üzerinden)
- [ ] Hesap sistemi + bulut senkron → Pro'nun ana kalemi

**Faz 3 — Ölçek (3-6 ay)**
- [ ] i18n (EN, AR, ID) → global fiyatlandırma anlamlı hale gelir
- [ ] Ramazan 2027 kampanyası + sponsorluk satışı
- [ ] B2B / white-label ilk müşteri

# ummetapp.com — Değerlendirme ve Yeniden Yapım Planı

> Hazırlanma tarihi: 26 Temmuz 2026
> İncelenen: o tarihte canlı olan Next.js/Payload sitesi
>
> ⚠️ **Tarihsel belge.** Burada değerlendirilen Next.js projesi (`landing/`) **kaldırıldı**;
> site Laravel + Blade ile `web/` altında yeniden yazıldı.
>
> Bu doküman iki nedenle duruyor: (1) tespit edilen kritik sorunların kaydı —
> uydurma yorumlar, "premium duvarı yok" vaadi, yanlış çevrimdışı iddiası —
> yeni sitede tekrarlanmamalı; (2) §5'teki SEO stratejisi hâlâ geçerli.

---

## 1. Genel Değerlendirme

Site "basit bir landing page" olarak tarif edilmiş ama aslında olduğundan daha iyi bir iş: 17 sayfalık bir SEO yapısı, çalışan sitemap/robots, Payload CMS entegrasyonu, tutarlı bir koyu tema ve düzgün bir bilgi mimarisi var. Temel sağlam.

Sorun estetikte değil, **üç yerde**: (a) hukuki risk taşıyan uydurma içerik, (b) monetizasyonu baştan imkânsız kılan kopya, (c) dönüşüm mekaniğinin tamamen eksik olması.

**Puan:** Tasarım 7/10 · SEO yapısı 7/10 · Dönüşüm 3/10 · İçerik güvenilirliği 2/10

---

## 2. Kritik Sorunlar

### 2.1 🚨 Uydurma kullanıcı yorumları — hukuki risk

`landing/src/app/(frontend)/page.tsx:32-39`

```ts
const REVIEWS = [
  { text: "Namaz vakitlerini takip etmek hiç bu kadar kolay olmamıştı...", author: "Fatma Y." },
  { text: "Kuran, dua, zikir hepsi tek uygulamada...", author: "Ahmet K." },
  // ...6 adet
];
```

Bunlar gerçek kullanıcılardan gelmemiş, kod içine yazılmış metinler. Yanına 5 yıldız ikonu ve "Ümmet Ailesi Ne Diyor?" başlığı konmuş. Hero'daki **"4.9 Puan"** ibaresi de hardcoded — App Store'dan çekilmiyor.

Bu, Türkiye'de **Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği** kapsamında yanıltıcı ticari uygulama sayılır (tüketici yorumu gibi sunulan uydurma içerik açıkça yasaklı, Reklam Kurulu ceza kesebiliyor). Dini bir marka için itibar riski ayrıca çok yüksek — biri fark edip ekran görüntüsü paylaşırsa telafisi zor.

**Yapılacak — bugün:**
- 6 uydurma yorumu ve hardcoded "4.9 Puan" ibaresini kaldırın
- Yerine: App Store'daki **gerçek** yorumlardan alıntı (tarih ve gerçek kullanıcı adıyla), veya App Store puanını API'den çekip gösterin, veya bu bölümü tamamen kaldırıp yerine ürün ekran görüntüleri koyun
- Gerçek yorumunuz azsa bölümü hiç koymayın. Sosyal kanıtı uydurmak, sosyal kanıtın olmamasından daha kötü.

### 2.2 🚨 Sahte blog — SEO'ya da zarar veriyor

`landing/src/app/(frontend)/blog/page.tsx:6-13`

6 blog yazısı listeleniyor, hepsi tarihli ("20 Mart 2026" vb.). Gerçekte:
- 3 tanesinin linki `href: "#"` — hiçbir yere gitmiyor
- 3 tanesi blog yazısı değil, mevcut araç sayfalarına yönlendiriyor
- Yani **tek bir gerçek blog yazısı yok**

Kullanıcı için kırık deneyim, Google için düşük kaliteli/aldatıcı sayfa sinyali. Blog'un SEO değeri gerçek içerikte; sahte liste ters etki yapıyor.

**Yapılacak:** Ya blog'u tamamen kaldırın (sitemap'ten de), ya da Payload CMS zaten kurulu olduğu için **gerçek** bir `Posts` koleksiyonu açıp 5-10 yazı yazın. İkincisi TR'de ciddi organik trafik getirir (aşağıda §5).

### 2.3 🚨 "Premium duvarı yok" vaadi — monetizasyonu kilitliyor

Sitede en az 4 yerde geçiyor:
- `page.tsx:25` — "Tamamen Ücretsiz — Gizli ücretler, **premium duvarları yok**."
- `page.tsx:101` — "100% Ücretsiz · Reklamsız"
- `page.tsx:307` — SSS: "Evet, tamamen ücretsizdir. Gizli ücret, **premium duvarı veya reklam yoktur**."
- `page.tsx:328` — "Kayıt gerektirmez, reklam yoktur."
- `layout.tsx:10` ve `page.tsx:8` — meta açıklamalarında "Tamamen ücretsiz"

Ümmet Pro çıkarıldığında bu, sözden dönmek olarak okunur. Detay ve önerilen yeni konumlandırma: `02-MONETIZASYON.md` §0.

**Yeni kopya:**
> "Namaz vakitleri, ezan, Kuran, meal, dua ve kıble **her zaman ücretsiz**. Ümmet Pro isteğe bağlıdır."

Bu hem dürüst, hem Pro'ya kapı bırakıyor, hem de "dini içeriği satmıyoruz" mesajını güçlendiriyor — aslında mevcut kopyadan **daha** güçlü bir vaat.

### 2.4 🚨 Yanlış "çevrimdışı" iddiası

`page.tsx:28` — "Çevrimdışı: **Kuran**, dualar, tesbih internet olmadan çalışır."

Koda göre bu doğru değil. Kuran okuyucu ilk açılışta tüm mushafı API'den indiriyor; internet yoksa boş ekran geliyor (`app/quran-reader.tsx:73-118`, bkz. `00-PROJE-ANALIZI.md` §5.3). İnternet olmadan Kuran çalışmıyor.

**İki seçenek:** Ya kodu düzeltip Kuran'ı bundle'a gömün (önerilen — `01-IYILESTIRME-YOL-HARITASI.md` §4), ya da kopyayı düzeltin. İlkini yapın; iddia zaten olması gereken şey.

### 2.5 Ürün görseli sıfır

Sitenin tamamında **tek bir uygulama ekran görüntüsü yok**. Bir mobil uygulama landing page'inde bu en büyük dönüşüm kaybı. Ziyaretçi neyi indireceğini görmüyor.

Elimizde hazır varlıklar var: `screenshots/appstore_01_namaz.png` … `appstore_06_araclar.png`. Bunlar telefon çerçevesi içinde hero'ya ve özellik bölümlerine yerleştirilmeli.

### 2.6 Android/Play Store yok, ikinci CTA yok
Tüm CTA'lar App Store'a gidiyor. Play Store yayına girdiğinde her CTA güncellenmeli; şimdiden ikili buton yapısı kurulmalı.

### 2.7 E-posta toplama yok
Ziyaretçiyi yakalamanın hiçbir yolu yok. Ramazan kampanyası, yeni özellik duyurusu, Android lansmanı — hepsi için bir liste gerekiyor. Payload zaten var, bir `Subscribers` koleksiyonu 30 dakikalık iş.

### 2.8 Ölçüm yok
Analytics kurulu değil (ne GA4 ne Plausible/Umami). Hangi sayfanın kaç indirme getirdiğini bilmiyoruz. En az: sayfa görüntüleme + "App Store'a tıklama" event'i.

---

## 3. İyi Olan, Korunmalı

- ✅ 17 sayfalık SEO yapısı ve araç sayfaları (zekat, dualar, Kuran, tesbih, namaz rehberi, hicri takvim) — doğru strateji
- ✅ `sitemap.ts` ve `robots.ts` düzgün, öncelikler makul
- ✅ Metadata/OpenGraph tanımlı, `lang="tr"`, locale doğru
- ✅ Koyu tema, altın-yeşil palet uygulamayla tutarlı
- ✅ Payload CMS entegre — içerik yönetimi için altyapı hazır
- ✅ Besmele bandı — güzel, markaya uygun bir dokunuş
- ✅ Mobil navbar/drawer çalışıyor

---

## 4. Yeniden Yapım — Sayfa Planı

Sıfırdan yazmaya gerek yok; ~~stack aynı kalsın~~ — **stack değişti: Laravel 13 + Blade (`web/`).** Aşağıdaki sayfa akışı geçerliliğini koruyor.

### Yeni ana sayfa akışı

| # | Bölüm | İçerik |
|---|---|---|
| 1 | **Hero** | Sol: başlık + alt başlık + çift CTA (App Store / Play Store) + gerçek sosyal kanıt. Sağ: telefon çerçevesinde uygulama ekran görüntüsü (mümkünse otomatik geçişli 3 ekran) |
| 2 | Besmele bandı | Aynen korunsun |
| 3 | **"Bugünün vakitleri"** | Ziyaretçinin konumuna göre canlı namaz vakti widget'ı — API zaten var (aladhan). Sayfada anında değer, SEO'da "namaz vakitleri" sorgusu için güçlü sinyal, sonrasında "telefonunda da olsun → indir" |
| 4 | Özellikler | Mevcut 9 kart korunsun, her birine gerçek ekran görüntüsü eklensin |
| 5 | **Ayırt edici üçlü** | Rakiplerde olmayanlar öne çıkarılsın: makam bazlı 5 ezan, kaza takibi, ortak zikir. Şu an bunlar 15 özellik arasında kayboluyor — asıl fark bunlar |
| 6 | Neden Ümmet | Kopya düzeltilmiş haliyle (§2.3, §2.4) |
| 7 | Web araçları | Zekat hesaplayıcı, tesbih, hicri takvim → hem SEO iç link hem gerçek fayda. Şu an sadece footer'da gizli |
| 8 | Sosyal kanıt | **Gerçek** App Store yorumları veya bölüm hiç olmasın |
| 9 | 3 adımda başlayın | Korunsun, sadeleştirilsin |
| 10 | SSS | Fiyatlandırma sorusu güncellenmiş haliyle |
| 11 | **E-posta yakalama** | "Yeni özellikler ve Ramazan hazırlığı için haberdar ol" |
| 12 | Son CTA | Çift mağaza butonu + masaüstü ziyaretçiler için QR kod |

### Teknik iyileştirmeler
- **Apple Smart App Banner** (`<meta name="apple-itunes-app" content="app-id=6760871547">`) — mobil Safari ziyaretçileri için tek satırlık, yüksek dönüşümlü iş
- Masaüstünde QR kod (mobil kullanıcı zaten telefonda, masaüstü ziyaretçi kayıp)
- Analytics + CTA tıklama event'i
- `next/image` ile görsel optimizasyonu, gerçek OG görseli (şu an OG image tanımlı değil)
- JSON-LD `SoftwareApplication` schema → Google'da zengin sonuç
- Lighthouse hedefi: mobilde 90+
- Play Store yayınında tüm CTA'lar için tek bir `<StoreButtons>` bileşeni (tek yerden güncellenir)

---

## 5. SEO — Asıl Fırsat Burada

Araç sayfaları doğru kurulmuş ama **etkileşimli değil**. Öneri: her araç sayfası web'de gerçekten çalışsın.

| Sayfa | Şu an | Olması gereken |
|---|---|---|
| `/namaz-vakitleri` | 40 satır tanıtım metni | **Çalışan** namaz vakti aracı (konum/şehir seçimli). "namaz vakitleri" TR'nin en yüksek hacimli dini araması |
| `/zekat-hesaplayici` | Yarı statik | Çalışan hesaplayıcı, güncel altın/gümüş fiyatı |
| `/kible-pusulasi` | 42 satır metin | Tarayıcı pusulası (mobil) veya harita üzerinde kıble açısı |
| `/hicri-takvim` | Statik | Çalışan dönüştürücü + yıllık kandil takvimi |
| `/tesbih` | Statik | Çalışan web tesbihi |

Mantık: kullanıcı Google'dan gelir → aracı web'de kullanır → değeri görür → "telefonunda hep yanında olsun" CTA'sı ile uygulamayı indirir. Statik tanıtım metni bu döngüyü kuramaz.

**Şehir bazlı sayfalar:** `/namaz-vakitleri/istanbul`, `/ankara`, `/izmir`… TR'de en yüksek hacimli arama kalıbı "istanbul namaz vakitleri". 81 il için programatik sayfa üretimi (Next'in statik üretimi ile kolay) organik trafiği katlar. Bu tek başına, listedeki en yüksek getirili SEO işi.

**Gerçek blog:** Payload'da `Posts` koleksiyonu + 8-10 gerçek yazı. Hedef sorgular: "kaza namazı nasıl kılınır", "zekat nisabı 2027", "Delâil-ül Hayrat nedir", "hatim nasıl yapılır", "Ramazan imsakiyesi".

---

## 6. Sıralı Yapılacaklar

**Bugün (birkaç saat)**
- [ ] Uydurma 6 yorumu ve hardcoded "4.9 Puan"ı kaldır — hukuki risk
- [ ] Sahte blog listesini kaldır veya `#` linklerini düzelt
- [ ] "Premium duvarı yok" kopyasını düzelt (4 konum + 2 meta açıklaması)
- [ ] Yanlış "çevrimdışı Kuran" iddiasını düzelt
- [ ] Apple Smart App Banner ekle
- [ ] Analytics kur

**Bu hafta**
- [ ] Ana sayfaya ürün ekran görüntüleri (hero + özellikler)
- [ ] OG görseli üret
- [ ] E-posta yakalama (Payload `Subscribers`)
- [ ] Ayırt edici üçlü bölümü (makam ezan / kaza / ortak zikir)

**2-4 hafta**
- [ ] Ana sayfa yeniden kurgusu (§4)
- [ ] Araç sayfalarını etkileşimli hale getir
- [ ] Şehir bazlı namaz vakti sayfaları (81 il)
- [ ] Gerçek blog içeriği
- [ ] Play Store butonları (yayınla eş zamanlı)

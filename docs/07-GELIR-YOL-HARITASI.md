# Ümmet — Gelir Yol Haritası (30 / 60 / 90 Gün)

> Hazırlanma tarihi: 26 Temmuz 2026
>
> 🚨 **BU DOKÜMAN KISMEN GEÇERSİZ (26 Temmuz 2026 akşamı).**
> Gerçek App Store verisi geldi: **4 ayda 58 indirme** (~0,5/gün).
> Bu hacimde monetizasyon erken — ödeme altyapısı 3 haftalık iş yapıp ayda
> ~₺30 gelir üretir. Darboğaz gelir değil, **kullanıcı**.
>
> Güncel öncelik sıralaması: [`15-VERI-ANALIZI.md`](15-VERI-ANALIZI.md)
> Aşağıdaki fiyatlandırma, paywall tasarımı ve Pro paket içeriği geçerliliğini
> koruyor — sadece **ne zaman** yapılacağı değişti (3.000-5.000 MAU sonrası).
> Bu doküman `01`/`06`'nın sıralamasını gelir önceliğine göre düzenler.

---

## 1. Önce Çatışmayı Söyleyelim

Alınan iki karar birbiriyle çelişiyor:

| Karar | Gelir etkisi | Süre |
|---|---|---|
| Laravel + Filament admin panel taşıması | **₺0** — kullanıcı hiçbir fark görmez | 1-1,5 hafta |
| Landing yeniden yapımı (Laravel) | Dolaylı — edinim kanalı | 1-1,5 hafta |
| "Projenin para kazanması gerekiyor" | — | — |

`06-LARAVEL-PLANI.md`'deki plan olduğu gibi uygulanırsa **ilk gelir ~7-9 hafta sonra** gelir. Bu kabul edilebilir değil.

Bu doküman ikisini de yapan ama **ilk geliri 2 haftaya çeken** bir sıralama öneriyor. Laravel işi iptal edilmiyor, sadece gelir işlerinin arkasına alınıyor.

---

## 2. Gelir Kaldıraçları — Hız / Etki

| Kaldıraç | Süre | İlk gelire etki | Not |
|---|---|---|---|
| **ASO** (ad + altyazı + anahtar kelime) | **1 gün** | Dolaylı, büyük | Mevcut ad "Ümmet — İslami Yaşam"; hacimli kelime yok. En yüksek getiri/efor |
| **"Destek Ol" IAP** | **~1 hafta** | **Doğrudan, hemen** | Ürün işi yok, paywall yok |
| Sentry + zaman dilimi fix | 1 gün | Dolaylı | Pro'nun altyapısı |
| **Ümmet Pro (abonelik)** | 3 hafta | **Doğrudan, büyük** | Asıl gelir |
| Play Store yayını | 1-2 hafta | Kitleyi 2-4x büyütür | Google test şartı gecikme yaratabilir |
| Landing yeniden yapımı | 1,5 hafta | Dolaylı | Edinim + Pro'nun önündeki kopya engeli |
| Admin taşıması (Laravel) | 1,5 hafta | **₺0** | Ertelenebilir |
| Ramazan sponsorluğu | Satış Kasım'da | Büyük, tek seferlik | Ramazan 2027 ≈ Şubat |

---

## 3. Hızlı Kazanç: "Ümmet'i Destekle"

**İlk geliri 1 haftada açan hamle.** Tam Pro'yu beklemeden.

Ne: Tek bir "Ümmet'i Destekle" ekranı, üç seviyeli consumable IAP.

| Seviye | Fiyat |
|---|---|
| Bir çay ısmarla | ₺29,99 |
| Destek ol | ₺79,99 |
| Cömert destek | ₺199,99 |

Neden bu kadar hızlı:
- **Özellik kilitleme yok** → ürün işi yok, gate mantığı yok, paywall tasarımı yok
- **Landing kopyası engel değil** → "premium duvarı yok" vaadi bozulmuyor, gönüllü destek premium duvarı değil. `02-MONETIZASYON.md` §0'daki kopya düzeltmesini beklemeye gerek yok
- **Risk yok** → kimse bir şey kaybetmiyor, olumsuz yorum riski çok düşük
- **RevenueCat altyapısını canlıda test eder** → Pro çıktığında ödeme hattı zaten çalışıyor olur, en uzun kalemi öne çekmiş olursunuz
- Dini uygulamalarda "destek ol" çerçevesi "satın al"dan belirgin şekilde iyi karşılanır

Nereye konur: "Diğer" menüsünde üst sıraya, ayrıca rozet kazanma ve 7 günlük streak anında nazik bir kart.

Kopya önerisi:
> **Ümmet'i Destekle**
> Namaz vakitleri, Kuran, dua ve kıble her zaman ücretsiz kalacak. Ümmet'i tek kişilik bir ekip geliştiriyor — desteğiniz sunucu masraflarını karşılıyor ve yeni özellikleri mümkün kılıyor.

⚠️ **Apple kuralı:** Bu, geliştiriciye destektir — izin verilir. **Hayır kurumuna bağış olarak sunulamaz** (Guideline 3.2.1(vi)); o durumda IAP kullanılamaz. Kopyada "sadaka", "bağış", "hayır" kelimelerini kullanmayın.

**Gerçekçi beklenti:** Tip jar dönüşümü düşüktür — aylık MAU'nun %0,2-0,5'i, ortalama ~₺80. 10.000 MAU'da aylık ~₺1.500-4.000 net. Büyük para değil. Değeri parada değil: **ödeme hattını canlıya alır ve Pro'nun risklerini önceden temizler.**

---

## 4. 30 Gün — İlk Gelir

### Hafta 1
- [ ] **ASO güncellemesi** (1 gün, kod yok) — mevcut ad `Ümmet — İslami Yaşam`, hacimli kelime içermiyor
  - Ad: `Ümmet: Namaz Vakti & Kuran`
  - Altyazı: `Ezan, Kıble, Dua, Tesbih`
  - Anahtar kelimeler: `ezan,kible,kuran,meal,dua,zikir,tesbih,kaza,oruc,ramazan,imsakiye,hicri,cami,hatim,zekat`
  - Ekran görüntülerine metin katmanı ekle
- [ ] **Apple Small Business Program kaydı** (10 dk — komisyon %30 → %15)
- [ ] Zaman dilimi hatası (`appStore.ts:64`) + Sentry
- [ ] Sürüm numarası fix (`more.tsx:212`)
- [ ] **Mevcut landing'de acil düzeltme** — Laravel'i beklemeyin, 30 dakikalık iş:
  - 6 uydurma yorumu ve hardcoded "4.9 Puan"ı sil (hukuki risk)
  - Sahte blog listesindeki `#` linklerini düzelt veya blog'u kaldır
  - Yanlış "çevrimdışı Kuran" iddiasını düzelt

### Hafta 2
- [ ] **RevenueCat kurulumu** + 3 consumable ürün
- [ ] "Ümmet'i Destekle" ekranı + giriş noktaları
- [ ] `useProStore.togglePro()` sil, entitlement'ı RevenueCat'ten türet
- [ ] Sandbox testleri → **App Store'a gönder**
- [ ] Play Console kaydını başlat (kimlik doğrulaması günler sürebilir, paralel yürüsün)

**→ ~14. günde ilk gelir.**

### Hafta 3-4
- [ ] **Ümmet Pro v1** — hesap sistemi gerektirmeyen minimum set:
  - Sınırsız kaza takibi (ücretsizde 2 vakit türü)
  - Tam analitik geçmişi (ücretsizde son 7 gün)
  - Tema + Arapça font paketleri
  - Ek ezan sesleri
  - Delâil-ül Hayrat tam metin
- [ ] Paywall ekranı + 4 tetikleyici (3 günlük streak, kaza limiti, analitik geçmişi, tema seçimi)
- [ ] Fiyatlandırma: TR ₺349,99/yıl · ₺59,99/ay · ₺899,99 ömür boyu — 7 gün deneme
- [ ] Android bildirim kanalı (ezan custom sound) — Play Store için tek gerçek geliştirme işi
- [ ] Play Store kapalı test

---

## 5. 60 Gün — Kitleyi Büyüt

- [ ] **Play Store üretim yayını** — TR'de Android %75-80. Tek başına kitleyi 2-4x büyütür
- [ ] Pro paywall A/B testi (remote config altyapısı zaten var)
- [ ] **Landing yeniden yapımı — Laravel Faz 1 + Faz 2** (`06-LARAVEL-PLANI.md`)
  - Bu noktada gelir akıyor, altyapı işine geçmek güvenli
  - 81 il namaz vakti sayfası → en yüksek getirili SEO işi
- [ ] Feature funnel event'leri (`03-VERI-VE-OLCUM.md` §3.3) — paywall optimizasyonu bunlar olmadan yapılamaz
- [ ] Yorum isteme akışı (`expo-store-review`) — ASO sıralamasının en büyük girdisi

---

## 6. 90 Gün — Ölçek

- [ ] **Hesap sistemi + bulut senkron** → Pro'nun en güçlü kalemi, fiyat artışını da haklı çıkarır
- [ ] **Laravel Faz 3 — admin taşıması.** Burada. Daha önce değil
- [ ] Ortak zikir / hatim grupları büyütmesi — elimizdeki tek viral döngü
- [ ] Bildirim stratejisi (streak uyarısı, kaza hatırlatıcı, Cuma Kehf, kandiller)
- [ ] **Ramazan 2027 hazırlığı** — sponsorluk satışı Kasım'da başlamalı, media kit gerekiyor
- [ ] i18n başlangıcı (EN/AR/ID) → global fiyatlandırma anlamlı hale gelir

---

## 7. Rakamlar

Gerçek MAU bilinmiyor (bkz. `03-VERI-VE-OLCUM.md`). Bu yüzden **10.000 MAU başına** veriyorum — kendi sayınızla çarpın.

**10.000 MAU başına yıllık net (Apple %15 sonrası):**

| Kaynak | Muhafazakâr | Gerçekçi | İyi senaryo |
|---|---|---|---|
| Destek Ol (tip) | ₺18.000 | ₺33.000 | ₺48.000 |
| Pro abonelik (%1 / %2 / %3 dönüşüm) | ₺29.750 | ₺59.500 | ₺89.250 |
| **Toplam** | **₺47.750** | **₺92.500** | **₺137.250** |

Buna eklenecekler:
- **Play Store:** kullanıcıyı 2-4x büyütür, ama Android ARPU iOS'un ~1/3'ü → gelirde net **+%50-80**
- **Ramazan sponsorluğu:** 100k+ MAU'da tek seferlik ₺150k-500k
- **Web AdSense:** trafiğe bağlı, aylık ₺5k-30k

**Buradaki asıl mesaj:** Her satır MAU ile doğru orantılı. Dönüşüm oranını %2'den %2,5'e çıkarmak için harcanan efor, kullanıcı sayısını 2x yapmak için harcanan eforun yanında küçük kalır. **Önce ASO ve Play Store, sonra paywall optimizasyonu.**

---

## 8. Laravel İşi Nereye Girdi

İptal edilmedi, yeniden sıralandı:

| Faz | Ne zaman | Gerekçe |
|---|---|---|
| Faz 1 — İskelet | 60 gün penceresi | Landing'in ön koşulu |
| Faz 2 — **Landing** | 60 gün penceresi | Gerçek değer üretiyor: SEO, edinim, doğru kopya |
| Faz 3 — **Admin** | 90 gün penceresi | Gelir üretmiyor. Mevcut Payload paneli çalışıyor, aceleye gerek yok |
| Faz 4 — Abonelik ekranı | Pro çıktıktan sonra | Zaten Pro'ya bağlı |

**Faz 3'ü öne almak isterseniz:** Bu bilinçli bir tercih olur — teknik borcu erken kapatmak, tek stack'e geçmek uzun vadede bakım kolaylığı sağlar. Ama maliyeti şudur: Pro'nun çıkışı ~2 hafta gecikir. 10.000 MAU'da bu yaklaşık **₺15.000 ertelenen gelir** demek. Karar sizin, sadece bedeli görünür olsun.

---

## 9. Haftalık Takip

Pro çıktıktan sonra her hafta bakılacaklar:

- Yeni indirme + product page conversion rate (ASO çalışıyor mu?)
- MAU / DAU
- Paywall gösterim → satın alma dönüşümü (**tetikleyici bazında** — hangi an satıyor?)
- Deneme → ücretli dönüşümü
- Churn ve iade oranı
- Destek Ol geliri (ayrı takip et — farklı bir kullanıcı davranışı)
- App Store puanı ve yeni yorumlar (monetizasyon sonrası **düşüyor mu?** — düşüyorsa paywall çok agresif)

Son madde en önemlisi. Dini bir uygulamada puan düşüşü, kısa vadeli gelir artışından çok daha pahalıya mal olur.

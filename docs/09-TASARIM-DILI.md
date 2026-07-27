# Ümmet — Tasarım Dili

> Hazırlanma tarihi: 26 Temmuz 2026
> Kapsam: mobil uygulama (Expo/RN) + web (Laravel/Blade) + yönetim paneli (Filament)
> Kaynak: `src/constants/theme.ts`, ekran kodları ve `web/resources/css/app.css`'ten çıkarıldı.

---

## 1. Marka Karakteri

Ümmet dini bir uygulama. Tasarım üç şeyi aynı anda yapmak zorunda:

| İlke | Pratikte ne demek |
|---|---|
| **Sakinlik** | Koyu zemin, düşük kontrastlı ikincil metin, yumuşak geçişler. Ekran gece de açılıyor — göz yormamalı |
| **Vakar** | Abartısız animasyon, sansasyonel renk yok, agresif CTA yok. Altın vurgu olarak kullanılır, dolgu olarak değil |
| **Modernlik** | Rakiplerden ayrışan nokta bu. Yuvarlak köşeler, kartlı yerleşim, akıcı geçişler |

**Yapılmayacaklar:** kırmızı uyarı renkleriyle aciliyet yaratmak · titreşen/yanıp sönen öğeler · ibadet ekranlarında reklam veya promosyon · sayaç/geri sayımla baskı kurmak.

---

## 2. Renk

### Çekirdek palet

| Rol | Değer | Kullanım |
|---|---|---|
| **Altın (vurgu)** | `#D4AF37` | Sıradaki vakit, aktif durum, bağlantı, birincil sayı. **Az kullanılır, o yüzden dikkat çeker** |
| Altın açık | `#F0D060` | Gradyan ucu, hover |
| Altın koyu | `#B8941E` | Basılı hâl |
| **Yeşil (birincil)** | `#1B4332` | Hero gradyanı, birincil buton, olumlu durum zemini |
| Yeşil orta | `#2D6A4F` | Gradyan ikinci durak |
| Yeşil parlak | `#40C057` | Başarı, tamamlanmış ibadet işareti |
| **Zemin** | `#0A0F14` (uygulama) · `#070B12` (web) | Sayfa arka planı |
| Yüzey | `#121A24` | Kart |
| Yükseltilmiş | `#1A2332` | Modal, açılır menü |

### Metin

| Rol | Değer | Kullanım |
|---|---|---|
| Birincil | `#ECDFCC` | Başlık ve gövde. Saf beyaz değil — kırık fildişi, koyu zeminde daha yumuşak |
| İkincil | `#8A9BA8` | Açıklama, alt başlık |
| Soluk | `#5A6B78` | Etiket, zaman damgası, yardımcı metin |

### Durum

| Rol | Değer |
|---|---|
| Başarı | `#40C057` |
| Uyarı | `#FFB300` |
| Hata | `#E53935` |

> ⚠️ **Hata kırmızısı ibadet takibinde kullanılmaz.** Kaçırılmış namaz "başarısızlık" olarak işaretlenmez — nötr veya soluk gösterilir. Suçluluk üreten arayüz bu üründe yanlıştır.

### Kuran okuyucu temaları

Okuma uzun sürdüğü için ayrı bir palet seti var (`src/stores/appStore.ts` → `QURAN_THEMES`):

| Tema | Zemin | Metin | Vurgu |
|---|---|---|---|
| Koyu | `#0A0E17` | `#ECDFCC` | `#D4AF37` |
| Açık | `#FFFFFF` | `#1A1A2E` | `#1B6B4A` |
| Sepia | `#F4ECD8` | `#5B4636` | `#8B6914` |
| Krem | `#FFF8E7` | `#3D2B1F` | `#B8860B` |
| Yeşil | `#0D1F17` | `#D4E7D0` | `#40C057` |

### Şeffaflık deseni

Kartlar düz renk değil, zemin üstünde yarı saydam katman:

```
Kart zemini    rgba(18, 26, 36, 0.6)
Kart çerçevesi rgba(255, 255, 255, 0.06)
Altın parıltı  rgba(212, 175, 55, 0.12)
Yeşil parıltı  rgba(27, 67, 50, 0.25)
```

---

## 3. Tipografi

Üç aile, üç net iş:

| Aile | Nerede | Neden |
|---|---|---|
| **Reem Kufi** (uygulama) / **Plus Jakarta Sans** (web) | Başlık, sayı, vakit | Reem Kufi İslami tipografiye göz kırpar ama okunaklı kalır |
| **Inter** | Gövde, arayüz | Küçük puntoda net |
| **Amiri** | Arapça (besmele, ayet) | Klasik nesih |

### Kuran'a özel Arapça fontlar

`src/stores/appStore.ts` → `ARABIC_FONTS`. Kullanıcı seçebiliyor:

| Font | Karakter | Satır yüksekliği çarpanı |
|---|---|---|
| Noto Naskh | Modern, net harekeler | 2.8 |
| Scheherazade | Geleneksel, zarif | 2.6 |
| Amiri | Klasik, dekoratif | 2.4 |

> Arapça metinde satır yüksekliği kritik: harekeler üst üste biner. Çarpan asla 2.4'ün altına inmemeli.

### Ölçek

| Kullanım | Boyut | Ağırlık |
|---|---|---|
| Hero sayı (vakit) | 48-56 | 800 |
| Sayfa başlığı | 24-28 | 700-800 |
| Bölüm başlığı | 17-20 | 700 |
| Kart başlığı | 15-16 | 600-700 |
| Gövde | 14-15 | 400-500 |
| Etiket / yardımcı | 12-13 | 500-600 |
| Mikro (rozet, gün kısaltması) | 11 | 600 |

> **Alt sınır 11px.** 26 Temmuz 2026'da uygulamadaki 48 adet 9-11px yazı yükseltildi.
> Gerekçe: kullanıcı kitlesinin yaş ortalaması yüksek ve ekran çoğunlukla gece,
> yarı karanlıkta açılıyor. 11px yalnızca dar kutulardaki gün kısaltmaları gibi
> mikro etiketler için; gövde metninde kullanılmaz.

**Sayılar her zaman `tabular-nums`.** Geri sayım yanıp sönmemeli.

---

## 4. Aralık ve Yuvarlaklık

`src/constants/theme.ts` içindeki ölçek — yeni kodda bu değerlerin dışına çıkmayın:

```
Spacing       xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48
BorderRadius  sm 8 · md 12 · lg 16 · xl 24 · full 9999
```

Pratik kullanım:
- Ekran kenar boşluğu: **20**
- Kartlar arası: **10-12**
- Kart iç dolgu: **14-16**
- İkon kutusu: **40-42px kare, radius 12**
- Kart radius: **16** · büyük kart **24** · buton **14-16**

---

## 5. Bileşen Kalıpları

### Kart
```
zemin      rgba(18,26,36,0.6)
çerçeve    1px rgba(255,255,255,0.06)
radius     16
dolgu      14-16
```
Hover/aktif: çerçeve `rgba(212,175,55,0.3)`, 2px yukarı.

### İkon kutusu
40-42px kare, radius 12, zemin ikonun renginin `%10-12` opaklığı. İkon rengi tam doygun.
Örnek: yeşil ikon → zemin `rgba(64,192,87,0.12)`, ikon `#40C057`.

### Birincil buton
Yeşil gradyan (`#1B4332` → `#2D6A4F`), beyaz metin, radius 14, dolgu 12×20.

### İkincil buton
Şeffaf zemin `rgba(255,255,255,0.04)`, çerçeve `rgba(255,255,255,0.12)`, metin `#ECDFCC`.

### Vurgu butonu (nadir)
Dolu altın `#D4AF37`, koyu metin `#16110A`. Sadece dönüşüm noktalarında — sayfada birden fazla olmamalı.

### Liste satırı
Sol ikon kutusu · orta başlık+alt başlık · sağ `chevron-forward` (`#5A6B78`).

---

## 6. Hareket

```
Giriş        FadeInDown / FadeInUp + .springify()
Kademe       100ms + index × 40ms
Nabız        1.0 ↔ 1.03, 1800ms, ease-in-out, sonsuz
Basma        scale 0.95, spring
Geçiş        200-300ms
```

**Kurallar:** Kademeli giriş 6 öğeden sonra kesilir. Sürekli animasyon yalnızca "sıradaki vakit" nabzında. Ekran geçişlerinde parallax/zıplama yok. Kullanıcı sistem ayarında hareketi azalttıysa animasyonlar kapatılmalı (**şu an uygulanmıyor — eksik**).

---

## 7. Dokunsal Geri Bildirim

`expo-haptics` **doğrudan çağrılmaz**, `src/utils/haptics.ts` kullanılır (kullanıcı ayarına saygı duyar).

| Olay | Tür |
|---|---|
| Tesbih artırma | `Light` |
| Buton, sekme | `Light` |
| Ezan oynat/durdur | `Medium` |
| Hedefe ulaşma, rozet | `Notification.Success` |
| Hata | `Notification.Error` |

---

## 8. Dil ve Ton

Arayüz Türkçe. Ton: **sade, saygılı, buyurgan değil.**

| Yerine | Kullan |
|---|---|
| "Namazını kaçırdın!" | "Bugün henüz işaretlemedin" |
| "Hemen satın al" | "Ümmet'i destekle" |
| "Premium'a yükselt" | "Pro'ya geç" / "Destek ol" |
| "HATA!" | "Vakitler şu an yüklenemedi" |

**Dini terimler doğru yazılır:** Kâbe, Kur'an-ı Kerim, Fâtiha, Delâil-ül Hayrât, kaza, sünnet. Şapkalı harfleri atmayın.

**Sayı biçimi:** binlik ayracı nokta (`10.000`), saat `HH:MM` 24 saat, tarih `26 Temmuz 2026`.

---

## 9. Web ile Uygulama Arasındaki Fark

Aynı marka, farklı bağlam. Bilinçli sapmalar:

| | Uygulama | Web |
|---|---|---|
| Zemin | `#0A0F14` | `#070B12` (biraz daha koyu, ekranda daha derin) |
| Başlık fontu | Reem Kufi | Plus Jakarta Sans (latin metinde daha iyi kerning) |
| Genişlik | Telefon | `1120px` konteyner |
| Bölüm aralığı | 20px dikey | 88px dikey |

**Değişmeyenler:** altın vurgu, yeşil birincil, kırık fildişi metin, kart deseni, radius ölçeği, ton.

---

## 10. Yönetim Paneli (Filament)

Panel iç araçtır — marka tasarımı uygulanmaz, sadece iki şey ayarlanır:

- Birincil renk: `Amber` (altına yakın)
- Marka adı: "Ümmet Yönetim"
- Menü grupları: İçerik · Bildirimler · Analitik · Topluluk

Gerisi Filament varsayılanı. Panel güzelleştirmek için vakit harcamayın.

---

## 11. Erişilebilirlik — Mevcut Eksikler

Dürüst durum tespiti:

| Konu | Durum |
|---|---|
| Metin kontrastı | ✅ `#ECDFCC` üzerinde `#0A0F14` ≈ 14:1 |
| İkincil metin | ⚠️ `#8A9BA8` ≈ 5.5:1 — küçük puntoda sınırda |
| Soluk metin | ✅ Düzeltildi — `#5A6B78` (3.5:1) ve `#6B7280` (3.99:1) küçük metinden kaldırıldı, `#8A9BA8` (6.74:1) ile değiştirildi. `#5A6B78` artık yalnızca geçmiş vakit gibi geri plan öğelerinde |
| Dokunma hedefi | ⚠️ Bazı ikon butonları hâlâ 44×44'ün altında. Tesbih sayacı düzeltildi (`hitSlop` ile yatayda ekranın %78'i) |
| Ekran okuyucu | ❌ Çoğu ikonda `accessibilityLabel` yok |
| Hareket azaltma | ❌ Desteklenmiyor — `AccessibilityInfo.isReduceMotionEnabled()` ile kontrol edilip animasyonlar kapatılmalı |
| Dinamik yazı boyutu | ✅ Çalışıyor ve **sınırlandırıldı** (26 Tem 2026). Detay aşağıda |

Bunlar `01-IYILESTIRME-YOL-HARITASI.md`'ye eklenmeli. Yaşlı kullanıcı oranı yüksek bir uygulamada **dinamik yazı boyutu** en önemli eksik.

---

### Dinamik yazı boyutu — nasıl çalışıyor

Yaygın bir yanılgı: "React Native sistem yazı boyutunu dinlemiyor." **Dinliyor** —
`allowFontScaling` varsayılan olarak açık. Sorun tam tersiydi: **sınırsız** dinliyordu.

iOS erişilebilirlik boyutlarında çarpan 3,12'ye kadar çıkıyor. Uygulamada 56 sabit
yükseklikli kap var; bu çarpanlarda metin taşıyor, üst üste biniyor ve arayüz
erişilebilirliğe en çok ihtiyaç duyan kullanıcıda kullanılamaz hale geliyordu.

`src/utils/textScaling.ts` üst sınır koyuyor:

| Metin | Sınır | Gerekçe |
|---|---|---|
| Gövde, etiket, başlık (<32px) | **1,5x** | iOS'un erişilebilirlik dışı en büyük ayarını (1,35) tamamen karşılar |
| Görsel sayılar (≥32px) | **1,2x** | Tesbih sayacı, vakit geri sayımı — zaten 48-58px, okunaklılık sorunu bunlarda değil |

AX5 ayarında etkisi: 58px sayaç 181px yerine 70px, 15px gövde 47px yerine 22px.

Bileşen kendi `maxFontSizeMultiplier` değerini verirse ona dokunulmuyor.

> Not: `Text.defaultProps` React 19'da forwardRef bileşenlerinde yok sayılıyor.
> Bu yüzden `render` sarmalanıyor — sürümden bağımsız çalışan tek güvenilir yol.

---

## 12. Yeni Ekran Eklerken Kontrol Listesi

- [ ] Renkler `theme.ts`'ten mi geliyor? (kod boyunca hex tekrarı var — yeni kodda yapmayın)
- [ ] Kenar boşluğu 20, kart radius 16, kartlar arası 10-12
- [ ] Giriş animasyonu `FadeInDown` + kademe, 6 öğede kesiliyor
- [ ] Haptik `utils/haptics.ts` üzerinden
- [ ] Metin Türkçe, dini terimler şapkalı
- [ ] Sayılar `tabular-nums`
- [ ] Boş durum ve hata durumu tasarlandı mı? (`catch {}` ile sessiz geçilmiyor)
- [ ] Yükleniyor durumu var mı?
- [ ] Dokunma hedefleri ≥ 44×44

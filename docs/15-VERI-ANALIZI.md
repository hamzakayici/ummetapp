# Ümmet — Gerçek Veri Analizi

> Kaynak: App Store Connect → Analytics → Downloads by Source
> Dönem: 26 Mart – 25 Temmuz 2026 (121 gün)
> Analiz tarihi: 26 Temmuz 2026
>
> ⚠️ **Bu doküman `07-GELIR-YOL-HARITASI.md`'nin varsayımlarını geçersiz kılar.**
> Önceki tüm rakamlar "10.000 MAU başına" tahmindi. Gerçek sayılar çok farklı çıktı.

---

## 1. Ham Veri

| Kaynak | İndirme | Pay |
|---|---|---|
| App Store Search | 39 | **67%** |
| App Referrer | 11 | 19% |
| App Store Browse | 6 | 10% |
| Unavailable | 2 | 3% |
| **Web Referrer** | **0** | **0%** |
| Institutional Purchase | 0 | 0% |
| **TOPLAM** | **58** | |

**Günlük ortalama: 0,48 indirme. Aylık: ~14.**

Grafikte 26 Mart'ta ~10'luk bir lansman sıçraması, sonrasında 4 ay boyunca düz bir çizgi.

---

## 2. Bu Ne Anlama Geliyor

### 2.1 Uygulama keşfedilmiyor

58 indirme, dört ayda. Bu bir ürün kalitesi sorunu değil — **kimse uygulamanın varlığından haberdar değil.** Ürün 25 ekranlık, rakiplerinden derin bir uygulama ama görünmüyor.

### 2.2 Arama zaten baskın kanal — ve ad kötüyken

En çarpıcı bulgu bu. İndirmelerin **%67'si App Store aramasından** geliyor. Üstelik uygulamanın adı `Ümmet — İslami Yaşam`; içinde "namaz vakti", "ezan", "kuran" gibi **hiçbir hacimli kelime yok.**

Yani insanlar bu uygulamayı, aramada görünmemesi gereken bir isimle bulmuşlar. Bu, ASO'nun neden en yüksek getirili iş olduğunun kanıtı: kanal zaten çalışıyor, sadece yanlış kelimelerle.

Ada "Namaz Vakti" ve "Kuran" eklemek bu 39 sayısını kat kat büyütmeli. Bu bir tahmin değil, verinin işaret ettiği yön.

### 2.3 Web sitesi dört ayda sıfır kurulum getirmiş

`Web Referrer: 0`.

ummetapp.com dört ay boyunca **tek bir indirme bile üretmemiş.** Landing sayfası bir edinim kanalı olarak tamamen ölü. `04-LANDING-PAGE.md`'de tespit edilen sorunlar (ürün görseli yok, uydurma yorumlar, dönüşüm mekaniği yok, App Store'a düzgün yönlendirme yok) bu sayıyla doğrulanıyor.

Yeni Laravel sitesi + 81 il SEO sayfası bu yüzden değerli. Ama unutmayın: SEO'nun indekslenip trafik getirmesi 3-6 ay alır.

### 2.4 App Referrer 11 — muhtemelen lansman paylaşımları

19% — büyük ihtimalle kendi paylaşımlarınız ve ilk çevre. Organik viral döngü yok. Ortak zikir zaten bozuktu (Supabase silinmişti), yani paylaşım mekanizması hiç çalışmadı.

---

## 3. Stratejik Sonuç: Monetizasyon Erken

Bu en önemli kısım.

`07-GELIR-YOL-HARITASI.md` "Hafta 2'de RevenueCat + Destek Ol → ilk gelir" diyordu. **Bu artık yanlış bir sıralama.**

Kaba hesap: 58 toplam indirmenin belki 20-30'u hâlâ aktif. En iyimser %3 dönüşümle **1 abone**. Yıllık ₺350. Üç haftalık geliştirme işi, ayda ~₺30 gelir üretir.

**Ödeme altyapısı kurmak şu an yanlış yatırım.** Darboğaz gelir değil, kullanıcı.

Doğru eşik: **aylık en az 3.000-5.000 aktif kullanıcıya ulaşana kadar monetizasyona girmeyin.** O noktada %2-3 dönüşüm anlamlı bir sayı üretir ve paywall'u optimize edecek veri olur.

---

## 4. Yeniden Sıralanmış Öncelikler

Her şey edinime gitmeli.

| # | İş | Efor | Neden |
|---|---|---|---|
| 1 | **ASO — ad, altyazı, anahtar kelime** | 1 gün | Arama zaten %67. Kanal çalışıyor, kelimeler yanlış. **Tek en yüksek getirili iş** |
| 2 | **Ekran görüntüsü + önizleme videosu** | 2 gün | Arama sonucunda görünmek yetmez, tıklanınca ikna etmeli |
| 3 | **Play Store yayını** | 1-2 hafta | TR'de Android %75-80. Altyapı hazır (bildirim kanalları dahil) |
| 4 | **Yorum isteme akışı** | ✅ yapıldı | Puan/yorum sayısı arama sıralamasının en büyük girdisi |
| 5 | **Yeni site + 81 il SEO sayfası** | devam ediyor | Web'den 4 ayda 0 kurulum. SEO 3-6 ayda meyve verir, **şimdi ekilmeli** |
| 6 | **Hatim grupları** | 1 hafta | Tek gerçek viral döngü (`14-BUYUME-SENARYOSU.md`) |
| 7 | Mobil API geçişi + yeni sürüm | hazır | Uygulama zaten arızalı; ASO güncellemesiyle aynı sürümde çıksın |
| 8 | Sentry | 4 saat | Az kullanıcıda bile çökme oranı bilinmeli |
| — | ~~RevenueCat + Pro~~ | **ERTELENDİ** | 3.000-5.000 MAU'ya kadar |
| — | ~~Destek Ol IAP~~ | **ERTELENDİ** | 58 indirmede anlamsız |

---

## 5. Hedefler

Gerçekçi ve ölçülebilir:

| Dönem | Hedef | Nasıl |
|---|---|---|
| 1 ay | Günlük 5 indirme (10x) | ASO + ekran görüntüleri |
| 3 ay | Günlük 30-50 indirme | + Play Store |
| 6 ay | Günlük 100+ | + SEO meyve vermeye başlar + hatim grupları |
| Ramazan 2027 | Aylık 10.000+ | Ramazan paketi (`14-BUYUME-SENARYOSU.md` §3) |

Ramazan 2027'de 10.000+ aylık aktif kullanıcıya ulaşılırsa **monetizasyon o zaman anlamlı olur.**

---

## 6. Hâlâ Bilmediklerimiz

Bu ekran yalnızca *kaynak bazlı indirme* gösteriyor. Karar için eksik olanlar:

| Metrik | Neden gerekli |
|---|---|
| **Impressions → Product Page Views → Downloads** | Dönüşüm oranı. Aramada görünüp tıklanmıyorsa sorun ikon/başlık; tıklanıp indirilmiyorsa sorun ekran görüntüleri |
| **Retention (D1/D7/D30)** | 58 kişi indirdi, kaçı kaldı? Ürün tutuyor mu? |
| **Active Devices** | Gerçek MAU |
| **Crashes** | Sentry yok, tek kaynak bu |
| **Ülke kırılımı** | Yurt dışı Türk kitlesi var mı → i18n kararı |

Bunlar aynı ekranda: Analytics → Metrics. Özellikle **Retention** kritik — düşükse ASO'ya yatırım yapmadan önce ürünü düzeltmek gerekir.

---

## 7. Ders

Bu veri elde olmadan üç doküman yazılmıştı ve hepsi yanlış varsayımla ilerliyordu: "orta ölçekli bir kullanıcı tabanı var, monetize edilmeli."

Gerçek şu: **ürün hazır, kitle yok.** Sorun tamamen dağıtımda.

İyi haber: bu düzeltilebilir bir sorun ve en ucuz çözümü (ASO) bir günlük iş.

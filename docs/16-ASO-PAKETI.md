# Ümmet — ASO Paketi (kopyala-yapıştır)

> Hazırlanma tarihi: 26 Temmuz 2026
> Dayanak: `15-VERI-ANALIZI.md` — indirmelerin **%67'si App Store aramasından**, üstelik
> ad hiçbir hacimli kelime içermiyor. Bu, listedeki en yüksek getirili tek iş.

Aşağıdaki metinler karakter sayıları doğrulanarak yazıldı. App Store Connect'e olduğu gibi yapıştırılabilir.

---

## 1. Neden Bu Değişiklik

Mevcut ad: **`Ümmet — İslami Yaşam`** (21/30 karakter)

Sorun: "Ümmet" bir marka adı, kimse aramıyor. "İslami Yaşam" düşük hacimli bir arama. TR'de asıl hacim **"namaz vakti"**, "ezan", "kuran" kelimelerinde — hiçbiri adda yok.

Buna rağmen indirmelerin %67'si aramadan geliyor. Yani kanal zaten çalışıyor, sadece yanlış kelimelerle. Doğru kelimeler konduğunda bu sayının katlanması beklenir.

**Apple'ın arama indeksi yalnızca üç alanı okur:** uygulama adı, altyazı, anahtar kelimeler. Açıklama metni arama sıralamasına girmez (dönüşüm için önemlidir, sıralama için değil).

---

## 2. Uygulama Adı

```
Ümmet: Namaz Vakti & Kuran
```
**26/30 karakter**

Neden bu:
- "Namaz Vakti" ve "Kuran" — TR'nin en hacimli iki dini araması
- Marka adı başta kalıyor, mevcut kullanıcı kaybı olmuyor
- Apple ad alanındaki kelimelere **en yüksek sıralama ağırlığını** verir

**Alternatif** (marka vurgusu daha az, arama gücü daha fazla):
```
Ümmet: Namaz Vakitleri & Ezan
```
29/30 karakter

---

## 3. Altyazı (Subtitle)

```
Ezan, Kıble, Dua ve Tesbih
```
**26/30 karakter**

**Ramazan dönemi için** (Ocak 2027'de değiştirin, Ramazan bitince geri alın):
```
İmsakiye, İftar, Ezan, Kıble
```
28/30 karakter

---

## 4. Anahtar Kelimeler

```
imsakiye,kaza,meal,zikir,hatim,diyanet,ramazan,hicri,takvim,zekat,cami,oruc,sure,mushaf,salavat
```
**95/100 karakter · 15 kelime**

Kurallar (sık yapılan hatalar):
- ❌ **Ad ve altyazıdaki kelimeleri tekrarlamayın** — Apple onları zaten indeksliyor, tekrar karakter israfı
- ❌ Virgülden sonra **boşluk bırakmayın** — her boşluk bir karakter yer
- ❌ "ve", "ile", "için" gibi bağlaçlar koymayın
- ❌ Rakip marka adı yazmayın (Apple reddediyor)
- ✅ Tekil kullanın — Apple kelime köklerini eşleştiriyor
- ✅ Apple alanlar arası kelimeleri **birleştirerek** öbek üretir: ad'daki "namaz" + keyword'deki "kaza" → "kaza namazı" araması için de sıralanırsınız

Türkçe karakterler: `ı`, `ğ`, `ş`, `ç`, `ö`, `ü` bire bir karakter sayılır. `oruc` ve `kible` gibi kelimeleri şapkasız yazmak isteyen kullanıcılar da var — Apple aksanları normalize ediyor, ikisini birden yazmayın.

---

## 5. Tanıtım Metni (Promotional Text)

170 karakter. **Uygulama güncellemesi gerektirmeden istediğiniz zaman değiştirilebilir** — kampanya, Ramazan, kandil için kullanın.

```
Namaz vakitleri, beş vakit için ayrı makamda ezan, Kuran ve meal, kaza takibi, kıble ve ortak zikir. Kayıt gerekmez, reklam yok.
```
127/170

**Ramazan sürümü:**
```
Ramazan hazır: imsakiye, iftar geri sayımı, sahur alarmı, 30 günlük oruç takibi ve birlikte hatim. Namaz vakitleri ve ezan her zaman ücretsiz.
```
141/170

---

## 6. Açıklama (Description)

Arama sıralamasına girmez ama **ürün sayfasına gelen kişiyi ikna eden şey budur.** İlk 3 satır "daha fazla"dan önce görünür — en önemli kısım orası.

```
Namaz vakitlerinden Kuran okumaya, kaza takibinden ortak zikire kadar günlük ibadetiniz için ihtiyacınız olan her şey tek uygulamada.

Kayıt gerekmez. Reklam yok. Çekirdek özellikler her zaman ücretsiz.

━━━━━━━━━━━━━━━━━━━━

◆ NAMAZ VAKİTLERİ VE EZAN
• Konumunuza göre otomatik vakitler, 13 farklı hesaplama yöntemi (varsayılan: Diyanet)
• Beş vakit için beş ayrı ezan kaydı — Saba, Rast, Hicaz, Segâh ve Bayatî makamlarında
• Vakit bildirimleri, güneş yayı göstergesi
• Ana ekran widget'ı: sıradaki vakit ve kalan süre

◆ KURAN-I KERİM
• 604 sayfalık mushaf, Diyanet meali
• Ayet ayet sesli okuma (Mishary Rashid Alafasy)
• 5 okuma teması, 3 Arapça yazı tipi, ayarlanabilir punto
• Kaldığınız yerden devam, sure ve cüz listesi, favoriler

◆ KAZA TAKİBİ
• Kaza namazı borcunuzu vakit vakit girin, kıldıkça düşün
• Kaza orucu ve adak takibi
• Tahmini bitiş tarihi

◆ ORTAK ZİKİR
• Bir kod paylaşın, arkadaşlarınızla aynı hedefe birlikte zikir çekin
• Sayaç herkeste güncellenir

◆ DUA, ZİKİR VE İÇERİK
• 100'den fazla kategorize dua
• Dijital tesbih, hedef belirleme, titreşimli geri bildirim
• Sahih hadis koleksiyonu, Delâil-ül Hayrât
• Namaz rehberi: adım adım kılınış

◆ ARAÇLAR
• Kıble pusulası — yön, derece ve Kâbe'ye uzaklık
• Yakındaki camiler
• Hicri takvim, kandiller ve mübarek geceler
• Zekat, fitre ve kefaret hesaplayıcıları
• Ramazan Hub: iftar, sahur ve hatim planı
• Hıfz modu, ibadet analitiği, streak ve rozetler

━━━━━━━━━━━━━━━━━━━━

◆ GİZLİLİK
İbadet kayıtlarınız, kaza borcunuz ve konum bilginiz cihazınızda kalır. Reklam amaçlı takip yapmıyoruz.

◆ İLETİŞİM
Öneri ve hata bildirimleriniz için: destek@ummetapp.com
ummetapp.com
```

---

## 7. Sürüm Notları (What's New)

Bir sonraki sürüm için — 4 aydır güncelleme yok, bu da sıralamada olumsuz sinyal:

```
Bu sürümde çok sayıda iyileştirme var:

• Yazı boyutları büyütüldü, düşük kontrastlı renkler düzeltildi — özellikle gece kullanımında çok daha okunaklı
• Tesbih sayacında dokunma alanı genişletildi, artık ekrana bakmadan da rahat sayabilirsiniz
• Gece yarısından sonra yapılan ibadetlerin bir önceki güne yazılmasına yol açan hata giderildi — streak ve istatistikler artık doğru
• Kuran metni yüklenemediğinde artık boş ekran yerine açıklama ve "tekrar dene" seçeneği çıkıyor
• Android için makam bazlı ezan bildirimleri hazırlandı
• Altyapı yenilendi: duyurular, ortak zikir ve bildirimler daha hızlı ve kararlı

Öneri ve görüşleriniz için: destek@ummetapp.com
```

---

## 8. Ekran Görüntüleri

Mevcut görseller ham ekran görüntüsü — üstlerinde başlık var ama **fayda değil özellik** anlatıyorlar.

Önerilen sıra ve başlıklar (ilk 2-3'ü arama sonucunda görünür, en kritik olanlar):

| # | Başlık | Alt başlık | Ekran |
|---|---|---|---|
| 1 | **Vakti kaçırmayın** | Ezan bildirimi, beş vakit beş makam | Ana sayfa, geri sayım |
| 2 | **Kaldığınız yerden okuyun** | 604 sayfa mushaf, Diyanet meali | Kuran okuyucu |
| 3 | **Kaza borcunuzu takip edin** | Vakit vakit girin, kıldıkça düşsün | Kaza takibi |
| 4 | **Birlikte zikir çekin** | Kod paylaşın, sayaç herkeste güncellensin | Ortak zikir |
| 5 | **Kıbleyi anında bulun** | Yön, derece ve Kâbe'ye uzaklık | Kıble pusulası |
| 6 | **15+ araç, hepsi ücretsiz** | Zekat, hicri takvim, cami, dua | Diğer menüsü |

**Eksik: uygulama önizleme videosu.** 15-30 saniye, ürün sayfasında ekran görüntülerinden önce oynar ve dönüşümü belirgin artırır.

---

## 9. Uygulama Kategorisi

Mevcut kategoriyi kontrol edin. Doğrusu:
- **Birincil:** Referans (Reference) — dini uygulamaların çoğu burada, rekabet daha az
- **İkincil:** Yaşam Tarzı (Lifestyle)

---

## 10. Uygulama Sonrası

ASO tek seferlik iş değil. Değişiklikten sonra:

1. **Bekleyin.** Apple'ın yeniden indekslemesi 24-72 saat sürer, sıralama etkisi 1-2 hafta içinde oturur.
2. **Ölçün.** App Store Connect → Analytics → Metrics → *Impressions*, *Product Page Views*, *Conversion Rate*. Karşılaştırma için değişiklik öncesi 30 günün rakamlarını not alın.
3. **Tek değişken.** Ad, altyazı ve ekran görüntülerini aynı anda değiştirirseniz hangisinin işe yaradığını bilemezsiniz. Önce ad + altyazı + anahtar kelime, iki hafta sonra ekran görüntüleri.
4. **Yorum toplayın.** Uygulamanın **0 yorumu var** (API'den doğrulandı). Puan ve yorum sayısı sıralamanın en büyük girdilerinden biri ve dönüşümü de doğrudan etkiliyor. Yorum isteme akışı eklendi ama **yeni sürüm çıkana kadar çalışmıyor.**

---

## 11. Sıradaki Adımlar

- [ ] App Store Connect'te ad, altyazı, anahtar kelimeleri güncelle (bugün, 15 dakika)
- [ ] Açıklama ve tanıtım metnini güncelle
- [ ] Kategoriyi kontrol et
- [ ] Yeni sürümü çıkar — 4 aydır güncelleme yok, yorum akışı da onunla devreye girecek
- [ ] Ekran görüntülerini fayda odaklı başlıklarla yenile (2 hafta sonra, ayrı değişken)
- [ ] Önizleme videosu çek
- [ ] Ocak 2027: Ramazan altyazısı ve tanıtım metnine geç

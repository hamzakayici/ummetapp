# Ümmet — Büyüme Senaryosu

> Hazırlanma tarihi: 26 Temmuz 2026
> Amaç: organik, ödemesiz kullanıcı kazanımı. Reklam bütçesi varsayılmıyor.

---

## 1. Tek Cümlelik Strateji

**Ümmet'in büyümesi reklamdan değil, Türk Müslümanların zaten yaptığı bir şeyi dijitalleştirmekten gelecek: birlikte hatim indirmek.**

Elimizde bir viral çekirdek zaten var — ortak zikir — ama gizli, teşvik edilmiyor ve şu an bozuk. Asıl fırsat onun bir üst hâli: **hatim grupları**.

---

## 2. Neden Hatim Grupları?

Türkiye'de son derece yaygın, kültürel olarak yerleşik bir pratik:

- Vefat eden biri için **"ruhuna hatim indirmek"** — aile WhatsApp grubunda 30 kişi toplanır, her biri bir cüz alır
- **Mukabele** — Ramazan'da günde bir cüz
- Kandillerde, hastalık/şifa niyetine, yeni doğan için

Şu an bu iş **WhatsApp'ta elle** yürüyor: birisi "1. cüz bende", "5 aldım" diye yazıyor, biri Excel tutuyor, kim nerede kaldı belli olmuyor.

**Bu tam bir ürün boşluğu.** Ve doğası gereği viral: bir hatim = 30 davet.

### Viral matematiği

| | Değer |
|---|---|
| Hatim başına davet edilen | ~30 kişi (WhatsApp grubu) |
| Linke tıklama | ~%50 |
| Tıklayıp yükleyen | ~%25 |
| **Hatim başına yeni kullanıcı** | **~4** |
| Yeni kullanıcının hatim başlatma oranı | ~%15 |

**K = 4 × 0,15 = 0,6**

K < 1 olduğu için sonsuz büyüme değil, ama **her organik kullanıcı 0,6 kullanıcı daha getiriyor** — yani edinim maliyeti fiilen %60 düşüyor. Ramazan'da hatim başlatma oranı 2-3 katına çıkar; o dönemde K geçici olarak 1'i aşabilir.

### Ne inşa edilmeli

```
Hatim oluştur → 30 cüz otomatik listelenir
             → WhatsApp'a görsel kart + link paylaş
             → Katılan "3. cüzü alıyorum" der
             → Herkes ilerlemeyi canlı görür
             → Biri cüzünü bitirince gruba bildirim
             → Hatim tamamlanınca herkese tebrik + paylaşılabilir kart
```

**Kritik detay:** Katılmak için uygulama indirmek gerekmeli ama **hesap açmak gerekmemeli.** Sürtünme ne kadar azsa dönüşüm o kadar yüksek. Link → App Store → aç → hatim ekranı doğrudan açılıyor (deep link zaten var).

**Efor:** ~1 hafta. Mevcut ortak zikir altyapısının üstüne kuruluyor (`shared_dhikrs` + katkı tablosu neredeyse aynı model).

---

## 3. Ramazan — Yılın Tek En Büyük Penceresi

Ramazan 2027 ≈ **Şubat 2027**. İslami uygulamalarda indirmelerin **%40-50'si** bu bir ayda gerçekleşir. Bir yıllık büyümenin yarısı burada kazanılır veya kaçırılır.

### Takvim

| Ne zaman | İş |
|---|---|
| **Kasım 2026** | Ramazan özellikleri geliştirme başlar · sponsorluk satışı başlar |
| **Aralık 2026** | Mukabele/hatim grupları hazır · imsakiye sayfaları yayında |
| **Ocak 2027** | ASO güncellemesi (Ramazan kelimeleri) · basın/mikrofon çalışması |
| **~10 Şubat 2027** | Ramazan başlangıcı — her şey hazır olmalı |
| Ramazan boyunca | Günlük bildirim ritmi, hatim kampanyaları |

### Ramazan'a özel kancalar

1. **İmsakiye** — TR'de Ramazan'ın en çok aranan kelimesi. 81 il için web sayfası + uygulama içi paylaşılabilir görsel imsakiye
2. **İftara geri sayım Live Activity** — kilit ekranında canlı sayaç. Rakiplerde nadir, ekran görüntüsü paylaşılası
3. **Mukabele grupları** — 30 gün, günde bir cüz, grupla birlikte
4. **Sahur alarmı** — vakte göre otomatik
5. **Ramazan günlüğü** — 30 günlük oruç/teravih/hatim takibi, sonunda paylaşılabilir özet kart

> Ramazan sonunda "30 günlük Ramazan karnem" paylaşım kartı — Instagram/WhatsApp durumunda dolaşır, bir sonraki yılın tohumunu atar.

---

## 4. Kandil Geceleri — Yılda 5 Ücretsiz Dalga

Regaib, Miraç, Berat, Kadir, Mevlid. Her biri Türkiye'de milyonlarca insanın mesajlaştığı gece.

**Mekanizma:** Kandil sabahı push → uygulama içinde o geceye özel dua/ibadet programı → **paylaşılabilir kandil kartı** (kişiselleştirilmiş, "Ümmet" filigranlı).

Türkiye'de kandil mesajı göndermek neredeyse zorunlu bir sosyal ritüel — insanlar zaten görsel arıyor. Google'da "kandil mesajları" aramaları o gün patlıyor. Bu görselleri biz üretirsek her paylaşım bir reklam olur.

**Efor:** 3-4 gün. Hicri takvim verisi zaten uygulamada var (`src/utils/hijriCalendar.ts`).

---

## 5. ASO — En Ucuz Kanal

App Store araması, bu kategoride indirmelerin en büyük kaynağı ve **bedava**.

Mevcut ad: **"Ümmet — İslami Yaşam"**. Hacimli tek kelime yok.

| Alan | Öneri |
|---|---|
| Ad (30) | `Ümmet: Namaz Vakti & Kuran` |
| Altyazı (30) | `Ezan, Kıble, Dua, Tesbih` |
| Anahtar kelime (100) | `ezan,kible,meal,zikir,tesbih,kaza,oruc,ramazan,imsakiye,hicri,cami,hatim,zekat,mukabele` |

Ek işler: ekran görüntülerine fayda başlığı ekle · 15-30 sn önizleme videosu · **yorum isteme akışı** (`expo-store-review`, pozitif bir andan sonra — rozet kazanma, 7 günlük streak).

Puan ve yorum sayısı ASO sıralamasının en büyük girdisi. Şu an yorum istemiyoruz bile.

**Ramazan ASO:** Ocak'ta altyazıyı `Ramazan İmsakiye & İftar` yapın, Ramazan bitince geri alın.

---

## 6. Play Store — Tek Hamlede Pazarın 4 Katı

Türkiye'de Android payı **%75-80**. Şu anda kullanılabilir pazarın dörtte üçü kapalı.

Altyapı hazır (`app.json` Android tarafı eksiksiz). Tek gerçek geliştirme işi: ezan bildirimleri için Android notification channel.

**Bu listedeki en yüksek getiri/efor oranına sahip madde.** Hatim gruplarından bile önce gelir — çünkü hatim grubunun viral etkisi de dört kat büyür.

---

## 7. Web SEO — Yavaş Ama Bileşik Getirili

`ummetapp.com` üzerinde:

| Sayfa tipi | Hedef |
|---|---|
| `/namaz-vakitleri/{81 il}` | "istanbul namaz vakitleri" — TR'nin en hacimli dini araması |
| `/imsakiye/{il}` (Ramazan) | Aralık'ta yayına |
| Çalışan araçlar | zekat, tesbih, kıble, hicri takvim |
| Blog | "kaza namazı nasıl kılınır", "hatim nasıl indirilir", "zekat nisabı 2027" |

Mantık: Google'dan gelir → aracı web'de kullanır → değeri görür → "telefonunda hep yanında olsun" ile indirir.

Şehir sayfaları **yayında** (Laravel). Ramazan'dan önce 3-6 ay indekslenmesi gerekiyor — **şimdi kurulmuş olması iyi**.

---

## 8. Topluluk — Ölçeklemesi Zor, Etkisi Derin

- **Camiler ve dernekler:** QR kodlu küçük afiş — "Bu caminin vakitlerini telefonunda takip et". Bir cami = yüzlerce cemaat
- **Yurt dışı Türk dernekleri:** Almanya, Hollanda, Fransa. Diaspora namaz vakti uygulamasına daha muhtaç (yerel vakit bulmak zor) ve ödeme gücü yüksek
- **İlahiyat/İHL öğrencileri:** erken benimseyen ve yayan grup
- **Dini içerik üreticileri:** takipçisi 50-200k olan hesaplar. Mega influencer'a gerek yok; bu kitlede mikro hesaplar daha güvenilir

---

## 9. Sıralama — Hangisi Önce

| # | İş | Efor | Etki | Ne zaman |
|---|---|---|---|---|
| 1 | **ASO güncellemesi** | 1 gün | 🔥🔥🔥 | Hemen |
| 2 | **Yorum isteme akışı** | 2 saat | 🔥🔥 | Hemen |
| 3 | **Play Store yayını** | 1-2 hafta | 🔥🔥🔥 | Ağustos |
| 4 | **Hatim grupları** | 1 hafta | 🔥🔥🔥 | Eylül |
| 5 | Paylaşım kartları (rozet, streak, kandil) | 3 gün | 🔥🔥 | Eylül |
| 6 | Kandil kampanya mekanizması | 3-4 gün | 🔥🔥 | Ekim |
| 7 | Web SEO derinleştirme | sürekli | 🔥🔥 | Sürekli |
| 8 | **Ramazan paketi** | 3-4 hafta | 🔥🔥🔥 | Kasım-Aralık |
| 9 | Cami/dernek programı | sürekli | 🔥 | Kasım |
| 10 | i18n (EN/AR/ID) | 2-3 hafta | 🔥🔥 | Ramazan sonrası |

---

## 10. Neyi Yapmayın

- ❌ **Ödüllü davet ("arkadaşını getir, Pro kazan")** — dini bağlamda ucuz durur, ibadeti ödüle bağlamak tepki çeker
- ❌ **Rehber erişimi isteyip toplu davet** — güven kaybı, App Store riski
- ❌ **Agresif bildirim** — "3 gündür namaz kılmadın!" gibi suçlayıcı dil. Kaldırılma sebebi olur
- ❌ **Sahte sosyal kanıt** — eski sitede zaten vardı, hukuki risk (`04-LANDING-PAGE.md` §2.1)
- ❌ **Ramazan'da ücretli reklam yakmak** — o dönem CPM tavan yapar; organik hazırlık çok daha verimli
- ❌ **Yarışma/çekiliş** — dini uygulamada kumar çağrışımı yapar

---

## 11. Ölçüm

Büyüme işlerinin çalışıp çalışmadığını görmek için eklenecek olaylar:

```
hatim_created (cuz_sayisi)        hatim_joined (kaynak: link|kod)
hatim_completed                    share_opened (tur: hatim|rozet|streak|kandil)
share_completed (kanal)            invite_link_clicked
deeplink_opened (tur)              review_prompt_shown / review_prompt_accepted
```

**Ana metrik:** *Bir hatim kaç yeni kurulum getiriyor?* Bu sayı K faktörünün ta kendisi. 4'ün üstündeyse mekanizma çalışıyor, 2'nin altındaysa paylaşım akışında sürtünme var.

İkincil: davet → kurulum dönüşümü · yeni kullanıcının 7 gün içinde hatim başlatma oranı · kandil günü kurulum artışı.

Bunlar `03-VERI-VE-OLCUM.md` §3.3'teki listeye eklenmeli.

---

## 12. Gerçekçi Beklenti

Rakam vermeden önce: **mevcut kullanıcı sayısını bilmiyoruz** (App Store Connect verisi henüz gelmedi). Aşağıdakiler çarpan olarak okunmalı, mutlak sayı olarak değil.

| Hamle | Kullanıcı tabanına etkisi |
|---|---|
| ASO düzeltmesi | +%30-60 organik indirme |
| Play Store | **2-4x** toplam kullanıcı |
| Hatim grupları | Her organik kullanıcı +0,6 kullanıcı |
| Ramazan paketi | O ay 3-5x indirme |
| Web SEO (6 ay sonra) | Aylık binlerce ek ziyaretçi, %2-5 kurulum |

**Birleşik senaryo:** ASO + Play Store + hatim grupları + Ramazan hazırlığı sırayla yapılırsa, Şubat 2027'de kullanıcı tabanının bugünün **5-10 katı** olması makul bir hedef.

Bunun ön koşulu tek bir şey: **Ramazan'a hazır girmek.** Şubat'ta panikleyerek özellik yetiştirmek işe yaramaz; Aralık'ta hazır olmak gerekiyor.

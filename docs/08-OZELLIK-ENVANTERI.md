# Ümmet — Özellik Envanteri ve Gelir Eşlemesi

> Hazırlanma tarihi: 26 Temmuz 2026
> Kaynak: kod tabanının tamamı okunarak çıkarıldı. Tahmin yok — her satır bir dosyaya dayanıyor.
> **Uyarı:** Gelir sütunu, `07-GELIR-YOL-HARITASI.md` §7'deki "10.000 MAU başına" varsayımına dayanır. Gerçek MAU hâlâ bilinmiyor.

---

## 1. Şu Anda VAR Olanlar

### ✅ Çalışıyor

| Özellik | Nerede | Gelir potansiyeli |
|---|---|---|
| Namaz vakitleri (13 hesaplama yöntemi) | `src/services/prayerTimes.ts` | **Ücretsiz kalmalı** — edinim motoru |
| Ezan sesleri, 5 vakit 5 ayrı makam | `assets/sounds/`, `audioService.ts` | Ücretsiz · **ek sesler Pro** 💰 |
| Ezan bildirimleri (custom sound) | `ezanNotification.ts` | Ücretsiz kalmalı |
| Kıble pusulası | `app/qibla.tsx` | Ücretsiz kalmalı |
| Kuran mushafı (604 sayfa) + Diyanet meali | `app/quran-reader.tsx` | Ücretsiz kalmalı |
| Ayet sesli okuma (Alafasy) | `audioService.ts` | Ücretsiz · **çoklu kâri Pro** 💰 |
| Sure / cüz / favori listesi | `app/(tabs)/quran.tsx` | Ücretsiz |
| Okuma teması (5) + Arapça font (3) | `appStore.ts` | Ücretsiz · **ek paketler Pro** 💰 |
| Dua kitabı (100+ kategorize) | `app/duas.tsx` | Ücretsiz |
| Hadis koleksiyonu | `app/hadis.tsx` | Ücretsiz |
| Delâil-ül Hayrât | `app/delailul-hayrat.tsx` | Ücretsiz · **tam metin + hizb planı Pro** 💰 |
| Dijital tesbih | `app/(tabs)/dhikr.tsx` | Ücretsiz |
| **Kaza namazı takibi** (6 vakit) | `app/(tabs)/tracker.tsx` | **En güçlü Pro adayı** 💰💰 |
| Kaza orucu + adak takibi | `app/(tabs)/tracker.tsx` | Pro paketine dahil 💰 |
| Hıfz (ezber) planı | `app/hifz.tsx` | Ücretsiz · gelişmiş mod Pro 💰 |
| Hicri takvim + kandiller | `app/hijri-calendar.tsx` | Ücretsiz |
| Ramazan Hub (iftar/sahur/hatim) | `app/ramazan-hub.tsx` | Ücretsiz · **sponsorluk alanı** 💰💰 |
| Zekat / fitre / kefaret hesaplayıcı | `app/calculator.tsx` | Ücretsiz — SEO değeri yüksek |
| Ruh hâline göre ayet önerisi | `app/(tabs)/index.tsx` | Ücretsiz — ayırt edici |
| Günün ayeti | `src/data/dailyVerses.ts` | Ücretsiz · sponsorluk alanı 💰 |
| iOS ana ekran widget'ı | `targets/widget/` | Ücretsiz · **çeşitleri Pro** 💰 |
| OTA güncelleme | `expo-updates` | — |

### ⚠️ Var ama bozuk / güvenilmez

| Özellik | Sorun | Etki |
|---|---|---|
| **Günlük/haftalık takip** | `appStore.ts:64` UTC hatası | 00:00–03:00 arası kayıtlar önceki güne yazılıyor |
| **Streak sayacı** | Aynı hata | En sadık kullanıcı serisini kaybediyor |
| **Rozetler** | Aynı hata | Yanlış zamanda tetikleniyor |
| **İbadet analitiği** | Aynı hata | Gösterdiği veri yanlış |
| **Kuran çevrimdışı** | `quran-reader.tsx:73-118` — runtime indirme, hata sessiz | İnternetsiz boş ekran |
| Yakındaki camiler | Public Overpass endpoint, rate-limit'li | Ölçekte sessizce durur |
| Zorunlu güncelleme | Remote config'e bağlı → o da ölü | Çalışmıyor |

### ❌ Var ama tamamen ölü (Supabase silindi)

| Özellik | Durum |
|---|---|
| **Ortak zikir** | Oluşturma, katılma, sayaç — hepsi ölü. **Kullanıcının gördüğü arıza** |
| Duyurular | Yüklenmiyor |
| Remote config | Güncellenmiyor |
| Push bildirim kaydı | Yeni kullanıcıya bildirim gönderilemiyor |
| Analytics | Hiç veri kaydedilmiyor |

> ✅ Bunların tamamı için Laravel API yazıldı ve yerelde çalışıyor (`web/README.md`). Kalan iş: mobil tarafı bu API'ye çevirmek + yeni App Store sürümü.

---

## 2. Şu Anda OLMAYANLAR

### 💰💰 Doğrudan para kazandıracaklar

| Eksik | Neden para kazandırır | Efor |
|---|---|---|
| **Ödeme altyapısı (RevenueCat)** | Gelirin ön koşulu. Bu olmadan diğer hiçbir madde para etmez | 3-5 gün |
| **"Destek Ol" IAP** | En hızlı ilk gelir — özellik kilitleme gerekmez | +2 gün |
| **Hesap + bulut yedek** | Telefon değişince yıllarca biriken kaza borcu kayboluyor. **Ödemeye en yatkın acı noktası** | 3-4 hafta |
| **Paywall + Pro paketi** | Asıl tekrarlayan gelir | 1 hafta |
| **Live Activity / Kilit ekranı** | Vakte geri sayım kilit ekranında. Rakiplerde nadir, yüksek algılanan değer | 1-2 hafta |
| **Ek ezan sesleri kütüphanesi** | Hem 43 MB'lık bundle sorununu çözer hem satılır | 3-4 gün |
| **Çoklu kâri sesi** | Klasik Pro kalemi | 3-4 gün |
| Widget çeşitleri | Şu an tek widget var | 1 hafta |

### 📈 Dolaylı — kitleyi büyütür, geliri çarpar

| Eksik | Etki | Efor |
|---|---|---|
| **Play Store yayını** | TR'de Android %75-80. Kitleyi 2-4x büyütür | 1-2 hafta |
| **ASO düzeltmesi** | Ad "Ümmet — İslami Yaşam", hacimli kelime yok | 1 gün |
| **Yorum isteme akışı** | `expo-store-review` yok. Puan = ASO sıralamasının en büyük girdisi | 2 saat |
| **i18n (EN/AR/ID)** | Pazar tavanını 10x açar | 2-3 hafta |
| **Hatim grupları** | 30 kişi, her biri bir cüz. Ramazan'da viral potansiyeli çok yüksek | 1 hafta |
| Ortak zikir paylaşım kartı | Elimizdeki tek viral döngü, teşvik edilmiyor | 2 gün |
| Streak/kaza hatırlatma bildirimleri | Retention → dönüşüm | 3 gün |

### 🔧 Altyapı — para kazandırmaz ama kaybettirir

| Eksik | Risk |
|---|---|
| **Crash izleme (Sentry)** | Kaç kullanıcının nerede çöktüğünü bilmiyoruz |
| **Test yok** | Ödeme akışı test edilmeden canlıya gidemez |
| Açık tema | Uygulama yalnızca koyu; `theme.ts` var ama kullanılmıyor |
| iPad tasarımı | `supportsTablet: true` ama arayüz telefona göre |

### 🤔 Rakiplerde var, bizde yok — değerlendirilmeli

Tefsir · tecvid/Arapça öğrenme · namaz kılınış videoları · cami cemaat saatleri · Apple Watch · sadaka/bağış akışı · esmaül hüsna · rüya tabiri

Bunların çoğu **içerik üretimi** gerektiriyor ve doğrudan gelir getirmiyor. Önceliğe alınmamalı.

---

## 3. Para Kazandıracakların Sıralaması

Gelir/efor oranına göre. Üstten aşağı yapılmalı.

| # | İş | Süre | İlk gelire etki |
|---|---|---|---|
| 1 | **ASO düzeltmesi** | 1 gün | Dolaylı, büyük — bedava indirme |
| 2 | **Small Business Program kaydı** | 10 dk | Komisyon %30 → %15 |
| 3 | **RevenueCat + "Destek Ol"** | 1 hafta | **İlk gerçek gelir** |
| 4 | **Zaman dilimi düzeltmesi** | 2 saat | Pro'nun motoru; bozukken satılamaz |
| 5 | **Yorum isteme akışı** | 2 saat | ASO sıralaması |
| 6 | **Pro v1 + paywall** | 3 hafta | Asıl tekrarlayan gelir |
| 7 | **Play Store** | 1-2 hafta | Kitle 2-4x |
| 8 | **Bulut yedek** | 3-4 hafta | Pro'nun en güçlü kalemi |
| 9 | **Ramazan sponsorluğu** | Satış Kasım'da | Tek seferlik ₺150-500k |
| 10 | **i18n** | 2-3 hafta | Global fiyatlandırma |

### Para kazandırmayanlar (ama yapılması gerekenler)

Supabase → Laravel API geçişi · Landing · Admin panel · Sentry · testler.

Bunlar **gelir üretmez ama gelirin önünü açar**: API geçişi olmadan uygulama arızalı kalır, ölçüm olmadan paywall optimize edilemez, Sentry olmadan ödeme hataları görülmez.

---

## 4. Ücretsiz / Pro Sınırı — Kesin Karar

**Değişmez ilke: ibadetin kendisi asla paywall'ın arkasına konmaz.**

### Her zaman ücretsiz
Namaz vakitleri · ezan bildirimleri (5 makam dahil) · kıble · Kuran + meal (tam mushaf) · temel dua · hadis · tesbih · ortak zikir · zekat/fitre/kefaret · hicri takvim · yakındaki camiler

### Ümmet Pro
| Kalem | Ücretsizde |
|---|---|
| Bulut yedek & çoklu cihaz senkron | yok |
| Sınırsız kaza takibi | 2 vakit türü |
| Tam analitik geçmişi | son 7 gün |
| Ek ezan sesleri & müezzinler | temel 5 makam |
| Çoklu kâri + ayet tekrar modu | Alafasy |
| Gelişmiş widget + Live Activity | temel widget |
| Delâil-ül Hayrât tam metin + hizb planı | özet |
| Tema & font paketleri | 5 tema, 3 font |
| Rozet paylaşım kartları | yok |

**İlk sürüm için hesap sistemi gerektirmeyen minimum set:** sınırsız kaza + analitik geçmişi + tema/font paketleri + ek ezan sesleri + Delâil tam metin. 2-3 haftada çıkar. Bulut senkron ikinci dalgada gelir, o zaman fiyat artışı da haklı çıkar.

---

## 5. Bir Uyarı

Bu dokümandaki gelir sıralaması **kullanıcı sayısı bilinmeden** yapıldı. 5.000 MAU'da abonelik kurmanın anlamı sınırlı — önce büyüme gerekir. 100.000 MAU'da ise her geciken ay ciddi kayıp.

App Store Connect verisi geldiğinde (bkz. `03-VERI-VE-OLCUM.md`) bu sıralama değişebilir. En olası değişiklik: MAU düşükse 1-2-5-7 (ASO, Play Store, yorumlar) öne çıkar, 3-6-8 (ödeme, Pro, senkron) geri gider.

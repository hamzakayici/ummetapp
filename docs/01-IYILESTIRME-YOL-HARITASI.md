# Ümmet — İyileştirme Yol Haritası

> Hazırlanma tarihi: 26 Temmuz 2026
> Sıralama getiri/efor oranına göre. Üstteki maddeler alttakilerden önce yapılmalı.

---

## Hızlı Özet

| # | İş | Efor | Etki | Neden şimdi |
|---|---|---|---|---|
| 1 | Play Store yayını | 3-5 gün | 🔥🔥🔥 | TR'de Android %75-80 — kitlenin ¾'ü kapalı |
| 2 | ASO: uygulama adı + altyazı | 1 gün | 🔥🔥🔥 | "Ümmet" kimse aramıyor; "namaz vakitleri" en büyük hacim |
| 3 | Zaman dilimi hatası | 2 saat | 🔥🔥 | Streak/rozet/analitik hepsi bozuk |
| 4 | Kuran offline + hata durumu | 2-3 gün | 🔥🔥 | Özellik bugün offline çalışmıyor, landing'de "çevrimdışı" deniyor |
| 5 | Sentry (crash izleme) | 4 saat | 🔥🔥 | Şu an kaç kişinin çöktüğünü bilmiyoruz |
| 6 | Landing yeniden yapımı | 1 hafta | 🔥🔥 | Monetizasyonun önündeki engel + dönüşüm |
| 7 | RevenueCat + Pro | 3 hafta | 🔥🔥🔥 | Gelir |
| 8 | Hesap + bulut senkron | 3-4 hafta | 🔥🔥 | En güçlü Pro kalemi + retention |
| 9 | i18n (EN/AR/ID) | 2-3 hafta | 🔥🔥 | Pazar tavanını 10x açar |
| 10 | Live Activity / Kilit ekranı | 1-2 hafta | 🔥 | Rakiplerde nadir, yüksek "vay" etkisi |

---

## 1. Play Store Yayını — en yüksek getirili tek iş

`app.json` Android tarafı hazır (`com.ummet.app`, versionCode 2, izinler tanımlı), `android/` klasörü mevcut, EAS yapılandırması var. Eksik olan sadece yayın süreci.

Yapılacaklar:
- Google Play Console hesabı ($25 tek seferlik) + kimlik doğrulama (2-3 gün sürebilir)
- Data Safety formu (analytics ve konum kullanımı beyan edilmeli)
- Store listing: TR + EN metin, ekran görüntüleri (`screenshots/appstore_*.png` yeniden boyutlandırılabilir), özellik grafiği
- Kapalı test → açık test → üretim (Google artık yeni geliştiricilerde 12 testçi/14 gün şartı arayabilir; erken başlayın)
- Android'e özel test: ezan custom sound (Android notification channel gerektirir), widget (Android widget yok — sadece iOS), edge-to-edge

**✅ Yapıldı (26 Tem 2026):** Android bildirim kanalları kuruldu.
- `plugins/withEzanSounds.js` artık `.mp3` dosyalarını `res/raw/`'a da kopyalıyor
- `src/services/notificationChannels.ts` — 5 vakit için makam adlı ayrı kanal + genel + günün ayeti kanalı
- Tüm bildirimlere `channelId` atandı; iOS sesi bildirimden, Android kanaldan alıyor
- Kanal kurulumu uygulama açılışında, bildirim zamanlanmadan önce çalışıyor

**İzin temizliği:** `RECORD_AUDIO` kaldırıldı (uygulama ses kaydetmiyor — Play Store inceleme riski ve kullanıcı güveni sorunu). `POST_NOTIFICATIONS` eklendi — Android 13+ için zorunlu, yoksa bildirimler sessizce engelleniyor.

**Kalan karar:** Kesin zamanlama için `SCHEDULE_EXACT_ALARM`. Android 13+'da kesin alarm izni olmadan bildirimler birkaç dakika gecikebilir. Namaz vakti için bu önemli ama Google bu izni yalnızca alarm/takvim uygulamalarına açıyor; reddedilme riski var. Önce izinsiz yayınlayıp gecikme şikayeti gelirse başvurmak daha güvenli.

---

## 2. ASO — bir günlük iş, indirmeleri katlayabilir

Şu anki App Store adı: **"Ümmet — İslami Yaşam"** (API'den doğrulandı, 21 karakter). 30 karakterlik sınırın 9 karakteri boşta duruyor ve mevcut kelimeler zayıf: "Ümmet" bir marka adı, "İslami Yaşam" ise düşük hacimli bir arama. TR'de asıl hacim **"namaz vakti"**, "ezan", "kuran" kelimelerinde ve bunların hiçbiri adda geçmiyor.

Önerilen:
- **Ad (30 karakter):** `Ümmet: Namaz Vakti & Kuran`
- **Altyazı (30 karakter):** `Ezan, Kıble, Dua, Tesbih`
- **Anahtar kelimeler (100 karakter, virgülle, boşluksuz):**
  `ezan,kible,kuran,meal,dua,zikir,tesbih,kaza,oruc,ramazan,imsakiye,hicri,cami,hatim,zekat`
  (Ad ve altyazıda geçen kelimeleri burada tekrarlamayın — Apple zaten indeksler, karakter israfı olur)

Ek işler:
- Ekran görüntülerine metin katmanı ekleyin. Şu anki `screenshots/appstore_*.png` ham ekran görüntüsü; her birinin üstüne büyük punto fayda başlığı ("Vakti kaçırma", "Kaldığın yerden oku") gelmeli. Dönüşümde ölçülebilir fark yaratır.
- Uygulama önizleme videosu (15-30 sn) ekleyin — yok.
- Yorum isteme akışı: `expo-store-review` ile pozitif bir andan sonra (rozet kazanma, 7 günlük streak) yorum iste. Şu an sadece "Diğer" menüsünde pasif bir link var (`app/(tabs)/more.tsx:79-85`). Puan ve yorum sayısı ASO sıralamasının en büyük girdisi.

---

## 3. Zaman Dilimi Hatası

`src/stores/appStore.ts:64`

```ts
// Şu an — UTC döndürüyor
const getTodayKey = () => new Date().toISOString().split("T")[0];

// Olması gereken — yerel tarih
const getTodayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
```

Aynı hata `app/(tabs)/index.tsx:214` ve `useWeeklyStore.getWeekData()` içinde de var — ortak bir `src/utils/dateKey.ts` yardımcı fonksiyonuna çıkarılmalı ve her yerde o kullanılmalı.

**Geçiş sorunu:** Mevcut kullanıcıların verisi UTC anahtarlarıyla kayıtlı. Düzeltme sonrası bazı kullanıcıların streak'i bir gün kayabilir. Bir kereye mahsus migration yazın: mevcut `dailyCounts` / `trackedDays` anahtarlarını olduğu gibi bırakın, sadece yeni yazımları yerel tarihle yapın ve streak hesabında her iki anahtarı da kontrol eden bir tolerans ekleyin. Veya kabul edilebilirse migration yapmadan geçin — etki tek seferlik ve küçük.

**Test yazın.** Bu, para kazanılacak özelliğin motoru; regresyon çok pahalı.

---

## 4. Kuran Okuyucu — Offline ve Hata Durumu

`app/quran-reader.tsx:56-118`

Üç ayrı sorun:

**a) Sessiz hata.** `catch { setLoading(false) }` → boş ekran. En azından hata mesajı + "Tekrar dene" butonu. 15 dakikalık iş, bugün kullanıcı kaybettiriyor.

**b) Runtime indirme.** Tüm mushaf iki API'den her ilk açılışta indiriliyor. Öneri: **Arapça metni + Diyanet mealini uygulama bundle'ına gömün.** Sıkıştırılmış olarak ~3-5 MB; 43 MB ses varken bu marjinal. Bundle'a gömüldüğünde:
- İlk açılış anında çalışır
- Offline garantisi gerçek olur (landing'deki "çevrimdışı" vaadi doğru hale gelir)
- `api.alquran.cloud` bağımlılığı ve tek nokta arıza riski kalkar
- Ekstra kâri sesleri ve ek mealler ise indirilebilir kalır → Pro özelliği olur

**c) AsyncStorage'da tek dev JSON.** Bundle'a geçilirse bu sorun tamamen ortadan kalkar. Geçilmezse en azından cüz bazında (30 parça) bölünmeli.

---

## 5. Gözlemlenebilirlik

- ✅ **Sentry kuruldu** (27 Tem 2026). `src/services/errorTracking.ts`, config plugin dahil.
  - DSN `app.json > extra.sentryDsn`'e yazılana kadar **hiçbir şey yapmaz** — uygulama normal çalışır
  - Geliştirmede kapalı (`enabled: !__DEV__`) — kota yakmasın, gerçek sinyali gizlemesin
  - **Ekran görüntüsü ve görünüm hiyerarşisi gönderilmiyor.** Bu bir ibadet uygulaması; ekranda kaza borcu, zikir sayacı ve konum var. Hata ayıklama için bunları toplamaya değmez
  - Cihaz kimliği analytics'teki `device_id` ile eşleştirildi — çökme kaydından o cihazın olay geçmişine bakılabilir
  - Bağlanan kritik noktalar: `prayerTimes:fetch`, `prayerTimes:parse`, `ezanNotification:schedule`, `audio:playEzan`, `pushToken:register`, `widget:update`, `quranReader:loadPages`
- **Sessiz `catch {}` blokları:** 50 adet tespit edildi, çekirdek özellikleri etkileyen 7'si Sentry'ye bağlandı. Kalanların çoğu meşru cache geri düşüşü — hepsini göndermek gürültü üretir.
- **`session_end` sorunu** (`src/services/analytics.ts:163`): uygulama kill edilirse oturum kapanmıyor → **ortalama oturum süresi olduğundan uzun görünüyor.** Sunucu tarafında bir cron ile "24 saattir kapanmamış oturumları son event zamanıyla kapat" işi yazılmalı. Sponsorluk satarken bu sayıyı vereceğiz; doğru olmalı.
- **`app_devices` upsert'e çevrilmeli** (`analytics.ts:49-63`): insert-then-update yerine `.upsert(..., { onConflict: 'device_id' })`.

---

## 6. Retention'ı Artıran Ürün İşleri

Bunlar dönüşümden önce gelir — abone olacak kullanıcı önce kalmalı.

**6.1 Hesap sistemi + bulut senkron**
Supabase Auth zaten elimizde (Apple ile Giriş + e-posta). Kaza borcu, hıfz planı, streak, rozet, favoriler senkronlanmalı. Zorunlu kayıt istemeyin — "İsteğe bağlı, verilerin kaybolmasın diye" çerçevesi. Aynı zamanda Pro'nun en güçlü satış kalemi.

**6.2 Ortak zikir'in üstüne gidin — elinizdeki tek viral döngü**
Şu an var ama gizli. Yapılabilecekler:
- Ana ekranda "Ortak zikire katıl" kartı
- WhatsApp'a özel paylaşım kartı (görsel + link) — `react-native-view-shot` zaten projede
- Hedefe ulaşıldığında tüm katılımcılara push (push altyapısı hazır)
- **Hatim grupları**: 30 kişi, her biri bir cüz. Ramazan'da patlama potansiyeli çok yüksek. Mevcut ortak zikir mimarisinin üstüne kurulabilir.

**6.3 Bildirim stratejisi**
Şu an sadece ezan + günün ayeti var. Eklenecekler:
- Streak kırılma uyarısı ("Bugün henüz işaretlemedin, 6 günlük serin var")
- Kaza hatırlatıcısı (haftalık, kişiselleştirilmiş)
- Cuma sabahı Kehf suresi hatırlatması
- Kandil/mübarek gece bildirimleri (hicri takvim verisi zaten var)
Segmentli push altyapısı mevcut — sadece içerik ve tetikleyici yazılacak.

**6.4 Live Activity / Dynamic Island**
Namaz vaktine geri sayım kilit ekranında. Ramazan'da iftara geri sayım. Rakiplerde nadir, çok yüksek algılanan değer, ekran görüntüsü/sosyal medya potansiyeli yüksek. iOS widget altyapısı (`targets/widget/`) zaten kurulu olduğu için maliyeti düşük.

---

## 7. Kod Kalitesi (arka planda, sürekli)

Bunlar aciliyet sırasında değil ama biriktikçe hız kaybettirir:

- **Tema merkezileştirme.** `#D4AF37`, `#0A0E17`, `#8A9BA8` gibi renkler onlarca dosyada string olarak tekrarlanıyor; `src/constants/theme.ts` var ama kullanılmıyor. Açık tema veya rebrand şu an her dosyayı elle düzenlemek demek.
- **NativeWind / inline style karışıklığı.** Bir tarafa karar verin. Öneri: NativeWind'i bırakıp tek bir `theme.ts` + `StyleSheet` düzenine geçmek daha az sürtünme yaratır (zaten kodun çoğu inline style).
- **Sürüm numarası** (`app/(tabs)/more.tsx:212`): hardcoded `v1.0.0`, `app.json` `1.0.1`. `expo-application` zaten var, oradan okuyun.
- **Ölü kod:** `useProStore.togglePro` (satın alma eklenirken tamamen yeniden yazılacak, bkz. `02-MONETIZASYON.md` §5).
- **Test altyapısı yok.** En azından şunlara test: tarih/streak hesapları, namaz vakti hesaplama yardımcıları, entitlement mantığı.
- **`assets/` optimizasyonu:** 4 adet ~1,1 MB PNG (`icon.png`, `adaptive-icon.png`, `favicon.png`, `adaptive-icon-original.png`). Sıkıştırın; `adaptive-icon-original.png` muhtemelen depoda olmamalı.
- **Cami servisi** (`src/services/mosqueService.ts`): public Overpass endpoint'leri rate-limit'li gönüllü altyapı. Kullanıcı arttıkça sessizce çalışmayı bırakır. Sonuçları Supabase'de cache'leyin veya ücretli bir sağlayıcıya geçin.

---

## 8. 90 Günlük Öneri Takvim

**Hafta 1-2**
Play Console kaydı başlat · ASO güncellemesi · zaman dilimi fix · Sentry · sürüm numarası fix · landing kopyası düzeltmesi (yasal risk: sahte yorumlar)

**Hafta 3-4**
Landing yeniden yapımı · Kuran bundle'a gömme + hata durumu · Android notification channel · Play Store kapalı test

**Hafta 5-7**
RevenueCat + Pro v1 · paywall + tetikleyiciler · App Review · Play Store üretim yayını

**Hafta 8-12**
Hesap + bulut senkron · ortak zikir/hatim grubu büyütmesi · bildirim stratejisi · paywall A/B testleri · i18n altyapısı başlangıcı

**Paralel, sürekli**
Metrik takibi (`03-VERI-VE-OLCUM.md`) · App Store yorumlarına cevap · Ramazan 2027 sponsorluk hazırlığı (Kasım'dan itibaren)

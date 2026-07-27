# Ümmet — Backend API Referansı

> Hazırlanma tarihi: 26 Temmuz 2026
> Uygulama: `web/` (Laravel 13.22 + Filament v5.7, PHP 8.3, MySQL)
> Taban adres: `https://ummetapp.com/api/v1` · yerel: `http://localhost:8000/api/v1`

Silinen Supabase backend'inin yerini alır. Mobil uygulamada `app.json > expo.extra.apiBaseUrl` ile ayarlanır.

---

## 1. Genel Kurallar

- Tüm yanıtlar JSON. Liste/nesne dönenler `{"data": ...}` zarfı içinde.
- Sürümleme yolda: `/api/v1`. Kırıcı değişiklikte `/v2` açılır, eski istemciler çalışmaya devam eder.
- Kimlik doğrulama yok — cihaz kimliği (`device_id`) istemci tarafında üretilen anonim bir dizedir. Kişisel veri taşımaz.
- Hatalar: doğrulama `422`, bulunamadı `404`, kapalı servis `503`, hız sınırı `429`.

### Hız sınırları

**Kimlik doğrulama yok** — bilinçli bir tercih: uygulama hesap istemiyor, `device_id`
istemcide üretilen anonim bir dize. Bunun bedeli her ucun kötüye kullanıma açık olması.
Bu yüzden **istisnasız hepsinde** hız sınırı var.

| Uç grubu | Sınır | Gerekçe |
|---|---|---|
| Analytics | 120/dk | Batch geldiği için yüksek |
| Ortak zikir okuma | 90/dk | Mobil 4 sn'de bir çağırıyor (~15/dk normal) |
| Ortak zikir yazma | 60/dk | |
| Okuma (duyuru, ayar, online) | 60/dk | 5 dk cache'li ama cache ıskası CPU kotasını yakabilir |
| Push token | 20/dk | |
| **Açılma sayaçları** | 20/dk **+ cihaz başına tekrar koruması** | Aşağıya bakın |
| RevenueCat webhook | yok | Teslimat garantisi için tekrar deniyor; 429 dönersek olay kaybolur. Koruma `Authorization` başlığında |

### Açılma sayaçlarında tekrar koruması

`POST /announcements/{id}/opened` ve `/push-notifications/{id}/opened` gövdede
`device_id` bekliyor ve **cihaz başına yalnızca bir kez** sayıyor
(duyuru: gün sonuna kadar, push: 30 gün). Tekrar gelirse `{"ok":true,"duplicate":true}`.

Neden: bu sayılar panelde "açılma oranı" olarak gösteriliyor ve ileride sponsorluk
satarken kullanılacak. Uygulamayı gün içinde defalarca açan kullanıcı sayacı şişirir,
oran %100'ü aşar ve veri değersizleşir.

---

## 2. Yapılandırma ve İçerik

### `GET /announcements`
Yayında olan duyurular. 5 dk cache.

```json
{ "data": [ { "id": 1, "title": "...", "content": "...", "type": "update", "published_at": "2026-07-26T15:22:56Z" } ] }
```
`type`: `info` · `warning` · `update`

### `GET /settings`
Remote config — anahtar/değer. 5 dk cache.

```json
{ "data": { "min_supported_version": "1.0.0", "latest_version": "1.0.1", "force_update": "false" } }
```

Tanımlı anahtarlar panelden yönetilir (**İçerik → Uygulama Ayarları**):

| Anahtar | Ne yapar |
|---|---|
| `min_supported_version` | Altındaki sürümlere zorunlu güncelleme ekranı |
| `latest_version` | App Store'daki güncel sürüm |
| `force_update` | Zorunlu güncelleme anahtarı |
| `ramadan_hub_enabled` | Ramazan Hub görünürlüğü |
| `support_url` | Destek bağlantısı |

### `POST /announcements/{id}/opened`
Duyuru görüntülendi. Panelde açılma sayacını artırır.

### `GET /stats/online`
Son 5 dakikada aktif cihaz sayısı. Tesbih ekranındaki "zikir halkası" göstergesi. 1 dk cache, minimum 1 döner.

```json
{ "data": { "online": 42 } }
```

---

## 3. Analytics

### `POST /analytics/events`
Olay batch'i. En fazla **50** olay.

```json
{ "events": [ { "name": "screen_view", "device_id": "dev_x", "session_id": "sess_y",
                "platform": "ios", "app_version": "1.0.1",
                "pathname": "/(tabs)/index", "props": {}, "ts": "2026-07-26T15:00:00Z" } ] }
```
→ `{ "ok": true, "accepted": 1 }`

`API_INGEST_ENABLED=false` ise `503` döner — yük altında toplama kapatılabilir.

### `POST /analytics/device`
Cihaz upsert. `first_seen_at` korunur, `last_seen_at` güncellenir.

### `POST /analytics/session/start`
`{ session_id, device_id, platform, app_version }`

### `POST /analytics/session/end`
`{ session_id }` — **süreyi sunucu hesaplar.**

> Eski mimaride süreyi istemci gönderiyordu; uygulama kill edilirse oturum hiç kapanmıyor ve ortalama süre olduğundan uzun görünüyordu. Ayrıca saatlik bir cron 24 saattir açık kalan oturumları son olay zamanıyla kapatır.

### Toplanan olaylar

`app_open` · `session_start` · `session_end` · `screen_view` · `error`

Monetizasyon için eklenecekler `03-VERI-VE-OLCUM.md` §3.3'te.

---

## 4. Push Bildirimleri

### `POST /push-tokens`
```json
{ "expo_push_token": "ExponentPushToken[...]", "device_id": "dev_x", "platform": "ios", "app_version": "1.0.1" }
```
Token `ExponentPushToken` veya `ExpoPushToken` ile başlamalı, yoksa `422`.

### `POST /push-notifications/{id}/opened`
Bildirime tıklandı. Açılma oranı metriği.

### Segmentler
Panelden gönderirken seçilir:

| Segment | Kim |
|---|---|
| `all` | Tüm aktif token'lar |
| `active_7d` | Son 7 günde uygulamayı açanlar |
| `inactive_14d` | 14 gündür açmayanlar (geri kazanım) |
| `ios` / `android` | Platform |

### ⚠️ Güvenlik bayrağı

`config/ummet.php` → `push.enabled` (`.env`: `PUSH_ENABLED`)

- `false` (yerel varsayılan): yalnızca `PUSH_TEST_TOKENS` listesindekilere gider, gerisi loglanıp atlanır. Bildirim `draft` kalır, tekrar gönderilebilir.
- `true`: **gerçek kullanıcılara gider, geri alınamaz.**

Yerelde asla `true` yapmayın.

---

## 5. Ortak Zikir

Supabase Realtime yerine **polling**: paylaşımlı hosting kalıcı WebSocket süreci tutamaz.

### `POST /shared-dhikrs`
```json
{ "title": "Cuma Hatmi", "preset_name": "Salavat", "target_count": 10000, "device_id": "dev_x" }
```
→ `201` + `{ "data": { "id": "uuid", "share_code": "XX9LBK", "current_count": 0, "progress": 0, ... } }`

Paylaşım kodu 6 karakter, karıştırılabilir harfler (`0/O`, `1/I`) çıkarılmıştır — elle yazılabilir.

### `GET /shared-dhikrs/{id|kod}`
UUID veya paylaşım koduyla okur. Mobil taraf ekran açıkken **4 saniyede bir** çağırır.

### `POST /shared-dhikrs/{id}/increment`
```json
{ "amount": 100, "device_id": "dev_x" }
```

Atomik `UPDATE ... SET current_count = current_count + N`. Eşzamanlı 3 cihazla test edildi: 3×100 → 300, kayıp yok.

Cihaz başına katkı `shared_dhikr_contributions` tablosunda tutulur — "senin katkın" göstergesi sunucudan doğrulanabilir.

---

## 6. Zamanlanmış Görevler

cPanel'de tek cron satırı hepsini çalıştırır:

```
* * * * * cd /home/kullanici/ummet-web && php artisan schedule:run >> /dev/null 2>&1
```

| Görev | Sıklık | Ne yapar |
|---|---|---|
| `queue:work --stop-when-empty` | dakikada | Push kuyruğunu boşaltır (daemon yerine) |
| Oturum kapatma | saatlik | 24 saattir açık oturumları son olay zamanıyla kapatır |
| Analitik cache tazeleme | 5 dk | Dashboard widget'ı |

---

## 7. Yerel Geliştirme

```bash
export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"
cd web && php artisan serve      # http://localhost:8000
```

XAMPP'tan sadece MySQL çalışır. Panel: `/admin`.

**Fiziksel cihazdan test:** `localhost` çalışmaz. `app.json > extra.apiBaseUrl` değerini makinenizin LAN adresine çevirin (`http://192.168.1.x:8000/api/v1`).

---

## 8. Yapılacaklar

- [ ] Uygulama sürümüne göre uç davranışı (eski istemci uyumluluğu)
- [ ] `/analytics/events` için gzip kabul
- [ ] Push receipt kontrolü (Expo `getReceipts`) — şu an yalnızca ticket hataları işleniyor
- [ ] RevenueCat webhook alıcısı (Pro çıkınca)
- [ ] Ortak zikir için ETag/304 (polling trafiğini azaltır)

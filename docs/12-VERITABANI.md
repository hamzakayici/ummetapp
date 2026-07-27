# Ümmet — Veritabanı Şeması

> Hazırlanma tarihi: 26 Temmuz 2026
> MySQL / MariaDB · veritabanı adı `ummet` · migration'lar `web/database/migrations/`

Silinen Supabase Postgres şemasının MySQL karşılığı. Tablolar `php artisan migrate` ile oluşturulur.

---

## 1. İçerik ve Yapılandırma

### `announcements` — uygulama içi duyurular
| Kolon | Tip | Not |
|---|---|---|
| `id` | bigint PK | |
| `title` | string | |
| `content` | text null | |
| `type` | enum | `info` · `warning` · `update` |
| `is_active` | bool | Panelden aç/kapa |
| `open_count` | uint | Görüntülenme — açılma oranı metriği |
| `published_at` | timestamp null | Gelecek tarih = zamanlanmış duyuru |

İndeks: `(is_active, published_at)`
Mobil yalnızca `is_active = true` **ve** `published_at <= now()` olanları görür (`Announcement::visible()`).

### `app_settings` — remote config
| Kolon | Tip |
|---|---|
| `key` | string **unique** |
| `value` | text null |
| `description` | string null — panelde ne işe yaradığını gösterir |

Uygulama açılışta hepsini çeker, 10 dk cache'ler. Kod dağıtmadan davranış değiştirmenin tek yolu.

---

## 2. Push Bildirimleri

### `push_tokens`
| Kolon | Tip | Not |
|---|---|---|
| `expo_push_token` | string **unique** | `ExponentPushToken[...]` |
| `device_id` | string null, indeksli | `app_devices` ile eşleşir (FK değil) |
| `platform` | enum | `ios` · `android` · `web` · `other` |
| `is_active` | bool | Expo `DeviceNotRegistered` derse otomatik `false` |

### `push_notifications`
| Kolon | Tip | Not |
|---|---|---|
| `title`, `body` | string / text | |
| `route` | string null | Tıklayınca açılacak ekran |
| `segment` | string | `all` · `active_7d` · `inactive_14d` · `ios` · `android` |
| `status` | enum | `draft` · `queued` · `sending` · `sent` · `failed` |
| `recipient_count` | uint | Segmentte kaç cihaz vardı |
| `sent_count` | uint | Expo kaç tanesini kabul etti |
| `open_count` | uint | Kaç kişi tıkladı |
| `sent_at` | timestamp null | |

İndeks: `(status, sent_at)` · Açılma oranı `open_count / sent_count` (model accessor).

---

## 3. Analytics

Yazma ağırlıklı. Uygulama batch halinde gönderir.

### `app_devices`
| Kolon | Not |
|---|---|
| `device_id` | string **unique** — istemcide üretilen anonim kimlik |
| `platform`, `app_version` | |
| `first_seen_at` | **Upsert'te korunur** — kohort analizinin temeli |
| `last_seen_at` | indeksli — segmentleme burayı kullanır |

### `app_sessions`
| Kolon | Not |
|---|---|
| `session_id` | string **unique** |
| `device_id` | indeksli |
| `started_at` | indeksli |
| `ended_at`, `duration_ms` | **Sunucu hesaplar.** Kill edilen oturumları saatlik cron kapatır |

### `app_events`
| Kolon | Not |
|---|---|
| `name` | indeksli — `app_open`, `screen_view`, `session_start/end`, `error` |
| `device_id`, `session_id` | indeksli |
| `pathname` | Hangi ekran |
| `props` | JSON null — olaya özel veri |
| `ts` | indeksli + `(ts, name)` bileşik indeks |

> `(ts, name)` bileşik indeksi dashboard'un "son 24 saatte olay adına göre grupla" sorgusu için. Bu tablo en hızlı büyüyen tablo olacak; ileride aylık partition veya arşivleme gerekebilir.

---

## 4. Ortak Zikir

### `shared_dhikrs`
| Kolon | Tip | Not |
|---|---|---|
| `id` | **UUID** PK | Deep link'te görünüyor, tahmin edilebilir olmasın |
| `title`, `preset_name` | string | |
| `target_count`, `current_count` | ubigint | |
| `share_code` | string(12) **unique** | 6 karakter, `0/O` `1/I` çıkarılmış — elle yazılabilir |
| `creator_device_id` | string null | |
| `expires_at` | timestamp null | |

### `shared_dhikr_contributions`
| Kolon | Not |
|---|---|
| `shared_dhikr_id` | UUID, FK → `shared_dhikrs` **cascade delete** |
| `device_id` | string |
| `amount` | ubigint |

Unique: `(shared_dhikr_id, device_id)` — cihaz başına tek satır, artırma `amount + N` ile.

**Neden ayrı tablo:** "senin katkın" göstergesini sunucudan doğrulayabilmek ve kötüye kullanımı sınırlayabilmek için. Sayaç artırma atomik `UPDATE` — eşzamanlı yazmada kayıp yok.

> FK yüzünden `shared_dhikrs` doğrudan `truncate` edilemez; önce katkılar silinmeli.

---

## 5. Web Sitesi

### `subscribers`
`email` unique · `source` (hangi sayfadan geldi) · `unsubscribed_at`

### `contact_messages`
`name` · `email` · `subject` · `message` · `is_read`

---

## 6. Laravel Sistem Tabloları

`users` (Filament girişi) · `sessions` · `cache` · `jobs` · `failed_jobs` · `migrations`

Kuyruk sürücüsü `database` — paylaşımlı hostingde Redis yok, push gönderimi `jobs` tablosundan cron ile işlenir.

---

## 7. Kurulum

```bash
export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"
cd web
php artisan migrate                                   # şema
php artisan db:seed --class=UmmetSeeder               # örnek duyuru + 5 config anahtarı
php artisan make:filament-user                        # panel kullanıcısı
```

Sıfırlamak için: `php artisan migrate:fresh --seed --seeder=UmmetSeeder`

**Yerel bağlantı:** `127.0.0.1:3306`, veritabanı `ummet`, kullanıcı `root`, parola yok (XAMPP varsayılanı). Üretimde asla bu yapılandırma kullanılmaz.

---

## 8. Karar Notları

**Neden `device_id` foreign key değil?**
Analytics olayları cihaz kaydından önce gelebilir (ilk açılışta yarış). FK olsaydı olaylar düşerdi. Gevşek bağ tercih edildi.

**Neden `shared_dhikrs.id` UUID?**
Deep link'te görünüyor (`ummet://shared-dhikr/{id}`). Artan tamsayı olsaydı başkalarının zikirleri tahmin edilebilirdi.

**Neden MariaDB ↔ MySQL 8 farkına dikkat?**
Yerel XAMPP MariaDB 10.4, cPanel farklı olabilir. JSON kolon davranışı ve collation varsayılanları ayrışır — migration'larda egzotik özellik kullanmayın.

---

## 9. Yapılacaklar

- [ ] `app_events` için arşivleme/partition stratejisi (ölçekte)
- [ ] `subscriptions` tablosu — RevenueCat webhook verisi (Pro çıkınca)
- [ ] Kullanıcı hesapları ve bulut yedek tabloları (Pro Faz 2)
- [ ] Yedekleme politikası — cPanel otomatik yedeği doğrulanmalı

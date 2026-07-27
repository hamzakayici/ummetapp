# Ümmet Web — Laravel + Filament

Landing sitesi, yönetim paneli ve **mobil uygulamanın backend API'si**.
Silinen Supabase projesinin yerini alır (bkz. `../docs/06-LARAVEL-PLANI.md` §1).

## Stack

| | |
|---|---|
| Laravel | 13.22 |
| Filament | v5.7 |
| PHP | 8.3.19 (Homebrew `php@8.3` — cPanel'deki 8.3.0 ile eşleşir) |
| Veritabanı | MySQL / MariaDB 10.4 (XAMPP) — `ummet` |

## Çalıştırma

XAMPP'tan **sadece MySQL**'i başlatın (Apache'ye gerek yok), sonra:

```bash
export PATH="/opt/homebrew/opt/php@8.3/bin:$PATH"   # ~/.zshrc'ye ekleyin
cd web
php artisan serve            # http://localhost:8000
```

**Admin panel:** http://localhost:8000/admin
Giriş: `hamzakayc@gmail.com` / `ummet2026` — *yerel geliştirme parolası, üretimde değiştirin.*

Sıfırdan kurmak için:
```bash
php artisan migrate:fresh --seed --seeder=UmmetSeeder
php artisan make:filament-user
```

## API — `/api/v1`

Mobil uygulama bu uçlara bağlanacak. Tümü sürümlenmiş; eski istemciler kırılmadan `v2` çıkarılabilir.

| Metod | Uç | Açıklama |
|---|---|---|
| GET | `/announcements` | Aktif duyurular (5 dk cache) |
| GET | `/settings` | Remote config anahtar/değer (5 dk cache) |
| POST | `/announcements/{id}/opened` | Açılma sayacı |
| POST | `/analytics/events` | Olay batch'i (maks. 50) |
| POST | `/analytics/device` | Cihaz upsert |
| POST | `/analytics/session/start` | Oturum açılışı |
| POST | `/analytics/session/end` | Oturum kapanışı — **süreyi sunucu hesaplar** |
| POST | `/push-tokens` | Expo push token kaydı |
| POST | `/shared-dhikrs` | Ortak zikir oluştur |
| GET | `/shared-dhikrs/{id\|kod}` | Durum oku (mobil polling buradan) |
| POST | `/shared-dhikrs/{id}/increment` | Sayaç artır (atomik) |

### Eski mimariye göre düzeltilenler

- **Oturum süresi sunucuda hesaplanıyor.** Önceden client gönderiyordu ve uygulama kill edilirse oturum hiç kapanmıyordu → ortalama süre olduğundan uzun görünüyordu.
- **`app_devices` gerçek upsert.** Önceki insert-then-update deseni yarış durumu üretiyordu; `first_seen_at` artık korunuyor.
- **Doğrulama + throttle var.** Önceden uygulama `anon` key ile doğrudan Postgres'e yazıyordu, herkes sahte veri basabiliyordu.
- **Ortak zikir sayacı atomik.** `current_count + N` tek UPDATE'te; eşzamanlı 3 katkı testinde hiç kayıp yok.

### Realtime yerine polling

Supabase Realtime WebSocket kullanıyordu; paylaşımlı cPanel kalıcı süreç çalıştıramaz. Mobil taraf ekran açıkken `GET /shared-dhikrs/{id}` ucunu 3-5 sn'de bir çağıracak.

## ⚠️ Yerelden canlı push göndermeyin

`.env` içinde `PUSH_ENABLED=false` — bu bayrak açılırsa **App Store'daki gerçek kullanıcılara** bildirim gider ve geri alınamaz. Test için:

```dotenv
PUSH_ENABLED=false
PUSH_TEST_TOKENS="ExponentPushToken[kendi-cihazin]"
```

Yapılandırma: `config/ummet.php`

## Yapı

```
app/
├── Filament/
│   ├── Resources/        # Duyurular, Ayarlar, Push Tokenları, Push Bildirimleri, Ortak Zikirler
│   └── Widgets/          # AnalyticsOverview (DAU/MAU/oturum/olay — 5 dk cache)
├── Http/Controllers/Api/ # Config, Analytics, PushToken, SharedDhikr
└── Models/               # 9 model
config/ummet.php          # push bayrağı + ingest anahtarı
routes/api.php            # /api/v1
```

## Sırada

- [ ] Landing sayfaları (Blade) — `../docs/04-LANDING-PAGE.md`
- [ ] `ExpoPushService` + push gönderim kuyruğu
- [ ] Mobil uygulamada 5 servisin bu API'ye çevrilmesi
- [ ] Oturum kapatma cron'u (24 saattir açık kalanlar)
- [ ] cPanel deploy — `../docs/06-LARAVEL-PLANI.md` §5

<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\AppDevice;
use App\Models\AppEvent;
use App\Models\AppSession;
use App\Models\ContactMessage;
use App\Models\PushNotification;
use App\Models\PushToken;
use App\Models\SharedDhikr;
use App\Models\SharedDhikrContribution;
use App\Models\Subscriber;
use App\Models\SyncState;
use App\Models\PurchaseEvent;
use App\Models\ExternalMetric;
use App\Services\AppStoreConnectService;
use Illuminate\Support\Facades\Cache;

class DashboardService
{
    public function __construct(
        private readonly AnalyticsService $analytics,
    ) {}

    /** @return array<string, mixed> */
    public function overview(): array
    {
        return Cache::remember('dashboard.overview', now()->addMinutes(5), function () {
            $now = now();

            $dau = AppEvent::where('ts', '>=', $now->copy()->subDay())
                ->distinct('device_id')->count('device_id');

            $prevDau = AppEvent::whereBetween('ts', [
                $now->copy()->subDays(2),
                $now->copy()->subDay(),
            ])->distinct('device_id')->count('device_id');

            $mau = AppEvent::where('ts', '>=', $now->copy()->subDays(30))
                ->distinct('device_id')->count('device_id');

            $sessions24h = AppSession::where('started_at', '>=', $now->copy()->subDay())->count();
            $prevSessions = AppSession::whereBetween('started_at', [
                $now->copy()->subDays(2),
                $now->copy()->subDay(),
            ])->count();

            $events24h = AppEvent::where('ts', '>=', $now->copy()->subDay())->count();
            $prevEvents = AppEvent::whereBetween('ts', [
                $now->copy()->subDays(2),
                $now->copy()->subDay(),
            ])->count();

            $avgMs = AppSession::where('started_at', '>=', $now->copy()->subDays(7))
                ->whereNotNull('duration_ms')->avg('duration_ms');

            return [
                'dau' => $dau,
                'dauTrend' => $this->trendPercent($dau, $prevDau),
                'dauSeries' => $this->dailyActiveSeries(7),
                'mau' => $mau,
                'devices' => AppDevice::count(),
                'newDevices24h' => AppDevice::where('first_seen_at', '>=', $now->copy()->subDay())->count(),
                'sessions24h' => $sessions24h,
                'sessionsTrend' => $this->trendPercent($sessions24h, $prevSessions),
                'avgSessionSec' => $avgMs ? (int) round($avgMs / 1000) : 0,
                'events24h' => $events24h,
                'eventsTrend' => $this->trendPercent($events24h, $prevEvents),
                'pushTokens' => PushToken::active()->count(),
            ];
        });
    }

    /** @return array<string, int> */
    public function operations(): array
    {
        return Cache::remember('dashboard.operations', now()->addMinutes(5), function () {
            return [
                'unreadMessages' => ContactMessage::query()->where('is_read', false)->count(),
                'subscribers' => Subscriber::query()->whereNull('unsubscribed_at')->count(),
                'activeAnnouncements' => Announcement::visible()->count(),
                'activeDhikrs' => SharedDhikr::query()
                    ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                    ->count(),
                'dhikrContributions24h' => SharedDhikrContribution::query()
                    ->where('created_at', '>=', now()->subDay())
                    ->count(),
                'pendingPush' => PushNotification::query()
                    ->whereIn('status', ['draft', 'failed'])
                    ->count(),
            ];
        });
    }

    /**
     * Dikkat gerektiren durumlar — boşsa widget gizlenir.
     *
     * @return list<array{type: string, title: string, body: string, url: ?string}>
     */
    public function alerts(): array
    {
        return Cache::remember('dashboard.alerts', now()->addMinutes(2), function () {
            $alerts = [];

            $unread = ContactMessage::query()->where('is_read', false)->count();
            if ($unread > 0) {
                $alerts[] = [
                    'type' => 'warning',
                    'title' => "{$unread} okunmamış iletişim mesajı",
                    'body' => 'Siteden gelen mesajları yanıtlamayı unutmayın.',
                    'url' => route('filament.admin.resources.contact-messages.index'),
                ];
            }

            $pendingPush = PushNotification::query()
                ->whereIn('status', ['draft', 'failed'])
                ->count();
            if ($pendingPush > 0) {
                $alerts[] = [
                    'type' => 'danger',
                    'title' => "{$pendingPush} push kampanyası bekliyor",
                    'body' => 'Taslak veya başarısız kampanyaları kontrol edin.',
                    'url' => route('filament.admin.resources.push-notifications.index'),
                ];
            }

            $sync = SyncState::query()->where('source', 'app_store')->first();
            if ($sync?->status === 'failed') {
                $alerts[] = [
                    'type' => 'warning',
                    'title' => 'App Store senkronizasyonu başarısız',
                    'body' => $sync->message ?? 'Son senkron denemesi hata verdi.',
                    'url' => route('filament.admin.pages.data-sources'),
                ];
            }

            if (PushToken::active()->count() === 0 && AppDevice::count() > 0) {
                $alerts[] = [
                    'type' => 'info',
                    'title' => 'Push token kaydı yok',
                    'body' => 'Cihazlar var ama bildirim gönderilebilir token bulunamadı. Mobil uygulama API bağlantısını kontrol edin.',
                    'url' => route('filament.admin.resources.push-tokens.index'),
                ];
            }

            $dau = AppEvent::where('ts', '>=', now()->subDay())
                ->distinct('device_id')->count('device_id');
            if (AppEvent::count() > 0 && AppDevice::count() >= 10 && $dau === 0) {
                $alerts[] = [
                    'type' => 'danger',
                    'title' => 'Son 24 saatte aktif cihaz yok',
                    'body' => 'Analitik akışı durmuş olabilir veya kullanıcılar geri dönmüyor.',
                    'url' => route('filament.admin.resources.app-events.index'),
                ];
            }

            return $alerts;
        });
    }


    /**
     * Entegrasyonların kurulum durumu.
     *
     * Panel açıldığında her şey sıfır görünüyorsa sebebi belli olmalı:
     * uygulama mı veri göndermiyor, entegrasyon mu eksik, yoksa gerçekten
     * kullanıcı mı yok? Sıfırlar duvarı hiçbirini ayırt ettirmiyor.
     *
     * @return array{ready: bool, items: list<array<string, mixed>>}
     */
    public function setupStatus(): array
    {
        return Cache::remember('dashboard.setup', now()->addMinutes(2), function () {
            $eventCount = AppEvent::count();
            $deviceCount = AppDevice::count();
            $tokenCount = PushToken::active()->count();
            $purchaseCount = PurchaseEvent::count();
            $ascMetrics = ExternalMetric::where('source', 'app_store')->count();

            $asc = app(AppStoreConnectService::class);

            $items = [
                [
                    'key' => 'mobile',
                    'label' => 'Mobil uygulama bağlantısı',
                    'done' => $eventCount > 0,
                    'detail' => $eventCount > 0
                        ? number_format($eventCount) . ' olay alındı, ' . number_format($deviceCount) . ' cihaz'
                        : 'Henüz hiç olay gelmedi.',
                    'action' => $eventCount > 0
                        ? null
                        : 'Uygulama yeni API’ye bağlanan sürümle App Store’a çıkmalı. O sürüm yayınlanana kadar buraya veri akmaz.',
                    'critical' => true,
                ],
                [
                    'key' => 'push',
                    'label' => 'Push bildirimleri',
                    'done' => $tokenCount > 0,
                    'detail' => $tokenCount > 0
                        ? number_format($tokenCount) . ' cihaza bildirim gönderilebilir'
                        : 'Kayıtlı cihaz yok.',
                    'action' => $tokenCount > 0 ? null : 'Uygulama sürümü yayınlanınca token’lar otomatik kaydedilir.',
                    'critical' => false,
                ],
                [
                    'key' => 'revenuecat',
                    'label' => 'RevenueCat (gelir)',
                    'done' => $purchaseCount > 0,
                    'detail' => $purchaseCount > 0
                        ? number_format($purchaseCount) . ' satın alma olayı'
                        : (filled(config('ummet.revenuecat.webhook_secret'))
                            ? 'Webhook tanımlı, ilk satın alma bekleniyor.'
                            : 'Webhook anahtarı tanımlı değil.'),
                    'action' => $purchaseCount > 0
                        ? null
                        : 'Uygulamada satın alma özelliği yayına girmeden veri gelmez.',
                    'critical' => false,
                ],
                [
                    'key' => 'app_store',
                    'label' => 'App Store Connect',
                    'done' => $ascMetrics > 0,
                    'detail' => $ascMetrics > 0
                        ? number_format($ascMetrics) . ' günlük metrik'
                        : ($asc->configurationProblem() ?? 'Bağlantı hazır, Apple’ın rapor üretmesi bekleniyor.'),
                    'action' => $ascMetrics > 0
                        ? null
                        : 'Apple ilk raporu 24-48 saatte üretiyor. Veri günlüktür, anlık değildir.',
                    'critical' => false,
                ],
                [
                    'key' => 'play_store',
                    'label' => 'Google Play',
                    'done' => filled(config('ummet.play_store_url')),
                    'detail' => filled(config('ummet.play_store_url'))
                        ? 'Yayında'
                        : 'Uygulama henüz Play Store’da değil.',
                    'action' => filled(config('ummet.play_store_url'))
                        ? null
                        : 'Türkiye’de Android payı %75-80 — yayına almak kullanıcı tabanını kat kat büyütür.',
                    'critical' => false,
                ],
            ];

            return [
                'ready' => $eventCount > 0,
                'items' => $items,
            ];
        });
    }

    /** Son N günün günlük aktif cihaz sayıları (eskiden yeniye). */
    public function dailyActiveSeries(int $days = 30): array
    {
        $cacheKey = "dashboard.dau_series.{$days}";

        $rows = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($days) {
            $since = now()->subDays($days - 1)->startOfDay();

            return AppEvent::where('ts', '>=', $since)
                ->selectRaw('DATE(ts) AS gun, COUNT(DISTINCT device_id) AS cihaz')
                ->groupBy('gun')
                ->orderBy('gun')
                ->pluck('cihaz', 'gun')
                ->all();
        });

        $values = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $key = now()->subDays($i)->toDateString();
            $values[] = (int) ($rows[$key] ?? 0);
        }

        return $values;
    }

    /** Son N günün günlük oturum sayıları (eskiden yeniye). */
    public function dailySessionSeries(int $days = 30): array
    {
        $cacheKey = "dashboard.session_series.{$days}";

        $rows = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($days) {
            $since = now()->subDays($days - 1)->startOfDay();

            return AppSession::where('started_at', '>=', $since)
                ->selectRaw('DATE(started_at) AS gun, COUNT(*) AS oturum')
                ->groupBy('gun')
                ->orderBy('gun')
                ->pluck('oturum', 'gun')
                ->all();
        });

        $values = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $key = now()->subDays($i)->toDateString();
            $values[] = (int) ($rows[$key] ?? 0);
        }

        return $values;
    }

    public function platformBreakdown(int $days = 7): array
    {
        return $this->analytics->platformBreakdown($days);
    }

    public function retentionSummary(): array
    {
        return $this->analytics->retentionSummary();
    }

    public function greeting(): string
    {
        $hour = (int) now()->format('G');

        return match (true) {
            $hour < 6 => 'İyi geceler',
            $hour < 12 => 'Günaydın',
            $hour < 18 => 'İyi günler',
            default => 'İyi akşamlar',
        };
    }

    private function trendPercent(int $current, int $previous): ?float
    {
        if ($previous === 0) {
            return $current > 0 ? 100.0 : null;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }
}

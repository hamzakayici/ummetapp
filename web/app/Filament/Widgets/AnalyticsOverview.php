<?php

namespace App\Filament\Widgets;

use App\Models\AppDevice;
use App\Models\AppEvent;
use App\Filament\Resources\AppDevices\AppDeviceResource;
use App\Filament\Resources\AppEvents\AppEventResource;
use App\Filament\Resources\PushTokens\PushTokenResource;
use App\Services\DashboardService;
use Filament\Support\Enums\IconPosition;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AnalyticsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 0;

    protected ?string $heading = 'Uygulama özeti';

    protected ?string $description = 'Kendi analitik verimiz — anlık güncellenir.';

    protected int|array|null $columns = ['default' => 1, 'sm' => 2, 'lg' => 3, '2xl' => 6];

    protected int|string|array $columnSpan = 'full';


    public static function canView(): bool
    {
        // Kurulum tamamlanmadan sıfırlar duvarı göstermek yerine
        // SetupStatus widget'ı devreye giriyor
        return AppEvent::exists() || AppDevice::exists();
    }

    protected function getStats(): array
    {
        $m = app(DashboardService::class)->overview();

        return [
            Stat::make('Bugün aktif', number_format($m['dau']))
                ->description($this->trendLabel($m['dauTrend'], 'önceki 24 saate göre'))
                ->descriptionIcon($this->trendIcon($m['dauTrend']), IconPosition::Before)
                ->chart($m['dauSeries'])
                ->color($this->trendColor($m['dauTrend'], true))
                ->url(AppEventResource::getUrl('index')),

            Stat::make('Bu ay aktif', number_format($m['mau']))
                ->description('Son 30 günde en az bir kez giren')
                ->descriptionIcon('heroicon-m-users')
                ->color('success')
                ->url(AppDeviceResource::getUrl('index')),

            Stat::make('Toplam cihaz', number_format($m['devices']))
                ->description($m['newDevices24h'] . ' yeni (son 24 saat)')
                ->descriptionIcon('heroicon-m-device-phone-mobile')
                ->color('primary')
                ->url(AppDeviceResource::getUrl('index')),

            Stat::make('Oturum (24 saat)', number_format($m['sessions24h']))
                ->description($this->trendLabel($m['sessionsTrend'], 'önceki güne göre') . ' · ort. ' . $this->humanDuration($m['avgSessionSec']))
                ->descriptionIcon($this->trendIcon($m['sessionsTrend']), IconPosition::Before)
                ->color($this->trendColor($m['sessionsTrend'], true)),

            Stat::make('Etkinlik (24 saat)', number_format($m['events24h']))
                ->description($this->trendLabel($m['eventsTrend'], 'önceki güne göre'))
                ->descriptionIcon($this->trendIcon($m['eventsTrend']), IconPosition::Before)
                ->color($this->trendColor($m['eventsTrend'], true))
                ->url(AppEventResource::getUrl('index')),

            Stat::make('Bildirim alan cihaz', number_format($m['pushTokens']))
                ->description('Push gönderilebilir token')
                ->descriptionIcon('heroicon-m-bell-alert')
                ->color('warning')
                ->url(PushTokenResource::getUrl('index')),
        ];
    }

    private function trendLabel(?float $trend, string $suffix): string
    {
        if ($trend === null) {
            return 'Karşılaştırma için yeterli veri yok';
        }

        $prefix = $trend > 0 ? '+' : '';

        return "{$prefix}{$trend}% {$suffix}";
    }

    private function trendIcon(?float $trend): string
    {
        if ($trend === null) {
            return 'heroicon-m-minus';
        }

        return $trend >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down';
    }

    private function trendColor(?float $trend, bool $positiveIsGood = true): string
    {
        if ($trend === null) {
            return 'gray';
        }

        $good = $positiveIsGood ? $trend >= 0 : $trend <= 0;

        return $good ? 'success' : 'danger';
    }

    private function humanDuration(int $seconds): string
    {
        if ($seconds <= 0) {
            return 'süre henüz yok';
        }

        return $seconds < 60
            ? "{$seconds} sn"
            : floor($seconds / 60) . ' dk';
    }
}

<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Announcements\AnnouncementResource;
use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\PushNotifications\PushNotificationResource;
use App\Filament\Resources\SharedDhikrs\SharedDhikrResource;
use App\Filament\Resources\Subscribers\SubscriberResource;
use App\Services\DashboardService;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class OperationsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected int|string|array $columnSpan = 'full';


    protected ?string $heading = 'Site ve içerik';

    protected ?string $description = 'Landing, iletişim ve uygulama içi içerik yönetimi.';

    protected int|array|null $columns = ['default' => 1, 'sm' => 2, 'lg' => 3, '2xl' => 5];

    protected function getStats(): array
    {
        $m = app(DashboardService::class)->operations();

        return [
            Stat::make('Okunmamış mesaj', number_format($m['unreadMessages']))
                ->description('İletişim formu')
                ->descriptionIcon($m['unreadMessages'] > 0 ? 'heroicon-m-exclamation-circle' : 'heroicon-m-check-circle')
                ->color($m['unreadMessages'] > 0 ? 'warning' : 'success')
                ->url(ContactMessageResource::getUrl('index')),

            Stat::make('E-posta abonesi', number_format($m['subscribers']))
                ->description('Aktif abonelik')
                ->color('primary')
                ->url(SubscriberResource::getUrl('index')),

            Stat::make('Aktif duyuru', number_format($m['activeAnnouncements']))
                ->description('Mobilde görünür')
                ->color('success')
                ->url(AnnouncementResource::getUrl('index')),

            Stat::make('Ortak zikir', number_format($m['activeDhikrs']))
                ->description($m['dhikrContributions24h'] . ' katkı (24 saat)')
                ->color('primary')
                ->url(SharedDhikrResource::getUrl('index')),

            Stat::make('Bekleyen push', number_format($m['pendingPush']))
                ->description('Taslak veya başarısız')
                ->color($m['pendingPush'] > 0 ? 'danger' : 'gray')
                ->url(PushNotificationResource::getUrl('index')),
        ];
    }
}

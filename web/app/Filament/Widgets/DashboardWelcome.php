<?php

namespace App\Filament\Widgets;

use App\Filament\Pages\QuickPush;
use App\Filament\Resources\Announcements\AnnouncementResource;
use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Filament\Resources\PushNotifications\PushNotificationResource;
use App\Services\DashboardService;
use Filament\Widgets\Widget;

class DashboardWelcome extends Widget
{
    protected static ?int $sort = -10;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.dashboard-welcome';

    protected function getViewData(): array
    {
        $service = app(DashboardService::class);
        $ops = $service->operations();

        return [
            'greeting' => $service->greeting(),
            'dateLabel' => now()->locale('tr')->translatedFormat('d F Y, l'),
            'quickLinks' => [
                [
                    'label' => 'Hızlı push',
                    'description' => 'Anlık bildirim gönder',
                    'icon' => 'heroicon-o-paper-airplane',
                    'url' => QuickPush::getUrl(),
                    'accent' => '#d4af37',
                    'badge' => null,
                ],
                [
                    'label' => 'Duyurular',
                    'description' => $ops['activeAnnouncements'] . ' aktif duyuru',
                    'icon' => 'heroicon-o-megaphone',
                    'url' => AnnouncementResource::getUrl('index'),
                    'accent' => '#40c057',
                    'badge' => null,
                ],
                [
                    'label' => 'İletişim',
                    'description' => $ops['unreadMessages'] > 0
                        ? "{$ops['unreadMessages']} okunmamış mesaj"
                        : 'Gelen kutusu',
                    'icon' => 'heroicon-o-envelope',
                    'url' => ContactMessageResource::getUrl('index'),
                    'accent' => '#f97316',
                    'badge' => $ops['unreadMessages'] > 0 ? (string) $ops['unreadMessages'] : null,
                ],
                [
                    'label' => 'Push kampanyaları',
                    'description' => $ops['pendingPush'] > 0
                        ? "{$ops['pendingPush']} bekleyen kampanya"
                        : 'Kampanya geçmişi',
                    'icon' => 'heroicon-o-bell-alert',
                    'url' => PushNotificationResource::getUrl('index'),
                    'accent' => '#8b5cf6',
                    'badge' => $ops['pendingPush'] > 0 ? (string) $ops['pendingPush'] : null,
                ],
            ],
        ];
    }
}

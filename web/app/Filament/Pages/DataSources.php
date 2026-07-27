<?php

namespace App\Filament\Pages;

use App\Models\ExternalMetric;
use App\Models\PurchaseEvent;
use App\Models\SyncState;
use App\Services\AppStoreConnectService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Artisan;

/**
 * Dış veri kaynaklarının durumu.
 *
 * Her kaynağın ne kadar "canlı" olduğunu açıkça yazar — çünkü hepsi
 * aynı değil ve bunu bilmeden metriklere bakmak yanıltıcı olur.
 */
class DataSources extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCircleStack;

    protected static string|\UnitEnum|null $navigationGroup = 'Analitik';

    protected static ?string $navigationLabel = 'Veri kaynakları';

    protected static ?string $title = 'Veri kaynakları';

    protected static ?int $navigationSort = 90;

    protected string $view = 'filament.pages.data-sources';

    /** @return array<int, array<string, mixed>> */
    public function getSources(): array
    {
        $states = SyncState::pluck('last_success_at', 'source');
        $asc = app(AppStoreConnectService::class);

        return [
            [
                'name' => 'Uygulama verisi',
                'freshness' => 'Anlık',
                'freshness_color' => 'success',
                'detail' => 'Olaylar, oturumlar, cihazlar, push, ortak zikir. Kendi sunucumuzda — gecikme yok.',
                'configured' => true,
                'last' => 'Sürekli',
                'data_through' => null,
            ],
            [
                'name' => 'RevenueCat',
                'freshness' => 'Anlık (webhook)',
                'freshness_color' => 'success',
                'detail' => 'Satın alma gerçekleştiği anda bildirim gelir. Panelde gerçekten canlı olan tek dış kaynak.',
                'configured' => filled(config('ummet.revenuecat.webhook_secret')),
                'last' => $states['revenuecat'] ?? null,
                'data_through' => null,
                'hint' => 'RevenueCat → Integrations → Webhooks → ' . url('/api/v1/webhooks/revenuecat'),
            ],
            [
                'name' => 'App Store Connect',
                'freshness' => 'Günlük (1-2 gün gecikmeli)',
                'freshness_color' => 'warning',
                'detail' => 'Apple canlı veri sunmuyor. Raporlar günlük üretilir; en taze veri bile 1-2 gün eskidir.',
                'configured' => $asc->isConfigured(),
                'last' => $states['app_store'] ?? null,
                'data_through' => SyncState::where('source', 'app_store')->value('data_through'),
            ],
            [
                'name' => 'Google Play Console',
                'freshness' => 'Günlük (1-2 gün gecikmeli)',
                'freshness_color' => 'warning',
                'detail' => 'Google da canlı veri vermiyor. Uygulama Play Store’da yayınlanınca bağlanacak.',
                'configured' => filled(config('ummet.play_console.service_account_path')),
                'last' => $states['play_store'] ?? null,
                'data_through' => null,
                'hint' => 'Uygulama henüz Play Store’da yayında değil.',
            ],
        ];
    }

    public function getStats(): array
    {
        return [
            'metrics' => ExternalMetric::count(),
            'purchases' => PurchaseEvent::count(),
        ];
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('syncAppStore')
                ->label('App Store verisini çek')
                ->icon('heroicon-o-arrow-path')
                ->action(function () {
                    $exit = Artisan::call('ummet:sync-app-store');
                    $output = trim(Artisan::output());

                    Notification::make()
                        ->title($exit === 0 ? 'Senkron tamamlandı' : 'Senkron başarısız')
                        ->body($output ?: 'Çıktı yok')
                        ->status($exit === 0 ? 'success' : 'danger')
                        ->send();
                }),
        ];
    }
}

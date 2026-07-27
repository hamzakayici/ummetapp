<?php

namespace App\Filament\Widgets;

use App\Models\ExternalMetric;
use App\Models\SyncState;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/**
 * App Store Connect metrikleri.
 *
 * ⚠️ Bu veri ANLIK DEĞİL. Apple raporları günlük üretir ve 1-2 gün
 * gecikmeyle yayınlar. Başlıkta verinin hangi güne kadar geldiği yazar.
 */
class AppStoreOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 'full';

    /** 5 stat — dar ekranda 1-2, geniş ekranda tam sıra */
    protected int|array|null $columns = ['default' => 1, 'sm' => 2, 'lg' => 3, '2xl' => 5];

    protected ?string $heading = 'App Store';

    public static function canView(): bool
    {
        return ExternalMetric::where('source', 'app_store')->exists();
    }

    public function getDescription(): ?string
    {
        $state = SyncState::where('source', 'app_store')->first();

        if (! $state?->data_through) {
            return 'Apple verisi bekleniyor.';
        }

        $lag = $state->data_through->diffInDays(now());

        return "Veri {$state->data_through->format('d.m.Y')} tarihine kadar"
            . ($lag > 0 ? " ({$lag} gün gecikmeli — Apple günlük rapor veriyor)" : '');
    }

    protected function getStats(): array
    {
        $impressions = ExternalMetric::sumFor('app_store', 'impressions', 30);
        $pageViews = ExternalMetric::sumFor('app_store', 'product_page_views', 30);
        $downloads = ExternalMetric::sumFor('app_store', 'downloads', 30);
        $firstTime = ExternalMetric::sumFor('app_store', 'downloads_first_time', 30);
        $crashes = ExternalMetric::sumFor('app_store', 'crashes', 30);

        // Ürün sayfasını görüp indirenlerin oranı — ASO'nun tek en iyi göstergesi
        $conversion = $pageViews > 0 ? round($downloads / $pageViews * 100, 1) : 0;

        return [
            Stat::make('Gösterim (30 gün)', number_format($impressions))
                ->description('App Store aramalarında görünme')
                ->color('gray'),

            Stat::make('Sayfa görüntüleme', number_format($pageViews))
                ->color('gray'),

            Stat::make('Dönüşüm oranı', $conversion . '%')
                ->description($conversion < 25 ? 'Düşük — ekran görüntüsü/metin gözden geçirilmeli' : 'İyi seviyede')
                ->color($conversion >= 30 ? 'success' : ($conversion >= 20 ? 'warning' : 'danger')),

            Stat::make('İndirme (30 gün)', number_format($downloads))
                ->description(number_format($firstTime) . ' ilk kez indiren')
                ->color('success'),

            Stat::make('Çökme (30 gün)', number_format($crashes))
                ->color($crashes > 0 ? 'warning' : 'success'),
        ];
    }
}

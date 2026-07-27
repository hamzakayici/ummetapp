<?php

namespace App\Filament\Widgets;

use App\Models\PurchaseEvent;
use App\Models\Subscription;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

/**
 * Gelir özeti — RevenueCat webhook verisinden.
 *
 * Bu veri ANLIK: satın alma gerçekleştiği anda webhook düşer.
 *
 * İki gelir kalemi ayrı gösteriliyor:
 *  • Abonelik (Ümmet Pro) — tekrarlayan
 *  • Destek (tek seferlik, `ummet_support_*`) — gönüllü bağış niteliğinde
 *
 * Bunları toplamak yanıltıcı olurdu: destek geliri tek seferlik ve
 * öngörülemez, abonelik ise tekrarlayan. Karar verirken ikisi ayrı okunmalı.
 */
class RevenueOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    /** 5 stat — dar ekranda 1-2, geniş ekranda tam sıra */
    protected int|array|null $columns = ['default' => 1, 'sm' => 2, 'lg' => 3, '2xl' => 5];

    protected ?string $heading = 'Gelir';

    protected ?string $description = 'RevenueCat üzerinden anlık güncellenir.';

    /** Destek (consumable) ürünlerinin ürün kimliği ön eki */
    private const SUPPORT_PREFIX = 'ummet_support_';

    public static function canView(): bool
    {
        return Subscription::exists() || PurchaseEvent::exists();
    }

    protected function getStats(): array
    {
        $m = Cache::remember('revenue.overview', now()->addMinute(), function () {
            $now = now();
            $since30 = $now->copy()->subDays(30);
            $sincePrev30 = $now->copy()->subDays(60);

            $earned = fn () => PurchaseEvent::where('type', '!=', 'REFUND');

            $subscriptionRevenue = (float) $earned()
                ->where('occurred_at', '>=', $since30)
                ->where(fn ($q) => $q->whereNull('product_id')
                    ->orWhere('product_id', 'not like', self::SUPPORT_PREFIX . '%'))
                ->sum('revenue_usd');

            $supportRevenue = (float) $earned()
                ->where('occurred_at', '>=', $since30)
                ->where('product_id', 'like', self::SUPPORT_PREFIX . '%')
                ->sum('revenue_usd');

            // Önceki 30 gün — trend için
            $prevTotal = (float) $earned()
                ->whereBetween('occurred_at', [$sincePrev30, $since30])
                ->sum('revenue_usd');

            $refunded = (float) PurchaseEvent::where('type', 'REFUND')
                ->where('occurred_at', '>=', $since30)
                ->sum('revenue_usd');

            return [
                'activeSubs' => Subscription::active()->count(),
                'payingSubs' => Subscription::paying()->count(),
                'trials' => Subscription::where('status', 'trial')->count(),
                'subscriptionRevenue' => $subscriptionRevenue,
                'supportRevenue' => $supportRevenue,
                'supporters' => $earned()
                    ->where('occurred_at', '>=', $since30)
                    ->where('product_id', 'like', self::SUPPORT_PREFIX . '%')
                    ->distinct('app_user_id')->count('app_user_id'),
                'total30' => $subscriptionRevenue + $supportRevenue,
                'prevTotal' => $prevTotal,
                'refunded' => abs($refunded),
                'cancels30d' => PurchaseEvent::whereIn('type', ['CANCELLATION', 'EXPIRATION'])
                    ->where('occurred_at', '>=', $since30)->count(),
            ];
        });

        $trend = $this->trend($m['total30'], $m['prevTotal']);

        return [
            Stat::make('Son 30 gün toplam', '$' . number_format($m['total30'], 2))
                ->description($trend['label'])
                ->descriptionIcon($trend['icon'])
                ->color($trend['color']),

            Stat::make('Abonelik geliri', '$' . number_format($m['subscriptionRevenue'], 2))
                ->description('Tekrarlayan — Ümmet Pro')
                ->color('success'),

            Stat::make('Destek geliri', '$' . number_format($m['supportRevenue'], 2))
                ->description($m['supporters'] > 0
                    ? $m['supporters'] . ' kişi destek oldu'
                    : 'Tek seferlik, gönüllü')
                ->color('warning'),

            Stat::make('Aktif abone', number_format($m['activeSubs']))
                ->description($m['trials'] > 0
                    ? $m['trials'] . ' tanesi denemede · ' . $m['payingSubs'] . ' ücretli'
                    : $m['payingSubs'] . ' tanesi ücretli')
                ->color($m['activeSubs'] > 0 ? 'success' : 'gray'),

            Stat::make('İptal (30 gün)', number_format($m['cancels30d']))
                ->description($m['refunded'] > 0
                    ? '$' . number_format($m['refunded'], 2) . ' iade edildi'
                    : 'İade yok')
                ->color($m['cancels30d'] > 0 ? 'warning' : 'gray'),
        ];
    }

    /** @return array{label: string, icon: string, color: string} */
    private function trend(float $current, float $previous): array
    {
        if ($previous <= 0) {
            return [
                'label' => $current > 0 ? 'İlk gelir dönemi' : 'Henüz gelir yok',
                'icon' => 'heroicon-m-minus',
                'color' => 'gray',
            ];
        }

        $change = (int) round(($current - $previous) / $previous * 100);

        return [
            'label' => abs($change) . '% önceki 30 güne göre',
            'icon' => $change >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down',
            'color' => $change >= 0 ? 'success' : 'danger',
        ];
    }
}

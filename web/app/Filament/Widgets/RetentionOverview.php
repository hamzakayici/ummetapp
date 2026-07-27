<?php

namespace App\Filament\Widgets;

use App\Services\AnalyticsService;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/** Kohort tutma oranları — D1 / D7 / D30 */
class RetentionOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';


    protected ?string $heading = 'Tutma oranı';

    protected ?string $description = 'İlk kez giren cihazların sonraki günlerde geri dönme oranı. 15 dakikada bir yenilenir.';

    protected int|array|null $columns = ['default' => 1, 'sm' => 2, 'lg' => 3];

    public static function canView(): bool
    {
        return app(AnalyticsService::class)->retentionSummary()['cohorts'] >= 5;
    }

    protected function getStats(): array
    {
        $data = app(AnalyticsService::class)->retentionSummary();

        return [
            Stat::make('D1', $this->formatRate($data['d1']))
                ->description('Ertesi gün geri dönen')
                ->color($this->rateColor($data['d1'], 25, 15)),

            Stat::make('D7', $this->formatRate($data['d7']))
                ->description('7. gün geri dönen')
                ->color($this->rateColor($data['d7'], 15, 8)),

            Stat::make('D30', $this->formatRate($data['d30']))
                ->description('30. gün geri dönen')
                ->color($this->rateColor($data['d30'], 8, 4)),
        ];
    }

    private function formatRate(?float $rate): string
    {
        return $rate !== null ? $rate . '%' : '—';
    }

    private function rateColor(?float $rate, float $good, float $ok): string
    {
        if ($rate === null) {
            return 'gray';
        }

        return match (true) {
            $rate >= $good => 'success',
            $rate >= $ok => 'warning',
            default => 'danger',
        };
    }
}

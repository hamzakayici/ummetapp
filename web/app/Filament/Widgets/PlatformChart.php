<?php

namespace App\Filament\Widgets;

use App\Services\AnalyticsService;
use Filament\Widgets\ChartWidget;

/** Son 7 gün aktif cihazların platform dağılımı */
class PlatformChart extends ChartWidget
{
    protected static ?int $sort = 7;

    protected ?string $heading = 'Platform dağılımı (7 gün)';

    protected ?string $description = 'Son hafta en az bir kez aktif olan cihazlar.';

    protected int | string | array $columnSpan = 1;

    public static function canView(): bool
    {
        return count(app(AnalyticsService::class)->platformBreakdown()) > 0;
    }

    protected function getData(): array
    {
        $rows = app(AnalyticsService::class)->platformBreakdown();

        $labels = [];
        $values = [];
        $colors = [];

        foreach ($rows as $platform => $count) {
            $labels[] = match ($platform) {
                'ios' => 'iOS',
                'android' => 'Android',
                'web' => 'Web',
                default => 'Diğer',
            };
            $values[] = $count;
            $colors[] = match ($platform) {
                'ios' => '#d4af37',
                'android' => '#40c057',
                'web' => '#3d5a80',
                default => '#5a6b78',
            };
        }

        return [
            'datasets' => [[
                'data' => $values,
                'backgroundColor' => $colors,
                'borderWidth' => 0,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        return ['plugins' => ['legend' => ['position' => 'bottom']]];
    }
}

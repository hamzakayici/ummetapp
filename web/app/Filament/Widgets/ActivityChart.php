<?php

namespace App\Filament\Widgets;

use App\Models\AppEvent;
use App\Services\DashboardService;
use Filament\Widgets\ChartWidget;

/** Son 30 günün günlük aktif cihaz ve oturum eğrisi. */
class ActivityChart extends ChartWidget
{
    protected static ?int $sort = 5;

    protected ?string $heading = 'Aktivite trendi (30 gün)';

    protected ?string $description = 'Günlük aktif cihaz ve oturum sayısı — kendi verimiz, anlık.';

    protected int|string|array $columnSpan = 'full';

    public static function canView(): bool
    {
        // Veri yokken sıfır dolu bir eğri göstermenin bilgi değeri yok
        return AppEvent::exists();
    }

    protected function getData(): array
    {
        $service = app(DashboardService::class);
        $dau = $service->dailyActiveSeries(30);
        $sessions = $service->dailySessionSeries(30);

        $labels = [];
        for ($i = 29; $i >= 0; $i--) {
            $labels[] = now()->subDays($i)->format('d.m');
        }

        return [
            'datasets' => [
                [
                    'label' => 'Aktif cihaz',
                    'data' => $dau,
                    'borderColor' => '#d4af37',
                    'backgroundColor' => 'rgba(212, 175, 55, 0.10)',
                    'fill' => true,
                    'tension' => 0.35,
                    'yAxisID' => 'y',
                ],
                [
                    'label' => 'Oturum',
                    'data' => $sessions,
                    'borderColor' => '#1b4332',
                    'backgroundColor' => 'rgba(27, 67, 50, 0.08)',
                    'fill' => false,
                    'tension' => 0.35,
                    'borderDash' => [4, 4],
                    'yAxisID' => 'y1',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'interaction' => ['mode' => 'index', 'intersect' => false],
            'plugins' => [
                'legend' => ['position' => 'bottom'],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'position' => 'left',
                    'title' => ['display' => true, 'text' => 'Cihaz'],
                ],
                'y1' => [
                    'beginAtZero' => true,
                    'position' => 'right',
                    'grid' => ['drawOnChartArea' => false],
                    'title' => ['display' => true, 'text' => 'Oturum'],
                ],
            ],
        ];
    }
}

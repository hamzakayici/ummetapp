<?php

namespace App\Filament\Widgets;

use App\Models\AppEvent;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

/** En çok görüntülenen ekranlar — hangi özelliğin tuttuğunu gösterir. */
class TopScreens extends ChartWidget
{
    protected static ?int $sort = 6;

    protected int|string|array $columnSpan = [
        'default' => 'full',
        'xl' => 2,
    ];

    protected ?string $heading = 'En çok kullanılan ekranlar (7 gün)';

    protected ?string $description = 'Pro paketine hangi özelliklerin gireceğine bu veri karar vermeli.';

    public static function canView(): bool
    {
        // Ekran görüntüleme olayı yoksa boş bar grafiği anlamsız
        return AppEvent::where('name', 'screen_view')->exists();
    }

    protected function getData(): array
    {
        $rows = Cache::remember('chart.topscreens', now()->addMinutes(5), fn () =>
            AppEvent::where('name', 'screen_view')
                ->where('ts', '>=', now()->subDays(7))
                ->whereNotNull('pathname')
                ->selectRaw('pathname, COUNT(*) AS adet')
                ->groupBy('pathname')
                ->orderByDesc('adet')
                ->limit(10)
                ->pluck('adet', 'pathname')
                ->all()
        );

        return [
            'datasets' => [[
                'label' => 'Görüntülenme',
                'data' => array_values($rows),
                'backgroundColor' => '#1b4332',
                'borderColor' => '#40c057',
                'borderWidth' => 1,
            ]],
            'labels' => array_map(
                fn (string $p) => str_replace(['/(tabs)/', '/'], ['', ''], $p) ?: 'ana sayfa',
                array_keys($rows),
            ),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getOptions(): array
    {
        return ['indexAxis' => 'y', 'plugins' => ['legend' => ['display' => false]]];
    }
}

<?php

namespace App\Filament\Widgets;

use App\Services\DashboardService;
use Filament\Widgets\Widget;

class SystemAlerts extends Widget
{
    protected static ?int $sort = -9;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.system-alerts';

    public static function canView(): bool
    {
        return count(app(DashboardService::class)->alerts()) > 0;
    }

    protected function getViewData(): array
    {
        return [
            'alerts' => app(DashboardService::class)->alerts(),
        ];
    }
}

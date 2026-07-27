<?php

namespace App\Console\Commands;

use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Console\Command;
use ReflectionClass;
use ReflectionMethod;

/** Geliştirme yardımcısı: dashboard'un şu an ne gösterdiğini terminalde önizler. */
class DashboardPreview extends Command
{
    protected $signature = 'ummet:dashboard-preview';

    protected $description = 'Dashboard widget çıktılarını önizler';

    public function handle(): int
    {
        $widgets = [
            'SetupStatus', 'SystemAlerts', 'OperationsOverview',
            'AnalyticsOverview', 'RevenueOverview', 'AppStoreOverview', 'RetentionOverview',
        ];

        foreach ($widgets as $name) {
            $class = 'App\\Filament\\Widgets\\' . $name;
            if (! class_exists($class)) {
                continue;
            }

            $visible = method_exists($class, 'canView') ? $class::canView() : true;
            if (! $visible) {
                $this->line("<fg=gray>— {$name} (gizli)</>");
                continue;
            }

            $this->newLine();
            $this->line("<fg=yellow>▸ {$name}</>");

            $widget = new $class;

            foreach (['getStats', 'getViewData'] as $method) {
                if (! method_exists($widget, $method)) {
                    continue;
                }

                $r = new ReflectionMethod($widget, $method);
                $r->setAccessible(true);
                $data = $r->invoke($widget);

                foreach ((array) $data as $key => $value) {
                    if ($value instanceof Stat) {
                        $rc = new ReflectionClass($value);
                        $get = function (string $prop) use ($rc, $value) {
                            if (! $rc->hasProperty($prop)) {
                                return null;
                            }
                            $p = $rc->getProperty($prop);
                            $p->setAccessible(true);

                            return $p->getValue($value);
                        };
                        $this->line('   ' . str_pad((string) $get('label'), 26) . $get('value')
                            . ' <fg=gray>' . $get('description') . '</>');
                    } elseif ($key === 'items' || $key === 'alerts') {
                        foreach ($value as $item) {
                            $mark = ($item['done'] ?? false) ? '✓' : '·';
                            $this->line("   {$mark} " . ($item['label'] ?? $item['title'] ?? '')
                                . ' <fg=gray>' . ($item['detail'] ?? $item['body'] ?? '') . '</>');
                        }
                    }
                }
            }
        }

        return self::SUCCESS;
    }
}

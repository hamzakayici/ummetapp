<?php

namespace App\Filament\Widgets;

use App\Services\DashboardService;
use Filament\Widgets\Widget;

/**
 * Kurulum durumu.
 *
 * Uygulamadan henüz veri gelmediği sürece panelin tamamı sıfır gösteriyor ve
 * bu hiçbir şey anlatmıyor: uygulama mı veri göndermiyor, entegrasyon mu eksik,
 * yoksa gerçekten kullanıcı mı yok? Bu widget o soruyu cevaplıyor.
 *
 * Veri akmaya başlayınca kendini gizler — kalıcı bir gürültü olmasın.
 */
class SetupStatus extends Widget
{
    protected static ?int $sort = -8;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.setup-status';

    public static function canView(): bool
    {
        return ! app(DashboardService::class)->setupStatus()['ready'];
    }

    protected function getViewData(): array
    {
        $status = app(DashboardService::class)->setupStatus();

        $items = $status['items'];
        $done = count(array_filter($items, fn ($i) => $i['done']));

        return [
            'items' => $items,
            'done' => $done,
            'total' => count($items),
            'percent' => count($items) > 0 ? (int) round($done / count($items) * 100) : 0,
        ];
    }
}

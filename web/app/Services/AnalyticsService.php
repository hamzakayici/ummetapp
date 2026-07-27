<?php

namespace App\Services;

use App\Models\AppDevice;
use App\Models\AppEvent;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /** @return array{d1: ?float, d7: ?float, d30: ?float, cohorts: int} */
    public function retentionSummary(): array
    {
        return Cache::remember('analytics.retention', now()->addMinutes(15), function () {
            return [
                'd1' => $this->retentionRate(1),
                'd7' => $this->retentionRate(7),
                'd30' => $this->retentionRate(30),
                'cohorts' => $this->cohortSampleSize(),
            ];
        });
    }

    /**
     * Kohort: son 30 günde ilk kez görülen cihazlar.
     * D{N}: ilk görülmeden N gün sonra tekrar olay gönderenlerin oranı.
     */
    public function retentionRate(int $days): ?float
    {
        $cohortEnd = now()->subDays($days + 1)->endOfDay();
        $cohortStart = now()->subDays($days + 31)->startOfDay();

        $cohortSize = AppDevice::query()
            ->whereBetween('first_seen_at', [$cohortStart, $cohortEnd])
            ->whereNotNull('first_seen_at')
            ->count();

        if ($cohortSize < 5) {
            return null;
        }

        $retained = AppDevice::query()
            ->whereBetween('first_seen_at', [$cohortStart, $cohortEnd])
            ->whereNotNull('first_seen_at')
            ->whereExists(function ($query) use ($days) {
                $query->select(DB::raw(1))
                    ->from('app_events')
                    ->whereColumn('app_events.device_id', 'app_devices.device_id')
                    ->whereRaw(
                        'DATE(app_events.ts) = DATE(DATE_ADD(app_devices.first_seen_at, INTERVAL ? DAY))',
                        [$days]
                    );
            })
            ->count();

        return round($retained / $cohortSize * 100, 1);
    }

    /** @return array<string, int> */
    public function platformBreakdown(int $days = 7): array
    {
        return Cache::remember("analytics.platform.{$days}", now()->addMinutes(5), function () use ($days) {
            return AppEvent::query()
                ->where('ts', '>=', now()->subDays($days))
                ->selectRaw('platform, COUNT(DISTINCT device_id) AS cihaz')
                ->groupBy('platform')
                ->orderByDesc('cihaz')
                ->pluck('cihaz', 'platform')
                ->map(fn ($v) => (int) $v)
                ->all();
        });
    }

    private function cohortSampleSize(): int
    {
        return AppDevice::query()
            ->where('first_seen_at', '>=', now()->subDays(60))
            ->whereNotNull('first_seen_at')
            ->count();
    }
}

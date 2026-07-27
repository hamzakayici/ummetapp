<?php

namespace App\Console\Commands;

use App\Models\ExternalMetric;
use App\Models\SyncState;
use App\Services\AppStoreConnectService;
use Illuminate\Console\Command;

/**
 * App Store Connect günlük metriklerini çeker ve external_metrics'e yazar.
 *
 * ⚠️ Apple canlı veri vermiyor — raporlar günlük üretiliyor ve 1-2 gün
 * gecikmeli geliyor. Bu komut günde birkaç kez çalışıp en taze veriyi alır.
 */
class SyncAppStoreConnect extends Command
{
    protected $signature = 'ummet:sync-app-store {--setup : Rapor talebi oluştur (ilk kurulumda bir kez)}';

    protected $description = 'App Store Connect analitik verilerini çeker';

    /** İlgilendiğimiz raporlar → hangi kolonları metrik olarak alacağız */
    private const WANTED = [
        'App Store Discovery and Engagement Standard' => [
            'Impressions' => 'impressions',
            'Impressions Unique Device' => 'impressions_unique',
            'Product Page Views' => 'product_page_views',
            'Product Page Views Unique Device' => 'product_page_views_unique',
        ],
        'App Downloads Standard' => [
            'Total Downloads' => 'downloads',
            'First Time Downloads' => 'downloads_first_time',
            'Redownloads' => 'downloads_redownload',
        ],
        'App Sessions Standard' => [
            'Sessions' => 'sessions',
            'Unique Devices' => 'active_devices',
            'Total Session Duration' => 'session_duration_total',
        ],
        'App Crashes' => [
            'Crashes' => 'crashes',
            'Unique Devices' => 'crash_devices',
        ],
    ];

    public function handle(AppStoreConnectService $asc): int
    {
        if ($problem = $asc->configurationProblem()) {
            $this->error($problem);
            SyncState::mark('app_store', 'failed', $problem);

            return self::FAILURE;
        }

        SyncState::mark('app_store', 'running');

        try {
            $requests = $asc->reportRequests();

            if ($this->option('setup') || $requests === []) {
                foreach (['ONGOING', 'ONE_TIME_SNAPSHOT'] as $type) {
                    if (! collect($requests)->firstWhere('accessType', $type)) {
                        $id = $asc->createReportRequest($type);
                        $this->info("{$type} rapor talebi oluşturuldu: {$id}");
                    }
                }

                $this->warn('Apple raporları üretmeye başlayacak — ilk seferde 24-48 saat sürebilir.');
                SyncState::mark('app_store', 'ok', 'Rapor talebi oluşturuldu, veri bekleniyor');

                return self::SUCCESS;
            }

            $written = 0;
            $latestDate = null;

            foreach ($requests as $request) {
                foreach (['APP_STORE_ENGAGEMENT', 'COMMERCE', 'APP_USAGE'] as $category) {
                    foreach ($asc->reports($request['id'], $category) as $report) {
                        $map = self::WANTED[$report['name']] ?? null;
                        if (! $map) {
                            continue;
                        }

                        foreach ($asc->instances($report['id']) as $instance) {
                            if ($instance['granularity'] !== 'DAILY') {
                                continue;
                            }

                            foreach ($asc->rows($instance['id']) as $row) {
                                $date = $row['Date'] ?? null;
                                if (! $date) {
                                    continue;
                                }

                                foreach ($map as $column => $metric) {
                                    if (! isset($row[$column]) || ! is_numeric($row[$column])) {
                                        continue;
                                    }

                                    ExternalMetric::updateOrCreate(
                                        [
                                            'source' => 'app_store',
                                            'metric' => $metric,
                                            'date' => $date,
                                            'dimension' => null,
                                        ],
                                        ['value' => (float) $row[$column]],
                                    );
                                    $written++;
                                }

                                if (! $latestDate || $date > $latestDate) {
                                    $latestDate = $date;
                                }
                            }
                        }
                    }
                }
            }

            if ($written === 0) {
                $this->warn('Hazır rapor bulunamadı — Apple henüz üretmemiş olabilir.');
                SyncState::mark('app_store', 'ok', 'Veri henüz üretilmemiş');

                return self::SUCCESS;
            }

            $this->info("{$written} metrik yazıldı. En güncel tarih: {$latestDate}");
            SyncState::mark('app_store', 'ok', "{$written} metrik", $latestDate);

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error($e->getMessage());
            SyncState::mark('app_store', 'failed', $e->getMessage());

            return self::FAILURE;
        }
    }
}

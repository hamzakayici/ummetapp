<?php

namespace App\Console\Commands;

use App\Services\AppStoreConnectService;
use Illuminate\Console\Command;

/** ASC API'de hangi uçların ANINDA veri verdiğini keşfeder. */
class AscProbe extends Command
{
    protected $signature = 'ummet:asc-probe';
    protected $description = 'App Store Connect API uçlarını yoklar';

    public function handle(AppStoreConnectService $asc): int
    {
        $appId = config('ummet.app_store_connect.app_id');

        $endpoints = [
            'Uygulama bilgisi'      => "/v1/apps/{$appId}",
            'Müşteri yorumları'     => "/v1/apps/{$appId}/customerReviews?limit=200&sort=-createdDate",
            'Sürümler'              => "/v1/apps/{$appId}/appStoreVersions?limit=10",
            'Yerelleştirmeler'      => "/v1/apps/{$appId}/appInfos",
            'Analytics talepleri'   => "/v1/apps/{$appId}/analyticsReportRequests",
        ];

        foreach ($endpoints as $label => $path) {
            try {
                $res = $asc->get($path);
                $n = isset($res['data']) ? (is_array($res['data']) && array_is_list($res['data']) ? count($res['data']) : 1) : 0;
                $this->line("<fg=green>✓</> " . str_pad($label, 24) . " {$n} kayıt");
            } catch (\Throwable $e) {
                $this->line("<fg=red>✗</> " . str_pad($label, 24) . " " . mb_substr($e->getMessage(), 0, 110));
            }
        }

        // Analytics rapor örnekleri hazır mı?
        $this->newLine();
        $this->line('<fg=yellow>Analytics rapor örnekleri:</>');
        try {
            foreach ($asc->reportRequests() as $req) {
                foreach (['APP_STORE_ENGAGEMENT', 'COMMERCE', 'APP_USAGE'] as $cat) {
                    $reports = $asc->reports($req['id'], $cat);
                    $withData = 0;
                    foreach ($reports as $r) {
                        if (count($asc->instances($r['id'])) > 0) {
                            $withData++;
                        }
                    }
                    $this->line("  {$req['accessType']} / {$cat}: " . count($reports) . " rapor, {$withData} tanesinde veri");
                }
            }
        } catch (\Throwable $e) {
            $this->error('  ' . $e->getMessage());
        }

        return self::SUCCESS;
    }
}

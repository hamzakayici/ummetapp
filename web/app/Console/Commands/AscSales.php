<?php

namespace App\Console\Commands;

use App\Services\AppStoreConnectService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Sales and Trends raporu — Analytics'ten farklı olarak rapor talebi beklemez,
 * veri ertesi gün hazırdır. İndirme sayıları buradan gelir.
 *
 * Tek engeli: vendorNumber gerekiyor (App Store Connect > Payments and
 * Financial Reports sayfasının üstünde yazar).
 */
class AscSales extends Command
{
    protected $signature = 'ummet:asc-sales {--vendor=} {--date=}';
    protected $description = 'Sales and Trends raporunu çeker';

    public function handle(AppStoreConnectService $asc): int
    {
        $vendor = $this->option('vendor');
        $date = $this->option('date') ?: now()->subDays(2)->format('Y-m-d');

        if (! $vendor) {
            // Vendor numarası olmadan istek at — hata mesajı genelde geçerli
            // numaraları listeliyor
            $this->warn('vendorNumber verilmedi, API ne diyor bakalım...');
            $vendor = '00000000';
        }

        $url = 'https://api.appstoreconnect.apple.com/v1/salesReports';
        $params = [
            'filter[frequency]' => 'DAILY',
            'filter[reportType]' => 'SALES',
            'filter[reportSubType]' => 'SUMMARY',
            'filter[vendorNumber]' => $vendor,
            'filter[reportDate]' => $date,
        ];

        $res = Http::withToken($asc->token())
            ->withHeaders(['Accept' => 'application/a-gzip'])
            ->timeout(60)
            ->get($url, $params);

        $this->line("HTTP {$res->status()} — tarih {$date}, vendor {$vendor}");

        if ($res->successful()) {
            $tsv = @gzdecode($res->body()) ?: $res->body();
            $lines = array_filter(explode("\n", trim($tsv)));
            $this->info(count($lines) - 1 . ' satır veri geldi');
            foreach (array_slice($lines, 0, 3) as $l) {
                $this->line('  ' . mb_substr($l, 0, 160));
            }

            return self::SUCCESS;
        }

        $body = $res->body();
        $json = json_decode($body, true);

        foreach ($json['errors'] ?? [] as $e) {
            $this->error('  ' . ($e['title'] ?? '') . ': ' . ($e['detail'] ?? ''));
        }

        if (! $json) {
            $this->line('  ' . mb_substr($body, 0, 300));
        }

        return self::FAILURE;
    }
}

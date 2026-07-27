<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * App Store Connect API istemcisi.
 *
 * ⚠️ ÖNEMLİ: Apple canlı veri vermez. Analytics Reports API günlük toplu
 * rapor üretir ve veri 1-2 gün gecikmelidir. "Anlık" göstermek mümkün değil;
 * yapabildiğimiz en iyisi günde birkaç kez çekip tarihiyle birlikte göstermek.
 *
 * Kimlik bilgileri .env:
 *   ASC_ISSUER_ID, ASC_KEY_ID, ASC_P8_PATH, ASC_APP_ID
 */
class AppStoreConnectService
{
    private const BASE = 'https://api.appstoreconnect.apple.com';

    public function isConfigured(): bool
    {
        return $this->configurationProblem() === null;
    }

    /**
     * Yapılandırma sorununu ayrıntılı anlatır.
     *
     * "Kimlik bilgileri eksik" demek yetmiyor: en sık karşılaşılan durum
     * bilgilerin girilmiş ama .p8 dosyasının taşınmış/silinmiş olması.
     * İkisini ayırmazsak yanlış yerde hata aranıyor.
     *
     * @return string|null sorun açıklaması, sorun yoksa null
     */
    public function configurationProblem(): ?string
    {
        $c = config('ummet.app_store_connect');

        $missing = collect([
            'ASC_ISSUER_ID' => $c['issuer_id'] ?? null,
            'ASC_KEY_ID' => $c['key_id'] ?? null,
            'ASC_APP_ID' => $c['app_id'] ?? null,
        ])->filter(fn ($v) => empty($v))->keys();

        if ($missing->isNotEmpty()) {
            return '.env içinde eksik: ' . $missing->implode(', ');
        }

        $path = $c['p8_path'] ?? '';

        if (empty($path)) {
            return '.env içinde ASC_P8_PATH tanımlı değil.';
        }

        if (! file_exists($path)) {
            return "Kimlik bilgileri tamam ancak .p8 dosyası bulunamadı: {$path}\n"
                . 'Dosyayı taşıdıysanız ASC_P8_PATH değerini güncelleyin. '
                . 'Sildiyseniz App Store Connect > Users and Access > Integrations üzerinden yeni bir key üretmeniz gerekir '
                . '(.p8 yalnızca bir kez indirilebilir).';
        }

        if (! is_readable($path)) {
            return ".p8 dosyası okunamıyor (izin sorunu): {$path} — `chmod 600 {$path}` deneyin.";
        }

        return null;
    }

    /**
     * ES256 imzalı JWT. Apple 20 dakikadan uzun ömür kabul etmiyor.
     *
     * Not: JOSE ham R||S imza ister, OpenSSL varsayılanı DER'dir —
     * bu yüzden DER'i elle çözüp 64 baytlık ham forma çeviriyoruz.
     */
    public function token(): string
    {
        $c = config('ummet.app_store_connect');

        if (! $this->isConfigured()) {
            throw new RuntimeException($this->configurationProblem() ?? 'App Store Connect yapılandırması geçersiz.');
        }

        $header = $this->b64([
            'alg' => 'ES256',
            'kid' => $c['key_id'],
            'typ' => 'JWT',
        ]);

        $payload = $this->b64([
            'iss' => $c['issuer_id'],
            'iat' => time(),
            'exp' => time() + 15 * 60,
            'aud' => 'appstoreconnect-v1',
        ]);

        $key = openssl_pkey_get_private(file_get_contents($c['p8_path']));
        if ($key === false) {
            throw new RuntimeException('.p8 anahtarı okunamadı.');
        }

        openssl_sign("{$header}.{$payload}", $der, $key, OPENSSL_ALGO_SHA256);

        return "{$header}.{$payload}." . $this->b64url($this->derToRaw($der));
    }

    public function get(string $path, array $query = []): array
    {
        $response = Http::withToken($this->token())
            ->timeout(30)
            ->get(str_starts_with($path, 'http') ? $path : self::BASE . $path, $query);

        if (! $response->successful()) {
            $detail = collect($response->json('errors', []))
                ->map(fn ($e) => ($e['title'] ?? '') . ': ' . ($e['detail'] ?? ''))
                ->implode(' | ');

            throw new RuntimeException("ASC API {$response->status()} — {$detail}");
        }

        return $response->json() ?? [];
    }

    /** Uygulama bilgisi — bağlantı testi için */
    public function app(): array
    {
        return $this->get('/v1/apps/' . config('ummet.app_store_connect.app_id'));
    }

    /** @return array<int, array{id:string, accessType:string}> */
    public function reportRequests(): array
    {
        $appId = config('ummet.app_store_connect.app_id');
        $data = $this->get("/v1/apps/{$appId}/analyticsReportRequests")['data'] ?? [];

        return array_map(fn ($r) => [
            'id' => $r['id'],
            'accessType' => $r['attributes']['accessType'] ?? '',
        ], $data);
    }

    /** Rapor talebi oluştur (bir kez yeterli, sonrasında Apple üretmeye devam eder) */
    public function createReportRequest(string $accessType = 'ONGOING'): string
    {
        $response = Http::withToken($this->token())
            ->timeout(30)
            ->post(self::BASE . '/v1/analyticsReportRequests', [
                'data' => [
                    'type' => 'analyticsReportRequests',
                    'attributes' => ['accessType' => $accessType],
                    'relationships' => [
                        'app' => ['data' => ['type' => 'apps', 'id' => config('ummet.app_store_connect.app_id')]],
                    ],
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException("Rapor talebi oluşturulamadı: {$response->status()}");
        }

        return $response->json('data.id');
    }

    /** @return array<int, array{id:string, name:string, category:string}> */
    public function reports(string $requestId, ?string $category = null): array
    {
        $query = ['limit' => 200];
        if ($category) {
            $query['filter[category]'] = $category;
        }

        $data = $this->get("/v1/analyticsReportRequests/{$requestId}/reports", $query)['data'] ?? [];

        return array_map(fn ($r) => [
            'id' => $r['id'],
            'name' => $r['attributes']['name'] ?? '',
            'category' => $r['attributes']['category'] ?? '',
        ], $data);
    }

    /** @return array<int, array{id:string, granularity:string, processingDate:string}> */
    public function instances(string $reportId): array
    {
        $data = $this->get("/v1/analyticsReports/{$reportId}/instances", ['limit' => 200])['data'] ?? [];

        return array_map(fn ($i) => [
            'id' => $i['id'],
            'granularity' => $i['attributes']['granularity'] ?? '',
            'processingDate' => $i['attributes']['processingDate'] ?? '',
        ], $data);
    }

    /**
     * Bir rapor örneğinin satırlarını indirir.
     * Segmentler gzip'li TSV olarak imzalı URL'den gelir.
     *
     * @return array<int, array<string, string>>
     */
    public function rows(string $instanceId): array
    {
        $segments = $this->get("/v1/analyticsReportInstances/{$instanceId}/segments")['data'] ?? [];
        $rows = [];

        foreach ($segments as $segment) {
            $url = $segment['attributes']['url'] ?? null;
            if (! $url) {
                continue;
            }

            // İmzalı URL — Authorization başlığı göndermeyin
            $gz = Http::timeout(120)->get($url)->body();
            $tsv = @gzdecode($gz) ?: $gz;

            $lines = preg_split('/\r\n|\n/', trim($tsv));
            if (count($lines) < 2) {
                continue;
            }

            $headers = explode("\t", array_shift($lines));

            foreach ($lines as $line) {
                if ($line === '') {
                    continue;
                }
                $values = explode("\t", $line);
                if (count($values) === count($headers)) {
                    $rows[] = array_combine($headers, $values);
                }
            }
        }

        return $rows;
    }

    private function b64(array $data): string
    {
        return $this->b64url(json_encode($data, JSON_UNESCAPED_SLASHES));
    }

    private function b64url(string $raw): string
    {
        return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
    }

    /** DER (ASN.1 SEQUENCE of two INTEGERs) → 64 baytlık ham R||S */
    private function derToRaw(string $der): string
    {
        $offset = 2;
        if (ord($der[1]) > 0x80) {
            $offset += ord($der[1]) - 0x80;
        }

        $read = function (int &$pos) use ($der): string {
            $pos++;                      // 0x02 INTEGER etiketi
            $len = ord($der[$pos++]);
            $value = substr($der, $pos, $len);
            $pos += $len;

            return str_pad(ltrim($value, "\x00"), 32, "\x00", STR_PAD_LEFT);
        };

        $r = $read($offset);
        $s = $read($offset);

        return $r . $s;
    }
}

<?php

namespace App\Services;

use App\Models\PushToken;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Expo Push API istemcisi.
 *
 * Eski Next/Payload panelindeki `expoPush.ts` servisinin PHP karşılığı.
 *
 * ⚠️ GÜVENLİK: config('ummet.push.enabled') false iken sadece test token'larına
 * gönderilir. Yerelde bu bayrak açılırsa App Store'daki GERÇEK kullanıcılara
 * bildirim gider ve geri alınamaz.
 */
class ExpoPushService
{
    private const ENDPOINT = 'https://exp.host/--/api/v2/push/send';

    /** Expo tek istekte en fazla 100 mesaj kabul ediyor */
    private const CHUNK_SIZE = 100;

    /**
     * @param  list<string>  $tokens
     * @param  array<string,mixed>  $data  bildirime tıklanınca uygulamaya geçecek veri
     * @return array{sent: int, failed: int, skipped: int}
     */
    public function send(array $tokens, string $title, string $body, array $data = []): array
    {
        $tokens = array_values(array_unique(array_filter($tokens)));
        $skipped = 0;

        if (! config('ummet.push.enabled')) {
            $allowed = config('ummet.push.test_tokens');
            $before = count($tokens);
            $tokens = array_values(array_intersect($tokens, $allowed));
            $skipped = $before - count($tokens);

            Log::info('Push kısıtlı modda', [
                'gonderilecek' => count($tokens),
                'atlanan' => $skipped,
            ]);
        }

        if ($tokens === []) {
            return ['sent' => 0, 'failed' => 0, 'skipped' => $skipped];
        }

        $sent = 0;
        $failed = 0;

        foreach (array_chunk($tokens, self::CHUNK_SIZE) as $chunk) {
            $messages = array_map(fn (string $token) => [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'sound' => 'default',
                'data' => $data,
            ], $chunk);

            try {
                $response = Http::timeout(30)
                    ->withHeaders(['Accept-Encoding' => 'gzip, deflate'])
                    ->post(self::ENDPOINT, $messages);

                if (! $response->successful()) {
                    Log::error('Expo push isteği başarısız', ['status' => $response->status()]);
                    $failed += count($chunk);

                    continue;
                }

                foreach ($response->json('data', []) as $i => $ticket) {
                    if (($ticket['status'] ?? null) === 'ok') {
                        $sent++;

                        continue;
                    }

                    $failed++;
                    $this->handleTicketError($chunk[$i] ?? null, $ticket);
                }
            } catch (\Throwable $e) {
                Log::error('Expo push hatası', ['hata' => $e->getMessage()]);
                $failed += count($chunk);
            }
        }

        return ['sent' => $sent, 'failed' => $failed, 'skipped' => $skipped];
    }

    /**
     * Bir segmentin token'larını döndürür.
     *
     * @return list<string>
     */
    public function tokensForSegment(string $segment): array
    {
        $query = PushToken::active();

        match ($segment) {
            'ios' => $query->where('platform', 'ios'),
            'android' => $query->where('platform', 'android'),

            // Son 7 günde uygulamayı açanlar
            'active_7d' => $query->whereIn('device_id', fn ($q) => $q
                ->select('device_id')->from('app_devices')
                ->where('last_seen_at', '>=', now()->subDays(7))),

            // 14 gündür açmayanlar — geri kazanım kampanyaları için
            'inactive_14d' => $query->whereIn('device_id', fn ($q) => $q
                ->select('device_id')->from('app_devices')
                ->where('last_seen_at', '<', now()->subDays(14))),

            default => null,   // 'all'
        };

        return $query->pluck('expo_push_token')->all();
    }

    /** @return Collection<string, int> segment => tahmini alıcı sayısı */
    public function segmentCounts(): Collection
    {
        return collect(['all', 'active_7d', 'inactive_14d', 'ios', 'android'])
            ->mapWithKeys(fn (string $s) => [$s => count($this->tokensForSegment($s))]);
    }

    /** Expo "cihaz kayıtlı değil" derse token'ı pasife çekiyoruz — boşa gönderim yapmayalım */
    private function handleTicketError(?string $token, array $ticket): void
    {
        $reason = $ticket['details']['error'] ?? null;

        if ($token && $reason === 'DeviceNotRegistered') {
            PushToken::where('expo_push_token', $token)->update(['is_active' => false]);

            return;
        }

        Log::warning('Push bileti hatalı', [
            'sebep' => $reason,
            'mesaj' => $ticket['message'] ?? null,
        ]);
    }
}

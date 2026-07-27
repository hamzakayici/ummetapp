<?php

namespace App\Jobs;

use App\Models\PushNotification;
use App\Services\ExpoPushService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * Push gönderimi kuyrukta yapılır — binlerce token'da senkron gönderim
 * istek zaman aşımına uğrar.
 *
 * Paylaşımlı hostingde daemon çalıştırılamadığı için kuyruk cron ile tetiklenir:
 *   * * * * * php artisan schedule:run
 */
class SendPushNotification implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;

    public int $tries = 2;

    public function __construct(public PushNotification $notification) {}

    public function handle(ExpoPushService $expo): void
    {
        $n = $this->notification;

        if ($n->status === 'sent') {
            Log::info('Bildirim zaten gönderilmiş, atlanıyor', ['id' => $n->id]);

            return;
        }

        $tokens = $expo->tokensForSegment($n->segment);

        $n->update([
            'status' => 'sending',
            'recipient_count' => count($tokens),
        ]);

        $result = $expo->send(
            $tokens,
            $n->title,
            $n->body,
            array_filter([
                'notification_id' => $n->id,
                'route' => $n->route,
            ]),
        );

        // Kısıtlı mod (PUSH_ENABLED=false) bir başarısızlık değil — her şey
        // bilerek atlandıysa taslak olarak bırak ki canlıda tekrar gönderilebilsin.
        $onlySkipped = $result['sent'] === 0 && $result['failed'] === 0 && $result['skipped'] > 0;

        $n->update([
            'status' => match (true) {
                $onlySkipped => 'draft',
                $result['sent'] > 0 => 'sent',
                default => 'failed',
            },
            'sent_count' => $result['sent'],
            'sent_at' => $onlySkipped ? null : now(),
        ]);

        Log::info('Push gönderimi tamamlandı', ['id' => $n->id] + $result);
    }

    public function failed(\Throwable $e): void
    {
        $this->notification->update(['status' => 'failed']);
    }
}

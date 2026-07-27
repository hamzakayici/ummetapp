<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseEvent;
use App\Models\Subscription;
use App\Models\SyncState;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * RevenueCat webhook alıcısı.
 *
 * Panelde GERÇEKTEN anlık olan tek dış veri kaynağı budur — satın alma
 * gerçekleştiği anda RevenueCat buraya POST eder.
 *
 * RevenueCat panelinde:
 *   Integrations → Webhooks → URL: https://ummetapp.com/api/v1/webhooks/revenuecat
 *   Authorization header: .env içindeki REVENUECAT_WEBHOOK_SECRET ile aynı olmalı
 */
class RevenueCatWebhookController extends Controller
{
    /** Consumable destek ürünleri — abonelik tablosuna yazılmaz */
    private const SUPPORT_PRODUCT_PREFIX = 'ummet_support_';

    public function handle(Request $request)
    {
        $expected = config('ummet.revenuecat.webhook_secret');

        if ($expected && ! hash_equals($expected, (string) $request->header('Authorization'))) {
            Log::warning('RevenueCat webhook: yetkisiz istek');

            return response()->json(['ok' => false], 401);
        }

        $event = $request->input('event');

        if (! is_array($event) || empty($event['id']) || empty($event['type'])) {
            return response()->json(['ok' => false, 'reason' => 'gecersiz_govde'], 422);
        }

        if (PurchaseEvent::where('event_id', $event['id'])->exists()) {
            return response()->json(['ok' => true, 'duplicate' => true]);
        }

        $occurredAt = isset($event['event_timestamp_ms'])
            ? Carbon::createFromTimestampMs((int) $event['event_timestamp_ms'])
            : now();

        $revenue = (float) ($event['price_in_purchased_currency'] ?? 0);
        if (isset($event['proceeds_in_usd'])) {
            $revenue = (float) $event['proceeds_in_usd'];
        }

        PurchaseEvent::create([
            'event_id' => $event['id'],
            'type' => $event['type'],
            'app_user_id' => (string) ($event['app_user_id'] ?? 'bilinmiyor'),
            'product_id' => $event['product_id'] ?? null,
            'store' => $event['store'] ?? null,
            'country' => $event['country_code'] ?? null,
            'revenue_usd' => $revenue,
            'payload' => $event,
            'occurred_at' => $occurredAt,
        ]);

        if ($this->shouldUpdateSubscription($event)) {
            $this->applyToSubscription($event, $occurredAt, $revenue);
        }

        SyncState::mark('revenuecat', 'ok', 'Webhook alındı: ' . $event['type']);

        return response()->json(['ok' => true]);
    }

    /** Destek (consumable) satın alımları yalnızca purchase_events'e yazılır */
    private function shouldUpdateSubscription(array $event): bool
    {
        $type = (string) ($event['type'] ?? '');

        if ($type === 'NON_RENEWING_PURCHASE') {
            return false;
        }

        $productId = (string) ($event['product_id'] ?? '');
        if ($productId !== '' && str_starts_with($productId, self::SUPPORT_PRODUCT_PREFIX)) {
            return false;
        }

        return true;
    }

    private function applyToSubscription(array $event, Carbon $occurredAt, float $revenue): void
    {
        $userId = (string) ($event['app_user_id'] ?? '');
        if ($userId === '') {
            return;
        }

        $status = match ($event['type']) {
            'INITIAL_PURCHASE', 'RENEWAL', 'TRIAL_CONVERTED', 'UNCANCELLATION', 'PRODUCT_CHANGE' => 'active',
            'TRIAL_STARTED' => 'trial',
            'CANCELLATION', 'TRIAL_CANCELLED' => 'cancelled',
            'EXPIRATION' => 'expired',
            'BILLING_ISSUE' => 'grace',
            'REFUND' => 'refunded',
            default => null,
        };

        if ($status === null) {
            return;
        }

        $subscription = Subscription::firstOrNew(['app_user_id' => $userId]);

        $entitlement = $event['entitlement_id']
            ?? ($event['entitlement_ids'][0] ?? null)
            ?? $subscription->entitlement
            ?? 'pro';

        $subscription->fill([
            'product_id' => $event['product_id'] ?? $subscription->product_id,
            'store' => $event['store'] ?? $subscription->store,
            'entitlement' => $entitlement,
            'country' => $event['country_code'] ?? $subscription->country,
            'status' => $status,
            'is_trial' => $status === 'trial',
        ]);

        if (! $subscription->started_at) {
            $subscription->started_at = $occurredAt;
        }

        if (! empty($event['expiration_at_ms'])) {
            $subscription->expires_at = Carbon::createFromTimestampMs((int) $event['expiration_at_ms']);
        }

        if (in_array($status, ['cancelled', 'refunded'], true)) {
            $subscription->cancelled_at = $occurredAt;
        }

        if ($event['type'] === 'REFUND') {
            $subscription->revenue_usd = max(0, (float) $subscription->revenue_usd - abs($revenue));
        } else {
            $subscription->revenue_usd = (float) $subscription->revenue_usd + max(0, $revenue);
        }

        $subscription->save();
    }
}

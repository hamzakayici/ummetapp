<?php

namespace Tests\Feature;

use App\Models\PurchaseEvent;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RevenueCatWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_consumable_support_purchase_records_event_only(): void
    {
        config(['ummet.revenuecat.webhook_secret' => 'test-secret']);

        $payload = [
            'event' => [
                'id' => 'evt_support_1',
                'type' => 'NON_RENEWING_PURCHASE',
                'app_user_id' => 'dev_test_123',
                'product_id' => 'ummet_support_tea',
                'store' => 'APP_STORE',
                'country_code' => 'TR',
                'proceeds_in_usd' => 0.79,
                'event_timestamp_ms' => now()->getTimestampMs(),
            ],
        ];

        $response = $this->postJson('/api/v1/webhooks/revenuecat', $payload, [
            'Authorization' => 'test-secret',
        ]);

        $response->assertOk()->assertJson(['ok' => true]);
        $this->assertDatabaseHas('purchase_events', [
            'event_id' => 'evt_support_1',
            'type' => 'NON_RENEWING_PURCHASE',
            'product_id' => 'ummet_support_tea',
        ]);
        $this->assertDatabaseMissing('subscriptions', [
            'app_user_id' => 'dev_test_123',
        ]);
    }

    public function test_subscription_purchase_updates_subscription_row(): void
    {
        config(['ummet.revenuecat.webhook_secret' => 'test-secret']);

        $payload = [
            'event' => [
                'id' => 'evt_sub_1',
                'type' => 'INITIAL_PURCHASE',
                'app_user_id' => 'dev_pro_456',
                'product_id' => 'ummet_pro_yearly',
                'store' => 'APP_STORE',
                'country_code' => 'TR',
                'entitlement_ids' => ['pro'],
                'proceeds_in_usd' => 24.99,
                'expiration_at_ms' => now()->addYear()->getTimestampMs(),
                'event_timestamp_ms' => now()->getTimestampMs(),
            ],
        ];

        $response = $this->postJson('/api/v1/webhooks/revenuecat', $payload, [
            'Authorization' => 'test-secret',
        ]);

        $response->assertOk();
        $this->assertSame(1, PurchaseEvent::count());
        $this->assertDatabaseHas('subscriptions', [
            'app_user_id' => 'dev_pro_456',
            'product_id' => 'ummet_pro_yearly',
            'status' => 'active',
            'entitlement' => 'pro',
        ]);
    }

    public function test_duplicate_events_are_ignored(): void
    {
        config(['ummet.revenuecat.webhook_secret' => 'test-secret']);

        PurchaseEvent::create([
            'event_id' => 'evt_dup',
            'type' => 'NON_RENEWING_PURCHASE',
            'app_user_id' => 'dev_1',
            'revenue_usd' => 1,
            'occurred_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/webhooks/revenuecat', [
            'event' => [
                'id' => 'evt_dup',
                'type' => 'NON_RENEWING_PURCHASE',
                'app_user_id' => 'dev_1',
                'product_id' => 'ummet_support_tea',
            ],
        ], ['Authorization' => 'test-secret']);

        $response->assertOk()->assertJson(['duplicate' => true]);
        $this->assertSame(1, PurchaseEvent::count());
        $this->assertSame(0, Subscription::count());
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Gelir tabloları — RevenueCat webhook'undan beslenir.
 * Pro/abonelik henüz yayında değil; altyapı hazır bekliyor.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Kullanıcı bazlı güncel abonelik durumu (tek satır = tek kullanıcı)
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('app_user_id')->unique();      // RevenueCat kullanıcı kimliği = device_id
            $table->string('product_id')->nullable();     // aylik / yillik / omur_boyu
            $table->string('store')->nullable();          // APP_STORE | PLAY_STORE
            $table->string('entitlement')->default('pro');
            $table->enum('status', ['trial', 'active', 'grace', 'expired', 'cancelled', 'refunded'])
                ->default('active');
            $table->string('country')->nullable();
            $table->decimal('revenue_usd', 10, 2)->default(0);   // RevenueCat proceeds
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('is_trial')->default(false);
            $table->timestamps();

            $table->index(['status', 'expires_at']);
        });

        // Ham olay akışı — her webhook bir satır. Denetim izi ve zaman serisi.
        Schema::create('purchase_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_id')->unique();          // tekrar gönderimlerde çift kayıt olmasın
            $table->string('type')->index();               // INITIAL_PURCHASE, RENEWAL, CANCELLATION...
            $table->string('app_user_id')->index();
            $table->string('product_id')->nullable();
            $table->string('store')->nullable();
            $table->string('country')->nullable();
            $table->decimal('revenue_usd', 10, 2)->default(0);
            $table->json('payload')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_events');
        Schema::dropIfExists('subscriptions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ortak zikir — paylaşılabilir kod ile grup zikri.
 *
 * NOT: Eski Supabase sürümü Realtime WebSocket kullanıyordu. Paylaşımlı hostingde
 * kalıcı süreç çalıştırılamadığı için mobil taraf polling'e geçecek (ekran açıkken
 * 3-5 sn'de bir). Sayaç artırma, yarış durumu yaratmaması için atomik UPDATE ile yapılır.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_dhikrs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('preset_name');
            $table->unsignedBigInteger('target_count')->default(0);
            $table->unsignedBigInteger('current_count')->default(0);
            $table->string('share_code', 12)->unique();
            $table->string('creator_device_id')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });

        // Kimin ne kadar katkı verdiği — hem kötüye kullanımı sınırlamak
        // hem de "senin katkın" göstergesini sunucudan doğrulayabilmek için
        Schema::create('shared_dhikr_contributions', function (Blueprint $table) {
            $table->id();
            $table->uuid('shared_dhikr_id');
            $table->string('device_id');
            $table->unsignedBigInteger('amount')->default(0);
            $table->timestamps();

            $table->unique(['shared_dhikr_id', 'device_id']);
            $table->foreign('shared_dhikr_id')->references('id')->on('shared_dhikrs')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_dhikr_contributions');
        Schema::dropIfExists('shared_dhikrs');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Dış kaynaklardan çekilen günlük metrikler.
 *
 * App Store Connect ve Play Console CANLI veri vermez — günlük toplu rapor
 * üretirler (1-2 gün gecikmeli). Bu yüzden çekip burada tarihli saklıyoruz.
 * Panel bu tablodan okur, her sayfa açılışında dış API'ye gitmez.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('external_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('source');        // app_store | play_store | revenuecat
            $table->string('metric');        // impressions, downloads, proceeds...
            $table->date('date');
            $table->decimal('value', 16, 4)->default(0);
            $table->string('dimension')->nullable();   // ülke, kaynak vb. kırılım
            $table->timestamps();

            $table->unique(['source', 'metric', 'date', 'dimension'], 'external_metrics_unique');
            $table->index(['source', 'date']);
        });

        // Her kaynağın son senkron durumu — panelde "veri ne kadar taze" göstergesi
        Schema::create('sync_states', function (Blueprint $table) {
            $table->id();
            $table->string('source')->unique();
            $table->enum('status', ['idle', 'running', 'ok', 'failed'])->default('idle');
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('last_success_at')->nullable();
            $table->date('data_through')->nullable();   // veri hangi güne kadar geldi
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_states');
        Schema::dropIfExists('external_metrics');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Duyuru, remote config ve push tabloları.
 * Eski Supabase şemasının MySQL karşılığı.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Uygulama içi duyurular — mobil uygulama okur, admin panel yönetir
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable();
            $table->enum('type', ['info', 'warning', 'update'])->default('info');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('open_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'published_at']);
        });

        // Remote config — anahtar/değer, uygulama açılışta çeker
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        // Expo push token kayıtları
        Schema::create('push_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('expo_push_token')->unique();
            $table->string('device_id')->nullable()->index();
            $table->enum('platform', ['ios', 'android', 'web', 'other'])->default('ios');
            $table->string('app_version')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Gönderilen push bildirimleri + performans metrikleri
        Schema::create('push_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('route')->nullable();          // bildirime tıklayınca açılacak ekran
            $table->string('segment')->default('all');    // all | active_7d | inactive_14d | ios | android
            $table->enum('status', ['draft', 'queued', 'sending', 'sent', 'failed'])->default('draft');
            $table->unsignedInteger('recipient_count')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('open_count')->default(0);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'sent_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_notifications');
        Schema::dropIfExists('push_tokens');
        Schema::dropIfExists('app_settings');
        Schema::dropIfExists('announcements');
    }
};

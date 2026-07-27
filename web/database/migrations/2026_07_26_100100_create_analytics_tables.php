<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Analytics tabloları — cihaz, oturum, event.
 * Mobil uygulama API üzerinden batch halinde yazar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_devices', function (Blueprint $table) {
            $table->id();
            $table->string('device_id')->unique();
            $table->enum('platform', ['ios', 'android', 'web', 'other'])->default('other');
            $table->string('app_version')->nullable();
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('app_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->unique();
            $table->string('device_id')->index();
            $table->timestamp('started_at')->nullable()->index();
            $table->timestamp('ended_at')->nullable();
            $table->unsignedBigInteger('duration_ms')->nullable();
            $table->enum('platform', ['ios', 'android', 'web', 'other'])->default('other');
            $table->string('app_version')->nullable();
            $table->timestamps();
        });

        Schema::create('app_events', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->string('device_id')->index();
            $table->string('session_id')->nullable()->index();
            $table->enum('platform', ['ios', 'android', 'web', 'other'])->default('other');
            $table->string('app_version')->nullable();
            $table->string('pathname')->nullable();
            $table->json('props')->nullable();
            $table->timestamp('ts')->index();
            $table->timestamps();

            // Dashboard sorguları için: "son 24 saatte olay adına göre grupla"
            $table->index(['ts', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_events');
        Schema::dropIfExists('app_sessions');
        Schema::dropIfExists('app_devices');
    }
};

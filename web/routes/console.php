<?php

use App\Models\AppSession;
use Illuminate\Support\Facades\Schedule;

/*
 * Paylaşımlı hostingde daemon çalıştırılamaz. cPanel'de tek bir cron satırı
 * bu dosyayı çalıştırır:
 *   * * * * * cd /home/kullanici/ummet-web && php artisan schedule:run >> /dev/null 2>&1
 */

// Push kuyruğu — daemon yerine dakikada bir boşalt
Schedule::command('queue:work --stop-when-empty --tries=2 --max-time=50')
    ->everyMinute()
    ->withoutOverlapping();

/*
 * Kapanmamış oturumları kapat.
 *
 * Uygulama kill edilirse session_end hiç gelmiyor ve oturum sonsuza kadar açık
 * kalıyordu — bu yüzden "ortalama oturum süresi" metriği olduğundan uzun
 * görünüyordu. Süreyi son olayın zamanına göre kapatıyoruz.
 */
Schedule::call(function () {
    AppSession::whereNull('ended_at')
        ->where('started_at', '<', now()->subHours(24))
        ->chunkById(200, function ($sessions) {
            foreach ($sessions as $session) {
                $lastEvent = \App\Models\AppEvent::where('session_id', $session->session_id)
                    ->max('ts');

                $endedAt = $lastEvent ? \Illuminate\Support\Carbon::parse($lastEvent) : $session->started_at;

                $session->update([
                    'ended_at' => $endedAt,
                    'duration_ms' => max(0, $session->started_at->diffInMilliseconds($endedAt)),
                ]);
            }
        });
})->hourly()->name('oturum-kapat')->withoutOverlapping();

// Analitik widget cache'ini tazele
Schedule::call(fn () => cache()->forget('analytics.overview'))->everyFiveMinutes();

/*
 * App Store Connect senkronu.
 *
 * Apple raporları günlük üretiyor ve 1-2 gün gecikmeli yayınlıyor; bu yüzden
 * sık çekmenin anlamı yok. Günde iki kez yeterli (biri Apple'ın rapor ürettiği
 * saatlere denk gelsin diye sabah, biri yedek).
 */
Schedule::command('ummet:sync-app-store')
    ->twiceDaily(7, 19)
    ->withoutOverlapping()
    ->name('app-store-senkron');

// Gelir widget cache'i — webhook geldiğinde bir dakika içinde yansısın
Schedule::call(fn () => cache()->forget('revenue.overview'))->everyMinute();

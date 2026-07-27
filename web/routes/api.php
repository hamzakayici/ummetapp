<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\PushNotificationController;
use App\Http\Controllers\Api\RevenueCatWebhookController;
use App\Http\Controllers\Api\PushTokenController;
use App\Http\Controllers\Api\SharedDhikrController;
use Illuminate\Support\Facades\Route;

/*
 * Mobil uygulama API'si — silinen Supabase backend'inin yerini alır.
 * Tümü /api/v1 altında sürümlenmiş; eski istemciler kırılmadan v2 çıkarılabilir.
 *
 * KİMLİK DOĞRULAMA YOK — bilinçli. Uygulama hesap istemiyor, `device_id`
 * istemcide üretilen anonim bir dize. Bunun bedeli: her uç kötüye kullanıma
 * açık. Bu yüzden hepsinde hız sınırı var ve sayaçlar tekrar korumalı.
 */
Route::prefix('v1')->group(function () {

    // ── Okuma ──
    // 5 dk sunucu cache'li ama yine de sınırlı: cache'i ıskalayan bir istek
    // dalgası paylaşımlı hostingde CPU kotasını yakabilir.
    Route::middleware('throttle:60,1')->group(function () {
        Route::get('/announcements', [ConfigController::class, 'announcements']);
        Route::get('/settings', [ConfigController::class, 'settings']);
        Route::get('/stats/online', [ConfigController::class, 'onlineCount']);
    });

    // Analytics — yazma ağırlıklı, throttle'lı
    Route::middleware('throttle:120,1')->group(function () {
        Route::post('/analytics/events', [AnalyticsController::class, 'ingest']);
        Route::post('/analytics/device', [AnalyticsController::class, 'device']);
        Route::post('/analytics/session/start', [AnalyticsController::class, 'sessionStart']);
        Route::post('/analytics/session/end', [AnalyticsController::class, 'sessionEnd']);
    });

    Route::post('/push-tokens', [PushTokenController::class, 'store'])->middleware('throttle:20,1');

    /*
     * Açılma sayaçları.
     *
     * ⚠️ Bu sayılar panelde "açılma oranı" olarak gösteriliyor ve ileride
     * sponsorluk satarken kullanılacak. Şişirilebilir olmaları veriyi
     * değersizleştirir. İki katman: hız sınırı + cihaz başına günlük tekrar
     * koruması (controller'da).
     */
    Route::middleware('throttle:20,1')->group(function () {
        Route::post('/announcements/{announcement}/opened', [ConfigController::class, 'announcementOpened']);
        Route::post('/push-notifications/{pushNotification}/opened', [PushNotificationController::class, 'opened']);
    });

    /*
     * Ortak zikir okuması — mobil taraf ekran açıkken 4 saniyede bir çağırıyor.
     * Dakikada ~15 istek normal; 90 sınırı birkaç ekranı açık tutanı da rahat
     * karşılar ama sonsuz döngüyü durdurur.
     */
    Route::get('/shared-dhikrs/{idOrCode}', [SharedDhikrController::class, 'show'])
        ->middleware('throttle:90,1');
    Route::middleware('throttle:60,1')->group(function () {
        Route::post('/shared-dhikrs', [SharedDhikrController::class, 'store']);
        Route::post('/shared-dhikrs/{id}/increment', [SharedDhikrController::class, 'increment']);
    });
});

/*
 * RevenueCat webhook — satın alma olduğu anda buraya POST edilir.
 * Panelde anlık gelir takibinin kaynağı budur.
 *
 * Throttle YOK: RevenueCat teslimatı garantilemek için tekrar deniyor;
 * 429 dönersek olayı kaybedebiliriz. Koruma Authorization başlığında.
 */
Route::post('/v1/webhooks/revenuecat', [RevenueCatWebhookController::class, 'handle']);

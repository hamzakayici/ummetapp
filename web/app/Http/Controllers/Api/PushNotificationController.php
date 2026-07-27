<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PushNotificationController extends Controller
{
    /**
     * Bildirime tıklandı. Açılma oranı, bir kampanyanın işe yarayıp
     * yaramadığını gösteren tek sayı — ve sponsorluk satarken en ikna edici veri.
     */
    public function opened(Request $request, PushNotification $pushNotification)
    {
        // Cihaz başına tek sayım — bir bildirime birden çok kez tıklanabiliyor
        // (bildirim merkezinde duruyor). Şişmiş açılma oranı yanıltıcı olur.
        $deviceId = (string) $request->input('device_id', '');

        if ($deviceId !== '') {
            $key = "opened:push:{$pushNotification->id}:{$deviceId}";
            if (Cache::has($key)) {
                return response()->json(['ok' => true, 'duplicate' => true]);
            }
            Cache::put($key, true, now()->addDays(30));
        }

        $pushNotification->increment('open_count');

        return response()->json(['ok' => true]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AppEvent;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Mobil uygulamanın açılışta çektiği duyuru + remote config.
 * Eski Supabase `announcements` / `app_settings` tablolarının yerini alır.
 */
class ConfigController extends Controller
{
    public function announcements()
    {
        $data = Cache::remember('api.announcements', now()->addMinutes(5), fn () =>
            Announcement::visible()
                ->latest('published_at')
                ->latest('id')
                ->limit(20)
                ->get(['id', 'title', 'content', 'type', 'published_at'])
        );

        return response()->json(['data' => $data]);
    }

    public function settings()
    {
        $data = Cache::remember('api.settings', now()->addMinutes(5), fn () =>
            AppSetting::pluck('value', 'key')
        );

        return response()->json(['data' => $data]);
    }

    /**
     * Şu an uygulamayı kullanan yaklaşık kişi sayısı.
     *
     * Eski sürümde Supabase Realtime "presence" ile gösteriliyordu; kalıcı
     * WebSocket olmadığı için son 5 dakikada olay gönderen ayrık cihazları
     * sayıyoruz. Tesbih ekranındaki "zikir halkası" göstergesi bunu kullanır.
     */
    public function onlineCount()
    {
        $count = Cache::remember('api.online_count', now()->addMinute(), fn () =>
            AppEvent::where('ts', '>=', now()->subMinutes(5))
                ->distinct('device_id')
                ->count('device_id')
        );

        return response()->json(['data' => ['online' => max(1, $count)]]);
    }

    /**
     * Duyuru görüntülendi — açılma oranı metriği için.
     *
     * Cihaz başına GÜNDE BİR sayılır. Aksi halde uygulamayı gün içinde defalarca
     * açan kullanıcı sayacı şişirir ve "açılma oranı" %100'ü aşar. Bu sayı
     * panelde gösteriliyor ve ileride sponsorluk satarken kullanılacak —
     * doğru olması gerekiyor.
     */
    public function announcementOpened(Request $request, Announcement $announcement)
    {
        $deviceId = (string) $request->input('device_id', '');

        if ($deviceId !== '') {
            $key = "opened:ann:{$announcement->id}:{$deviceId}";
            if (Cache::has($key)) {
                return response()->json(['ok' => true, 'duplicate' => true]);
            }
            Cache::put($key, true, now()->endOfDay());
        }

        $announcement->increment('open_count');

        return response()->json(['ok' => true]);
    }
}

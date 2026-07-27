<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppDevice;
use App\Models\AppEvent;
use App\Models\AppSession;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Analytics toplama. Mobil uygulama olayları 25'lik batch'ler halinde gönderir.
 *
 * Eski mimaride uygulama Supabase'e anon key ile DOĞRUDAN yazıyordu; herkes
 * sahte veri basabiliyordu. Burada en azından boyut sınırı ve throttle var.
 */
class AnalyticsController extends Controller
{
    public function ingest(Request $request)
    {
        if (! config('ummet.ingest_enabled')) {
            return response()->json(['ok' => false, 'reason' => 'disabled'], 503);
        }

        $validated = $request->validate([
            'events' => ['required', 'array', 'max:50'],
            'events.*.name' => ['required', 'string', 'max:64'],
            'events.*.device_id' => ['required', 'string', 'max:64'],
            'events.*.session_id' => ['nullable', 'string', 'max:64'],
            'events.*.platform' => ['nullable', 'in:ios,android,web,other'],
            'events.*.app_version' => ['nullable', 'string', 'max:32'],
            'events.*.pathname' => ['nullable', 'string', 'max:255'],
            'events.*.props' => ['nullable', 'array'],
            'events.*.ts' => ['nullable', 'date'],
        ]);

        $now = now();
        $rows = array_map(fn ($e) => [
            'name' => $e['name'],
            'device_id' => $e['device_id'],
            'session_id' => $e['session_id'] ?? null,
            'platform' => $e['platform'] ?? 'other',
            'app_version' => $e['app_version'] ?? null,
            'pathname' => $e['pathname'] ?? null,
            'props' => isset($e['props']) ? json_encode($e['props']) : null,
            'ts' => isset($e['ts']) ? Carbon::parse($e['ts']) : $now,
            'created_at' => $now,
            'updated_at' => $now,
        ], $validated['events']);

        AppEvent::insert($rows);

        return response()->json(['ok' => true, 'accepted' => count($rows)]);
    }

    /** Cihaz kaydı — insert-then-update yerine tek upsert */
    public function device(Request $request)
    {
        $data = $request->validate([
            'device_id' => ['required', 'string', 'max:64'],
            'platform' => ['nullable', 'in:ios,android,web,other'],
            'app_version' => ['nullable', 'string', 'max:32'],
        ]);

        $now = now();

        AppDevice::upsert(
            [[
                'device_id' => $data['device_id'],
                'platform' => $data['platform'] ?? 'other',
                'app_version' => $data['app_version'] ?? null,
                'first_seen_at' => $now,
                'last_seen_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]],
            uniqueBy: ['device_id'],
            update: ['platform', 'app_version', 'last_seen_at', 'updated_at'], // first_seen_at korunur
        );

        return response()->json(['ok' => true]);
    }

    public function sessionStart(Request $request)
    {
        $data = $request->validate([
            'session_id' => ['required', 'string', 'max:64'],
            'device_id' => ['required', 'string', 'max:64'],
            'platform' => ['nullable', 'in:ios,android,web,other'],
            'app_version' => ['nullable', 'string', 'max:32'],
        ]);

        AppSession::updateOrCreate(
            ['session_id' => $data['session_id']],
            [
                'device_id' => $data['device_id'],
                'platform' => $data['platform'] ?? 'other',
                'app_version' => $data['app_version'] ?? null,
                'started_at' => now(),
            ],
        );

        return response()->json(['ok' => true]);
    }

    /**
     * Oturum kapanışı. Süreyi SUNUCU hesaplar — eski mimaride client
     * gönderiyordu ve uygulama kill edilince oturum hiç kapanmıyordu.
     */
    public function sessionEnd(Request $request)
    {
        $data = $request->validate([
            'session_id' => ['required', 'string', 'max:64'],
        ]);

        $session = AppSession::where('session_id', $data['session_id'])->first();

        if ($session && ! $session->ended_at) {
            $endedAt = now();
            $session->update([
                'ended_at' => $endedAt,
                'duration_ms' => $session->started_at
                    ? max(0, $session->started_at->diffInMilliseconds($endedAt))
                    : null,
            ]);
        }

        return response()->json(['ok' => true]);
    }
}

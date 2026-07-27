<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SharedDhikr;
use App\Models\SharedDhikrContribution;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Ortak zikir.
 *
 * Eski Supabase sürümü Realtime WebSocket ile canlı sayaç gösteriyordu.
 * Paylaşımlı hostingde kalıcı süreç çalıştırılamadığı için mobil taraf
 * `show` endpoint'ini ekran açıkken 3-5 sn'de bir çağırır (polling).
 */
class SharedDhikrController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'preset_name' => ['required', 'string', 'max:64'],
            'target_count' => ['required', 'integer', 'min:1', 'max:100000000'],
            'device_id' => ['nullable', 'string', 'max:64'],
        ]);

        $dhikr = SharedDhikr::create([
            'title' => $data['title'],
            'preset_name' => $data['preset_name'],
            'target_count' => $data['target_count'],
            'current_count' => 0,
            'share_code' => $this->uniqueShareCode(),
            'creator_device_id' => $data['device_id'] ?? null,
        ]);

        return response()->json(['data' => $this->present($dhikr)], 201);
    }

    public function show(string $idOrCode)
    {
        $dhikr = SharedDhikr::where('id', $idOrCode)
            ->orWhere('share_code', strtoupper($idOrCode))
            ->firstOrFail();

        return response()->json(['data' => $this->present($dhikr)]);
    }

    /**
     * Sayaç artırma. Atomik UPDATE — 100 kişi aynı anda bassa da hiçbir katkı kaybolmaz.
     * (Eski Supabase tarafındaki `increment_shared_dhikr` RPC'sinin karşılığı.)
     */
    public function increment(Request $request, string $id)
    {
        $data = $request->validate([
            'amount' => ['required', 'integer', 'min:1', 'max:10000'],
            'device_id' => ['required', 'string', 'max:64'],
        ]);

        $dhikr = SharedDhikr::findOrFail($id);

        DB::transaction(function () use ($dhikr, $data) {
            DB::table('shared_dhikrs')
                ->where('id', $dhikr->id)
                ->update(['current_count' => DB::raw('current_count + ' . (int) $data['amount'])]);

            SharedDhikrContribution::updateOrCreate(
                ['shared_dhikr_id' => $dhikr->id, 'device_id' => $data['device_id']],
                ['amount' => DB::raw('amount + ' . (int) $data['amount'])],
            );
        });

        return response()->json(['data' => $this->present($dhikr->fresh())]);
    }

    private function present(SharedDhikr $d): array
    {
        return [
            'id' => $d->id,
            'title' => $d->title,
            'preset_name' => $d->preset_name,
            'target_count' => (int) $d->target_count,
            'current_count' => (int) $d->current_count,
            'share_code' => $d->share_code,
            'progress' => $d->progress,
            'created_at' => $d->created_at?->toIso8601String(),
        ];
    }

    private function uniqueShareCode(): string
    {
        do {
            // Karıştırılabilir karakterler (0/O, 1/I) çıkarıldı — kod elle yazılabiliyor
            $code = substr(str_shuffle(str_repeat('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 3)), 0, 6);
        } while (SharedDhikr::where('share_code', $code)->exists());

        return $code;
    }
}

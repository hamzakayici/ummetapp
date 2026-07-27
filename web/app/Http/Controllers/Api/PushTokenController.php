<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushToken;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:255', 'starts_with:ExponentPushToken,ExpoPushToken'],
            'device_id' => ['nullable', 'string', 'max:64'],
            'platform' => ['nullable', 'in:ios,android,web,other'],
            'app_version' => ['nullable', 'string', 'max:32'],
        ]);

        $token = PushToken::updateOrCreate(
            ['expo_push_token' => $data['expo_push_token']],
            [
                'device_id' => $data['device_id'] ?? null,
                'platform' => $data['platform'] ?? 'ios',
                'app_version' => $data['app_version'] ?? null,
                'is_active' => true,
            ],
        );

        return response()->json(['ok' => true, 'id' => $token->id]);
    }
}

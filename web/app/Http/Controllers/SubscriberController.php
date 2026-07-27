<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
        ], [], ['email' => 'e-posta adresi']);

        Subscriber::firstOrCreate(
            ['email' => strtolower($data['email'])],
            ['source' => $request->headers->get('referer')],
        );

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Tamam, listeye eklendin.',
            ]);
        }

        return back()->with('subscribed', true);
    }
}

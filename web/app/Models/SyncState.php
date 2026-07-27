<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncState extends Model
{
    protected $fillable = ['source', 'status', 'last_run_at', 'last_success_at', 'data_through', 'message'];

    protected $casts = [
        'last_run_at' => 'datetime',
        'last_success_at' => 'datetime',
        'data_through' => 'date',
    ];

    public static function mark(string $source, string $status, ?string $message = null, ?string $dataThrough = null): void
    {
        $state = static::firstOrNew(['source' => $source]);
        $state->status = $status;
        $state->last_run_at = now();
        $state->message = $message;

        if ($status === 'ok') {
            $state->last_success_at = now();
            if ($dataThrough) {
                $state->data_through = $dataThrough;
            }
        }

        $state->save();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSession extends Model
{
    protected $fillable = [
        'session_id', 'device_id', 'started_at', 'ended_at',
        'duration_ms', 'platform', 'app_version',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];
}

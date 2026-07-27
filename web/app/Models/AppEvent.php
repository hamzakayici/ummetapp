<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppEvent extends Model
{
    protected $fillable = [
        'name', 'device_id', 'session_id', 'platform',
        'app_version', 'pathname', 'props', 'ts',
    ];

    protected $casts = [
        'props' => 'array',
        'ts' => 'datetime',
    ];
}

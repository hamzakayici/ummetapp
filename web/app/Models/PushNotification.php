<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushNotification extends Model
{
    protected $fillable = [
        'title', 'body', 'route', 'segment', 'status',
        'recipient_count', 'sent_count', 'open_count', 'sent_at',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    /** Açılma oranı — sıfıra bölmeye karşı korumalı */
    public function getOpenRateAttribute(): float
    {
        return $this->sent_count > 0
            ? round($this->open_count / $this->sent_count * 100, 1)
            : 0.0;
    }
}

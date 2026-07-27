<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SharedDhikr extends Model
{
    use HasUuids;

    protected $fillable = [
        'title', 'preset_name', 'target_count',
        'current_count', 'share_code', 'creator_device_id', 'expires_at',
    ];

    protected $casts = ['expires_at' => 'datetime'];

    public function contributions(): HasMany
    {
        return $this->hasMany(SharedDhikrContribution::class);
    }

    public function getProgressAttribute(): float
    {
        return $this->target_count > 0
            ? min(100, round($this->current_count / $this->target_count * 100, 1))
            : 0.0;
    }
}

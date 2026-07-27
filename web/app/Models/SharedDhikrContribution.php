<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SharedDhikrContribution extends Model
{
    protected $fillable = ['shared_dhikr_id', 'device_id', 'amount'];

    public function sharedDhikr(): BelongsTo
    {
        return $this->belongsTo(SharedDhikr::class);
    }
}

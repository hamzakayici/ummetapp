<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'app_user_id', 'product_id', 'store', 'entitlement', 'status', 'country',
        'revenue_usd', 'started_at', 'expires_at', 'cancelled_at', 'is_trial',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'is_trial' => 'boolean',
        'revenue_usd' => 'decimal:2',
    ];

    /** Parası ödenmiş ve süresi dolmamış abonelikler */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'trial', 'grace'])
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
    }

    public function scopePaying($query)
    {
        return $query->where('status', 'active')->where('is_trial', false);
    }
}

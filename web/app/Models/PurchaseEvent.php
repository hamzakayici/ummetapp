<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseEvent extends Model
{
    protected $fillable = [
        'event_id', 'type', 'app_user_id', 'product_id',
        'store', 'country', 'revenue_usd', 'payload', 'occurred_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'occurred_at' => 'datetime',
        'revenue_usd' => 'decimal:2',
    ];

    /** RevenueCat olay tipi → Türkçe etiket */
    public const LABELS = [
        'INITIAL_PURCHASE' => 'İlk satın alma',
        'RENEWAL' => 'Yenileme',
        'TRIAL_STARTED' => 'Deneme başladı',
        'TRIAL_CONVERTED' => 'Denemeden ücretliye',
        'TRIAL_CANCELLED' => 'Deneme iptal',
        'CANCELLATION' => 'İptal',
        'UNCANCELLATION' => 'İptal geri alındı',
        'EXPIRATION' => 'Süre doldu',
        'BILLING_ISSUE' => 'Ödeme sorunu',
        'PRODUCT_CHANGE' => 'Plan değişikliği',
        'REFUND' => 'İade',
        'NON_RENEWING_PURCHASE' => 'Tek seferlik satın alma',
    ];

    public function getLabelAttribute(): string
    {
        return self::LABELS[$this->type] ?? $this->type;
    }
}

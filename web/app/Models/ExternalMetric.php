<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalMetric extends Model
{
    protected $fillable = ['source', 'metric', 'date', 'value', 'dimension'];

    protected $casts = ['date' => 'date', 'value' => 'decimal:4'];

    /** Bir metriğin belirli gün aralığındaki toplamı */
    public static function sumFor(string $source, string $metric, int $days = 30): float
    {
        return (float) static::where('source', $source)
            ->where('metric', $metric)
            ->where('date', '>=', now()->subDays($days)->toDateString())
            ->sum('value');
    }
}

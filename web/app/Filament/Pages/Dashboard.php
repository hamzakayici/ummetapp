<?php

namespace App\Filament\Pages;

use Filament\Pages\Dashboard as BaseDashboard;
use Illuminate\Contracts\Support\Htmlable;

class Dashboard extends BaseDashboard
{
    protected static ?string $navigationLabel = 'Özet';

    protected static ?string $title = 'Özet';

    protected static ?int $navigationSort = -2;

    public function getSubheading(): string|Htmlable|null
    {
        return 'Ümmet uygulaması ve site için anlık özet — metrikler 5 dakikada bir yenilenir.';
    }

    public function getColumns(): int|array
    {
        return [
            'default' => 1,
            'md' => 2,
            'xl' => 3,
        ];
    }
}

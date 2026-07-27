<?php

namespace App\Filament\Forms\Components;

use Filament\Forms\Components\DateTimePicker as FilamentDateTimePicker;
use Filament\Support\Icons\Heroicon;

/**
 * Türkçe tarih + saat seçici — native input yerine Filament UI kit.
 */
class DateTimePicker extends FilamentDateTimePicker
{
    protected function setUp(): void
    {
        parent::setUp();

        $this
            ->native(false)
            ->locale('tr')
            ->seconds(false)
            ->displayFormat('d.m.Y H:i')
            ->placeholder('Tarih ve saat seçin')
            ->prefixIcon(Heroicon::OutlinedCalendarDays)
            ->weekStartsOnMonday()
            ->timezone(config('app.timezone', 'Europe/Istanbul'));
    }
}

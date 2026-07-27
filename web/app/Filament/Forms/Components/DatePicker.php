<?php

namespace App\Filament\Forms\Components;

use Filament\Forms\Components\DatePicker as FilamentDatePicker;
use Filament\Support\Icons\Heroicon;

/**
 * Türkçe takvim arayüzü — native input yerine Filament UI kit.
 */
class DatePicker extends FilamentDatePicker
{
    protected function setUp(): void
    {
        parent::setUp();

        $this
            ->native(false)
            ->locale('tr')
            ->displayFormat('d.m.Y')
            ->placeholder('Tarih seçin')
            ->prefixIcon(Heroicon::OutlinedCalendarDays)
            ->weekStartsOnMonday()
            ->closeOnDateSelection();
    }
}

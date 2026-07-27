<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Tüm Filament tarih alanlarında UI kit (takvim) kullan
        \Filament\Forms\Components\DateTimePicker::configureUsing(function (\Filament\Forms\Components\DateTimePicker $picker): void {
            if ($picker instanceof \App\Filament\Forms\Components\DateTimePicker) {
                return;
            }

            $picker
                ->native(false)
                ->locale('tr')
                ->weekStartsOnMonday();
        });

        \Filament\Forms\Components\DatePicker::configureUsing(function (\Filament\Forms\Components\DatePicker $picker): void {
            if ($picker instanceof \App\Filament\Forms\Components\DatePicker) {
                return;
            }

            $picker
                ->native(false)
                ->locale('tr')
                ->weekStartsOnMonday()
                ->closeOnDateSelection();
        });
    }
}

<?php

namespace App\Filament\Resources\AppEvents\Schemas;

use App\Filament\Support\FormLayout;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class AppEventInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextEntry::make('name')->label('Olay'),
                TextEntry::make('platform')
                    ->label('Platform')
                    ->formatStateUsing(fn (string $state) => match ($state) {
                        'ios' => 'iOS',
                        'android' => 'Android',
                        'web' => 'Web',
                        default => 'Diğer',
                    }),
                TextEntry::make('pathname')->label('Ekran')->placeholder('—'),
                TextEntry::make('app_version')->label('Sürüm')->placeholder('—'),
                TextEntry::make('session_id')->label('Oturum')->fontFamily('mono')->placeholder('—'),
                TextEntry::make('ts')->label('Zaman')->dateTime('d.m.Y H:i:s'),
                TextEntry::make('device_id')->label('Cihaz')->fontFamily('mono')->columnSpanFull(),
                TextEntry::make('props')
                    ->label('Özellikler')
                    ->formatStateUsing(fn ($state) => $state ? json_encode($state, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : '—')
                    ->fontFamily('mono')
                    ->columnSpanFull(),
            ]);
    }
}

<?php

namespace App\Filament\Resources\AppDevices\Schemas;

use App\Filament\Support\FormLayout;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class AppDeviceInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextEntry::make('platform')
                    ->label('Platform')
                    ->formatStateUsing(fn (string $state) => match ($state) {
                        'ios' => 'iOS',
                        'android' => 'Android',
                        'web' => 'Web',
                        default => 'Diğer',
                    }),

                TextEntry::make('app_version')
                    ->label('Uygulama sürümü')
                    ->placeholder('—'),

                TextEntry::make('device_id')
                    ->label('Cihaz kimliği')
                    ->copyable()
                    ->fontFamily('mono')
                    ->columnSpanFull(),

                TextEntry::make('first_seen_at')
                    ->label('İlk görülme')
                    ->dateTime('d.m.Y H:i'),

                TextEntry::make('last_seen_at')
                    ->label('Son görülme')
                    ->dateTime('d.m.Y H:i'),
            ]);
    }
}

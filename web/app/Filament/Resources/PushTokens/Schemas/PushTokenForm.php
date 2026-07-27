<?php

namespace App\Filament\Resources\PushTokens\Schemas;

use App\Filament\Support\FormLayout;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class PushTokenForm
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextInput::make('device_id')
                    ->label('Cihaz kimliği')
                    ->disabled(),

                Select::make('platform')
                    ->label('Platform')
                    ->options([
                        'ios' => 'iOS',
                        'android' => 'Android',
                        'web' => 'Web',
                        'other' => 'Diğer',
                    ])
                    ->disabled()
                    ->native(false),

                TextInput::make('app_version')
                    ->label('Uygulama sürümü')
                    ->disabled(),

                Toggle::make('is_active')
                    ->label('Bildirim alıyor')
                    ->helperText('Kapalıysa bu cihaza bildirim gönderilmez.'),

                TextInput::make('expo_push_token')
                    ->label('Bildirim anahtarı')
                    ->disabled()
                    ->columnSpanFull(),
            ]);
    }
}

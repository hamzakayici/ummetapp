<?php

namespace App\Filament\Resources\SharedDhikrs\Schemas;

use App\Filament\Forms\Components\DatePicker;
use App\Filament\Support\FormLayout;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SharedDhikrForm
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextInput::make('title')
                    ->label('Başlık')
                    ->required()
                    ->helperText('Kullanıcıların gördüğü zikir adı.'),

                TextInput::make('preset_name')
                    ->label('Zikir türü')
                    ->required()
                    ->helperText('Örn: Subhanallah, Salavat'),

                TextInput::make('target_count')
                    ->label('Hedef sayı')
                    ->required()
                    ->numeric()
                    ->minValue(1),

                TextInput::make('current_count')
                    ->label('Şu anki sayı')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->helperText('Toplam çekilen zikir.'),

                TextInput::make('share_code')
                    ->label('Paylaşım kodu')
                    ->required()
                    ->helperText('Arkadaşların katılmak için girdiği kod.'),

                TextInput::make('creator_device_id')
                    ->label('Oluşturan cihaz')
                    ->disabled(),

                DatePicker::make('expires_at')
                    ->label('Bitiş tarihi')
                    ->helperText('Boş bırakılırsa süresiz kalır.'),
            ]);
    }
}

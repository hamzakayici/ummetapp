<?php

namespace App\Filament\Resources\AppSettings\Schemas;

use App\Filament\Support\FormLayout;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AppSettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextInput::make('key')
                    ->label('Ayar kodu')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->disabledOn('edit')
                    ->helperText('Teknik isim. Yeni ayar eklerken dikkatli yazın; sonradan değiştirmeyin.'),

                TextInput::make('description')
                    ->label('Ne işe yarar?')
                    ->helperText('Sadece panelde görünür — kullanıcıya gösterilmez.'),

                Textarea::make('value')
                    ->label('Değer')
                    ->rows(3)
                    ->required()
                    ->helperText('Uygulamanın okuyacağı değer.')
                    ->columnSpanFull(),
            ]);
    }
}

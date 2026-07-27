<?php

namespace App\Filament\Resources\Announcements\Schemas;

use App\Filament\Forms\Components\DateTimePicker;
use App\Filament\Support\FormLayout;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AnnouncementForm
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextInput::make('title')
                    ->label('Başlık')
                    ->required()
                    ->maxLength(120)
                    ->helperText('Uygulama içinde kullanıcının göreceği başlık.'),

                Select::make('type')
                    ->label('Tür')
                    ->options([
                        'info' => 'Bilgi',
                        'warning' => 'Uyarı',
                        'update' => 'Güncelleme',
                    ])
                    ->default('info')
                    ->required()
                    ->native(false),

                Toggle::make('is_active')
                    ->label('Yayında')
                    ->helperText('Kapalıysa uygulamada görünmez.')
                    ->default(true),

                Textarea::make('content')
                    ->label('Metin')
                    ->rows(4)
                    ->helperText('Duyurunun tam metni.')
                    ->columnSpanFull(),

                DateTimePicker::make('published_at')
                    ->label('Yayın tarihi')
                    ->helperText('Boş bırakırsanız hemen yayınlanır. İleri tarih seçerek zamanlayabilirsiniz.'),

                TextInput::make('open_count')
                    ->label('Görüntülenme')
                    ->numeric()
                    ->default(0)
                    ->disabled()
                    ->dehydrated(false)
                    ->visibleOn('edit')
                    ->helperText('Kullanıcılar duyuruyu açtıkça otomatik artar.'),
            ]);
    }
}

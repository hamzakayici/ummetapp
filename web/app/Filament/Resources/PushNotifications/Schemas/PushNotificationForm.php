<?php

namespace App\Filament\Resources\PushNotifications\Schemas;

use App\Filament\Resources\PushNotifications\Tables\PushNotificationsTable;
use App\Filament\Support\FormLayout;
use App\Services\ExpoPushService;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class PushNotificationForm
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)->components([
            TextInput::make('title')
                ->label('Başlık')
                ->required()
                ->maxLength(80)
                ->helperText('Kilit ekranında kalın görünür. Kısa tutun.'),

            Select::make('segment')
                ->label('Kime gönderilsin?')
                ->required()
                ->default('all')
                ->options(PushNotificationsTable::segmentLabels())
                ->live()
                ->helperText(function ($state) {
                    if (! $state) {
                        return null;
                    }

                    $count = count(app(ExpoPushService::class)->tokensForSegment((string) $state));

                    return "Şu an bu grupta {$count} cihaz var.";
                }),

            Textarea::make('body')
                ->label('Mesaj')
                ->required()
                ->rows(3)
                ->maxLength(240)
                ->helperText('iOS uzun metni kırpar; ilk cümle önemli.')
                ->columnSpanFull(),

            Select::make('route')
                ->label('Tıklayınca açılacak ekran')
                ->placeholder('Uygulamayı aç (varsayılan)')
                ->options([
                    '/(tabs)/index' => 'Ana sayfa',
                    '/(tabs)/quran' => 'Kuran',
                    '/(tabs)/dhikr' => 'Tesbih',
                    '/(tabs)/tracker' => 'İbadet takibi',
                    '/ramazan-hub' => 'Ramazan Hub',
                    '/duas' => 'Dualar',
                    '/announcements' => 'Duyurular',
                    '/streak' => 'Streak',
                ]),

        ]);
    }
}

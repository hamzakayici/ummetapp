<?php

namespace App\Filament\Resources\PurchaseEvents\Schemas;

use App\Filament\Support\FormLayout;
use App\Models\PurchaseEvent;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class PurchaseEventInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextEntry::make('type')
                    ->label('Olay')
                    ->formatStateUsing(fn (string $state) => PurchaseEvent::LABELS[$state] ?? $state),
                TextEntry::make('product_id')->label('Ürün'),
                TextEntry::make('store')
                    ->label('Mağaza')
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'app_store' => 'App Store',
                        'play_store' => 'Google Play',
                        default => $state,
                    }),
                TextEntry::make('revenue_usd')->label('Gelir (USD)')->money('usd'),
                TextEntry::make('country')->label('Ülke')->placeholder('—'),
                TextEntry::make('occurred_at')->label('Olay zamanı')->dateTime('d.m.Y H:i'),
                TextEntry::make('event_id')->label('Olay kimliği')->fontFamily('mono')->columnSpanFull(),
                TextEntry::make('app_user_id')->label('Kullanıcı')->fontFamily('mono')->columnSpanFull(),
            ]);
    }
}

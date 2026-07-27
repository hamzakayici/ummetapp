<?php

namespace App\Filament\Resources\Subscriptions\Schemas;

use App\Filament\Support\FormLayout;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class SubscriptionInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextEntry::make('product_id')->label('Ürün'),
                TextEntry::make('entitlement')->label('Hak'),
                TextEntry::make('status')
                    ->label('Durum')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => match ($state) {
                        'active' => 'Aktif',
                        'trial' => 'Deneme',
                        'grace' => 'Ödeme sorunu',
                        'cancelled' => 'İptal',
                        'expired' => 'Süresi doldu',
                        default => $state,
                    }),
                TextEntry::make('store')
                    ->label('Mağaza')
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'app_store' => 'App Store',
                        'play_store' => 'Google Play',
                        default => $state,
                    }),
                TextEntry::make('country')->label('Ülke')->placeholder('—'),
                TextEntry::make('revenue_usd')->label('Gelir (USD)')->money('usd'),
                IconEntry::make('is_trial')->label('Deneme')->boolean(),
                TextEntry::make('started_at')->label('Başlangıç')->dateTime('d.m.Y H:i'),
                TextEntry::make('expires_at')->label('Bitiş')->dateTime('d.m.Y H:i')->placeholder('—'),
                TextEntry::make('cancelled_at')->label('İptal')->dateTime('d.m.Y H:i')->placeholder('—'),
                TextEntry::make('app_user_id')->label('Kullanıcı')->fontFamily('mono')->columnSpanFull(),
            ]);
    }
}

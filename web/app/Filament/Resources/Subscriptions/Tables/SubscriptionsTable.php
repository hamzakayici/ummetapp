<?php

namespace App\Filament\Resources\Subscriptions\Tables;

use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SubscriptionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('Henüz abonelik kaydı yok')
            ->emptyStateDescription('RevenueCat webhook bağlandığında satın almalar burada görünür.')
            ->columns([
                TextColumn::make('product_id')
                    ->label('Ürün')
                    ->searchable()
                    ->wrap(),

                TextColumn::make('status')
                    ->label('Durum')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => match ($state) {
                        'active' => 'Aktif',
                        'trial' => 'Deneme',
                        'grace' => 'Ödeme sorunu',
                        'cancelled' => 'İptal',
                        'expired' => 'Süresi doldu',
                        default => $state,
                    })
                    ->color(fn (string $state) => match ($state) {
                        'active' => 'success',
                        'trial' => 'info',
                        'grace', 'cancelled' => 'warning',
                        'expired' => 'gray',
                        default => 'gray',
                    }),

                TextColumn::make('store')
                    ->label('Mağaza')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'app_store' => 'App Store',
                        'play_store' => 'Google Play',
                        default => $state,
                    }),

                TextColumn::make('country')
                    ->label('Ülke')
                    ->placeholder('—'),

                TextColumn::make('revenue_usd')
                    ->label('Gelir (USD)')
                    ->money('usd')
                    ->sortable(),

                IconColumn::make('is_trial')
                    ->label('Deneme')
                    ->boolean(),

                TextColumn::make('expires_at')
                    ->label('Bitiş')
                    ->dateTime('d.m.Y')
                    ->placeholder('—')
                    ->sortable(),

                TextColumn::make('app_user_id')
                    ->label('Kullanıcı')
                    ->searchable()
                    ->limit(12)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Durum')
                    ->options([
                        'active' => 'Aktif',
                        'trial' => 'Deneme',
                        'grace' => 'Ödeme sorunu',
                        'cancelled' => 'İptal',
                        'expired' => 'Süresi doldu',
                    ]),
            ])
            ->recordActions([
                ViewAction::make()->label('Detay'),
            ]);
    }
}

<?php

namespace App\Filament\Resources\PurchaseEvents\Tables;

use App\Models\PurchaseEvent;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PurchaseEventsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('occurred_at', 'desc')
            ->emptyStateHeading('Henüz satın alma olayı yok')
            ->emptyStateDescription('RevenueCat webhook\'undan gelen olaylar burada listelenir.')
            ->columns([
                TextColumn::make('type')
                    ->label('Olay')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => PurchaseEvent::LABELS[$state] ?? $state)
                    ->searchable(),

                TextColumn::make('product_id')
                    ->label('Ürün')
                    ->searchable()
                    ->limit(24),

                TextColumn::make('store')
                    ->label('Mağaza')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'app_store' => 'App Store',
                        'play_store' => 'Google Play',
                        default => $state,
                    }),

                TextColumn::make('revenue_usd')
                    ->label('Gelir (USD)')
                    ->money('usd')
                    ->sortable(),

                TextColumn::make('country')
                    ->label('Ülke')
                    ->placeholder('—'),

                TextColumn::make('occurred_at')
                    ->label('Tarih')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),

                TextColumn::make('app_user_id')
                    ->label('Kullanıcı')
                    ->searchable()
                    ->limit(12)
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label('Olay tipi')
                    ->options(PurchaseEvent::LABELS),
            ])
            ->recordActions([
                ViewAction::make()->label('Detay'),
            ]);
    }
}

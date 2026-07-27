<?php

namespace App\Filament\Resources\Subscribers\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SubscribersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('Henüz abone yok')
            ->emptyStateDescription('Google Play bildirimi veya site formlarından gelen e-postalar burada listelenir.')
            ->columns([
                TextColumn::make('email')
                    ->label('E-posta')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('source')
                    ->label('Kaynak')
                    ->badge()
                    ->placeholder('—')
                    ->formatStateUsing(fn (?string $state) => match ($state) {
                        'home', 'landing' => 'Ana sayfa',
                        'footer' => 'Alt bilgi',
                        default => $state ?: 'Bilinmiyor',
                    }),

                TextColumn::make('unsubscribed_at')
                    ->label('Durum')
                    ->badge()
                    ->formatStateUsing(fn ($state) => $state ? 'Ayrıldı' : 'Aktif')
                    ->color(fn ($state) => $state ? 'gray' : 'success'),

                TextColumn::make('created_at')
                    ->label('Kayıt')
                    ->since()
                    ->dateTimeTooltip('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Durum')
                    ->options([
                        'active' => 'Aktif',
                        'unsubscribed' => 'Ayrıldı',
                    ])
                    ->query(function ($query, array $data) {
                        if (($data['value'] ?? null) === 'active') {
                            $query->whereNull('unsubscribed_at');
                        }

                        if (($data['value'] ?? null) === 'unsubscribed') {
                            $query->whereNotNull('unsubscribed_at');
                        }
                    }),
            ])
            ->recordActions([
                Action::make('unsubscribe')
                    ->label('Abonelikten çıkar')
                    ->icon('heroicon-o-x-circle')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->visible(fn ($record) => $record->unsubscribed_at === null)
                    ->action(fn ($record) => $record->update(['unsubscribed_at' => now()])),

                Action::make('resubscribe')
                    ->label('Yeniden aktif et')
                    ->icon('heroicon-o-arrow-path')
                    ->color('success')
                    ->visible(fn ($record) => $record->unsubscribed_at !== null)
                    ->action(fn ($record) => $record->update(['unsubscribed_at' => null])),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('Sil'),
                ]),
            ]);
    }
}

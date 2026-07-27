<?php

namespace App\Filament\Resources\ContactMessages\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ContactMessagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('Henüz mesaj yok')
            ->emptyStateDescription('Sitedeki iletişim formundan gelen mesajlar burada görünür.')
            ->columns([
                IconColumn::make('is_read')
                    ->label('Okundu')
                    ->boolean(),

                TextColumn::make('name')
                    ->label('Gönderen')
                    ->searchable()
                    ->weight(fn ($record) => $record->is_read ? 'normal' : 'bold'),

                TextColumn::make('email')
                    ->label('E-posta')
                    ->searchable()
                    ->copyable(),

                TextColumn::make('subject')
                    ->label('Konu')
                    ->searchable()
                    ->placeholder('—')
                    ->limit(40),

                TextColumn::make('message')
                    ->label('Önizleme')
                    ->limit(50)
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->label('Tarih')
                    ->since()
                    ->dateTimeTooltip('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                TernaryFilter::make('is_read')
                    ->label('Okunma durumu')
                    ->placeholder('Tümü')
                    ->trueLabel('Okundu')
                    ->falseLabel('Okunmadı'),
            ])
            ->recordActions([
                Action::make('markRead')
                    ->label('Okundu')
                    ->icon('heroicon-o-check')
                    ->color('success')
                    ->visible(fn ($record) => ! $record->is_read)
                    ->action(fn ($record) => $record->update(['is_read' => true])),

                ViewAction::make()->label('Görüntüle'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('Sil'),
                ]),
            ]);
    }
}

<?php

namespace App\Filament\Resources\Announcements\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AnnouncementsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('published_at', 'desc')
            ->emptyStateHeading('Henüz duyuru yok')
            ->emptyStateDescription('Uygulama içinde gösterilecek bir duyuru oluşturun.')
            ->columns([
                TextColumn::make('title')
                    ->label('Başlık')
                    ->searchable()
                    ->wrap(),

                TextColumn::make('type')
                    ->label('Tür')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => match ($state) {
                        'info' => 'Bilgi',
                        'warning' => 'Uyarı',
                        'update' => 'Güncelleme',
                        default => $state,
                    }),

                IconColumn::make('is_active')
                    ->label('Yayında')
                    ->boolean(),

                TextColumn::make('open_count')
                    ->label('Görüntülenme')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('published_at')
                    ->label('Yayın')
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('Hemen')
                    ->sortable(),
            ])
            ->recordActions([
                EditAction::make()->label('Düzenle'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('Sil'),
                ]),
            ]);
    }
}

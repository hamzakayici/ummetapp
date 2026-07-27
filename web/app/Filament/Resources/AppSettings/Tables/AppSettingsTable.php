<?php

namespace App\Filament\Resources\AppSettings\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class AppSettingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('key')
            ->emptyStateHeading('Ayar bulunamadı')
            ->emptyStateDescription('Uygulama uzaktan okunan ayarları buradan yönetilir.')
            ->columns([
                TextColumn::make('key')
                    ->label('Ayar kodu')
                    ->searchable()
                    ->copyable()
                    ->fontFamily('mono'),

                TextColumn::make('value')
                    ->label('Değer')
                    ->limit(60)
                    ->tooltip(fn ($record) => $record->value),

                TextColumn::make('description')
                    ->label('Açıklama')
                    ->wrap()
                    ->searchable(),
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

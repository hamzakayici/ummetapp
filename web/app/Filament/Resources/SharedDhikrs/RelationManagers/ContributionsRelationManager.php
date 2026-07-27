<?php

namespace App\Filament\Resources\SharedDhikrs\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ContributionsRelationManager extends RelationManager
{
    protected static string $relationship = 'contributions';

    protected static ?string $title = 'Katkılar';

    protected static ?string $modelLabel = 'katkı';

    protected static ?string $pluralModelLabel = 'katkılar';

    public function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('Henüz katkı yok')
            ->columns([
                TextColumn::make('device_id')
                    ->label('Cihaz')
                    ->limit(14)
                    ->tooltip(fn ($record) => $record->device_id)
                    ->fontFamily('mono'),

                TextColumn::make('amount')
                    ->label('Zikir sayısı')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Tarih')
                    ->since()
                    ->dateTimeTooltip('d.m.Y H:i')
                    ->sortable(),
            ]);
    }

    public function isReadOnly(): bool
    {
        return true;
    }
}

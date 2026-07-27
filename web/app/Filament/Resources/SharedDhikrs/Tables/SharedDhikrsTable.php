<?php

namespace App\Filament\Resources\SharedDhikrs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SharedDhikrsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('Ortak zikir yok')
            ->emptyStateDescription('Kullanıcılar uygulamadan ortak zikir oluşturduğunda burada listelenir.')
            ->columns([
                TextColumn::make('title')
                    ->label('Başlık')
                    ->searchable()
                    ->wrap(),

                TextColumn::make('share_code')
                    ->label('Kod')
                    ->searchable()
                    ->copyable()
                    ->fontFamily('mono'),

                TextColumn::make('current_count')
                    ->label('Sayı')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('target_count')
                    ->label('Hedef')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('progress')
                    ->label('İlerleme')
                    ->state(fn ($record) => $record->target_count > 0
                        ? round(($record->current_count / $record->target_count) * 100) . '%'
                        : '—'),

                TextColumn::make('expires_at')
                    ->label('Bitiş')
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('Süresiz')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Oluşturulma')
                    ->since()
                    ->dateTimeTooltip('d.m.Y H:i')
                    ->sortable(),
            ])
            ->recordActions([
                EditAction::make()->label('Düzenle'),
                DeleteAction::make()
                    ->label('Sil')
                    ->requiresConfirmation()
                    ->modalHeading('Ortak zikri sil')
                    ->modalDescription('Bu işlem geri alınamaz. Kullanıcıların paylaşım kodu artık çalışmaz.'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('Sil'),
                ]),
            ]);
    }
}

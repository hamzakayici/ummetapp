<?php

namespace App\Filament\Resources\PushTokens\Tables;

use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PushTokensTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('updated_at', 'desc')
            ->emptyStateHeading('Kayıtlı cihaz yok')
            ->emptyStateDescription('Kullanıcılar uygulamayı açıp bildirim izni verince burada görünür.')
            ->columns([
                TextColumn::make('platform')
                    ->label('Platform')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => match ($state) {
                        'ios' => 'iOS',
                        'android' => 'Android',
                        'web' => 'Web',
                        default => 'Diğer',
                    }),

                TextColumn::make('app_version')
                    ->label('Sürüm')
                    ->placeholder('—'),

                IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),

                TextColumn::make('device_id')
                    ->label('Cihaz')
                    ->searchable()
                    ->limit(12)
                    ->tooltip(fn ($record) => $record->device_id)
                    ->toggleable(),

                TextColumn::make('updated_at')
                    ->label('Son güncelleme')
                    ->since()
                    ->dateTimeTooltip('d.m.Y H:i')
                    ->sortable(),
            ]);
    }
}

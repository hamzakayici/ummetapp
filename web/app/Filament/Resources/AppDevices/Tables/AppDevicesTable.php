<?php

namespace App\Filament\Resources\AppDevices\Tables;

use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class AppDevicesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('last_seen_at', 'desc')
            ->emptyStateHeading('Henüz cihaz kaydı yok')
            ->emptyStateDescription('Mobil uygulama API\'ye bağlandığında cihazlar burada görünür.')
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
                    ->placeholder('—')
                    ->sortable(),

                TextColumn::make('device_id')
                    ->label('Cihaz kimliği')
                    ->searchable()
                    ->limit(16)
                    ->tooltip(fn ($record) => $record->device_id)
                    ->fontFamily('mono'),

                TextColumn::make('first_seen_at')
                    ->label('İlk görülme')
                    ->dateTime('d.m.Y')
                    ->sortable()
                    ->toggleable(),

                TextColumn::make('last_seen_at')
                    ->label('Son görülme')
                    ->since()
                    ->dateTimeTooltip('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('platform')
                    ->label('Platform')
                    ->options([
                        'ios' => 'iOS',
                        'android' => 'Android',
                        'web' => 'Web',
                        'other' => 'Diğer',
                    ]),
            ])
            ->recordActions([
                ViewAction::make()->label('Detay'),
            ]);
    }
}

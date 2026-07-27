<?php

namespace App\Filament\Resources\AppEvents\Tables;

use App\Models\AppEvent;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class AppEventsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('ts', 'desc')
            ->paginated([25, 50, 100])
            ->emptyStateHeading('Henüz olay yok')
            ->emptyStateDescription('Mobil uygulama analytics API\'ye bağlandığında olaylar burada görünür.')
            ->columns([
                TextColumn::make('name')
                    ->label('Olay')
                    ->searchable()
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'screen_view' => 'primary',
                        'session_start', 'session_end' => 'gray',
                        default => 'warning',
                    }),

                TextColumn::make('pathname')
                    ->label('Ekran')
                    ->searchable()
                    ->limit(28)
                    ->placeholder('—')
                    ->toggleable(),

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
                    ->toggleable(),

                TextColumn::make('device_id')
                    ->label('Cihaz')
                    ->searchable()
                    ->limit(12)
                    ->tooltip(fn ($record) => $record->device_id)
                    ->fontFamily('mono')
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('ts')
                    ->label('Zaman')
                    ->dateTime('d.m.Y H:i:s')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('name')
                    ->label('Olay tipi')
                    ->options(fn () => AppEvent::query()
                        ->select('name')
                        ->distinct()
                        ->orderBy('name')
                        ->pluck('name', 'name')
                        ->all()),

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

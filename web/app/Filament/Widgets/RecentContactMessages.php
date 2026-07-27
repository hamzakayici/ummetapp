<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use App\Models\ContactMessage;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class RecentContactMessages extends TableWidget
{
    protected static ?int $sort = 9;

    protected int|string|array $columnSpan = 'full';

    public static function canView(): bool
    {
        return ContactMessage::query()->exists();
    }

    public function table(Table $table): Table
    {
        return $table
            ->heading('Son iletişim mesajları')
            ->description('Siteden gelen en güncel mesajlar.')
            ->query(
                ContactMessage::query()
                    ->latest()
                    ->limit(8)
            )
            ->defaultSort('created_at', 'desc')
            ->paginated(false)
            ->emptyStateHeading('Henüz mesaj yok')
            ->columns([
                TextColumn::make('name')
                    ->label('Gönderen')
                    ->weight(fn (ContactMessage $record) => $record->is_read ? 'normal' : 'bold')
                    ->color(fn (ContactMessage $record) => $record->is_read ? null : 'warning'),

                TextColumn::make('subject')
                    ->label('Konu')
                    ->placeholder('—')
                    ->limit(35),

                TextColumn::make('message')
                    ->label('Önizleme')
                    ->limit(60)
                    ->wrap(),

                TextColumn::make('created_at')
                    ->label('Tarih')
                    ->since()
                    ->dateTimeTooltip('d.m.Y H:i'),
            ])
            ->recordActions([
                ViewAction::make()
                    ->url(fn (ContactMessage $record) => ContactMessageResource::getUrl('view', ['record' => $record])),
            ])
            ->headerActions([
                \Filament\Actions\Action::make('tumunu_gor')
                    ->label('Tümünü gör')
                    ->url(ContactMessageResource::getUrl('index'))
                    ->icon('heroicon-o-arrow-right')
                    ->color('gray'),
            ]);
    }
}

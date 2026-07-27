<?php

namespace App\Filament\Resources\PushNotifications\Tables;

use App\Jobs\SendPushNotification;
use App\Models\PushNotification;
use App\Services\ExpoPushService;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class PushNotificationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('title')
                    ->label('Başlık')
                    ->searchable()
                    ->wrap(),

                TextColumn::make('segment')
                    ->label('Kime')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => self::segmentLabels()[$state] ?? $state),

                TextColumn::make('status')
                    ->label('Durum')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => match ($state) {
                        'draft' => 'Taslak',
                        'queued' => 'Kuyrukta',
                        'sending' => 'Gönderiliyor',
                        'sent' => 'Gönderildi',
                        'failed' => 'Başarısız',
                        default => $state,
                    })
                    ->color(fn (string $state) => match ($state) {
                        'sent' => 'success',
                        'failed' => 'danger',
                        'sending', 'queued' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('sent_count')
                    ->label('Gönderilen')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('open_count')
                    ->label('Açılan')
                    ->numeric()
                    ->sortable(),

                // Açılma oranı — bir kampanyanın işe yarayıp yaramadığını gösteren tek sayı
                TextColumn::make('open_rate')
                    ->label('Açılma oranı')
                    ->state(fn (PushNotification $r) => $r->sent_count > 0 ? $r->open_rate . '%' : '—')
                    ->badge()
                    ->color(fn (PushNotification $r) => match (true) {
                        $r->open_rate >= 10 => 'success',
                        $r->open_rate >= 4 => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('sent_at')
                    ->label('Gönderim')
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('—')
                    ->sortable(),
            ])
            ->recordActions([
                Action::make('send')
                    ->label('Gönder')
                    ->icon('heroicon-o-paper-airplane')
                    ->color('success')
                    ->visible(fn (PushNotification $r) => in_array($r->status, ['draft', 'failed'], true))
                    ->requiresConfirmation()
                    ->modalHeading('Bildirimi gönder')
                    ->modalDescription(function (PushNotification $r) {
                        $count = count(app(ExpoPushService::class)->tokensForSegment($r->segment));

                        if (! config('ummet.push.enabled')) {
                            return "KISITLI MOD açık — bildirim yalnızca test cihazlarına gidecek. "
                                . "Canlıda bu segmentte {$count} cihaz var.";
                        }

                        return "Bu bildirim {$count} GERÇEK cihaza gönderilecek. Bu işlem geri alınamaz.";
                    })
                    ->modalSubmitActionLabel('Evet, gönder')
                    ->action(function (PushNotification $r) {
                        $r->update(['status' => 'queued']);
                        SendPushNotification::dispatch($r);

                        Notification::make()
                            ->title('Bildirim kuyruğa alındı')
                            ->body(config('ummet.push.enabled')
                                ? 'Gönderim başladı.'
                                : 'KISITLI MOD: yalnızca test cihazlarına gidecek.')
                            ->success()
                            ->send();
                    }),

                EditAction::make()->label('Düzenle'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()->label('Sil'),
                ]),
            ]);
    }

    /** @return array<string,string> */
    public static function segmentLabels(): array
    {
        return [
            'all' => 'Tüm kullanıcılar',
            'active_7d' => 'Son 7 gün aktif',
            'inactive_14d' => '14 gündür pasif',
            'ios' => 'Sadece iOS',
            'android' => 'Sadece Android',
        ];
    }
}

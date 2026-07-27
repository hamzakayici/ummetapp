<?php

namespace App\Filament\Pages;

use App\Filament\Resources\PushNotifications\Schemas\PushNotificationForm;
use App\Filament\Resources\PushNotifications\Tables\PushNotificationsTable;
use App\Jobs\SendPushNotification;
use App\Models\PushNotification;
use App\Services\ExpoPushService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class QuickPush extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPaperAirplane;

    protected static ?string $navigationLabel = 'Hızlı push';

    protected static ?string $title = 'Hızlı push gönder';

    protected static string|\UnitEnum|null $navigationGroup = 'Bildirimler';

    protected static ?int $navigationSort = 0;

    protected string $view = 'filament-panels::pages.page';

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill([
            'segment' => 'all',
        ]);
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->columns(2);
    }

    public function form(Schema $schema): Schema
    {
        return PushNotificationForm::configure($schema);
    }

    public function content(Schema $schema): Schema
    {
        return $schema
            ->components([
                Form::make([EmbeddedSchema::make('form')])
                    ->id('quick-push-form')
                    ->livewireSubmitHandler('send')
                    ->footer([
                        Actions::make([
                            Action::make('send')
                                ->label('Gönder')
                                ->icon('heroicon-o-paper-airplane')
                                ->color('success')
                                ->requiresConfirmation()
                                ->modalHeading('Bildirimi gönder')
                                ->modalDescription(function () {
                                    $segment = $this->data['segment'] ?? 'all';
                                    $count = count(app(ExpoPushService::class)->tokensForSegment((string) $segment));

                                    if (! config('ummet.push.enabled')) {
                                        return "KISITLI MOD açık — bildirim yalnızca test cihazlarına gidecek. Canlıda bu segmentte {$count} cihaz var.";
                                    }

                                    return "Bu bildirim {$count} GERÇEK cihaza gönderilecek. Bu işlem geri alınamaz.";
                                })
                                ->modalSubmitActionLabel('Evet, gönder')
                                ->submit('send'),
                        ]),
                    ]),
            ]);
    }

    public function send(): void
    {
        $data = $this->form->getState();

        $notification = PushNotification::create([
            ...$data,
            'status' => 'queued',
        ]);

        SendPushNotification::dispatch($notification);

        Notification::make()
            ->title('Bildirim kuyruğa alındı')
            ->body(config('ummet.push.enabled')
                ? 'Gönderim başladı.'
                : 'KISITLI MOD: yalnızca test cihazlarına gidecek.')
            ->success()
            ->send();

        $this->form->fill([
            'segment' => 'all',
            'title' => null,
            'body' => null,
            'route' => null,
        ]);
    }

    public function getSubheading(): ?string
    {
        $labels = PushNotificationsTable::segmentLabels();
        $segment = $this->data['segment'] ?? 'all';
        $count = count(app(ExpoPushService::class)->tokensForSegment((string) $segment));

        $mode = config('ummet.push.enabled')
            ? 'Canlı mod'
            : 'KISITLI MOD (yalnızca test cihazları)';

        return ($labels[$segment] ?? $segment) . " · {$count} cihaz · {$mode}";
    }
}

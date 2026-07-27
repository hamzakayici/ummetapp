<?php

namespace App\Filament\Resources\ContactMessages\Pages;

use App\Filament\Resources\ContactMessages\ContactMessageResource;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\ViewRecord;

class ViewContactMessage extends ViewRecord
{
    protected static string $resource = ContactMessageResource::class;

    protected static ?string $title = 'Mesaj detayı';

    public function mount(int | string $record): void
    {
        parent::mount($record);

        if (! $this->getRecord()->is_read) {
            $this->getRecord()->update(['is_read' => true]);
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('reply')
                ->label('E-posta ile yanıtla')
                ->icon('heroicon-o-envelope')
                ->url(fn () => 'mailto:' . $this->getRecord()->email
                    . '?subject=' . rawurlencode('Re: ' . ($this->getRecord()->subject ?: 'Ümmet iletişim')))
                ->openUrlInNewTab(),

            DeleteAction::make()->label('Sil'),
        ];
    }
}

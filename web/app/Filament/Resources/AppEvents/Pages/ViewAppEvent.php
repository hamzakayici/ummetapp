<?php

namespace App\Filament\Resources\AppEvents\Pages;

use App\Filament\Resources\AppEvents\AppEventResource;
use Filament\Resources\Pages\ViewRecord;

class ViewAppEvent extends ViewRecord
{
    protected static string $resource = AppEventResource::class;

    protected static ?string $title = 'Olay detayı';

    protected function getHeaderActions(): array
    {
        return [];
    }
}

<?php

namespace App\Filament\Resources\AppEvents\Pages;

use App\Filament\Resources\AppEvents\AppEventResource;
use Filament\Resources\Pages\ListRecords;

class ListAppEvents extends ListRecords
{
    protected static string $resource = AppEventResource::class;

    protected static ?string $title = 'Uygulama olayları';

    protected function getHeaderActions(): array
    {
        return [];
    }
}

<?php

namespace App\Filament\Resources\AppDevices\Pages;

use App\Filament\Resources\AppDevices\AppDeviceResource;
use Filament\Resources\Pages\ListRecords;

class ListAppDevices extends ListRecords
{
    protected static string $resource = AppDeviceResource::class;

    protected static ?string $title = 'Uygulama cihazları';

    protected function getHeaderActions(): array
    {
        return [];
    }
}

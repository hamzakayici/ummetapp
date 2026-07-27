<?php

namespace App\Filament\Resources\AppDevices\Pages;

use App\Filament\Resources\AppDevices\AppDeviceResource;
use Filament\Resources\Pages\ViewRecord;

class ViewAppDevice extends ViewRecord
{
    protected static string $resource = AppDeviceResource::class;

    protected static ?string $title = 'Cihaz detayı';

    protected function getHeaderActions(): array
    {
        return [];
    }
}

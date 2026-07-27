<?php

namespace App\Filament\Resources\PurchaseEvents\Pages;

use App\Filament\Resources\PurchaseEvents\PurchaseEventResource;
use Filament\Resources\Pages\ViewRecord;

class ViewPurchaseEvent extends ViewRecord
{
    protected static string $resource = PurchaseEventResource::class;

    protected static ?string $title = 'Satın alma detayı';

    protected function getHeaderActions(): array
    {
        return [];
    }
}

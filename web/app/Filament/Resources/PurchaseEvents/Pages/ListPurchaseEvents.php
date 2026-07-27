<?php

namespace App\Filament\Resources\PurchaseEvents\Pages;

use App\Filament\Resources\PurchaseEvents\PurchaseEventResource;
use Filament\Resources\Pages\ListRecords;

class ListPurchaseEvents extends ListRecords
{
    protected static string $resource = PurchaseEventResource::class;

    protected static ?string $title = 'Satın alma olayları';

    protected function getHeaderActions(): array
    {
        return [];
    }
}

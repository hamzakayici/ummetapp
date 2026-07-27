<?php

namespace App\Filament\Resources\SharedDhikrs\Pages;

use App\Filament\Resources\SharedDhikrs\SharedDhikrResource;
use Filament\Resources\Pages\ListRecords;

class ListSharedDhikrs extends ListRecords
{
    protected static string $resource = SharedDhikrResource::class;

    protected static ?string $title = 'Ortak zikirler';

    protected function getHeaderActions(): array
    {
        return [];
    }
}

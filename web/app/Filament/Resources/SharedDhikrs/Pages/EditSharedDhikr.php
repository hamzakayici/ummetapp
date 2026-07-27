<?php

namespace App\Filament\Resources\SharedDhikrs\Pages;

use App\Filament\Resources\SharedDhikrs\SharedDhikrResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditSharedDhikr extends EditRecord
{
    protected static string $resource = SharedDhikrResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

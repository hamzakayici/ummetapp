<?php

namespace App\Filament\Resources\AppDevices;

use App\Filament\Resources\AppDevices\Pages\ListAppDevices;
use App\Filament\Resources\AppDevices\Pages\ViewAppDevice;
use App\Filament\Resources\AppDevices\Schemas\AppDeviceInfolist;
use App\Filament\Resources\AppDevices\Tables\AppDevicesTable;
use App\Models\AppDevice;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class AppDeviceResource extends Resource
{
    protected static ?string $model = AppDevice::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDeviceTablet;

    protected static ?string $modelLabel = 'Cihaz';

    protected static ?string $pluralModelLabel = 'Uygulama cihazları';

    protected static ?string $navigationLabel = 'Cihazlar';

    protected static string|\UnitEnum|null $navigationGroup = 'Analitik';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function infolist(Schema $schema): Schema
    {
        return AppDeviceInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AppDevicesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAppDevices::route('/'),
            'view' => ViewAppDevice::route('/{record}'),
        ];
    }
}

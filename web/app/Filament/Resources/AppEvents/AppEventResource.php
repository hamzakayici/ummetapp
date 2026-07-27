<?php

namespace App\Filament\Resources\AppEvents;

use App\Filament\Resources\AppEvents\Pages\ListAppEvents;
use App\Filament\Resources\AppEvents\Pages\ViewAppEvent;
use App\Filament\Resources\AppEvents\Schemas\AppEventInfolist;
use App\Filament\Resources\AppEvents\Tables\AppEventsTable;
use App\Models\AppEvent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class AppEventResource extends Resource
{
    protected static ?string $model = AppEvent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBolt;

    protected static ?string $modelLabel = 'Olay';

    protected static ?string $pluralModelLabel = 'Uygulama olayları';

    protected static ?string $navigationLabel = 'Olaylar';

    protected static string|\UnitEnum|null $navigationGroup = 'Analitik';

    protected static ?int $navigationSort = 3;

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
        return AppEventInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AppEventsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAppEvents::route('/'),
            'view' => ViewAppEvent::route('/{record}'),
        ];
    }
}

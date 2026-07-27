<?php

namespace App\Filament\Resources\PurchaseEvents;

use App\Filament\Resources\PurchaseEvents\Pages\ListPurchaseEvents;
use App\Filament\Resources\PurchaseEvents\Pages\ViewPurchaseEvent;
use App\Filament\Resources\PurchaseEvents\Schemas\PurchaseEventInfolist;
use App\Filament\Resources\PurchaseEvents\Tables\PurchaseEventsTable;
use App\Models\PurchaseEvent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class PurchaseEventResource extends Resource
{
    protected static ?string $model = PurchaseEvent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBanknotes;

    protected static ?string $modelLabel = 'Satın alma';

    protected static ?string $pluralModelLabel = 'Satın alma olayları';

    protected static ?string $navigationLabel = 'Satın alma olayları';

    protected static string|\UnitEnum|null $navigationGroup = 'Gelir';

    protected static ?int $navigationSort = 11;

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
        return PurchaseEventInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PurchaseEventsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPurchaseEvents::route('/'),
            'view' => ViewPurchaseEvent::route('/{record}'),
        ];
    }
}

<?php

namespace App\Filament\Resources\SharedDhikrs;

use App\Filament\Resources\SharedDhikrs\Pages\EditSharedDhikr;
use App\Filament\Resources\SharedDhikrs\Pages\ListSharedDhikrs;
use App\Filament\Resources\SharedDhikrs\RelationManagers\ContributionsRelationManager;
use App\Filament\Resources\SharedDhikrs\Schemas\SharedDhikrForm;
use App\Filament\Resources\SharedDhikrs\Tables\SharedDhikrsTable;
use App\Models\SharedDhikr;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SharedDhikrResource extends Resource
{
    protected static ?string $model = SharedDhikr::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;


    protected static ?string $modelLabel = 'Ortak zikir';

    protected static ?string $pluralModelLabel = 'Ortak zikirler';

    protected static ?string $navigationLabel = 'Ortak zikirler';

    protected static string|\UnitEnum|null $navigationGroup = 'Kullanıcılar';

    protected static ?int $navigationSort = 1;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return SharedDhikrForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SharedDhikrsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            ContributionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSharedDhikrs::route('/'),
            'edit' => EditSharedDhikr::route('/{record}/edit'),
        ];
    }
}

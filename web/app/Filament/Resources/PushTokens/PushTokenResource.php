<?php

namespace App\Filament\Resources\PushTokens;

use App\Filament\Resources\PushTokens\Pages\ListPushTokens;
use App\Filament\Resources\PushTokens\Schemas\PushTokenForm;
use App\Filament\Resources\PushTokens\Tables\PushTokensTable;
use App\Models\PushToken;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class PushTokenResource extends Resource
{
    protected static ?string $model = PushToken::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDevicePhoneMobile;


    protected static ?string $modelLabel = 'Bildirim cihazı';

    protected static ?string $pluralModelLabel = 'Bildirim cihazları';

    protected static ?string $navigationLabel = 'Bildirim cihazları';

    protected static string|\UnitEnum|null $navigationGroup = 'Bildirimler';

    protected static ?int $navigationSort = 2;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return PushTokenForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PushTokensTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPushTokens::route('/'),
        ];
    }
}

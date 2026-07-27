<?php

namespace App\Filament\Resources\PushNotifications;

use App\Filament\Resources\PushNotifications\Pages\CreatePushNotification;
use App\Filament\Resources\PushNotifications\Pages\EditPushNotification;
use App\Filament\Resources\PushNotifications\Pages\ListPushNotifications;
use App\Filament\Resources\PushNotifications\Schemas\PushNotificationForm;
use App\Filament\Resources\PushNotifications\Tables\PushNotificationsTable;
use App\Models\PushNotification;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PushNotificationResource extends Resource
{
    protected static ?string $model = PushNotification::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBellAlert;


    protected static ?string $modelLabel = 'Bildirim';

    protected static ?string $pluralModelLabel = 'Bildirimler';

    protected static ?string $navigationLabel = 'Push kampanyaları';

    protected static string|\UnitEnum|null $navigationGroup = 'Bildirimler';

    protected static ?int $navigationSort = 2;

    public static function getNavigationBadge(): ?string
    {
        $count = PushNotification::query()
            ->whereIn('status', ['draft', 'failed'])
            ->count();

        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema
    {
        return PushNotificationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PushNotificationsTable::configure($table);
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
            'index' => ListPushNotifications::route('/'),
            'create' => CreatePushNotification::route('/create'),
            'edit' => EditPushNotification::route('/{record}/edit'),
        ];
    }
}

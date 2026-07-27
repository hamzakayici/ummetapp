<?php

namespace App\Filament\Resources\ContactMessages\Schemas;

use App\Filament\Support\FormLayout;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class ContactMessageInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return FormLayout::twoColumns($schema)
            ->components([
                TextEntry::make('name')
                    ->label('Gönderen'),

                TextEntry::make('email')
                    ->label('E-posta')
                    ->copyable(),

                TextEntry::make('subject')
                    ->label('Konu')
                    ->placeholder('—'),

                IconEntry::make('is_read')
                    ->label('Okundu')
                    ->boolean(),

                TextEntry::make('message')
                    ->label('Mesaj')
                    ->columnSpanFull()
                    ->prose(),

                TextEntry::make('created_at')
                    ->label('Gönderim')
                    ->dateTime('d.m.Y H:i'),
            ]);
    }
}

<?php

namespace App\Filament\Support;

use Filament\Schemas\Schema;

class FormLayout
{
    /** Tüm ekran boyutlarında yan yana 2 sütun */
    public static function twoColumns(Schema $schema): Schema
    {
        return $schema->columns([
            'default' => 2,
            'sm' => 2,
            'md' => 2,
            'lg' => 2,
            'xl' => 2,
            '2xl' => 2,
        ]);
    }
}

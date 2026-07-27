<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\AppSetting;
use Illuminate\Database\Seeder;

class UmmetSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'min_supported_version', 'value' => '1.0.0', 'description' => 'Bu sürümün altındakilere zorunlu güncelleme gösterilir'],
            ['key' => 'latest_version',        'value' => '1.0.1', 'description' => 'App Store\'daki güncel sürüm'],
            ['key' => 'force_update',          'value' => 'false', 'description' => 'Zorunlu güncelleme ekranını aç/kapat'],
            ['key' => 'ramadan_hub_enabled',   'value' => 'true',  'description' => 'Ramazan Hub görünürlüğü'],
            ['key' => 'support_url',           'value' => 'https://ummetapp.com/iletisim', 'description' => 'Destek bağlantısı'],
        ];

        foreach ($settings as $s) {
            AppSetting::updateOrCreate(['key' => $s['key']], $s);
        }

        Announcement::updateOrCreate(
            ['title' => 'Ümmet yeni altyapıya taşındı'],
            [
                'content' => 'Uygulama daha hızlı ve kararlı çalışması için yeni sunucularımıza taşındı. Bildirimler ve ortak zikir yeniden aktif.',
                'type' => 'update',
                'is_active' => true,
                'published_at' => now(),
            ],
        );

        Announcement::updateOrCreate(
            ['title' => 'Ortak zikir yeniden çalışıyor'],
            [
                'content' => 'Arkadaşlarınızla birlikte zikir çekebilir, hedefe ulaşmanızı canlı takip edebilirsiniz.',
                'type' => 'info',
                'is_active' => true,
                'published_at' => now()->subDay(),
            ],
        );
    }
}

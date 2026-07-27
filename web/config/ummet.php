<?php

return [
    // ── Mağaza ──
    'app_store_id' => '6760871547',
    'app_store_url' => 'https://apps.apple.com/tr/app/ummet/id6760871547',
    // Play Store yayına girince .env içine PLAY_STORE_URL ekleyin
    'play_store_url' => env('PLAY_STORE_URL') ?: null,
    'play_package_name' => env('PLAY_PACKAGE_NAME', 'com.ummet.app'),

    'support_email' => 'destek@ummetapp.com',

    // Filament admin paneline erişebilen e-postalar (virgülle ayrılmış)
    'admin_emails' => array_filter(array_map(
        'trim',
        explode(',', (string) env('ADMIN_EMAILS', 'hamzakayc@gmail.com'))
    )),

    // ── Site menüsü ──
    'nav' => [
        ['label' => 'Özellikler', 'href' => '/ozellikler'],
        ['label' => 'Namaz Vakitleri', 'href' => '/namaz-vakitleri'],
        ['label' => 'Zekat Hesaplama', 'href' => '/zekat-hesaplayici'],
        ['label' => 'SSS', 'href' => '/sss'],
    ],

    // Analytics toplama açık mı (yük altında kapatılabilir)
    'ingest_enabled' => env('API_INGEST_ENABLED', true),

    'push' => [
        // ⚠️ Yerelde MUTLAKA false. true ise gerçek kullanıcılara bildirim gider.
        'enabled' => env('PUSH_ENABLED', false),

        // enabled=false iken sadece bu token'lara gönderilir
        'test_tokens' => array_filter(explode(',', (string) env('PUSH_TEST_TOKENS', ''))),
    ],

    // ── Pazarlama görselleri (public/img/marketing/) ──
    // Yeni ekran görüntüleri hazır olunca doldurun; boşken ana sayfada görsel bölümü çıkmaz.
    'marketing' => [
        'hero_image' => null,
        // 'hero_image' => 'img/marketing/hero.png',

        'screens' => [
            // ['src' => 'img/marketing/kuran.png', 'alt' => 'Ümmet — Kuran okuyucu', 'label' => 'Kuran'],
        ],
    ],

    // ── RevenueCat ──
    // Panelde GERÇEKTEN anlık olan tek dış kaynak. Satın alma anında webhook gelir.
    // RevenueCat → Integrations → Webhooks
    //   URL: https://ummetapp.com/api/v1/webhooks/revenuecat
    //   Authorization: REVENUECAT_WEBHOOK_SECRET ile aynı olmalı
    'revenuecat' => [
        'webhook_secret' => env('REVENUECAT_WEBHOOK_SECRET'),
        // Secret API key (sk_...) — yalnızca sunucu tarafı REST API için; mobilde ASLA kullanmayın
        'secret_api_key' => env('REVENUECAT_SECRET_API_KEY'),
    ],

    // ── App Store Connect ──
    // ⚠️ Apple canlı veri VERMEZ. Raporlar günlük üretilir, 1-2 gün gecikmelidir.
    // .p8 dosyası depoya konmaz; public_html dışında, chmod 600 tutulur.
    'app_store_connect' => [
        'issuer_id' => env('ASC_ISSUER_ID'),
        'key_id' => env('ASC_KEY_ID'),
        'p8_path' => env('ASC_P8_PATH'),
        'app_id' => env('ASC_APP_ID', '6760871547'),
    ],

    // ── Google Play Console ──
    // ⚠️ Google da canlı veri vermez; raporlar GCS bucket'ına günlük düşer.
    // Uygulama Play Store'da yayınlanınca doldurulacak.
    'play_console' => [
        'package_name' => env('PLAY_PACKAGE_NAME', 'com.ummet.app'),
        'service_account_path' => env('PLAY_SERVICE_ACCOUNT_PATH'),
        'report_bucket' => env('PLAY_REPORT_BUCKET'),
    ],
];

<?php

namespace App\Services;

/**
 * Türkiye'nin 81 ili — namaz vakti sayfaları için.
 *
 * "istanbul namaz vakitleri" kalıbı TR'de en yüksek hacimli dini arama.
 * Her il için ayrı bir sayfa üretiyoruz: /namaz-vakitleri/{slug}
 */
readonly class City
{
    public function __construct(
        public string $slug,
        public string $name,
        public float $lat,
        public float $lon,
        public bool $major = false,   // ana sayfada ve öne çıkanlarda gösterilir
    ) {}

    /** @return array<string, self> */
    public static function all(): array
    {
        static $cities = null;

        if ($cities !== null) {
            return $cities;
        }

        $rows = [
            ['istanbul', 'İstanbul', 41.0082, 28.9784, true],
            ['ankara', 'Ankara', 39.9334, 32.8597, true],
            ['izmir', 'İzmir', 38.4237, 27.1428, true],
            ['bursa', 'Bursa', 40.1826, 29.0665, true],
            ['antalya', 'Antalya', 36.8969, 30.7133, true],
            ['adana', 'Adana', 37.0000, 35.3213, true],
            ['konya', 'Konya', 37.8746, 32.4932, true],
            ['gaziantep', 'Gaziantep', 37.0662, 37.3833, true],
            ['sanliurfa', 'Şanlıurfa', 37.1591, 38.7969, true],
            ['kocaeli', 'Kocaeli', 40.8533, 29.8815, true],
            ['mersin', 'Mersin', 36.8121, 34.6415, true],
            ['kayseri', 'Kayseri', 38.7312, 35.4787, true],
            ['diyarbakir', 'Diyarbakır', 37.9144, 40.2306, true],
            ['samsun', 'Samsun', 41.2867, 36.3300, true],
            ['trabzon', 'Trabzon', 41.0015, 39.7178, true],
            ['erzurum', 'Erzurum', 39.9000, 41.2700, true],

            ['adiyaman', 'Adıyaman', 37.7648, 38.2786, false],
            ['afyonkarahisar', 'Afyonkarahisar', 38.7507, 30.5567, false],
            ['agri', 'Ağrı', 39.7191, 43.0503, false],
            ['aksaray', 'Aksaray', 38.3687, 34.0370, false],
            ['amasya', 'Amasya', 40.6499, 35.8353, false],
            ['ardahan', 'Ardahan', 41.1105, 42.7022, false],
            ['artvin', 'Artvin', 41.1828, 41.8183, false],
            ['aydin', 'Aydın', 37.8560, 27.8416, false],
            ['balikesir', 'Balıkesir', 39.6484, 27.8826, false],
            ['bartin', 'Bartın', 41.6344, 32.3375, false],
            ['batman', 'Batman', 37.8812, 41.1351, false],
            ['bayburt', 'Bayburt', 40.2552, 40.2249, false],
            ['bilecik', 'Bilecik', 40.1506, 29.9833, false],
            ['bingol', 'Bingöl', 38.8854, 40.4980, false],
            ['bitlis', 'Bitlis', 38.4006, 42.1095, false],
            ['bolu', 'Bolu', 40.7392, 31.6089, false],
            ['burdur', 'Burdur', 37.7203, 30.2908, false],
            ['canakkale', 'Çanakkale', 40.1553, 26.4142, false],
            ['cankiri', 'Çankırı', 40.6013, 33.6134, false],
            ['corum', 'Çorum', 40.5506, 34.9556, false],
            ['denizli', 'Denizli', 37.7765, 29.0864, false],
            ['duzce', 'Düzce', 40.8438, 31.1565, false],
            ['edirne', 'Edirne', 41.6818, 26.5623, false],
            ['elazig', 'Elazığ', 38.6810, 39.2264, false],
            ['erzincan', 'Erzincan', 39.7500, 39.5000, false],
            ['eskisehir', 'Eskişehir', 39.7767, 30.5206, false],
            ['giresun', 'Giresun', 40.9128, 38.3895, false],
            ['gumushane', 'Gümüşhane', 40.4386, 39.5086, false],
            ['hakkari', 'Hakkâri', 37.5744, 43.7408, false],
            ['hatay', 'Hatay', 36.4018, 36.3498, false],
            ['igdir', 'Iğdır', 39.8880, 44.0048, false],
            ['isparta', 'Isparta', 37.7648, 30.5566, false],
            ['kahramanmaras', 'Kahramanmaraş', 37.5858, 36.9371, false],
            ['karabuk', 'Karabük', 41.2061, 32.6204, false],
            ['karaman', 'Karaman', 37.1811, 33.2150, false],
            ['kars', 'Kars', 40.6013, 43.0975, false],
            ['kastamonu', 'Kastamonu', 41.3887, 33.7827, false],
            ['kilis', 'Kilis', 36.7184, 37.1212, false],
            ['kirikkale', 'Kırıkkale', 39.8468, 33.5153, false],
            ['kirklareli', 'Kırklareli', 41.7333, 27.2167, false],
            ['kirsehir', 'Kırşehir', 39.1425, 34.1709, false],
            ['kutahya', 'Kütahya', 39.4167, 29.9833, false],
            ['malatya', 'Malatya', 38.3552, 38.3095, false],
            ['manisa', 'Manisa', 38.6191, 27.4289, false],
            ['mardin', 'Mardin', 37.3212, 40.7245, false],
            ['mugla', 'Muğla', 37.2153, 28.3636, false],
            ['mus', 'Muş', 38.9462, 41.7539, false],
            ['nevsehir', 'Nevşehir', 38.6939, 34.6857, false],
            ['nigde', 'Niğde', 37.9667, 34.6833, false],
            ['ordu', 'Ordu', 40.9839, 37.8764, false],
            ['osmaniye', 'Osmaniye', 37.0742, 36.2464, false],
            ['rize', 'Rize', 41.0201, 40.5234, false],
            ['sakarya', 'Sakarya', 40.6940, 30.4358, false],
            ['siirt', 'Siirt', 37.9333, 41.9500, false],
            ['sinop', 'Sinop', 42.0231, 35.1531, false],
            ['sirnak', 'Şırnak', 37.4187, 42.4918, false],
            ['sivas', 'Sivas', 39.7477, 37.0179, false],
            ['tekirdag', 'Tekirdağ', 40.9833, 27.5167, false],
            ['tokat', 'Tokat', 40.3167, 36.5500, false],
            ['tunceli', 'Tunceli', 39.1079, 39.5401, false],
            ['usak', 'Uşak', 38.6823, 29.4082, false],
            ['van', 'Van', 38.4891, 43.4089, false],
            ['yalova', 'Yalova', 40.6500, 29.2667, false],
            ['yozgat', 'Yozgat', 39.8181, 34.8147, false],
            ['zonguldak', 'Zonguldak', 41.4564, 31.7987, false],
        ];

        $cities = [];
        foreach ($rows as [$slug, $name, $lat, $lon, $major]) {
            $cities[$slug] = new self($slug, $name, $lat, $lon, $major);
        }

        ksort($cities);

        return $cities;
    }

    public static function find(string $slug): ?self
    {
        return self::all()[$slug] ?? null;
    }

    /** @return array<string, self> */
    public static function major(): array
    {
        return array_filter(self::all(), fn (self $c) => $c->major);
    }
}

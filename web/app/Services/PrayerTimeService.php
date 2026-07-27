<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Namaz vakitleri — aladhan.com API'si üzerinden, sunucuda cache'li.
 *
 * Mobil uygulama da aynı API'yi kullanıyor (src/services/prayerTimes.ts),
 * metod 13 = Diyanet. Burada şehir bazlı çalışıyoruz çünkü web ziyaretçisinin
 * konumunu istemeden de sayfayı gösterebilmek istiyoruz (SEO için şart).
 */
class PrayerTimeService
{
    private const METHOD_DIYANET = 13;

    /** Vakit anahtarı => Türkçe ad */
    public const PRAYERS = [
        'Fajr' => 'İmsak',
        'Sunrise' => 'Güneş',
        'Dhuhr' => 'Öğle',
        'Asr' => 'İkindi',
        'Maghrib' => 'Akşam',
        'Isha' => 'Yatsı',
    ];

    /**
     * Bir şehrin bugünkü vakitleri.
     *
     * @return array{times: array<string,string>, date: string, hijri: string}|null
     */
    public function today(City $city): ?array
    {
        $cacheKey = "prayer.{$city->slug}." . now()->format('Y-m-d');

        return Cache::remember($cacheKey, now()->endOfDay(), function () use ($city) {
            try {
                $response = Http::timeout(10)->get('https://api.aladhan.com/v1/timings/' . now()->format('d-m-Y'), [
                    'latitude' => $city->lat,
                    'longitude' => $city->lon,
                    'method' => self::METHOD_DIYANET,
                ]);

                if (! $response->successful()) {
                    return null;
                }

                $data = $response->json('data');

                $times = [];
                foreach (array_keys(self::PRAYERS) as $key) {
                    // API "05:44 (+03)" biçiminde dönebiliyor — saat kısmını al
                    $times[$key] = substr((string) ($data['timings'][$key] ?? ''), 0, 5);
                }

                $hijri = $data['date']['hijri'] ?? null;

                return [
                    'times' => $times,
                    'date' => now()->translatedFormat('d F Y'),
                    'hijri' => $hijri
                        ? "{$hijri['day']} {$hijri['month']['ar']} {$hijri['year']}"
                        : '',
                ];
            } catch (\Throwable $e) {
                Log::warning('Namaz vakti alınamadı', ['sehir' => $city->slug, 'hata' => $e->getMessage()]);

                return null;
            }
        });
    }

    /**
     * Sıradaki vakit ve kalan süre.
     *
     * @param  array<string,string>  $times
     * @return array{name: string, at: string, remaining: string}|null
     */
    public function next(array $times): ?array
    {
        $now = now();

        foreach (self::PRAYERS as $key => $label) {
            if ($key === 'Sunrise' || empty($times[$key])) {
                continue;
            }

            [$h, $m] = array_map('intval', explode(':', $times[$key]));
            $at = $now->copy()->setTime($h, $m);

            if ($at->isFuture()) {
                return [
                    'name' => $label,
                    'at' => $times[$key],
                    'remaining' => $this->humanDiff($now, $at),
                ];
            }
        }

        // Bugünün vakitleri bitti → yarının imsağı
        if (! empty($times['Fajr'])) {
            [$h, $m] = array_map('intval', explode(':', $times['Fajr']));
            $at = $now->copy()->addDay()->setTime($h, $m);

            return [
                'name' => 'İmsak',
                'at' => $times['Fajr'],
                'remaining' => $this->humanDiff($now, $at),
            ];
        }

        return null;
    }

    private function humanDiff(\DateTimeInterface $from, \DateTimeInterface $to): string
    {
        $minutes = max(0, (int) round(($to->getTimestamp() - $from->getTimestamp()) / 60));
        $h = intdiv($minutes, 60);
        $m = $minutes % 60;

        return $h > 0 ? "{$h} sa {$m} dk" : "{$m} dk";
    }

    /** Ana sayfa vakit kartı ve AJAX özet uç noktası için biçimlendirilmiş veri. */
    public function widgetData(City $city): array
    {
        $prayer = $this->today($city);

        if (! $prayer) {
            return [
                'error' => true,
                'city' => ['slug' => $city->slug, 'name' => $city->name],
            ];
        }

        $next = $this->next($prayer['times']);
        $times = [];

        foreach (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as $key) {
            $label = self::PRAYERS[$key];
            $times[] = [
                'key' => $key,
                'label' => $label,
                'time' => $prayer['times'][$key] ?? '—',
                'active' => $next && $next['name'] === $label,
            ];
        }

        return [
            'city' => ['slug' => $city->slug, 'name' => $city->name],
            'date' => $prayer['date'],
            'hijri' => $prayer['hijri'] ?? '',
            'times' => $times,
            'next' => $next,
            'more_url' => route('prayer.show', $city->slug),
        ];
    }
}

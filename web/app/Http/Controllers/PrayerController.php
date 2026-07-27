<?php

namespace App\Http\Controllers;

use App\Services\City;
use App\Services\PrayerTimeService;

class PrayerController extends Controller
{
    public function __construct(private PrayerTimeService $prayerTimes) {}

    public function index()
    {
        return view('pages.prayer-index', ['cities' => City::all()]);
    }

    public function show(string $slug)
    {
        $city = City::find($slug);
        abort_if(! $city, 404);

        $prayer = $this->prayerTimes->today($city);

        return view('pages.prayer-show', [
            'city' => $city,
            'prayer' => $prayer,
            'next' => $prayer ? $this->prayerTimes->next($prayer['times']) : null,
            'others' => array_slice(City::major(), 0, 12, true),
        ]);
    }

    public function summary(string $slug)
    {
        $city = City::find($slug);
        abort_if(! $city, 404);

        return response()->json($this->prayerTimes->widgetData($city));
    }
}

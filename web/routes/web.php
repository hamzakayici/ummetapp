<?php

use App\Http\Controllers\PageController;
use App\Http\Controllers\PrayerController;
use App\Http\Controllers\SubscriberController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');

Route::get('/ozellikler', [PageController::class, 'features'])->name('features');
Route::get('/sss', [PageController::class, 'faq'])->name('faq');
Route::get('/gizlilik', [PageController::class, 'privacy'])->name('privacy');
Route::get('/kullanim-sartlari', [PageController::class, 'terms'])->name('terms');

// Programatik SEO — 81 il. "istanbul namaz vakitleri" TR'nin en hacimli dini araması.
Route::get('/namaz-vakitleri', [PrayerController::class, 'index'])->name('prayer.index');
Route::get('/namaz-vakitleri/{slug}/ozet', [PrayerController::class, 'summary'])->name('prayer.summary');
Route::get('/namaz-vakitleri/{slug}', [PrayerController::class, 'show'])->name('prayer.show');

Route::view('/zekat-hesaplayici', 'pages.tools.zekat')->name('tools.zekat');
Route::view('/tesbih', 'pages.tools.tesbih')->name('tools.tesbih');
Route::view('/kible-pusulasi', 'pages.tools.kible')->name('tools.kible');
Route::view('/iletisim', 'pages.contact')->name('contact');

Route::post('/abone', [SubscriberController::class, 'store'])->name('subscribe');

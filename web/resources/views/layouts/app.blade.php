<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@yield('title', 'Ümmet — Namaz Vakitleri, Kuran ve Dua Uygulaması')</title>
    <meta name="description" content="@yield('description', 'Namaz vakitleri, ezan bildirimleri, Kuran-ı Kerim ve meal, dua, zikir, kıble pusulası. Çekirdek özellikler her zaman ücretsiz.')">
    <link rel="canonical" href="{{ url()->current() }}">

    <meta name="apple-itunes-app" content="app-id={{ config('ummet.app_store_id') }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Ümmet">
    <meta property="og:locale" content="tr_TR">
    <meta property="og:title" content="@yield('title', 'Ümmet')">
    <meta property="og:description" content="@yield('description', '')">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="theme-color" content="#0a0e17">

    <link rel="icon" href="{{ asset('favicon.png') }}" type="image/png" sizes="32x32">
    <link rel="icon" href="{{ asset('img/brand/icon.png') }}" type="image/png" sizes="512x512">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">
    <meta property="og:image" content="{{ asset('img/brand/icon.png') }}">
    <meta name="twitter:image" content="{{ asset('img/brand/icon.png') }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    {{-- Plus Jakarta Sans: modern, Türkçe karakterleri (ğ ı ş ç ö ü) eksiksiz.
         Amiri yalnızca Arapça metin için. --}}
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('head')
</head>
<body class="@yield('body-class')">

    <a href="#main" class="skip">İçeriğe git</a>

    @include('partials.nav')

    <main id="main">
        @yield('content')
    </main>

    @include('partials.footer')

    @stack('scripts')
</body>
</html>

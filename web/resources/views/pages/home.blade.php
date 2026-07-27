@extends('layouts.app')

@section('body-class', 'page-home')

@section('title', 'Ümmet — Namaz Vakitleri, Kuran ve Dua Uygulaması')
@section('description', 'Namaz vakitleri, ezan bildirimleri, Kuran-ı Kerim ve meal, dua, zikir, kıble pusulası ve kaza takibi. Çekirdek özellikler her zaman ücretsiz.')

@push('head')
<script type="application/ld+json">
{!! json_encode([
    '@context' => 'https://schema.org',
    '@type' => 'MobileApplication',
    'name' => 'Ümmet — İslami Yaşam',
    'operatingSystem' => 'iOS, Android',
    'applicationCategory' => 'LifestyleApplication',
    'inLanguage' => 'tr',
    'offers' => ['@type' => 'Offer', 'price' => '0', 'priceCurrency' => 'TRY'],
    'url' => config('ummet.app_store_url'),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}
</script>
@endpush

@section('content')

{{-- ── Hero ── --}}
<section class="home-hero">
    <div class="home-hero__backdrop" aria-hidden="true">
        <div class="home-hero__orb home-hero__orb--1"></div>
        <div class="home-hero__orb home-hero__orb--2"></div>
        <p class="home-hero__besmele" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
    </div>

    <div class="wrap home-hero__layout">
        <div class="home-hero__main">
            <div class="home-hero__badge">
                <span class="home-hero__dot" aria-hidden="true"></span>
                iOS'ta yayında · Android yakında
            </div>

            <h1 class="home-hero__title">
                İslami yaşamınız<br>
                <span class="home-hero__title-accent">tek uygulamada</span>
            </h1>

            <p class="home-hero__lead">
                Namaz vakitleri, ezan, Kuran-ı Kerim, dua, kıble ve zikir.
                Kayıt yok, reklam yok — ibadetin temeli her zaman ücretsiz.
            </p>

            <div class="home-hero__actions">
                <x-store-button size="lg" />
            </div>

            <ul class="home-hero__stats">
                <li><strong>0₺</strong><span>Çekirdek ücretsiz</span></li>
                <li><strong>100+</strong><span>Dua</span></li>
                <li><strong>604</strong><span>Sayfa mushaf</span></li>
            </ul>
        </div>

        <aside class="home-hero__side">
            @if ($heroImage = config('ummet.marketing.hero_image'))
                <img src="{{ asset($heroImage) }}" alt="Ümmet uygulaması" class="home-hero__phone" fetchpriority="high">
            @endif

            <div class="home-hero__glass">
                <p class="home-hero__glass-label">Canlı vakitler</p>
                @include('partials.prayer-card', ['widget' => $widget])
            </div>
        </aside>
    </div>
</section>

{{-- ── Web araçları şeridi ── --}}
<section class="home-tools" aria-label="Web araçları">
    <div class="wrap">
        <div class="home-tools__track">
            @foreach ($webTools as $tool)
                <a href="{{ $tool['href'] }}" class="home-tools__chip">
                    <span class="home-tools__chip-title">{{ $tool['title'] }}</span>
                    <span class="home-tools__chip-arrow" aria-hidden="true">→</span>
                </a>
            @endforeach
        </div>
    </div>
</section>

{{-- ── Bento özellikler ── --}}
<section class="home-section" id="ozellikler">
    <div class="wrap">
        <header class="home-section__head">
            <p class="home-section__eyebrow">Özellikler</p>
            <h2 class="home-section__title">İbadetiniz için gereken her şey</h2>
            <p class="home-section__desc">Namazdan Kuran'a, duadan zikre — hepsi tek uygulamada, hepsi ücretsiz.</p>
        </header>

        <div class="home-bento">
            @foreach ($features as $feature)
                <article
                    class="home-bento__card{{ ! empty($feature['featured']) ? ' home-bento__card--featured' : '' }}"
                    style="--card-accent: {{ $feature['accent'] }}"
                >
                    <span class="home-bento__icon" aria-hidden="true">{{ $feature['icon'] }}</span>
                    <h3>{{ $feature['title'] }}</h3>
                    <p>{{ $feature['desc'] }}</p>
                </article>
            @endforeach
        </div>

        <p class="home-section__link"><a href="{{ route('features') }}">Tüm özellikleri gör →</a></p>
    </div>
</section>

{{-- ── Farklılaştırıcılar (zigzag) ── --}}
<section class="home-section home-section--alt">
    <div class="wrap">
        <header class="home-section__head home-section__head--center">
            <p class="home-section__eyebrow">Neden Ümmet?</p>
            <h2 class="home-section__title">Başka uygulamalarda bulamayacağınız</h2>
        </header>

        <div class="home-zigzag">
            @foreach ($differentiators as $index => $item)
                <article class="home-zigzag__row{{ $index % 2 === 1 ? ' home-zigzag__row--flip' : '' }}">
                    <div class="home-zigzag__num" aria-hidden="true">{{ str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) }}</div>
                    <div class="home-zigzag__body">
                        <h3>{{ $item['title'] }}</h3>
                        <p>{{ $item['desc'] }}</p>
                    </div>
                </article>
            @endforeach
        </div>
    </div>
</section>

<x-app-screens title="Uygulamadan kareler" section-class="home-section home-section--screens" />

{{-- ── Neden + adımlar ── --}}
<section class="home-section">
    <div class="wrap home-duo">
        <div class="home-duo__panel">
            <header class="home-section__head">
                <p class="home-section__eyebrow">Güven</p>
                <h2 class="home-section__title">Neden binlerce kişi Ümmet'i seçiyor?</h2>
            </header>
            <ul class="home-checklist">
                @foreach ($why as $item)
                    <li>
                        <strong>{{ $item['title'] }}</strong>
                        <span>{{ $item['desc'] }}</span>
                    </li>
                @endforeach
            </ul>
        </div>

        <div class="home-duo__panel home-duo__panel--steps">
            <header class="home-section__head">
                <p class="home-section__eyebrow">Başlangıç</p>
                <h2 class="home-section__title">3 adımda hazırsınız</h2>
            </header>
            <ol class="home-steps">
                @foreach ($steps as $index => $step)
                    <li>
                        <span class="home-steps__num">{{ $index + 1 }}</span>
                        <div>
                            <strong>{{ $step['title'] }}</strong>
                            <p>{{ $step['desc'] }}</p>
                        </div>
                    </li>
                @endforeach
            </ol>
            <x-store-button class="home-duo__stores" />
        </div>
    </div>
</section>

{{-- ── Web vs Uygulama ── --}}
<section class="home-section home-section--alt">
    <div class="wrap">
        <header class="home-section__head home-section__head--center">
            <p class="home-section__eyebrow">Karşılaştırma</p>
            <h2 class="home-section__title">Web önizleme, uygulama tam deneyim</h2>
        </header>

        <div class="home-versus">
            <div class="home-versus__col">
                <span class="home-versus__tag">Web sitesi</span>
                <h3>Hızlı bakış</h3>
                <p>Arama motorundan gelenler için temel araçlar.</p>
                <ul class="home-versus__list">
                    @foreach ($webTools as $tool)
                        <li>
                            <a href="{{ $tool['href'] }}">{{ $tool['title'] }}</a>
                            <span>{{ $tool['app'] }}</span>
                        </li>
                    @endforeach
                </ul>
            </div>

            <div class="home-versus__col home-versus__col--app">
                <span class="home-versus__tag home-versus__tag--gold">Mobil uygulama</span>
                <h3>Asıl ürün burada</h3>
                <p>Ezan, widget, mushaf ve ortak zikir — tam deneyim.</p>
                <ul class="home-versus__checks">
                    @foreach ($appOnly as $item)
                        <li>{{ $item }}</li>
                    @endforeach
                </ul>
                <x-store-button />
            </div>
        </div>
    </div>
</section>

{{-- ── SSS ── --}}
<section class="home-section">
    <div class="wrap wrap--narrow">
        <header class="home-section__head home-section__head--center">
            <p class="home-section__eyebrow">SSS</p>
            <h2 class="home-section__title">Merak edilenler</h2>
        </header>

        <div class="home-faq">
            @foreach (array_slice($faqs, 0, 4) as $faq)
                <details class="home-faq__item">
                    <summary>{{ $faq['q'] }}</summary>
                    <p>{{ $faq['a'] }}</p>
                </details>
            @endforeach
        </div>

        <p class="home-section__link home-section__link--center"><a href="{{ route('faq') }}">Tüm sorular →</a></p>
    </div>
</section>

{{-- ── İndir CTA ── --}}
<section class="home-download" id="indir">
    <div class="wrap">
        <div class="home-download__card">
            <div class="home-download__copy">
                <x-logo variant="mark" size="lg" class="home-download__logo" />
                <h2>Ümmet'i hemen indirin</h2>
                <p>Hesap açmadan kullanın. Namaz, Kuran ve dua her zaman ücretsiz kalacak.</p>
                <x-store-button size="lg" />
            </div>

            @unless (config('ummet.play_store_url'))
                <div class="home-download__notify">
                    <p>Google Play çıkınca haber verelim</p>
                    @include('partials.subscribe-form')
                </div>
            @endunless
        </div>
    </div>
</section>

{{-- Mobil sabit indir --}}
<div
    class="home-dock"
    x-data="{ show: false }"
    x-init="show = window.innerWidth < 768"
    @scroll.window="show = window.innerWidth < 768 && window.scrollY > 400"
    x-show="show"
    x-cloak
>
    <div class="wrap home-dock__inner">
        <x-store-button size="sm" />
    </div>
</div>

@endsection

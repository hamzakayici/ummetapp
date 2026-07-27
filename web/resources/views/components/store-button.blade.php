@props(['size' => 'md'])

@php
    $playUrl = config('ummet.play_store_url');
    $playLive = filled($playUrl);
    $height = match ($size) {
        'lg' => 48,
        'sm' => 34,
        default => 40,
    };
@endphp

<div {{ $attributes->merge(['class' => 'store-badges store-badges--' . $size]) }}>
    <a
        href="{{ config('ummet.app_store_url') }}"
        target="_blank"
        rel="noopener noreferrer"
        class="store-badge"
        aria-label="App Store'dan indir"
    >
        <img
            src="{{ asset('img/badges/app-store.svg') }}"
            alt="App Store'dan indir"
            width="144"
            height="{{ $height }}"
            style="height: {{ $height }}px; width: auto;"
            loading="lazy"
        >
    </a>

    <a
        href="{{ $playLive ? $playUrl : '#indir' }}"
        @if ($playLive) target="_blank" rel="noopener noreferrer" @endif
        class="store-badge{{ $playLive ? '' : ' store-badge--soon' }}"
        aria-label="{{ $playLive ? 'Google Play\'den indir' : 'Google Play yakında — haber ver' }}"
    >
        <img
            src="{{ asset('img/badges/google-play.svg') }}"
            alt="{{ $playLive ? 'Google Play\'den indir' : 'Google Play yakında' }}"
            width="162"
            height="{{ $height }}"
            style="height: {{ $height }}px; width: auto;"
            loading="lazy"
        >
        @unless ($playLive)
            <span class="store-badge__soon">Yakında</span>
        @endunless
    </a>
</div>

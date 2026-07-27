@props([
    'variant' => 'full',
    'size' => 'md',
    'href' => null,
])

@php
    $heights = [
        'sm' => 28,
        'md' => 32,
        'lg' => 40,
    ];

    $height = $heights[$size] ?? $heights['md'];

    $markSrc = asset('img/brand/icon.png');

    $classes = collect([
        'brand-logo',
        'brand-logo--' . $variant,
        'brand-logo--' . $size,
    ])->implode(' ');

    $tag = $href ? 'a' : 'span';
@endphp

<{{ $tag }}
    @if ($href) href="{{ $href }}" @endif
    {{ $attributes->merge(['class' => $classes]) }}
    @if ($variant === 'full' && ! $href) aria-label="Ümmet" @endif
>
    @if ($variant === 'mark')
        <img
            src="{{ $markSrc }}"
            alt="Ümmet"
            class="brand-logo__img"
            width="{{ $height }}"
            height="{{ $height }}"
            loading="eager"
            decoding="async"
        >
    @elseif ($variant === 'stacked')
        <img
            src="{{ $markSrc }}"
            alt=""
            aria-hidden="true"
            class="brand-logo__img"
            width="{{ $height }}"
            height="{{ $height }}"
            loading="lazy"
            decoding="async"
        >
        <span class="brand-logo__word">Ümmet</span>
    @else
        <img
            src="{{ $markSrc }}"
            alt=""
            aria-hidden="true"
            class="brand-logo__img"
            width="{{ $height }}"
            height="{{ $height }}"
            loading="eager"
            decoding="async"
        >
        <span class="brand-logo__word">Ümmet</span>
    @endif
</{{ $tag }}>

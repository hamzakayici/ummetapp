@props(['eyebrow' => null, 'title', 'subtitle' => null, 'align' => 'center', 'level' => 'h2'])

@php
    $alignClass = $align === 'center' ? 'u-heading--center' : 'u-heading--left';
@endphp

<header class="u-heading {{ $alignClass }}">
    @if ($eyebrow)
        <p class="u-eyebrow">{{ $eyebrow }}</p>
    @endif
    <{{ $level }} class="u-heading__title">{{ $title }}</{{ $level }}>
    @if ($subtitle)
        <p class="u-heading__subtitle">{{ $subtitle }}</p>
    @endif
</header>

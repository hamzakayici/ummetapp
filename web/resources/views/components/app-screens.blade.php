@props(['title' => 'Uygulamadan', 'sectionClass' => 'section'])

@php
    $screens = config('ummet.marketing.screens', []);
@endphp

@if (count($screens) > 0)
<section class="{{ $sectionClass }}">
    <div class="wrap">
        <h2 class="section__title">{{ $title }}</h2>

        <div class="app-screens">
            @foreach ($screens as $screen)
                <figure class="app-screens__item">
                    <img
                        src="{{ asset($screen['src']) }}"
                        alt="{{ $screen['alt'] ?? '' }}"
                        width="{{ $screen['width'] ?? 200 }}"
                        height="{{ $screen['height'] ?? 400 }}"
                        loading="lazy"
                        class="app-screens__img"
                    >
                    @if (! empty($screen['label']))
                        <figcaption class="app-screens__label">{{ $screen['label'] }}</figcaption>
                    @endif
                </figure>
            @endforeach
        </div>
    </div>
</section>
@endif

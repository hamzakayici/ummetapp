@props([
    'compact' => false,
])

<div @class(['app-upsell', 'app-upsell--compact' => $compact])>
    <div class="app-upsell__copy">
        <p class="app-upsell__title">Tam deneyim uygulamada</p>
        @unless ($compact)
            <p class="app-upsell__text">Ezan, widget, Kuran ve ortak zikir — App Store ve Google Play.</p>
        @endunless
    </div>
    <x-store-button size="sm" />
</div>

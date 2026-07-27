@extends('layouts.app')
@section('title', 'Sıkça Sorulan Sorular — Ümmet')
@section('description', 'Ümmet uygulaması hakkında merak edilenler: ücretlendirme, namaz vakti doğruluğu, gizlilik ve Android sürümü.')

@section('content')
<section class="mx-auto max-w-3xl px-5 py-16">
    <x-section-heading eyebrow="SSS" title="Sıkça sorulan sorular" />
    <div class="mt-12 space-y-3">
        @foreach ($faqs as $faq)
            <details class="group rounded-2xl border border-white/6 bg-card/60 p-5">
                <summary class="cursor-pointer list-none font-display text-base font-semibold text-ink">
                    <span class="flex items-center justify-between gap-4">{{ $faq['q'] }}<span class="text-gold transition group-open:rotate-45">+</span></span>
                </summary>
                <p class="mt-3 text-sm leading-relaxed text-ink-dim">{{ $faq['a'] }}</p>
            </details>
        @endforeach
    </div>
</section>
@endsection

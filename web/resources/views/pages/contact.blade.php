@extends('layouts.app')
@section('title', 'İletişim — Ümmet')
@section('description', 'Öneri, hata bildirimi ve iş birliği için bize ulaşın.')

@section('content')
<section class="mx-auto max-w-2xl px-5 py-16">
    <x-section-heading eyebrow="İletişim" title="Bize yazın"
        subtitle="Öneri, hata bildirimi veya iş birliği tekliflerinizi bekliyoruz." />

    <div class="mt-12 rounded-2xl border border-white/6 bg-card/60 p-8 text-center">
        <p class="text-ink-dim">E-posta ile ulaşabilirsiniz:</p>
        <a href="mailto:{{ config('ummet.support_email') }}"
           class="mt-3 inline-block font-display text-xl font-bold text-gold hover:underline">
            {{ config('ummet.support_email') }}
        </a>
    </div>
</section>
@endsection

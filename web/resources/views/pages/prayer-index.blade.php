@extends('layouts.app')
@section('title', '81 İl Namaz Vakitleri — Ümmet')
@section('description', 'Türkiye’nin 81 ili için güncel namaz vakitleri. Diyanet hesaplama yöntemiyle imsak, güneş, öğle, ikindi, akşam ve yatsı saatleri.')

@section('content')
<section class="mx-auto max-w-6xl px-5 py-16">
    <x-section-heading
        eyebrow="Namaz Vakitleri"
        title="81 il için güncel vakitler"
        subtitle="Diyanet hesaplama yöntemiyle imsak, güneş, öğle, ikindi, akşam ve yatsı saatleri." />

    <div class="mt-14 grid gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        @foreach ($cities as $c)
            <a href="{{ route('prayer.show', $c->slug) }}"
               class="rounded-xl border border-white/6 bg-card/60 px-4 py-3 text-sm text-ink transition hover:border-gold/30 hover:text-gold">
                {{ $c->name }}
            </a>
        @endforeach
    </div>
</section>
@endsection

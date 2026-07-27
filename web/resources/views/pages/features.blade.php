@extends('layouts.app')
@section('title', 'Özellikler — Ümmet')
@section('description', 'Namaz vakitleri, Kuran, dua, tesbih, kıble, hicri takvim, kaza takibi, hesaplayıcılar ve daha fazlası.')

@section('content')
<section class="mx-auto max-w-6xl px-5 py-16">
    <x-section-heading eyebrow="Özellikler" title="Ümmet'te neler var?" />
    <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @foreach ($features as $f)
            <div class="rounded-2xl border border-white/6 bg-card/60 p-6">
                <div class="grid h-11 w-11 place-items-center rounded-xl text-xl" style="background: {{ $f['bg'] }}">{{ $f['icon'] }}</div>
                <h3 class="mt-4 font-display text-base font-bold text-ink">{{ $f['title'] }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-ink-dim">{{ $f['desc'] }}</p>
            </div>
        @endforeach
    </div>
    <div class="mt-14 flex justify-center"><x-store-button size="lg" /></div>
</section>
@endsection

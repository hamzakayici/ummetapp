@extends('layouts.app')
@section('title', $city->name . ' Namaz Vakitleri — ' . now()->translatedFormat('d F Y'))
@section('description', $city->name . ' için bugünkü namaz vakitleri. İmsak, güneş, öğle, ikindi, akşam ve yatsı saatleri — Diyanet hesaplamasıyla.')

@section('content')
<section class="mx-auto max-w-4xl px-5 py-16">
    <nav class="text-sm text-ink-muted">
        <a href="{{ route('prayer.index') }}" class="hover:text-ink">Namaz Vakitleri</a>
        <span class="mx-2">/</span>
        <span class="text-ink-dim">{{ $city->name }}</span>
    </nav>

    <h1 class="mt-4 font-display text-4xl font-bold text-ink">{{ $city->name }} Namaz Vakitleri</h1>
    <p class="mt-2 text-ink-dim">
        {{ $prayer['date'] ?? now()->translatedFormat('d F Y') }}
        @if (!empty($prayer['hijri'])) · <span class="text-ink-muted">{{ $prayer['hijri'] }}</span> @endif
    </p>

    @if ($prayer && $next)
        <div class="mt-8 rounded-3xl border border-gold/15 bg-linear-to-b from-green/25 to-transparent p-8 text-center">
            <p class="text-sm text-ink-dim">Sıradaki vakit — {{ $next['name'] }}</p>
            <p class="mt-2 font-display text-6xl font-bold tabular-nums text-gold">{{ $next['at'] }}</p>
            <p class="mt-2 text-ink-dim">{{ $next['remaining'] }} kaldı</p>
        </div>

        <div class="mt-6 overflow-hidden rounded-2xl border border-white/8">
            <table class="w-full text-left">
                <tbody>
                @foreach (\App\Services\PrayerTimeService::PRAYERS as $key => $label)
                    <tr class="border-b border-white/5 last:border-0 {{ $next['name'] === $label ? 'bg-gold/8' : '' }}">
                        <td class="px-6 py-4 font-display font-semibold text-ink">{{ $label }}</td>
                        <td class="px-6 py-4 text-right font-bold tabular-nums text-gold">{{ $prayer['times'][$key] ?? '—' }}</td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    @else
        <p class="mt-8 rounded-2xl border border-white/8 bg-card/60 p-8 text-center text-ink-dim">
            Vakitler şu anda alınamadı. Lütfen birazdan tekrar deneyin.
        </p>
    @endif

    <div class="mt-10 rounded-2xl border border-white/6 bg-card/60 p-7 text-center">
        <p class="font-display text-lg font-bold text-ink">Vakitleri telefonunuzda takip edin</p>
        <p class="mt-2 text-sm text-ink-dim">Ezan bildirimleri, widget ve kıble pusulası ile birlikte.</p>
        <div class="mt-5 flex justify-center"><x-store-button /></div>
    </div>

    <div class="mt-12">
        <h2 class="font-display text-lg font-bold text-ink">Diğer şehirler</h2>
        <div class="mt-4 flex flex-wrap gap-2">
            @foreach ($others as $o)
                @if ($o->slug !== $city->slug)
                    <a href="{{ route('prayer.show', $o->slug) }}"
                       class="rounded-lg border border-white/8 bg-card/60 px-3 py-1.5 text-sm text-ink-dim hover:text-gold">{{ $o->name }}</a>
                @endif
            @endforeach
        </div>
    </div>
</section>
@endsection

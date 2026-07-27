@extends('layouts.app')
@section('title', 'Dijital Tesbih — Online Zikir Sayacı | Ümmet')
@section('description', 'Tarayıcıdan kullanabileceğiniz dijital tesbih. Sübhanallah, Elhamdülillah, Allahuekber zikirlerini 33’lük hedeflerle sayın.')

@section('content')
<section class="mx-auto max-w-2xl px-5 py-16" x-data="{
    count: 0,
    target: 33,
    presets: [
        { name: 'Sübhanallah', target: 33 },
        { name: 'Elhamdülillah', target: 33 },
        { name: 'Allahuekber', target: 34 },
        { name: 'Salavat', target: 100 },
    ],
    active: 0,
    inc() { this.count++; if (navigator.vibrate) navigator.vibrate(10); },
    select(i) { this.active = i; this.target = this.presets[i].target; this.count = 0; },
    get pct() { return Math.min(100, Math.round(this.count / this.target * 100)); }
}">
    <x-section-heading eyebrow="Dijital Tesbih" title="Online zikir sayacı"
        subtitle="Tarayıcınızdan zikir çekin. Kaldığınız yeri kaydetmek ve ortak zikire katılmak için uygulamayı kullanın." />

    <div class="mt-12 flex flex-wrap justify-center gap-2">
        <template x-for="(p, i) in presets" :key="i">
            <button @click="select(i)"
                    class="rounded-xl border px-4 py-2 text-sm transition"
                    :class="active === i ? 'border-gold/40 bg-gold/10 text-gold' : 'border-white/8 bg-card/60 text-ink-dim'">
                <span x-text="p.name"></span>
            </button>
        </template>
    </div>

    <div class="mt-8 rounded-3xl border border-white/8 bg-card/60 p-10 text-center">
        <p class="text-sm text-ink-dim" x-text="presets[active].name"></p>
        <p class="mt-3 font-display text-7xl font-bold tabular-nums text-gold" x-text="count"></p>
        <p class="mt-2 text-sm text-ink-muted">Hedef: <span x-text="target"></span></p>

        <div class="mx-auto mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-bg">
            <div class="h-full rounded-full bg-gold transition-all" :style="`width: ${pct}%`"></div>
        </div>

        <button @click="inc()"
                class="mt-8 h-32 w-32 rounded-full bg-linear-to-br from-green to-green-bright/60 text-lg font-bold text-white shadow-xl transition active:scale-95">
            Çek
        </button>

        <div class="mt-6">
            <button @click="count = 0" class="text-sm text-ink-muted hover:text-ink">Sıfırla</button>
        </div>
    </div>

    <div class="mt-10 rounded-2xl border border-white/6 bg-card/60 p-7 text-center">
        <p class="font-display text-lg font-bold text-ink">Ortak zikire katılın</p>
        <p class="mt-2 text-sm text-ink-dim">Uygulamada bir kod paylaşarak arkadaşlarınızla aynı hedefe birlikte zikir çekebilirsiniz.</p>
        <div class="mt-5 flex justify-center"><x-store-button /></div>
    </div>
</section>
@endsection

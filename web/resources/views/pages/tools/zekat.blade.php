@extends('layouts.app')
@section('title', 'Zekat Hesaplama — Nisap ve Zekat Hesaplayıcı | Ümmet')
@section('description', 'Altın, gümüş, nakit, ticaret malı ve alacaklarınıza göre zekat miktarınızı hesaplayın. Nisap eşiği ve 1/40 oranı ile.')

@section('content')
<section class="mx-auto max-w-2xl px-5 py-16" x-data="{
    gold: 0, silver: 0, cash: 0, trade: 0, receivable: 0, debt: 0,
    goldPrice: 4500, silverPrice: 55,
    get assets() {
        return (this.gold * this.goldPrice) + (this.silver * this.silverPrice)
             + Number(this.cash) + Number(this.trade) + Number(this.receivable);
    },
    get net() { return Math.max(0, this.assets - Number(this.debt)); },
    // Nisap: 80,18 gr altın karşılığı
    get nisab() { return 80.18 * this.goldPrice; },
    get liable() { return this.net >= this.nisab; },
    get zakat() { return this.liable ? this.net / 40 : 0; },
    fmt(n) { return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(Math.round(n)); }
}">
    <x-section-heading eyebrow="Zekat Hesaplayıcı" title="Zekat miktarınızı hesaplayın"
        subtitle="Nisap eşiği 80,18 gram altın karşılığıdır. Nisabı aşan mal varlığının kırkta biri (%2,5) zekat olarak verilir." />

    <div class="mt-12 space-y-5 rounded-2xl border border-white/8 bg-card/60 p-7">
        <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
                <span class="text-sm text-ink-dim">Gram altın fiyatı (₺)</span>
                <input type="number" x-model.number="goldPrice" class="mt-1.5 w-full rounded-xl border border-white/10 bg-bg px-4 py-2.5 text-ink outline-none focus:border-gold/40">
            </label>
            <label class="block">
                <span class="text-sm text-ink-dim">Gram gümüş fiyatı (₺)</span>
                <input type="number" x-model.number="silverPrice" class="mt-1.5 w-full rounded-xl border border-white/10 bg-bg px-4 py-2.5 text-ink outline-none focus:border-gold/40">
            </label>
        </div>

        <hr class="border-white/8">

        @foreach ([
            ['gold', 'Altın (gram)'],
            ['silver', 'Gümüş (gram)'],
            ['cash', 'Nakit / banka (₺)'],
            ['trade', 'Ticaret malı (₺)'],
            ['receivable', 'Alacaklarınız (₺)'],
            ['debt', 'Borçlarınız (₺)'],
        ] as [$model, $label])
            <label class="block">
                <span class="text-sm text-ink-dim">{{ $label }}</span>
                <input type="number" x-model.number="{{ $model }}" min="0" placeholder="0"
                       class="mt-1.5 w-full rounded-xl border border-white/10 bg-bg px-4 py-2.5 text-ink outline-none placeholder:text-ink-muted focus:border-gold/40">
            </label>
        @endforeach
    </div>

    <div class="mt-6 rounded-3xl border border-gold/15 bg-linear-to-b from-green/25 to-transparent p-8 text-center">
        <p class="text-sm text-ink-dim">Zekata tabi net mal varlığı</p>
        <p class="mt-1 font-display text-2xl font-bold text-ink"><span x-text="fmt(net)"></span> ₺</p>

        <p class="mt-4 text-sm text-ink-dim">Nisap eşiği</p>
        <p class="mt-1 text-lg font-semibold text-ink-dim"><span x-text="fmt(nisab)"></span> ₺</p>

        <hr class="my-6 border-white/8">

        <template x-if="liable">
            <div>
                <p class="text-sm text-gold">Ödemeniz gereken zekat</p>
                <p class="mt-2 font-display text-5xl font-bold text-gold"><span x-text="fmt(zakat)"></span> ₺</p>
            </div>
        </template>
        <template x-if="!liable">
            <p class="text-ink-dim">Mal varlığınız nisap eşiğinin altında görünüyor. Zekat yükümlülüğü doğmuyor.</p>
        </template>
    </div>

    <p class="mt-5 text-center text-xs leading-relaxed text-ink-muted">
        Bu araç yaklaşık bir hesaplama sunar. Özel durumlar (ortaklık, taksitli borç, kira geliri vb.) için
        bir din görevlisine danışmanızı öneririz.
    </p>

    <div class="mt-10 rounded-2xl border border-white/6 bg-card/60 p-7 text-center">
        <p class="font-display text-lg font-bold text-ink">Fitre ve kefaret de hesaplayın</p>
        <p class="mt-2 text-sm text-ink-dim">Uygulamada zekat, fitre ve kefaret hesaplayıcıları bir arada.</p>
        <div class="mt-5 flex justify-center"><x-store-button /></div>
    </div>
</section>
@endsection

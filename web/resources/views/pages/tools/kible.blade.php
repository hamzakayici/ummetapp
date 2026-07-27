@extends('layouts.app')
@section('title', 'Kıble Pusulası — Kıble Yönü Bulma | Ümmet')
@section('description', 'Bulunduğunuz konumdan Kâbe’ye olan kıble açısını ve mesafeyi hesaplayın.')

@section('content')
<section class="mx-auto max-w-2xl px-5 py-16" x-data="{
    status: 'idle', bearing: null, distance: null, error: '',
    locate() {
        if (!navigator.geolocation) { this.error = 'Tarayıcınız konum desteklemiyor.'; this.status = 'error'; return; }
        this.status = 'loading';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                const kLat = 21.4225, kLon = 39.8262;   // Kâbe
                const toRad = (d) => d * Math.PI / 180, toDeg = (r) => r * 180 / Math.PI;
                const dLon = toRad(kLon - lon);
                const y = Math.sin(dLon) * Math.cos(toRad(kLat));
                const x = Math.cos(toRad(lat)) * Math.sin(toRad(kLat))
                        - Math.sin(toRad(lat)) * Math.cos(toRad(kLat)) * Math.cos(dLon);
                this.bearing = Math.round((toDeg(Math.atan2(y, x)) + 360) % 360);

                const R = 6371, dLat = toRad(kLat - lat);
                const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat)) * Math.cos(toRad(kLat)) * Math.sin(dLon/2)**2;
                this.distance = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
                this.status = 'done';
            },
            () => { this.error = 'Konum izni verilmedi.'; this.status = 'error'; }
        );
    }
}">
    <x-section-heading eyebrow="Kıble Pusulası" title="Kıble yönünü bulun"
        subtitle="Bulunduğunuz konumdan Kâbe’ye olan açıyı ve mesafeyi hesaplar." />

    <div class="mt-12 rounded-3xl border border-white/8 bg-card/60 p-10 text-center">
        <template x-if="status !== 'done'">
            <div>
                <div class="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gold/10 text-4xl">🧭</div>
                <button @click="locate()" :disabled="status === 'loading'"
                        class="mt-8 rounded-xl bg-gold px-7 py-3 font-bold text-bg transition hover:brightness-110 disabled:opacity-50">
                    <span x-text="status === 'loading' ? 'Konum alınıyor...' : 'Konumumu kullan'"></span>
                </button>
                <p x-show="status === 'error'" x-text="error" class="mt-4 text-sm text-red-400"></p>
            </div>
        </template>

        <template x-if="status === 'done'">
            <div>
                <div class="relative mx-auto h-48 w-48">
                    <div class="absolute inset-0 rounded-full border-2 border-white/10"></div>
                    <span class="absolute left-1/2 top-2 -translate-x-1/2 text-xs text-ink-muted">K</span>
                    <span class="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-ink-muted">G</span>
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ink-muted">D</span>
                    <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-ink-muted">B</span>
                    <div class="absolute inset-0 grid place-items-center">
                        <div class="origin-center text-4xl transition-transform" :style="`transform: rotate(${bearing}deg)`">🕋</div>
                    </div>
                </div>

                <p class="mt-8 text-sm text-ink-dim">Kıble açısı (kuzeyden itibaren)</p>
                <p class="mt-1 font-display text-5xl font-bold text-gold"><span x-text="bearing"></span>°</p>
                <p class="mt-4 text-sm text-ink-dim">Kâbe’ye uzaklık: <span class="text-ink" x-text="new Intl.NumberFormat('tr-TR').format(distance)"></span> km</p>
            </div>
        </template>
    </div>

    <p class="mt-5 text-center text-xs leading-relaxed text-ink-muted">
        Tarayıcı pusulası cihaz sensörüne erişemediği için yalnızca açı gösterilir.
        Telefonunuzu döndürerek yön bulan canlı pusula için uygulamayı kullanın.
    </p>

    <div class="mt-10 flex justify-center"><x-store-button /></div>
</section>
@endsection

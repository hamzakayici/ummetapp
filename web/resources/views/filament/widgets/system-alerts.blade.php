@php
    /** @var list<array{type: string, title: string, body: string, url: ?string}> $alerts */
@endphp

<x-filament-widgets::widget>
    <div class="grid gap-3">
        @foreach ($alerts as $alert)
            @php
                $styles = match ($alert['type']) {
                    'danger' => 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100',
                    'warning' => 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
                    default => 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100',
                };
            @endphp

            <div class="flex items-start justify-between gap-4 rounded-xl border px-4 py-3 {{ $styles }}">
                <div>
                    <p class="text-sm font-semibold">{{ $alert['title'] }}</p>
                    <p class="mt-1 text-sm opacity-80">{{ $alert['body'] }}</p>
                </div>

                @if ($alert['url'])
                    <a
                        href="{{ $alert['url'] }}"
                        class="shrink-0 rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold text-inherit shadow-sm transition hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
                    >
                        İncele
                    </a>
                @endif
            </div>
        @endforeach
    </div>
</x-filament-widgets::widget>

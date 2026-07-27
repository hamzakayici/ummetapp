<x-filament-widgets::widget>
    <x-filament::section>
        <x-slot name="heading">Kurulum durumu</x-slot>
        <x-slot name="description">
            Aşağıdaki metrikler <strong>0</strong> görünüyorsa sebebi burada. Uygulamadan veri akmaya
            başlayınca bu bölüm kendiliğinden kaybolur.
        </x-slot>

        <x-slot name="headerEnd">
            <span class="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {{ $done }}/{{ $total }} tamam
            </span>
        </x-slot>

        {{-- İlerleme çubuğu --}}
        <div class="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
            <div class="h-full rounded-full bg-[#d4af37] transition-all" style="width: {{ $percent }}%"></div>
        </div>

        <ul class="divide-y divide-zinc-200 dark:divide-white/10">
            @foreach ($items as $item)
                <li class="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                    {{-- Durum ikonu --}}
                    <span @class([
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                        'bg-emerald-500/15 text-emerald-500' => $item['done'],
                        'bg-amber-500/15 text-amber-500' => ! $item['done'] && $item['critical'],
                        'bg-zinc-400/15 text-zinc-400' => ! $item['done'] && ! $item['critical'],
                    ])>
                        @if ($item['done'])
                            <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0z" clip-rule="evenodd"/>
                            </svg>
                        @else
                            <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
                        @endif
                    </span>

                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-sm font-semibold text-zinc-900 dark:text-[#ecdfcc]">
                                {{ $item['label'] }}
                            </span>

                            @if (! $item['done'] && $item['critical'])
                                <x-filament::badge color="warning" size="sm">Öncelikli</x-filament::badge>
                            @endif
                        </div>

                        <p class="mt-0.5 text-sm text-zinc-500 dark:text-[#8a9ba8]">{{ $item['detail'] }}</p>

                        @if (! empty($item['action']))
                            <p class="mt-1.5 text-xs leading-relaxed text-zinc-400 dark:text-[#5a6b78]">
                                {{ $item['action'] }}
                            </p>
                        @endif
                    </div>
                </li>
            @endforeach
        </ul>
    </x-filament::section>
</x-filament-widgets::widget>

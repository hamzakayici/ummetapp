@php
    /** @var string $greeting */
    /** @var string $dateLabel */
    /** @var list<array{label: string, description: string, icon: string, url: string, accent: string, badge: ?string}> $quickLinks */
@endphp

<x-filament-widgets::widget>
    <x-filament::section class="ummet-dashboard-welcome">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <p class="text-sm font-medium text-[#8a9ba8]">{{ $dateLabel }}</p>
                <h2 class="mt-1 text-2xl font-bold tracking-tight text-[#0a0e17] dark:text-[#ecdfcc]">
                    {{ $greeting }}, hoş geldiniz
                </h2>
                <p class="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-[#8a9ba8]">
                    Ümmet uygulaması, site ve bildirimlerin tek bakışta özeti. Aşağıdaki kısayollardan hızlı işlem yapabilirsiniz.
                </p>
            </div>

            <div class="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-4 lg:max-w-4xl">
                @foreach ($quickLinks as $link)
                    <a
                        href="{{ $link['url'] }}"
                        class="group relative flex flex-col rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1b4332]/30 hover:shadow-md dark:border-white/10 dark:bg-[#121a24]"
                    >
                        @if (! empty($link['badge']))
                            <span class="absolute right-3 top-3 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                {{ $link['badge'] }}
                            </span>
                        @endif

                        <span
                            class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                            style="background: color-mix(in srgb, {{ $link['accent'] ?? '#8a9ba8' }} 14%, transparent); color: {{ $link['accent'] ?? '#8a9ba8' }};"
                        >
                            <x-filament::icon :icon="$link['icon'] ?? 'heroicon-o-square-2-stack'" class="h-5 w-5" />
                        </span>

                        <span class="text-sm font-semibold text-zinc-900 dark:text-[#ecdfcc]">{{ $link['label'] }}</span>
                        <span class="mt-1 text-xs text-zinc-500 dark:text-[#8a9ba8]">{{ $link['description'] }}</span>
                    </a>
                @endforeach
            </div>
        </div>
    </x-filament::section>
</x-filament-widgets::widget>

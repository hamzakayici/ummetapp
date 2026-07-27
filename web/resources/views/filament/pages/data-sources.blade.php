<x-filament-panels::page>
    <div class="space-y-6">

        <x-filament::section>
            <x-slot name="heading">Veri ne kadar canlı?</x-slot>
            <x-slot name="description">
                Kaynakların tazeliği aynı değil. Bir metriğe bakmadan önce hangi kaynaktan
                geldiğini ve ne kadar gecikmeli olduğunu bilin.
            </x-slot>

            <div class="space-y-3">
                @foreach ($this->getSources() as $source)
                    <div @class([
                        'rounded-xl border p-4',
                        'border-gray-200 dark:border-white/10' => $source['configured'],
                        'border-dashed border-gray-300 dark:border-white/10 opacity-70' => ! $source['configured'],
                    ])>
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <span class="font-semibold">{{ $source['name'] }}</span>

                                <x-filament::badge :color="$source['freshness_color']">
                                    {{ $source['freshness'] }}
                                </x-filament::badge>

                                @if (! $source['configured'])
                                    <x-filament::badge color="gray">Bağlı değil</x-filament::badge>
                                @endif
                            </div>

                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                @if ($source['data_through'])
                                    Veri {{ \Illuminate\Support\Carbon::parse($source['data_through'])->format('d.m.Y') }} tarihine kadar
                                @elseif ($source['last'] instanceof \Illuminate\Support\Carbon)
                                    Son güncelleme: {{ $source['last']->diffForHumans() }}
                                @elseif ($source['last'])
                                    {{ $source['last'] }}
                                @else
                                    Henüz veri alınmadı
                                @endif
                            </div>
                        </div>

                        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ $source['detail'] }}</p>

                        @if (! empty($source['hint']))
                            <p class="mt-2 text-xs text-gray-400 dark:text-gray-500">{{ $source['hint'] }}</p>
                        @endif
                    </div>
                @endforeach
            </div>
        </x-filament::section>

        <x-filament::section>
            <x-slot name="heading">Toplanan kayıtlar</x-slot>

            <div class="grid gap-4 sm:grid-cols-2">
                <div class="rounded-xl border border-gray-200 p-4 dark:border-white/10">
                    <div class="text-2xl font-bold">{{ number_format($this->getStats()['metrics']) }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Dış kaynak metriği (günlük satır)</div>
                </div>
                <div class="rounded-xl border border-gray-200 p-4 dark:border-white/10">
                    <div class="text-2xl font-bold">{{ number_format($this->getStats()['purchases']) }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Satın alma olayı</div>
                </div>
            </div>
        </x-filament::section>

    </div>
</x-filament-panels::page>

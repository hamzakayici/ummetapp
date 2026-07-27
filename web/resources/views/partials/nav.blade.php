<header class="header" x-data="{ open: false }">
    <div class="wrap header__inner">
        <x-logo href="{{ route('home') }}" size="md" />

        <nav class="header__nav" aria-label="Ana menü">
            @foreach (config('ummet.nav') as $item)
                <a href="{{ $item['href'] }}">{{ $item['label'] }}</a>
            @endforeach
        </nav>

        <div class="header__badges header__badges--desktop">
            <x-store-button size="sm" />
        </div>

        <button type="button" class="header__toggle" @click="open = !open" :aria-expanded="open" aria-label="Menü">
            <span x-show="!open">Menü</span>
            <span x-show="open" x-cloak>Kapat</span>
        </button>
    </div>

    <div class="header__mobile" x-show="open" x-cloak @click.outside="open = false">
        @foreach (config('ummet.nav') as $item)
            <a href="{{ $item['href'] }}" @click="open = false">{{ $item['label'] }}</a>
        @endforeach
        <div class="header__badges" @click="open = false">
            <x-store-button size="sm" />
        </div>
    </div>
</header>

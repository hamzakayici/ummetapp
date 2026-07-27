<footer class="footer">
    <div class="wrap footer__grid">
        <div class="footer__brand">
            <x-logo variant="stacked" size="sm" class="footer__logo" />
            <p class="footer__about">Türkçe İslami yaşam uygulaması. App Store'da yayında, Google Play yakında.</p>
            <x-store-button size="sm" class="footer__stores" />
        </div>

        <div>
            <p class="footer__label">Araçlar</p>
            <a href="{{ route('prayer.index') }}">Namaz vakitleri</a>
            <a href="{{ route('tools.zekat') }}">Zekat</a>
            <a href="{{ route('tools.tesbih') }}">Tesbih</a>
            <a href="{{ route('tools.kible') }}">Kıble</a>
        </div>

        <div>
            <p class="footer__label">Site</p>
            <a href="{{ route('features') }}">Özellikler</a>
            <a href="{{ route('faq') }}">SSS</a>
            <a href="{{ route('contact') }}">İletişim</a>
            <a href="{{ route('privacy') }}">Gizlilik</a>
            <a href="{{ route('terms') }}">Kullanım şartları</a>
        </div>

        <div>
            <p class="footer__label">İletişim</p>
            <a href="mailto:{{ config('ummet.support_email') }}">{{ config('ummet.support_email') }}</a>
        </div>
    </div>

    <div class="wrap footer__end">
        <span>© {{ date('Y') }} Ümmet</span>
    </div>
</footer>

@php
    $subscribed = session('subscribed');
@endphp

@if ($subscribed)
    <p class="form-ok">Tamam, listeye eklendin.</p>
@else
    <div x-data="subscribeForm()">
        <p class="form-ok" x-show="success" x-cloak>Tamam, listeye eklendin.</p>

        <div x-show="!success">
            <form
                x-ref="form"
                method="POST"
                action="{{ route('subscribe') }}"
                class="form-inline"
                @submit.prevent="submit"
            >
                @csrf
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="E-posta"
                    x-model="email"
                    class="input"
                    autocomplete="email"
                    aria-label="E-posta"
                    :disabled="loading"
                >
                <button type="submit" class="btn btn--md" :disabled="loading">
                    <span x-text="loading ? 'Gönderiliyor…' : 'Gönder'"></span>
                </button>
            </form>

            <p class="form-err" x-show="error" x-text="error" x-cloak></p>
        </div>
    </div>
@endif

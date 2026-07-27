import Alpine from 'alpinejs';

window.vakitCard = function (initial) {
    return {
        loading: false,
        error: Boolean(initial.error),
        city: initial.city,
        date: initial.date ?? '',
        hijri: initial.hijri ?? '',
        times: initial.times ?? [],
        next: initial.next ?? null,
        moreUrl: initial.more_url ?? '#',
        selected: initial.city.slug,

        async load(slug) {
            this.loading = true;
            this.error = false;

            try {
                const res = await fetch(`/namaz-vakitleri/${encodeURIComponent(slug)}/ozet`, {
                    headers: { Accept: 'application/json' },
                });

                if (!res.ok) {
                    throw new Error('Yanıt alınamadı');
                }

                const data = await res.json();

                if (data.error) {
                    throw new Error('Vakit verisi yok');
                }

                this.city = data.city;
                this.date = data.date;
                this.hijri = data.hijri;
                this.times = data.times;
                this.next = data.next;
                this.moreUrl = data.more_url;
                this.selected = data.city.slug;
            } catch {
                this.error = true;
            } finally {
                this.loading = false;
            }
        },
    };
};

window.subscribeForm = function () {
    return {
        email: '',
        loading: false,
        success: false,
        error: '',

        async submit() {
            this.loading = true;
            this.error = '';

            try {
                const form = this.$refs.form;
                const res = await fetch(form.action, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: new FormData(form),
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    this.error = data.errors?.email?.[0] ?? 'Gönderilemedi. Tekrar dene.';
                    return;
                }

                this.success = true;
            } catch {
                this.error = 'Bağlantı hatası. Tekrar dene.';
            } finally {
                this.loading = false;
            }
        },
    };
};

window.Alpine = Alpine;
Alpine.start();

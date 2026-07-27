<aside
    class="vakit"
    aria-label="Bugünün namaz vakitleri"
    x-data="vakitCard(@js($widget))"
    :class="{ 'is-loading': loading }"
    :aria-busy="loading"
>
    <div class="vakit__head">
        <div>
            <strong x-text="city.name">{{ $widget['city']['name'] }}</strong>
            <span class="vakit__date" x-show="date" x-text="date">{{ $widget['date'] ?? '' }}</span>
        </div>
        <select
            class="vakit__select"
            aria-label="Şehir seç"
            x-model="selected"
            @change="load($event.target.value)"
            :disabled="loading"
        >
            @foreach (\App\Services\City::all() as $c)
                <option value="{{ $c->slug }}">{{ $c->name }}</option>
            @endforeach
        </select>
    </div>

    <template x-if="!error && next">
        <div>
            <p class="vakit__next">
                Sıradaki: <strong x-text="next.name"></strong> · <span x-text="next.at"></span>
                <span class="vakit__remain">(<span x-text="next.remaining"></span>)</span>
            </p>

            <table class="vakit__table">
                <tbody>
                    <template x-for="row in times" :key="row.key">
                        <tr :class="{ 'is-active': row.active }">
                            <th scope="row" x-text="row.label"></th>
                            <td x-text="row.time"></td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <p class="vakit__hijri" x-show="hijri" x-text="hijri"></p>

            <a :href="moreUrl" class="vakit__more" x-text="`${city.name} namaz vakitleri →`"></a>
        </div>
    </template>

    <p class="vakit__err" x-show="error">Vakitler alınamadı.</p>
</aside>

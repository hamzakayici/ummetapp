<?php

namespace App\Http\Controllers;

use App\Services\City;
use App\Services\PrayerTimeService;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function __construct(private PrayerTimeService $prayerTimes) {}

    public function home(Request $request)
    {
        $city = City::find((string) $request->query('sehir')) ?? City::find('istanbul');
        $widget = $this->prayerTimes->widgetData($city);

        return view('pages.home', [
            'city' => $city,
            'widget' => $widget,
            'features' => $this->homeFeatures(),
            'faqs' => $this->faqs(),
            'differentiators' => $this->differentiators(),
            'why' => $this->whyUmmet(),
            'steps' => $this->steps(),
            'webTools' => $this->webTools(),
            'appOnly' => $this->appOnlyFeatures(),
        ]);
    }

    public function features()
    {
        return view('pages.features', ['features' => $this->featureList()]);
    }

    public function faq()
    {
        return view('pages.faq', ['faqs' => $this->faqs()]);
    }

    public function privacy()
    {
        return view('pages.privacy');
    }

    public function terms()
    {
        return view('pages.terms');
    }

    /** @return list<array{icon:string,bg:string,title:string,desc:string}> */
    private function featureList(): array
    {
        return [
            ['icon' => '🕐', 'bg' => 'rgba(64,192,87,0.12)',  'title' => 'Namaz Vakitleri', 'desc' => 'Konumunuza göre otomatik vakitler, güneş yayı göstergesi, ezan bildirimleri ve iOS widget.'],
            ['icon' => '📖', 'bg' => 'rgba(212,175,55,0.12)', 'title' => 'Kuran-ı Kerim',   'desc' => '604 sayfalık mushaf, Türkçe meal, ayet ayet sesli okuma, 5 tema ve 3 Arapça yazı tipi.'],
            ['icon' => '🤲', 'bg' => 'rgba(139,92,246,0.12)', 'title' => 'Dua Kitabı',      'desc' => '100+ kategorize dua: sabah-akşam, namaz sonrası, yolculuk, hastalık ve daha fazlası.'],
            ['icon' => '📿', 'bg' => 'rgba(249,115,22,0.12)', 'title' => 'Dijital Tesbih',  'desc' => 'Zikir sayacı, hedef belirleme, titreşimli geri bildirim ve ortak zikir.'],
            ['icon' => '🧭', 'bg' => 'rgba(34,211,238,0.12)', 'title' => 'Kıble Pusulası',  'desc' => 'Hassas kıble yönü, derece göstergesi ve Kâbe’ye olan mesafe.'],
            ['icon' => '🌙', 'bg' => 'rgba(240,208,96,0.12)', 'title' => 'Hicri Takvim',    'desc' => 'Miladi-Hicri dönüştürme, kandiller, mübarek geceler ve önemli İslami günler.'],
            ['icon' => '🕌', 'bg' => 'rgba(64,192,87,0.12)',  'title' => 'Yakındaki Camiler','desc' => 'Konumunuza en yakın camileri bulun, mesafeyi görün ve yol tarifi alın.'],
            ['icon' => '📚', 'bg' => 'rgba(139,92,246,0.12)', 'title' => 'Hadis & Delâil',  'desc' => 'Sahih hadis koleksiyonu ve Delâil-ül Hayrât.'],
            ['icon' => '🧮', 'bg' => 'rgba(249,115,22,0.12)', 'title' => 'Hesaplayıcılar',  'desc' => 'Zekat, fitre ve kefaret hesaplayıcıları — detaylı ve açıklamalı.'],
        ];
    }

    /** @return list<array{icon:string,title:string,desc:string}> */
    private function differentiators(): array
    {
        return [
            ['icon' => 'ezan', 'title' => 'Her vakte ayrı makam', 'desc' => 'Sabah Saba, öğle Rast, ikindi Hicaz, akşam Segâh, yatsı Bayatî — beş vakit, beş ezan kaydı.'],
            ['icon' => 'kaza', 'title' => 'Kaza namazı takibi', 'desc' => 'Borcunuzu vakit vakit girin, kıldıkça düşün. Oruç ve adak takibi aynı ekranda.'],
            ['icon' => 'ortak', 'title' => 'Ortak zikir', 'desc' => 'Kod paylaşın, arkadaşlarınızla aynı hedefe birlikte zikir çekin. Sayaç herkeste güncellenir.'],
        ];
    }

    /** Ana sayfa — öne çıkan 6 özellik */
    private function homeFeatures(): array
    {
        return [
            ['icon' => '🕌', 'accent' => 'rgba(64,192,87,0.14)',  'title' => 'Namaz vakitleri', 'desc' => 'Diyanet hesaplaması, güneş yayı, ezan bildirimleri ve iOS widget.', 'featured' => true],
            ['icon' => '📖', 'accent' => 'rgba(212,175,55,0.14)', 'title' => 'Kuran-ı Kerim',   'desc' => '604 sayfalık mushaf, Türkçe meal, sesli okuma ve 5 tema.'],
            ['icon' => '🤲', 'accent' => 'rgba(139,92,246,0.14)', 'title' => 'Dua kitabı',      'desc' => 'Sabah-akşam, namaz sonrası, yolculuk ve daha fazlası — 100+ dua.'],
            ['icon' => '🧭', 'accent' => 'rgba(34,211,238,0.14)', 'title' => 'Kıble pusulası',  'desc' => 'Hassas yön, derece göstergesi ve Kâbe mesafesi.'],
            ['icon' => '📋', 'accent' => 'rgba(249,115,22,0.14)', 'title' => 'Kaza takibi',     'desc' => 'Namaz, oruç ve adak borçlarınızı cihazınızda tutun.'],
            ['icon' => '📿', 'accent' => 'rgba(240,208,96,0.14)', 'title' => 'Dijital tesbih',  'desc' => 'Zikir sayacı, hedef belirleme ve ortak zikir.'],
        ];
    }

    /** Sitede SEO için sunulan araçlar */
    private function webTools(): array
    {
        return [
            [
                'title' => 'Namaz vakitleri',
                'desc' => '81 il için günlük vakit tablosu. Diyanet hesaplaması.',
                'href' => route('prayer.index'),
                'app' => 'Ezan bildirimi ve widget uygulamada.',
            ],
            [
                'title' => 'Zekât hesaplama',
                'desc' => 'Varlık, altın ve nisap üzerinden hızlı hesap.',
                'href' => route('tools.zekat'),
                'app' => 'Fitre ve kefaret hesaplayıcı uygulamada.',
            ],
            [
                'title' => 'Tesbih',
                'desc' => 'Basit zikir sayacı — tarayıcıda hemen kullanın.',
                'href' => route('tools.tesbih'),
                'app' => 'Ortak zikir ve hedef takibi uygulamada.',
            ],
            [
                'title' => 'Kıble pusulası',
                'desc' => 'Konumunuza göre kıble yönü.',
                'href' => route('tools.kible'),
                'app' => 'Hassas pusula ve mesafe uygulamada.',
            ],
        ];
    }

    /** Sadece uygulamada olanlar — dönüşüm için */
    private function appOnlyFeatures(): array
    {
        return [
            'Ezan bildirimi (her vakte ayrı makam)',
            'Ana ekran widget\'ı',
            'Kuran mushaf okuyucu',
            'Ortak zikir',
            'Yakındaki camiler',
            'Kaza ve adak takibi',
        ];
    }

    /** @return list<array{title:string,desc:string}> */
    private function whyUmmet(): array
    {
        return [
            ['title' => 'Gizlilik önceliği', 'desc' => 'İbadet kayıtlarınız, kaza borcunuz ve konum bilginiz cihazınızda kalır. Reklam takibi yok.'],
            ['title' => 'Çekirdek özellikler ücretsiz', 'desc' => 'Namaz vakitleri, ezan, Kuran, meal, dua ve kıble her zaman ücretsiz kalacak.'],
            ['title' => 'Reklamsız', 'desc' => 'İbadet ekranlarınızda reklam göstermiyoruz.'],
            ['title' => 'iOS Widget', 'desc' => 'Ana ekranda sıradaki vakit ve kalan süre.'],
            ['title' => 'Kayıt gerekmez', 'desc' => 'İndirin ve kullanmaya başlayın. Hesap açmanız gerekmiyor.'],
            ['title' => 'Diyanet hesaplaması', 'desc' => 'Varsayılan yöntem Diyanet. 13 farklı hesaplama yöntemi arasından seçebilirsiniz.'],
        ];
    }

    /** @return list<array{title:string,desc:string}> */
    private function steps(): array
    {
        return [
            ['title' => 'İndirin', 'desc' => 'App Store\'dan ücretsiz indirin. Kayıt gerekmez.'],
            ['title' => 'Konum izni', 'desc' => 'Namaz vakitleri ve kıble için konum izni verin. Verileriniz güvende.'],
            ['title' => 'İbadete başlayın', 'desc' => 'Namaz, Kuran, zikir ve dua ile ibadetinizi sürdürün.'],
        ];
    }

    /** @return list<array{q:string,a:string}> */
    private function faqs(): array
    {
        return [
            [
                'q' => 'Ümmet ücretsiz mi?',
                // ⚠️ Eski sitedeki "premium duvarı yok" ifadesi bilinçli olarak kaldırıldı.
                'a' => 'Namaz vakitleri, ezan bildirimleri, Kuran-ı Kerim, meal, dua ve kıble pusulası her zaman ücretsiz kalacak. İleride uygulamayı desteklemek isteyenler için isteğe bağlı ek özellikler sunabiliriz; ibadetin kendisi hiçbir zaman ücretli olmayacak.',
            ],
            [
                'q' => 'Namaz vakitleri ne kadar doğru?',
                'a' => 'Varsayılan olarak Diyanet İşleri Başkanlığı hesaplama yöntemi kullanılır. Ayarlar bölümünden 13 farklı hesaplama yöntemi arasından seçim yapabilirsiniz.',
            ],
            [
                'q' => 'Verilerim güvende mi?',
                'a' => 'İbadet kayıtlarınız, kaza borcunuz ve konum bilginiz cihazınızda saklanır. Reklam amaçlı takip yapmıyoruz. Yalnızca uygulamanın nasıl kullanıldığını anlamak için isimsiz kullanım istatistikleri toplanır.',
            ],
            [
                'q' => 'İnternet olmadan çalışır mı?',
                // ⚠️ Eski sitede "Kuran çevrimdışı çalışır" deniyordu; doğru değildi.
                'a' => 'Namaz vakitleri son alınan verilerle çevrimdışı gösterilir; dua, tesbih ve kaza takibi tamamen çevrimdışı çalışır. Kuran metni ilk açılışta bir kez indirilir, sonrasında internetsiz okunabilir.',
            ],
            [
                'q' => 'Android sürümü var mı?',
                'a' => 'Android sürümü üzerinde çalışıyoruz. Yayınlandığında haberdar olmak için aşağıdan e-posta adresinizi bırakabilirsiniz.',
            ],
            [
                'q' => 'Ortak zikir nasıl çalışır?',
                'a' => 'Bir zikir hedefi oluşturup paylaşım kodunu arkadaşlarınıza gönderirsiniz. Herkesin çektiği zikir ortak sayaçta toplanır ve ilerlemeyi birlikte görürsünüz.',
            ],
        ];
    }
}

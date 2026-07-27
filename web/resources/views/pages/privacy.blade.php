@extends('pages._legal')
@section('title', 'Gizlilik Politikası — Ümmet')
@section('description', 'Ümmet uygulamasının gizlilik politikası: hangi veriler toplanır, nerede saklanır.')
@section('heading', 'Gizlilik Politikası')
@section('body')
    <p>Ümmet, kişisel verilerinizi korumayı önemser. Bu politika hangi verilerin toplandığını ve nasıl kullanıldığını açıklar.</p>

    <h2 class="font-display text-xl font-bold text-ink">Cihazınızda kalan veriler</h2>
    <p>İbadet kayıtlarınız, kaza namazı ve oruç borcunuz, zikir sayaçlarınız, hıfz planınız, favori sureleriniz ve uygulama ayarlarınız yalnızca cihazınızda saklanır. Bu veriler sunucularımıza gönderilmez.</p>

    <h2 class="font-display text-xl font-bold text-ink">Konum bilgisi</h2>
    <p>Namaz vakitlerini ve kıble yönünü hesaplamak için konumunuza ihtiyaç duyulur. Konum bilginiz cihazınızda işlenir; vakit hesaplaması için yalnızca koordinatlar hesaplama servisine iletilir ve saklanmaz.</p>

    <h2 class="font-display text-xl font-bold text-ink">Kullanım istatistikleri</h2>
    <p>Uygulamanın nasıl kullanıldığını anlamak için isimsiz kullanım istatistikleri toplarız: açılan ekranlar, oturum süresi, uygulama sürümü ve cihaz platformu. Bu kayıtlar rastgele üretilmiş bir cihaz kimliğiyle ilişkilendirilir; adınız, e-postanız veya telefon numaranızla eşleştirilmez.</p>

    <h2 class="font-display text-xl font-bold text-ink">Bildirimler</h2>
    <p>Ezan ve duyuru bildirimleri gönderebilmek için cihazınıza ait bildirim anahtarı saklanır. Bildirimleri istediğiniz zaman ayarlardan kapatabilirsiniz.</p>

    <h2 class="font-display text-xl font-bold text-ink">Reklam ve üçüncü taraflar</h2>
    <p>Reklam amaçlı takip yapmıyoruz. Verilerinizi reklam ağlarına veya üçüncü taraflara satmıyoruz.</p>

    <h2 class="font-display text-xl font-bold text-ink">İletişim</h2>
    <p>Sorularınız için <a href="mailto:{{ config('ummet.support_email') }}" class="text-gold hover:underline">{{ config('ummet.support_email') }}</a> adresinden bize ulaşabilirsiniz.</p>
@endsection

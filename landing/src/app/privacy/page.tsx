import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gizlilik Politikası", description: "Ümmet uygulaması gizlilik politikası. Verileriniz güvende." };

export default function PrivacyPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Yasal</span><h1>Gizlilik Politikası</h1><p>Verileriniz güvende — gizliliğiniz bizim için önceliklidir</p></div>
      <div className="content-page">
        <p className="meta">Son güncelleme: 20 Mart 2026</p>
        <h2>1. Toplanan Veriler</h2>
        <p>Ümmet yalnızca namaz vakitlerini, kıble yönünü ve yakındaki camileri hesaplamak amacıyla konum bilginizi kullanır. Konum veriniz cihazınızda yerel olarak saklanır ve üçüncü taraflarla paylaşılmaz.</p>
        <h2>2. Verilerin Kullanımı</h2>
        <p>Konum verisi yalnızca namaz vakitlerini hesaplamak, kıble yönünü belirlemek ve yakındaki camileri bulmak için kullanılır.</p>
        <h2>3. Verilerin Saklanması</h2>
        <p>Tüm verileriniz (tercihler, ibadet takibi, okunan sureler, zikir sayıları) yalnızca cihazınızda yerel olarak saklanır. Sunuculara kişisel veri aktarılmaz.</p>
        <h2>4. Üçüncü Taraf Hizmetler</h2>
        <p>Uygulama, namaz vakitleri hesaplama, konum belirleme ve yakındaki camileri bulma gibi işlevler için üçüncü taraf hizmetleri kullanır. Bu hizmetlere yalnızca konum koordinatları iletilir. Ad, e-posta gibi kişisel bilgiler paylaşılmaz.</p>
        <h2>5. Bildirimler</h2>
        <p>Namaz vakti bildirimleri kullanıcının izni ile yerel olarak planlanır. Bildirim verileri sunucuya gönderilmez.</p>
        <h2>6. Reklam ve İzleme</h2>
        <p>Ümmet reklam içermez. Kullanıcı izleme, analitik veya reklam araçları kullanılmaz.</p>
        <h2>7. Çocukların Gizliliği</h2>
        <p>Uygulama tüm yaş grupları için uygundur ve çocuklardan bilerek kişisel bilgi toplamaz.</p>
        <h2>8. Veri Silme</h2>
        <p>Uygulamayı sildiğinizde tüm verileriniz otomatik olarak silinir.</p>
        <h2>9. Değişiklikler</h2>
        <p>Bu politika zaman zaman güncellenebilir. Güncel politika her zaman bu sayfadan erişilebilir olacaktır.</p>
        <h2>10. İletişim</h2>
        <p>Sorularınız için <a href="mailto:destek@ummetapp.com">destek@ummetapp.com</a> adresinden ulaşabilirsiniz.</p>
      </div>
    </>
  );
}

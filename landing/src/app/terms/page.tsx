import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kullanım Şartları", description: "Ümmet uygulaması kullanım şartları ve hizmet koşulları." };

export default function TermsPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Yasal</span><h1>Kullanım Şartları</h1><p>Ümmet uygulaması hizmet koşulları</p></div>
      <div className="content-page">
        <p className="meta">Son güncelleme: 20 Mart 2026</p>
        <h2>1. Kabul</h2>
        <p>Ümmet uygulamasını indirip kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız.</p>
        <h2>2. Hizmet Tanımı</h2>
        <p>Ümmet, namaz vakitleri, Kuran okuma, dua, zikir, kıble pusulası, hicri takvim, yakındaki camiler, hadis koleksiyonu ve hesaplayıcılar sunan ücretsiz bir mobil uygulamadır.</p>
        <h2>3. Kullanım Koşulları</h2>
        <ul>
          <li>İçerikleri kopyalamak, değiştirmek veya ticari amaçla dağıtmak yasaktır</li>
          <li>Uygulamanın güvenliğini tehlikeye atacak girişimlerde bulunmak yasaktır</li>
          <li>API&apos;leri kötüye kullanmak veya aşırı yükleme yapmak yasaktır</li>
        </ul>
        <h2>4. İçerik</h2>
        <p>Kuran metinleri, dualar, hadisler güvenilir kaynaklardan derlenmiştir. Dini konularda alim görüşüne başvurmanız tavsiye edilir.</p>
        <h2>5. Sorumluluk Sınırı</h2>
        <p>Namaz vakitleri, kıble yönü ve cami hesaplamaları konum ve internet bağlantısına bağlıdır. Uygulama &quot;olduğu gibi&quot; sunulmaktadır.</p>
        <h2>6. Fikri Mülkiyet</h2>
        <p>Ümmet uygulamasının tasarımı, logosu, marka adı ve özgün içerikleri telif hakkı ile korunmaktadır.</p>
        <h2>7. Uygulanacak Hukuk</h2>
        <p>Bu kullanım şartları Türkiye Cumhuriyeti kanunlarına tabidir.</p>
        <h2>8. Değişiklikler</h2>
        <p>Bu şartlar önceden bildirimde bulunulmaksızın değiştirilebilir. Güncel şartlar her zaman bu sayfadan erişilebilir olacaktır.</p>
        <h2>9. İletişim</h2>
        <p>Sorularınız için <a href="mailto:destek@ummetapp.com">destek@ummetapp.com</a> adresinden ulaşabilirsiniz.</p>
      </div>
    </>
  );
}

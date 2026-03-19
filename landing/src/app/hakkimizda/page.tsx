import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Hakkımızda", description: "Ümmet uygulamasının hikayesi, misyonu ve ekibi." };

export default function HakkimizdaPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Hakkımızda</span><h1>Ümmet&apos;in Hikayesi</h1><p>Modern teknolojiyi İslami yaşamla buluşturuyoruz</p></div>
      <div className="content-page">
        <h2>Misyonumuz</h2>
        <p>Ümmet, Müslümanların günlük ibadet hayatını kolaylaştırmak, zenginleştirmek ve daha bilinçli bir şekilde sürdürmelerine yardımcı olmak amacıyla geliştirilmiş kapsamlı bir İslami yaşam uygulamasıdır.</p>
        <h2>Vizyonumuz</h2>
        <p>Dünyadaki her Müslümanın ibadetlerini kolayca takip edebileceği, İslami bilgiye hızlıca erişebileceği ve manevi gelişimini sürdürebileceği bir platform oluşturmak.</p>
        <h2>Değerlerimiz</h2>
        <ul>
          <li><strong>Gizlilik Öncelikli:</strong> Hiçbir kişisel veri sunuculara gönderilmez.</li>
          <li><strong>Ücretsiz Erişim:</strong> Tüm özellikler herkese açık. Premium duvarı yoktur.</li>
          <li><strong>Doğruluk:</strong> İçerikler güvenilir kaynaklardan derlenir.</li>
          <li><strong>Modern Tasarım:</strong> Estetik ve kullanıcı dostu arayüz.</li>
          <li><strong>Sürekli İyileştirme:</strong> Kullanıcı geri bildirimleriyle sürekli gelişme.</li>
        </ul>
        <h2>Neler Sunuyoruz?</h2>
        <ul>
          <li>Konuma göre otomatik <Link href="/namaz-vakitleri">namaz vakitleri</Link></li>
          <li>114 sure ile eksiksiz Kuran-ı Kerim</li>
          <li>100+ kategorize dua</li>
          <li>Dijital tesbih ve zikir sayacı</li>
          <li><Link href="/kible-pusulasi">Kıble pusulası</Link></li>
          <li>Hicri takvim ve önemli günler</li>
          <li>Yakındaki camileri bulma</li>
          <li>Hadis koleksiyonu</li>
          <li><Link href="/zekat-hesaplama">Zekat</Link>, fitre ve kefaret hesaplayıcıları</li>
          <li>Ramazan Hub ve iOS Widget</li>
        </ul>
        <h2>İletişim</h2>
        <p>Öneri, şikayet veya işbirliği talepleriniz için <a href="mailto:destek@ummetapp.com">destek@ummetapp.com</a> adresinden ulaşabilirsiniz.</p>
      </div>
      <section className="cta-section"><h2>Ümmet&apos;i Keşfedin</h2><p>İslami yaşamınıza güç katın — ücretsiz indirin.</p><a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>App Store&apos;dan İndir</a></section>
    </>
  );
}

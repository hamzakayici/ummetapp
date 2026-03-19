import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kıble Pusulası — Telefonla Kıble Yönü Bulma", description: "Kıble yönünü telefonunuzla hassas şekilde bulun. Doğru kıble hesaplama rehberi." };

export default function KiblePusulasiPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Kıble</span><h1>Kıble Pusulası</h1><p>Telefonunuzla hassas kıble yönü — dünyada her yerden</p></div>
      <div className="content-page">
        <h2>Kıble Nedir?</h2>
        <p>Kıble, Müslümanların namaz kılarken yöneldikleri yöndür. Mekke&apos;deki Kabe-i Muazzama&apos;nın bulunduğu yöne bakan yöndür.</p>
        <h2>Kıble Yönü Nasıl Bulunur?</h2>
        <p>Ümmet uygulaması, konumunuz ve Kabe&apos;nin konumu arasındaki mesafeyi otomatik olarak hesaplar ve size doğru yönü gösterir.</p>
        <h2>Doğru Sonuç İçin İpuçları</h2>
        <ul>
          <li>Telefonunuzu havada 8 şekli çizerek kalibre edin</li>
          <li>Metalik nesnelerden ve mıknatıslardan uzak durun</li>
          <li>Telefonu düz bir yüzeye koyun</li>
          <li>Açık alanda daha doğru sonuç alırsınız</li>
        </ul>
        <h2>Türkiye&apos;den Kıble Açıları</h2>
        <ul>
          <li><strong>İstanbul:</strong> ~153° (güneydoğu)</li>
          <li><strong>Ankara:</strong> ~165°</li>
          <li><strong>İzmir:</strong> ~145°</li>
          <li><strong>Antalya:</strong> ~156°</li>
          <li><strong>Trabzon:</strong> ~180° (güney)</li>
        </ul>
        <p><em>Bunlar yaklaşık değerlerdir. Hassas sonuç için Ümmet uygulamasını kullanın.</em></p>
        <h2>Ümmet Kıble Pusulası</h2>
        <ul>
          <li>Gerçek zamanlı kıble yönü</li>
          <li>Derece göstergesi</li>
          <li>Kabe&apos;ye olan mesafe (km)</li>
          <li>Doğru yönü bulduğunuzda titreşim</li>
          <li>İnternet olmadan çalışır</li>
        </ul>
      </div>
      <section className="cta-section"><h2>Kıble Yönünü Hemen Bulun</h2><p>Ümmet ile dünyada her yerden hassas kıble.</p><a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>Ücretsiz İndir</a></section>
    </>
  );
}

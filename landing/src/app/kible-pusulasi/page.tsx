import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kıble Pusulası — Telefonla Kıble Yönü Bulma", description: "Kıble yönünü telefonunuzla hassas şekilde bulun. GPS ve pusula sensörü ile doğru kıble hesaplama." };

export default function KiblePusulasiPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Kıble</span><h1>Kıble Pusulası</h1><p>Telefonunuzla hassas kıble yönü — dünyada her yerden</p></div>
      <div className="content-page">
        <h2>Kıble Nedir?</h2>
        <p>Kıble, Müslümanların namaz kılarken yöneldikleri yöndür. Mekke&apos;deki Kabe-i Muazzama&apos;nın bulunduğu yöne bakan yöndür.</p>
        <h2>Kıble Yönü Nasıl Hesaplanır?</h2>
        <p>GPS koordinatları ile Kabe&apos;nin koordinatları (21.4225°K, 39.8262°D) arasındaki büyük daire hesabı kullanılır.</p>
        <h2>İpuçları</h2>
        <ul>
          <li>Telefonunuzu 8 hareketi ile kalibre edin</li>
          <li>Manyetik alanlardan uzak durun</li>
          <li>Telefonu düz zemine koyun</li>
          <li>Açık alanda GPS daha hassastır</li>
        </ul>
        <h2>Türkiye&apos;den Kıble Açıları</h2>
        <ul>
          <li><strong>İstanbul:</strong> ~153° (güneydoğu)</li>
          <li><strong>Ankara:</strong> ~165°</li>
          <li><strong>İzmir:</strong> ~145°</li>
          <li><strong>Antalya:</strong> ~156°</li>
          <li><strong>Trabzon:</strong> ~180° (güney)</li>
        </ul>
        <h2>Ümmet Kıble Pusulası</h2>
        <ul>
          <li>Sensör tabanlı gerçek zamanlı kıble</li>
          <li>Derece göstergesi</li>
          <li>Kabe mesafesi (km)</li>
          <li>Haptic geri bildirim</li>
          <li>Çevrimdışı çalışır</li>
        </ul>
      </div>
      <section className="cta-section"><h2>Kıble Yönünü Hemen Bulun</h2><p>Ümmet ile dünyada her yerden hassas kıble.</p><a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>Ücretsiz İndir</a></section>
    </>
  );
}

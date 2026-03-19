import type { Metadata } from "next";

export const metadata: Metadata = { title: "Zekat Hesaplama 2026 — Nisap, Oranlar ve Hesaplayıcı", description: "2026 zekat hesaplama rehberi: Nisap miktarı, altın nisabı, zekat oranı, fitre ve kefaret hesaplama." };

export default function ZekatHesaplamaPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Zekat</span><h1>Zekat Hesaplama 2026</h1><p>Nisap, oranlar ve detaylı hesaplayıcı</p></div>
      <div className="content-page">
        <h2>Zekat Nedir?</h2>
        <p>İslam&apos;ın beş şartından biridir. Belirli miktarın üzerinde mala sahip olan Müslümanların mallarının %2.5&apos;ini ihtiyaç sahiplerine vermesi farzdır.</p>
        <h2>Nisap</h2>
        <ul>
          <li><strong>Altın Nisabı:</strong> 80.18 gram altın</li>
          <li><strong>Gümüş Nisabı:</strong> 561.2 gram gümüş</li>
        </ul>
        <h2>Zekata Tabi Varlıklar</h2>
        <ul>
          <li>Altın ve gümüş (ziynet dahil)</li>
          <li>Nakit para, döviz, banka hesapları</li>
          <li>Hisse senetleri</li>
          <li>Ticari mallar</li>
          <li>Kira geliri</li>
        </ul>
        <h2>Zekata Tabi Olmayan Varlıklar</h2>
        <ul><li>Oturduğunuz ev</li><li>Binek araç</li><li>Kişisel eşyalar</li></ul>
        <h2>Hesaplama</h2>
        <p>1. Toplam varlıkları hesaplayın<br/>2. Borçları düşün<br/>3. Net varlık ≥ nisap ise → Zekat = Net varlık × %2.5</p>
        <h2>Fitre</h2>
        <p>Ramazan&apos;da her Müslümanın bayram namazından önce vermesi gereken sadaka. Kişi sayısı × fitre miktarı.</p>
        <h2>Kefaret ve Fidye</h2>
        <p><strong>Kefaret:</strong> Kasten oruç bozmanın cezası — 60 gün oruç veya 60 fakiri doyurma.<br/><strong>Fidye:</strong> Oruç tutamayan kişilerin günlük bedeli.</p>
        <h2>Ümmet ile Zekat Hesaplama</h2>
        <ul><li>Altın, gümüş, nakit, hisse girişi</li><li>Otomatik nisap kontrolü</li><li>Detaylı döküm</li><li>Fitre ve kefaret hesaplayıcı</li></ul>
      </div>
      <section className="cta-section"><h2>Zekatınızı Kolayca Hesaplayın</h2><p>Ümmet ile nisap kontrolü ve detaylı hesaplama.</p><a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>Ücretsiz İndir</a></section>
    </>
  );
}

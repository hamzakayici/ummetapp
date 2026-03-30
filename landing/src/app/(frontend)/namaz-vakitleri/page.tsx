import type { Metadata } from "next";

export const metadata: Metadata = { title: "Namaz Vakitleri 2026 — Konuma Göre Doğru Vakitler", description: "2026 yılı namaz vakitleri: Konumunuza göre imsak, güneş, öğle, ikindi, akşam ve yatsı vakitleri." };

export default function NamazVakitleriPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Namaz</span><h1>Namaz Vakitleri 2026</h1><p>Konumunuza göre doğru ve hassas namaz vakitleri</p></div>
      <div className="content-page">
        <h2>Namaz Vakitleri Neden Önemlidir?</h2>
        <p>İslam&apos;ın beş şartından biri olan namaz, günde beş vakit kılınır. Her namazın belirli bir vakti vardır ve bu vakitler güneşin konumuna göre değişir.</p>
        <h2>Beş Vakit Namaz</h2>
        <p><strong>İmsak (Fecr-i Sadık):</strong> Sabah namazının ilk vaktidir. Güneş doğmadan önce tan yerinin ağarmaya başladığı andır.</p>
        <p><strong>Güneş (Şuruk):</strong> Güneşin doğuş vaktidir. Sabah namazının son vaktidir.</p>
        <p><strong>Öğle (Zühur):</strong> Güneşin tepe noktasını geçtiği andır.</p>
        <p><strong>İkindi (Asr):</strong> Öğle vaktinin bitiminden güneşin batmasına kadar.</p>
        <p><strong>Akşam (Mağrib):</strong> Güneşin battığı andan şafağın kaybolmasına kadar. İftar vakti.</p>
        <p><strong>Yatsı (İşa):</strong> Şafağın kaybolmasından imsak vaktine kadar.</p>
        <h2>Hesaplama Yöntemleri</h2>
        <p>Ümmet 5 farklı hesaplama yöntemini destekler:</p>
        <ul>
          <li><strong>Diyanet İşleri Başkanlığı</strong> — Türkiye varsayılanı</li>
          <li><strong>İslami Bilimler Üniversitesi, Karaçi</strong></li>
          <li><strong>Müslüman Dünya Birliği</strong></li>
          <li><strong>Ümmül Kura, Mekke</strong></li>
          <li><strong>Mısır Genel Fetva Kurulu</strong></li>
        </ul>
        <h2>Ümmet ile Namaz Vakitlerini Takip Edin</h2>
        <ul>
          <li>Otomatik konum algılama</li>
          <li>Güneş yayı animasyonu</li>
          <li>Özelleştirilebilir ezan bildirimleri</li>
          <li>iOS Widget desteği</li>
          <li>Çevrimdışı önbellek</li>
        </ul>
      </div>
      <section className="cta-section"><h2>Namaz Vakitlerini Doğru Takip Edin</h2><p>Ümmet ile konumunuza göre hassas vakitler.</p><a href="https://apps.apple.com/tr/app/ummet/id6760871547" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-flex" }}>Ücretsiz İndir</a></section>
    </>
  );
}

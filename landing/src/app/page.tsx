import type { Metadata } from "next";
import Link from "next/link";
import { Clock, BookOpen, HandHelping, Circle, Compass, Moon, MapPin, Library, Calculator, Shield, Gem, Palette, Smartphone, Wifi, Zap, Star, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Ümmet — İslami Yaşam Asistanınız | Namaz Vakitleri, Kuran, Dua",
  description: "Namaz vakitleri, Kuran okuma, dua, zikir, kıble pusulası, yakındaki camiler, hicri takvim ve daha fazlası. Tamamen ücretsiz İslami yaşam uygulaması.",
};

const FEATURES = [
  { icon: <Clock size={26} />, bg: "rgba(64,192,87,0.12)", color: "#40C057", title: "Namaz Vakitleri", desc: "Diyanet hesaplamasıyla konumunuza göre otomatik vakitler, güneş yayı animasyonu, ezan bildirimleri ve iOS Widget." },
  { icon: <BookOpen size={26} />, bg: "rgba(212,175,55,0.12)", color: "#D4AF37", title: "Kuran-ı Kerim", desc: "114 sure, Arapça metin, Türkçe meal, sure arama, okuma takibi ve yer imi kaydetme." },
  { icon: <HandHelping size={26} />, bg: "rgba(139,92,246,0.12)", color: "#8B5CF6", title: "Dua Kitabı", desc: "100+ kategorize dua: sabah/akşam, namaz sonrası, yolculuk, hastalık ve daha fazlası." },
  { icon: <Circle size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "Dijital Tesbih", desc: "Zikir sayacı, hedef belirleme, streak takibi ve haptic geri bildirim." },
  { icon: <Compass size={26} />, bg: "rgba(34,211,238,0.12)", color: "#22D3EE", title: "Kıble Pusulası", desc: "Hassas kıble yönü bulma, derece göstergesi ve Kabe'ye olan mesafe." },
  { icon: <Moon size={26} />, bg: "rgba(240,208,96,0.12)", color: "#F0D060", title: "Hicri Takvim", desc: "Miladi-Hicri dönüştürme, mübarek geceler, kandiller ve önemli İslami günler." },
  { icon: <MapPin size={26} />, bg: "rgba(64,192,87,0.12)", color: "#40C057", title: "Yakındaki Camiler", desc: "Konumunuza en yakın camileri bulun, mesafeyi görün ve haritada yol tarifi alın." },
  { icon: <Library size={26} />, bg: "rgba(139,92,246,0.12)", color: "#8B5CF6", title: "Hadis Koleksiyonu", desc: "Sahih hadisler, kategori filtreleme, favori kaydetme ve günlük hadis." },
  { icon: <Calculator size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "Hesaplayıcılar", desc: "Zekat, fitre ve kefaret hesaplayıcıları — güncel fiyatlar ve detaylı sonuçlar." },
];

const WHY = [
  { icon: <Shield size={28} />, color: "#40C057", title: "Gizlilik Öncelikli", desc: "Verileriniz cihazınızda kalır. Reklam takibi yoktur." },
  { icon: <Gem size={28} />, color: "#D4AF37", title: "Tamamen Ücretsiz", desc: "Gizli ücretler, premium duvarları yok." },
  { icon: <Palette size={28} />, color: "#8B5CF6", title: "Modern Tasarım", desc: "Koyu tema, animasyonlar ve premium hissiyat." },
  { icon: <Smartphone size={28} />, color: "#22D3EE", title: "iOS Widget", desc: "Ana ekranda namaz vakitleri ve günün ayeti." },
  { icon: <Wifi size={28} />, color: "#F97316", title: "Çevrimdışı", desc: "Kuran, dualar, tesbih internet olmadan çalışır." },
  { icon: <Zap size={28} />, color: "#F0D060", title: "Hızlı & Hafif", desc: "Düşük batarya, hızlı açılma, akıcı performans." },
];

const REVIEWS = [
  { text: "Namaz vakitlerini takip etmek hiç bu kadar kolay olmamıştı. Güneş yayı animasyonu harika!", author: "Fatma Y." },
  { text: "Kuran, dua, zikir hepsi tek uygulamada. Reklamsız ve bedava olması büyük artı.", author: "Ahmet K." },
  { text: "Ramazan Hub'daki iftar geri sayımı ve oruç takibi çok kullanışlı. Tavsiye ederim.", author: "Zeynep B." },
  { text: "Yakındaki camiler özelliği seyahatte çok işime yaradı. Kıble pusulası da hassas.", author: "Mehmet A." },
  { text: "Widget ile ana ekranda namaz vakitlerini görmek harika. Tasarımı da çok modern.", author: "Elif S." },
  { text: "Zekat hesaplayıcısı ile kefareti kolayca hesaplayabildim. Detaylı ve açıklayıcı.", author: "Mustafa D." },
];

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
);

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-badge"><Moon size={14} /> App Store&apos;da Ücretsiz</div>
          <h1>İslami Yaşamınız İçin Tek Uygulama</h1>
          <p>Namaz vakitleri, Kuran okuma, dua, zikir, kıble pusulası, yakındaki camiler, hicri takvim ve daha fazlası — hepsi <strong>Ümmet</strong>&apos;te.</p>
          <div className="hero-buttons">
            <a href="#download" className="btn-primary"><AppleIcon /> App Store&apos;dan İndir</a>
            <Link href="/ozellikler" className="btn-secondary">Tüm Özellikleri Keşfet →</Link>
          </div>
          <p className="hero-trust">
            <span><Star size={12} style={{ display: "inline", verticalAlign: "-2px" }} /> 4.9 Puan</span> · <span>100% Ücretsiz</span> · <span>Reklamsız</span> · <span>Gizlilik Öncelikli</span>
          </p>
        </div>
      </section>

      {/* BESMELE */}
      <div className="ayat-bar">
        <p className="ayat-arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        <p className="ayat-translation">&quot;Rahman ve Rahîm olan Allah&apos;ın adıyla&quot;</p>
        <p className="ayat-ref">Fatiha Suresi, 1. Ayet</p>
      </div>

      {/* FEATURES */}
      <section id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Özellikler</span>
            <h2 className="section-title">İhtiyacınız Olan Her Şey, Tek Uygulamada</h2>
            <p className="section-desc">Günlük ibadetlerinizi kolaylaştıran, modern ve kullanıcı dostu 15+ araç.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link href="/ozellikler" className="btn-secondary">Tüm 15+ Özelliği Gör →</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-bar section-inner">
        <div className="stat"><div className="stat-num">6</div><div className="stat-label">Vakit Bildirimi</div></div>
        <div className="stat"><div className="stat-num">114</div><div className="stat-label">Sure</div></div>
        <div className="stat"><div className="stat-num">100+</div><div className="stat-label">Dua</div></div>
        <div className="stat"><div className="stat-num">15+</div><div className="stat-label">Özellik</div></div>
      </div>

      {/* WHY */}
      <section>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Neden Ümmet?</span>
            <h2 className="section-title">Fark Yaratan Özellikler</h2>
          </div>
          <div className="why-grid">
            {WHY.map(w => (
              <div className="why-card" key={w.title}>
                <div className="why-icon" style={{ color: w.color }}>{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Nasıl Çalışır?</span>
            <h2 className="section-title">3 Adımda Başlayın</h2>
          </div>
          <div className="steps">
            <div className="step"><h3>İndirin</h3><p>App Store&apos;dan ücretsiz indirin. Kayıt gerekmez.</p></div>
            <div className="step"><h3>Konum İzni</h3><p>Namaz vakitleri ve kıble için konum izni verin. Verileriniz güvende.</p></div>
            <div className="step"><h3>İbadete Başlayın</h3><p>Namaz, Kuran, zikir ve dua ile ibadetinizi sürdürün.</p></div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">Kullanıcı Yorumları</span>
            <h2 className="section-title">Ümmet Ailesi Ne Diyor?</h2>
          </div>
          <div className="testimonials-grid">
            {REVIEWS.map(r => (
              <div className="testimonial" key={r.author}>
                <div className="testimonial-stars"><Star size={14} fill="var(--gold)" /><Star size={14} fill="var(--gold)" /><Star size={14} fill="var(--gold)" /><Star size={14} fill="var(--gold)" /><Star size={14} fill="var(--gold)" /></div>
                <p>&quot;{r.text}&quot;</p>
                <span className="testimonial-author">— {r.author}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section>
        <div className="section-inner">
          <div className="section-header">
            <span className="section-label">SSS</span>
            <h2 className="section-title">Sıkça Sorulan Sorular</h2>
          </div>
          <div className="faq-list">
            <details className="faq-item"><summary>Ümmet uygulaması ücretsiz mi?</summary><p>Evet, tamamen ücretsizdir. Gizli ücret, premium duvarı veya reklam yoktur.</p></details>
            <details className="faq-item"><summary>Namaz vakitleri ne kadar doğru?</summary><p>Diyanet İşleri Başkanlığı hesaplama yöntemi varsayılan olarak kullanılır. 5 farklı yöntem seçebilirsiniz.</p></details>
            <details className="faq-item"><summary>Verilerim güvende mi?</summary><p>Evet. Tüm verileriniz cihazınızda saklanır. Sunucuya kişisel veri gönderilmez.</p></details>
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <Link href="/sss" className="btn-secondary">Tüm Soruları Gör →</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="download">
        <span className="section-label"><Download size={14} style={{ display: "inline", verticalAlign: "-2px" }} /> Ücretsiz İndirin</span>
        <h2>İslami Yaşamınıza Güç Katın</h2>
        <p>Ümmet ile her an ibadetinize yoldaş olun. Kayıt gerektirmez, reklam yoktur.</p>
        <a href="#" className="btn-primary" style={{ display: "inline-flex" }}><AppleIcon /> App Store&apos;dan İndir</a>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Blog", description: "İslami yaşam, namaz, Kuran, dua, ramazan ve dijital ibadet araçları hakkında güncel yazılar." };

const POSTS = [
  { href: "/namaz-vakitleri", tag: "Namaz", title: "2026'da Namaz Vakitlerini Doğru Takip Etmenin Yolları", desc: "Konuma dayalı uygulamalar, hesaplama yöntemleri ve doğru vakitleri ayarlamak için bilmeniz gereken her şey.", date: "20 Mart 2026" },
  { href: "/kible-pusulasi", tag: "Kıble", title: "Kıble Yönünü Doğru Bulmak: Dijital Pusula Rehberi", desc: "Telefonunuzla kıble yönünü nasıl doğru bulursunuz? Pusula kalibrasyonu ve hassasiyet ipuçları.", date: "18 Mart 2026" },
  { href: "/zekat-hesaplama", tag: "Zekat", title: "2026 Zekat Hesaplama Rehberi: Nisap ve Hesaplayıcı", desc: "Altın nisabı, gümüş nisabı, hangi varlıklar zekata tabidir ve nasıl hesaplanır.", date: "15 Mart 2026" },
  { href: "#", tag: "Ramazan", title: "Ramazan'a Hazırlık: Dijital Araçlarla Oruç Takibi", desc: "İftar geri sayımı, sahur alarmı, 30 günlük oruç takibi ve Ramazan duaları.", date: "12 Mart 2026" },
  { href: "#", tag: "Kuran", title: "Kuran Okuma Alışkanlığı Nasıl Kazanılır?", desc: "Günlük okuma hedefleri, hıfz planı ve dijital Kuran uygulaması kullanım ipuçları.", date: "10 Mart 2026" },
  { href: "#", tag: "Zikir", title: "Günlük Zikir Rutini: Tesbihat Rehberi", desc: "Sabah-akşam zikirleri, tesbih kullanımı ve zikir faziletleri.", date: "8 Mart 2026" },
];

export default function BlogPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Blog</span><h1>İslami Yaşam Rehberi</h1><p>Namaz, Kuran, dua, ramazan ve dijital ibadet araçları hakkında faydalı içerikler</p></div>
      <section style={{ paddingTop: 20 }}>
        <div className="section-inner">
          <div className="blog-grid">
            {POSTS.map(p => (
              <Link href={p.href} className="blog-card" key={p.title}>
                <div className="blog-card-body">
                  <span className="blog-tag">{p.tag}</span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <div className="blog-date">{p.date}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

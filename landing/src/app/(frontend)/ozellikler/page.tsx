import type { Metadata } from "next";
import { Clock, BookOpen, HandHelping, Circle, Compass, Moon, MapPin, Library, Calculator, BarChart3, Flame, Trophy, GraduationCap, Brain, Star } from "lucide-react";

export const metadata: Metadata = { title: "Tüm Özellikler", description: "Ümmet uygulamasının tüm 15+ özelliği: namaz vakitleri, Kuran, dua, kıble, zikir, hadis, zekat ve daha fazlası." };

const FEATURES = [
  { icon: <Clock size={26} />, bg: "rgba(64,192,87,0.12)", color: "#40C057", title: "Namaz Vakitleri", desc: "Diyanet İşleri Başkanlığı hesaplamasıyla konumunuza göre otomatik namaz vakitleri. Güneş yayı animasyonu ile gün döngüsünü görsel takip. Her vakit için özelleştirilebilir ezan bildirimleri." },
  { icon: <BookOpen size={26} />, bg: "rgba(212,175,55,0.12)", color: "#D4AF37", title: "Kuran-ı Kerim", desc: "114 surenin tamamı Arapça metin ve Türkçe meal ile. Sure arama, okuma takibi, yer imi kaydetme. Offline çalışır." },
  { icon: <HandHelping size={26} />, bg: "rgba(139,92,246,0.12)", color: "#8B5CF6", title: "Dua Kitabı", desc: "100+ dua: sabah/akşam, namaz sonrası, yolculuk, hastalık, yemek, uyku. Arapça metin, Türkçe okunuş ve anlam." },
  { icon: <Circle size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "Dijital Tesbih & Zikir", desc: "Sübhanallah, Elhamdülillah, Allahu Ekber sayacı. Günlük hedef, streak takibi ve haptic geri bildirim." },
  { icon: <Compass size={26} />, bg: "rgba(34,211,238,0.12)", color: "#22D3EE", title: "Kıble Pusulası", desc: "Gerçek zamanlı hassas kıble yönü. Derece göstergesi, Kabe mesafesi ve görsel rehber." },
  { icon: <Moon size={26} />, bg: "rgba(240,208,96,0.12)", color: "#F0D060", title: "Hicri Takvim", desc: "Miladi-Hicri dönüştürme, mübarek geceler, kandiller, Ramazan ve bayram tarihleri." },
  { icon: <MapPin size={26} />, bg: "rgba(64,192,87,0.12)", color: "#40C057", title: "Yakındaki Camiler", desc: "Konumunuza en yakın camileri anında bulun. Mesafe, harita navigasyonu, telefon ve website bilgileri." },
  { icon: <Library size={26} />, bg: "rgba(139,92,246,0.12)", color: "#8B5CF6", title: "Hadis Koleksiyonu", desc: "Sahih hadisler, kategori filtresi, favori kaydetme. Arapça metin, Türkçe çeviri ve kaynak." },
  { icon: <Calculator size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "İslami Hesaplayıcılar", desc: "Zekat (altın, gümüş, nakit, hisse), fitre, kefaret ve fidye hesaplayıcı. Güncel fiyatlar." },
  { icon: <Star size={26} />, bg: "rgba(240,208,96,0.12)", color: "#F0D060", title: "Ramazan Hub", desc: "İftar ve sahur vakitleri, iftar geri sayımı, 30 günlük oruç takibi, Ramazan duaları." },
  { icon: <BarChart3 size={26} />, bg: "rgba(16,185,129,0.12)", color: "#10B981", title: "İbadet Analitik", desc: "Haftalık ve aylık ibadet performansı. Namaz, Kuran, dua ve zikir istatistikleri." },
  { icon: <Flame size={26} />, bg: "rgba(249,115,22,0.12)", color: "#F97316", title: "Streak Takibi", desc: "Ardışık gün sayacı ile motivasyon. Namazlarınızı kaçırmayın, streak'inizi koruyun." },
  { icon: <Trophy size={26} />, bg: "rgba(234,179,8,0.12)", color: "#EAB308", title: "Başarı Rozetleri", desc: "İbadet hedeflerine ulaştıkça rozetler kazanın." },
  { icon: <GraduationCap size={26} />, bg: "rgba(59,130,246,0.12)", color: "#3B82F6", title: "Namaz Rehberi", desc: "Adım adım namaz, abdest, farzlar, sünnetler ve nafile namazlar rehberi." },
  { icon: <Brain size={26} />, bg: "rgba(244,63,94,0.12)", color: "#F43F5E", title: "Hıfz Modu", desc: "Kuran ezberleme planı. Sure seçimi, tekrar sayacı ve ilerleme takibi." },
];

export default function OzelliklerPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">Özellikler</span><h1>15+ İslami Yaşam Aracı</h1><p>Günlük ibadetlerinizi kolaylaştıran modern araçlar. Hepsi ücretsiz.</p></div>
      <section>
        <div className="section-inner">
          <div className="features-grid">
            {FEATURES.map(f => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon" style={{ background: f.bg, color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-section"><h2>Tüm Özellikleri Ücretsiz Deneyin</h2><p>Ümmet&apos;i indirin, ibadetlerinize güç katın.</p><a href="https://apps.apple.com/tr/app/ummet/id6760871547" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-flex" }}>App Store&apos;dan İndir</a></section>
    </>
  );
}

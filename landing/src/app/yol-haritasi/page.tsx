import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yol Haritası — Ümmet Güncelleme Planı",
  description: "Ümmet uygulamasının güncelleme yol haritası. Tamamlanan özellikler ve yakında gelecek yenilikler.",
};

const TIMELINE = [
  {
    date: "Mart 2026",
    version: "v1.0.0",
    title: "🚀 İlk Yayın — App Store Lansmanı",
    status: "completed" as const,
    items: [
      { text: "Namaz vakitleri (Diyanet + 4 hesaplama yöntemi)", tag: "new" },
      { text: "Güneş yayı animasyonu ile vakit gösterimi", tag: "new" },
      { text: "Kuran-ı Kerim — 114 sure, Arapça + Türkçe meal", tag: "new" },
      { text: "100+ kategorize dua", tag: "new" },
      { text: "Dijital tesbih ve zikir sayacı", tag: "new" },
      { text: "Kıble pusulası (sensör tabanlı)", tag: "new" },
      { text: "Hicri takvim ve önemli İslami günler", tag: "new" },
      { text: "Hadis koleksiyonu", tag: "new" },
      { text: "Zekat, fitre ve kefaret hesaplayıcıları", tag: "new" },
      { text: "Ramazan Hub — iftar geri sayımı, oruç takibi", tag: "new" },
      { text: "Yakındaki camiler (OpenStreetMap)", tag: "new" },
      { text: "iOS Widget desteği", tag: "new" },
      { text: "Ezan bildirimleri (vakit öncesi hatırlatma)", tag: "new" },
      { text: "Namaz rehberi (adım adım)", tag: "new" },
      { text: "İbadet analitik ve streak takibi", tag: "new" },
      { text: "Başarı rozetleri", tag: "new" },
    ],
  },
  {
    date: "Nisan 2026",
    version: "v1.1.0",
    title: "📊 Analitik & Sosyal Özellikler",
    status: "current" as const,
    items: [
      { text: "İletişim formu SMTP entegrasyonu", tag: "fix" },
      { text: "Geliştirilmiş widget tasarımı", tag: "fix" },
      { text: "Kuran sesli okuma (hafızlar)", tag: "coming" },
      { text: "Dua favorileri ve paylaşım", tag: "coming" },
      { text: "Detaylı ibadet istatistikleri ve grafikler", tag: "coming" },
    ],
  },
  {
    date: "Mayıs 2026",
    version: "v1.2.0",
    title: "🌍 Android & Çoklu Dil",
    status: "upcoming" as const,
    items: [
      { text: "Android sürümü (Google Play Store)", tag: "coming" },
      { text: "İngilizce dil desteği", tag: "coming" },
      { text: "Arapça dil desteği", tag: "coming" },
      { text: "Apple Watch widget", tag: "coming" },
    ],
  },
  {
    date: "Yaz 2026",
    version: "v2.0.0",
    title: "🤝 Topluluk & İleri Özellikler",
    status: "upcoming" as const,
    items: [
      { text: "Topluluk duaları ve paylaşım", tag: "coming" },
      { text: "Canlı ezan sesleri (şehir bazlı)", tag: "coming" },
      { text: "Hac ve Umre rehberi", tag: "coming" },
      { text: "Yapay zeka ile kişiselleştirilmiş ibadet önerileri", tag: "coming" },
      { text: "Karanlık / aydınlık tema seçimi", tag: "coming" },
    ],
  },
];

const TAG_LABELS: Record<string, string> = { new: "Yeni", fix: "İyileştirme", coming: "Planlanan" };

export default function YolHaritasiPage() {
  return (
    <>
      <div className="page-hero">
        <span className="section-label">Yol Haritası</span>
        <h1>Güncelleme Planı</h1>
        <p>Ümmet&apos;in geçmişi ve geleceği — tamamlanan ve planlanan özellikler</p>
      </div>

      <section style={{ paddingTop: 20 }}>
        <div className="section-inner">
          <div className="timeline">
            {TIMELINE.map(item => (
              <div className="timeline-item" key={item.version}>
                <div className={`timeline-dot ${item.status}`} />
                <div className="timeline-date">{item.date} — {item.version}</div>
                <h3>{item.title}</h3>
                <div className="timeline-tags" style={{ marginBottom: 10 }}>
                  {item.status === "completed" && <span className="timeline-tag" style={{ background: "rgba(64,192,87,0.15)", color: "#40C057" }}>✓ Tamamlandı</span>}
                  {item.status === "current" && <span className="timeline-tag" style={{ background: "rgba(234,179,8,0.15)", color: "#EAB308" }}>⚡ Geliştiriliyor</span>}
                  {item.status === "upcoming" && <span className="timeline-tag coming">🔮 Planlanan</span>}
                </div>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {item.items.map((sub, i) => (
                    <li key={i} style={{ padding: "6px 0", color: "var(--text-dim)", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <span className={`timeline-tag ${sub.tag}`}>{TAG_LABELS[sub.tag]}</span>
                      {sub.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Bir Öneriniz mi Var?</h2>
        <p>Yeni özellik isteklerinizi bize iletin, yol haritamıza ekleyelim.</p>
        <a href="mailto:destek@ummetapp.com" className="btn-secondary" style={{ display: "inline-flex" }}>destek@ummetapp.com</a>
      </section>
    </>
  );
}

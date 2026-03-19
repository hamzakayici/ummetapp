import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Search } from "lucide-react";

export const metadata: Metadata = { title: "Kuran-ı Kerim Sureleri — 114 Sure Listesi", description: "Kuran-ı Kerim 114 sure listesi: Sure adları, ayet sayıları, iniş yerleri. Arapça metin ve Türkçe meal ile okuyun." };

const SURAS = [
  { no: 1, name: "Fâtiha", arabic: "الفاتحة", verses: 7, place: "Mekke", meaning: "Açılış" },
  { no: 2, name: "Bakara", arabic: "البقرة", verses: 286, place: "Medine", meaning: "Sığır" },
  { no: 3, name: "Âl-i İmrân", arabic: "آل عمران", verses: 200, place: "Medine", meaning: "İmran Ailesi" },
  { no: 4, name: "Nisâ", arabic: "النساء", verses: 176, place: "Medine", meaning: "Kadınlar" },
  { no: 5, name: "Mâide", arabic: "المائدة", verses: 120, place: "Medine", meaning: "Sofra" },
  { no: 6, name: "En'âm", arabic: "الأنعام", verses: 165, place: "Mekke", meaning: "Hayvanlar" },
  { no: 7, name: "A'râf", arabic: "الأعراف", verses: 206, place: "Mekke", meaning: "Yüksek Yerler" },
  { no: 36, name: "Yâsîn", arabic: "يس", verses: 83, place: "Mekke", meaning: "Yâ Sîn" },
  { no: 55, name: "Rahmân", arabic: "الرحمن", verses: 78, place: "Medine", meaning: "Rahman" },
  { no: 56, name: "Vâkıa", arabic: "الواقعة", verses: 96, place: "Mekke", meaning: "Kıyamet" },
  { no: 67, name: "Mülk", arabic: "الملك", verses: 30, place: "Mekke", meaning: "Hükümranlık" },
  { no: 78, name: "Nebe", arabic: "النبأ", verses: 40, place: "Mekke", meaning: "Haber" },
  { no: 87, name: "A'lâ", arabic: "الأعلى", verses: 19, place: "Mekke", meaning: "En Yüce" },
  { no: 93, name: "Duhâ", arabic: "الضحى", verses: 11, place: "Mekke", meaning: "Kuşluk Vakti" },
  { no: 94, name: "İnşirâh", arabic: "الشرح", verses: 8, place: "Mekke", meaning: "Göğsü Açma" },
  { no: 95, name: "Tîn", arabic: "التين", verses: 8, place: "Mekke", meaning: "İncir" },
  { no: 96, name: "Alak", arabic: "العلق", verses: 19, place: "Mekke", meaning: "Asılıp Tutunan" },
  { no: 97, name: "Kadir", arabic: "القدر", verses: 5, place: "Mekke", meaning: "Kadir Gecesi" },
  { no: 99, name: "Zilzâl", arabic: "الزلزلة", verses: 8, place: "Medine", meaning: "Deprem" },
  { no: 100, name: "Âdiyât", arabic: "العاديات", verses: 11, place: "Mekke", meaning: "Nefes Nefese Koşanlar" },
  { no: 101, name: "Kâria", arabic: "القارعة", verses: 11, place: "Mekke", meaning: "Yürek Hoplatan" },
  { no: 102, name: "Tekâsür", arabic: "التكاثر", verses: 8, place: "Mekke", meaning: "Çoğalma Yarışı" },
  { no: 103, name: "Asr", arabic: "العصر", verses: 3, place: "Mekke", meaning: "Asır/Zaman" },
  { no: 104, name: "Hümeze", arabic: "الهمزة", verses: 9, place: "Mekke", meaning: "Dedikoducu" },
  { no: 105, name: "Fîl", arabic: "الفيل", verses: 5, place: "Mekke", meaning: "Fil" },
  { no: 106, name: "Kureyş", arabic: "قريش", verses: 4, place: "Mekke", meaning: "Kureyş Kabilesi" },
  { no: 107, name: "Mâûn", arabic: "الماعون", verses: 7, place: "Mekke", meaning: "Yardım" },
  { no: 108, name: "Kevser", arabic: "الكوثر", verses: 3, place: "Mekke", meaning: "Kevser Havuzu" },
  { no: 109, name: "Kâfirûn", arabic: "الكافرون", verses: 6, place: "Mekke", meaning: "İnkarcılar" },
  { no: 110, name: "Nasr", arabic: "النصر", verses: 3, place: "Medine", meaning: "Yardım" },
  { no: 111, name: "Tebbet", arabic: "المسد", verses: 5, place: "Mekke", meaning: "Liflerden Bükülmüş" },
  { no: 112, name: "İhlâs", arabic: "الإخلاص", verses: 4, place: "Mekke", meaning: "Samimiyet" },
  { no: 113, name: "Felak", arabic: "الفلق", verses: 5, place: "Mekke", meaning: "Tan Yeri" },
  { no: 114, name: "Nâs", arabic: "الناس", verses: 6, place: "Mekke", meaning: "İnsanlar" },
];

export default function KuranPage() {
  return (
    <>
      <div className="page-hero">
        <span className="section-label">Kuran-ı Kerim</span>
        <h1>114 Sure</h1>
        <p>Kuran-ı Kerim sure listesi — Arapça adları, ayet sayıları ve anlamlarıyla</p>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ maxWidth: 800 }}>
          <div className="sura-grid">
            {SURAS.map(s => (
              <div className="sura-card" key={s.no}>
                <div className="sura-no">{s.no}</div>
                <div className="sura-info">
                  <div className="sura-name">{s.name}</div>
                  <div className="sura-meaning">{s.meaning} · {s.verses} ayet · {s.place}</div>
                </div>
                <div className="sura-arabic">{s.arabic}</div>
              </div>
            ))}
          </div>

          <div className="tool-note" style={{ marginTop: 20 }}>
            Bu listede en çok okunan sureler gösterilmektedir. Tüm 114 sure için Ümmet uygulamasını indirin.
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "var(--text-dim)", marginBottom: 16, fontSize: 14 }}>Arapça metin, Türkçe meal, okuma takibi ve yer imi için Ümmet uygulamasını indirin.</p>
            <a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>Uygulamayı İndir</a>
          </div>
        </div>
      </section>
    </>
  );
}

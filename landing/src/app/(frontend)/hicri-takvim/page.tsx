"use client";
import { useState } from "react";
import { Calendar, ArrowRightLeft } from "lucide-react";

function gregorianToHijri(gYear: number, gMonth: number, gDay: number) {
  const d = new Date(gYear, gMonth - 1, gDay);
  const jd = Math.floor((d.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * l3) / 709);
  const hDay = l3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;
  return { year: hYear, month: hMonth, day: hDay };
}

const HIJRI_MONTHS = ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"];
const MILADI_MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const IMPORTANT_DATES = [
  { name: "Ramazan Başlangıcı", hijri: "1 Ramazan", note: "Ramazan ayının ilk günü" },
  { name: "Kadir Gecesi", hijri: "27 Ramazan", note: "Bin aydan hayırlı gece" },
  { name: "Ramazan Bayramı", hijri: "1-3 Şevval", note: "3 gün süren bayram" },
  { name: "Kurban Bayramı", hijri: "10-13 Zilhicce", note: "4 gün süren bayram" },
  { name: "Arefe Günü", hijri: "9 Zilhicce", note: "Kurban bayramı öncesi" },
  { name: "Mevlid Kandili", hijri: "12 Rebiülevvel", note: "Hz. Muhammed'in doğumu" },
  { name: "Regaip Kandili", hijri: "İlk Recep Cuma", note: "Recep ayının ilk cuma gecesi" },
  { name: "Miraç Kandili", hijri: "27 Recep", note: "Miraç mucizesi" },
  { name: "Berat Kandili", hijri: "15 Şaban", note: "Günahlardan arınma gecesi" },
  { name: "Muharrem (Hicri Yılbaşı)", hijri: "1 Muharrem", note: "Hicri yılbaşı" },
  { name: "Aşure Günü", hijri: "10 Muharrem", note: "Hz. Nuh'un gemiden çıkışı" },
];

export default function HicriTakvimPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());

  const hijri = gregorianToHijri(year, month, day);
  const todayHijri = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());

  return (
    <>
      <div className="page-hero">
        <span className="section-label">Hicri Takvim</span>
        <h1>Miladi — Hicri Dönüştürücü</h1>
        <p>Tarih dönüştürme ve önemli İslami günler</p>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ maxWidth: 700 }}>
          {/* Bugünün Tarihi */}
          <div className="tool-card" style={{ textAlign: "center" }}>
            <div className="tool-card-header" style={{ justifyContent: "center" }}>
              <Calendar size={18} /> Bugün
            </div>
            <p style={{ fontSize: 16, color: "var(--text-dim)", marginBottom: 4 }}>{today.getDate()} {MILADI_MONTHS[today.getMonth()]} {today.getFullYear()}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--gold)" }}>{todayHijri.day} {HIJRI_MONTHS[todayHijri.month - 1]} {todayHijri.year}</p>
          </div>

          {/* Dönüştürücü */}
          <div className="tool-card" style={{ marginTop: 20 }}>
            <div className="tool-card-header"><ArrowRightLeft size={18} /> Tarih Dönüştürücü</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="tool-field"><label>Gün</label><input type="number" min={1} max={31} value={day} onChange={e => setDay(parseInt(e.target.value) || 1)} /></div>
              <div className="tool-field"><label>Ay</label><input type="number" min={1} max={12} value={month} onChange={e => setMonth(parseInt(e.target.value) || 1)} /></div>
              <div className="tool-field"><label>Yıl</label><input type="number" min={1900} max={2100} value={year} onChange={e => setYear(parseInt(e.target.value) || 2026)} /></div>
            </div>
            <div className="tool-result" style={{ marginTop: 16 }}>
              <div className="tool-result-main">
                <span>Hicri Tarih</span>
                <strong className="zekat-amount">{hijri.day} {HIJRI_MONTHS[hijri.month - 1]} {hijri.year}</strong>
              </div>
            </div>
          </div>

          {/* Önemli Günler */}
          <div className="tool-card" style={{ marginTop: 20 }}>
            <div className="tool-card-header"><Calendar size={18} /> Önemli İslami Günler</div>
            <div className="important-dates">
              {IMPORTANT_DATES.map(d => (
                <div className="date-row" key={d.name}>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{d.name}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>{d.note}</div>
                  </div>
                  <div className="date-hijri">{d.hijri}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "var(--text-dim)", marginBottom: 16, fontSize: 14 }}>Bildirimler ve detaylı takvim için Ümmet uygulamasını indirin.</p>
            <a href="https://apps.apple.com/tr/app/ummet/id6760871547" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-flex" }}>Uygulamayı İndir</a>
          </div>
        </div>
      </section>
    </>
  );
}

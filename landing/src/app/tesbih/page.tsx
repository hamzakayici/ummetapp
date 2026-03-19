"use client";
import { useState, useCallback } from "react";
import { RotateCcw, Minus, Plus } from "lucide-react";

export default function TesbihPage() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [dhikr, setDhikr] = useState(0);

  const DHIKRS = [
    { text: "سُبْحَانَ اللَّهِ", label: "Sübhanallah", transliteration: "Allah'ı tenzih ederim" },
    { text: "الْحَمْدُ لِلَّهِ", label: "Elhamdülillah", transliteration: "Allah'a hamd olsun" },
    { text: "اللَّهُ أَكْبَرُ", label: "Allahu Ekber", transliteration: "Allah en büyüktür" },
    { text: "لَا إِلَهَ إِلَّا اللَّهُ", label: "Lâ ilâhe illallah", transliteration: "Allah'tan başka ilah yoktur" },
    { text: "أَسْتَغْفِرُ اللَّهَ", label: "Estağfirullah", transliteration: "Allah'tan bağışlanma dilerim" },
  ];

  const current = DHIKRS[dhikr];
  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;

  const handleCount = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return (
    <>
      <div className="page-hero">
        <span className="section-label">Tesbih</span>
        <h1>Dijital Tesbih</h1>
        <p>Zikir sayacı — hedef belirleyin, tıklayın, zikredin</p>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ maxWidth: 500, textAlign: "center" }}>
          {/* Zikir Seçici */}
          <div className="dhikr-selector">
            {DHIKRS.map((d, i) => (
              <button key={i} className={`dhikr-btn ${i === dhikr ? "active" : ""}`} onClick={() => { setDhikr(i); setCount(0); }}>{d.label}</button>
            ))}
          </div>

          {/* Tesbih Alanı */}
          <div className="tesbih-card" onClick={handleCount} role="button" tabIndex={0} onKeyDown={e => e.key === " " && handleCount()}>
            <p className="tesbih-arabic">{current.text}</p>
            <p className="tesbih-label">{current.label}</p>
            <p className="tesbih-meaning">{current.transliteration}</p>

            <div className="tesbih-counter">{count}</div>
            <div className="tesbih-progress-bar">
              <div className="tesbih-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="tesbih-target">Hedef: {target}</p>
            <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>Tıklayarak veya boşluk tuşuyla sayın</p>
          </div>

          {/* Hedef Ayar */}
          <div className="tesbih-controls">
            <button onClick={() => setTarget(Math.max(1, target - 1))}><Minus size={16} /></button>
            <span>{target}</span>
            <button onClick={() => setTarget(target + 1)}><Plus size={16} /></button>
            <button className="reset-btn" onClick={() => setCount(0)}><RotateCcw size={14} /> Sıfırla</button>
          </div>

          {/* Hızlı Hedefler */}
          <div className="quick-targets">
            {[33, 99, 100, 500, 1000].map(t => (
              <button key={t} className={`quick-target ${t === target ? "active" : ""}`} onClick={() => { setTarget(t); setCount(0); }}>{t}</button>
            ))}
          </div>

          {count >= target && target > 0 && (
            <div className="tesbih-complete">Hedef tamamlandı! Allah kabul etsin.</div>
          )}

          <div style={{ marginTop: 40 }}>
            <p style={{ color: "var(--text-dim)", marginBottom: 16, fontSize: 14 }}>Streak takibi ve haptic geri bildirim için Ümmet uygulamasını indirin.</p>
            <a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>Uygulamayı İndir</a>
          </div>
        </div>
      </section>
    </>
  );
}

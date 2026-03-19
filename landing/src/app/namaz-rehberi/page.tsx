import type { Metadata } from "next";

export const metadata: Metadata = { title: "Namaz Nasıl Kılınır? — Adım Adım Namaz Rehberi", description: "Namaz nasıl kılınır? Abdest, niyet, kıyam, rükû, secde, selam — adım adım detaylı namaz kılma rehberi." };

const STEPS = [
  { title: "Abdest", desc: "Eller 3 kez yıkanır, ağza ve buruna 3'er kez su verilir, yüz 3 kez yıkanır, kollar dirseklere kadar yıkanır, başa mesh yapılır, kulaklar meshedilir ve ayaklar topuklara kadar yıkanır.", tip: "Abdesti bozan haller: idrar, gaz çıkışı, kan akması, uyku, bayılma." },
  { title: "Niyet", desc: "Kılınacak namazın türünü (farz, sünnet, vitir) ve vaktini kalben belirlemektir. Dil ile söylemek sünnettir.", tip: "Niyet, tekbirden hemen önce yapılmalıdır." },
  { title: "İftitah Tekbiri", desc: "Ayakta durarak \"Allahu Ekber\" denir ve eller kulakların hizasına kaldırılır. Eller bağlanır.", tip: "Tekbir esnasında parmaklar açık ve kıbleye dönük olmalıdır." },
  { title: "Kıyam (Ayakta Durma)", desc: "Ayakta durarak sırasıyla: Sübhaneke duası, Eûzü-Besmele, Fâtiha suresi ve ardından bir sure okunur.", tip: "Gözler secde yerine bakmalı, eller göbek altında bağlı olmalıdır." },
  { title: "Rükû (Eğilme)", desc: "\"Allahu Ekber\" diyerek eğilinir. Eller dizleri kavrar, sırt düz tutulur. 3 kez \"Sübhâne Rabbiye'l-Azîm\" denir. Doğrulurken \"Semi'allâhu limen hamideh\" denir.", tip: "Rükûda baş ile sırt aynı hizada olmalıdır." },
  { title: "Secde (Yere Kapanma)", desc: "\"Allahu Ekber\" diyerek alnı, burnu, iki eli, iki dizi ve iki ayağı yere koyarak secdeye varılır. 3 kez \"Sübhâne Rabbiye'l-A'lâ\" denir. İki secde arasında kısa oturulur.", tip: "Secde, namazın en faziletli anıdır." },
  { title: "Ka'de (Oturuş)", desc: "Son rekatta oturulur. Sırasıyla: Ettehiyyatü, Allahümme salli, Allahümme bârik ve Rabbenâ âtinâ duaları okunur.", tip: "Son oturuşta sağ ayak dikili, sol ayak yatık olmalıdır." },
  { title: "Selam", desc: "Başı sağa çevirerek \"Esselâmu aleyküm ve rahmetullâh\" denir, ardından sola çevirerek aynısı tekrarlanır.", tip: "Selam verirken omzunuzdaki meleklere selam verdiğinizi düşünün." },
];

const PRAYERS = [
  { name: "Sabah", total: 4, breakdown: "2 sünnet + 2 farz", time: "İmsak ile güneş doğuşu arası" },
  { name: "Öğle", total: 10, breakdown: "4 sünnet + 4 farz + 2 sünnet", time: "Güneş tepe noktasını geçtikten sonra" },
  { name: "İkindi", total: 8, breakdown: "4 sünnet + 4 farz", time: "Güneşin batmaya başlamasına kadar" },
  { name: "Akşam", total: 5, breakdown: "3 farz + 2 sünnet", time: "Güneş battıktan sonra" },
  { name: "Yatsı", total: 13, breakdown: "4 sünnet + 4 farz + 2 sünnet + 3 vitir", time: "Şafak kaybolduktan sonra" },
];

export default function NamazRehberiPage() {
  return (
    <>
      <div className="page-hero">
        <span className="section-label">Namaz Rehberi</span>
        <h1>Namaz Nasıl Kılınır?</h1>
        <p>Abdest, niyet, kıyam, rükû, secde — adım adım namaz kılma rehberi</p>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ maxWidth: 800 }}>
          {/* Adımlar */}
          <h2 style={{ color: "var(--gold)", fontSize: 20, marginBottom: 20, fontWeight: 700 }}>Namazın 8 Adımı</h2>
          <div className="steps-list">
            {STEPS.map((step, idx) => (
              <div className="prayer-step" key={step.title}>
                <div className="prayer-step-num">{idx + 1}</div>
                <div className="prayer-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <div className="prayer-step-tip">{step.tip}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Vakit Namazları */}
          <h2 style={{ color: "var(--gold)", fontSize: 20, marginTop: 50, marginBottom: 20, fontWeight: 700 }}>5 Vakit Namaz</h2>
          <div className="prayer-table">
            <div className="prayer-table-header">
              <span>Vakit</span><span>Rekat</span><span>Dağılım</span><span>Zaman</span>
            </div>
            {PRAYERS.map(p => (
              <div className="prayer-table-row" key={p.name}>
                <span className="prayer-name">{p.name}</span>
                <span className="prayer-total">{p.total}</span>
                <span>{p.breakdown}</span>
                <span className="prayer-time">{p.time}</span>
              </div>
            ))}
          </div>

          <div className="tool-note" style={{ marginTop: 20 }}>
            Günde toplam <strong>40 rekat</strong> namaz kılınır: 17 farz, 12 sünnet-i müekkede, 4 sünnet-i gayri müekkede ve 3 vitir vacip.
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "var(--text-dim)", marginBottom: 16, fontSize: 14 }}>Detaylı namaz rehberi, adım adım görseller ve ibadet takibi için Ümmet uygulamasını indirin.</p>
            <a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>Uygulamayı İndir</a>
          </div>
        </div>
      </section>
    </>
  );
}

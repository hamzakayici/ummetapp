"use client";
import { useState } from "react";
import type { Metadata } from "next";
import { Calculator, Info, ChevronDown, ChevronUp } from "lucide-react";

const GOLD_GRAM_PRICE = 2850;
const SILVER_GRAM_PRICE = 35;
const NISAP_GOLD = 80.18;
const NISAP_SILVER = 561.2;

export default function ZekatHesaplayiciPage() {
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [cash, setCash] = useState("");
  const [stocks, setStocks] = useState("");
  const [rental, setRental] = useState("");
  const [debts, setDebts] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [showFitre, setShowFitre] = useState(false);

  const num = (v: string) => parseFloat(v) || 0;
  const totalAssets = num(gold) * GOLD_GRAM_PRICE + num(silver) * SILVER_GRAM_PRICE + num(cash) + num(stocks) + num(rental);
  const net = totalAssets - num(debts);
  const nisapTL = NISAP_GOLD * GOLD_GRAM_PRICE;
  const isAboveNisap = net >= nisapTL;
  const zekat = isAboveNisap ? net * 0.025 : 0;

  const [fitrePerson, setFitrePerson] = useState("1");
  const fitrePerPerson = 250;
  const totalFitre = num(fitrePerson) * fitrePerPerson;

  return (
    <>
      <div className="page-hero">
        <span className="section-label">Araç</span>
        <h1>Zekat Hesaplayıcı</h1>
        <p>Varlıklarınızı girin, zekatınızı anında hesaplayın</p>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ maxWidth: 700 }}>
          {/* Zekat Hesaplama */}
          <div className="tool-card">
            <div className="tool-card-header">
              <Calculator size={20} /> Zekat Hesaplama
            </div>

            <div className="tool-field">
              <label>Altın (gram)</label>
              <input type="number" placeholder="0" value={gold} onChange={e => setGold(e.target.value)} />
              {num(gold) > 0 && <span className="field-hint">≈ {(num(gold) * GOLD_GRAM_PRICE).toLocaleString("tr-TR")} ₺</span>}
            </div>
            <div className="tool-field">
              <label>Gümüş (gram)</label>
              <input type="number" placeholder="0" value={silver} onChange={e => setSilver(e.target.value)} />
            </div>
            <div className="tool-field">
              <label>Nakit Para (₺)</label>
              <input type="number" placeholder="0" value={cash} onChange={e => setCash(e.target.value)} />
            </div>
            <div className="tool-field">
              <label>Hisse Senetleri (₺)</label>
              <input type="number" placeholder="0" value={stocks} onChange={e => setStocks(e.target.value)} />
            </div>
            <div className="tool-field">
              <label>Kira Geliri (₺)</label>
              <input type="number" placeholder="0" value={rental} onChange={e => setRental(e.target.value)} />
            </div>
            <div className="tool-field">
              <label>Borçlar (₺)</label>
              <input type="number" placeholder="0" value={debts} onChange={e => setDebts(e.target.value)} />
            </div>

            <button className="tool-btn" onClick={() => setShowResult(true)}>Zekatı Hesapla</button>

            {showResult && (
              <div className="tool-result">
                <div className="tool-result-row"><span>Toplam Varlık</span><strong>{totalAssets.toLocaleString("tr-TR")} ₺</strong></div>
                <div className="tool-result-row"><span>Borçlar</span><strong>-{num(debts).toLocaleString("tr-TR")} ₺</strong></div>
                <div className="tool-result-row"><span>Net Varlık</span><strong>{net.toLocaleString("tr-TR")} ₺</strong></div>
                <div className="tool-result-row"><span>Nisap (80.18g altın)</span><strong>{nisapTL.toLocaleString("tr-TR")} ₺</strong></div>
                <div className="tool-result-divider" />
                {isAboveNisap ? (
                  <div className="tool-result-main"><span>Ödenecek Zekat (%2.5)</span><strong className="zekat-amount">{zekat.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ₺</strong></div>
                ) : (
                  <div className="tool-result-info"><Info size={16} /> Varlıklarınız nisap miktarının altındadır. Zekat yükümlülüğünüz bulunmamaktadır.</div>
                )}
              </div>
            )}
          </div>

          {/* Fitre */}
          <div className="tool-card" style={{ marginTop: 20 }}>
            <button className="tool-card-toggle" onClick={() => setShowFitre(!showFitre)}>
              <span>Fitre Hesaplayıcı</span>
              {showFitre ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showFitre && (
              <>
                <div className="tool-field">
                  <label>Aile Üye Sayısı</label>
                  <input type="number" placeholder="1" value={fitrePerson} onChange={e => setFitrePerson(e.target.value)} />
                </div>
                <div className="tool-result">
                  <div className="tool-result-row"><span>Kişi Başı Fitre</span><strong>{fitrePerPerson} ₺</strong></div>
                  <div className="tool-result-main"><span>Toplam Fitre</span><strong className="zekat-amount">{totalFitre.toLocaleString("tr-TR")} ₺</strong></div>
                </div>
              </>
            )}
          </div>

          <div className="tool-note">
            <Info size={14} /> Bu hesaplamalar bilgilendirme amaçlıdır. Kesin dini hüküm niteliği taşımaz.
          </div>

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "var(--text-dim)", marginBottom: 16, fontSize: 14 }}>Daha detaylı hesaplama için Ümmet uygulamasını indirin.</p>
            <a href="https://apps.apple.com/tr/app/ummet/id6760871547" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-flex" }}>Uygulamayı İndir</a>
          </div>
        </div>
      </section>
    </>
  );
}

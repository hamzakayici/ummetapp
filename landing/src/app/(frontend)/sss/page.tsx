import type { Metadata } from "next";

export const metadata: Metadata = { title: "SSS", description: "Ümmet uygulaması hakkında sıkça sorulan sorular. Namaz vakitleri, Kuran, kıble, gizlilik ve daha fazlası." };

const FAQ = [
  { q: "Ümmet uygulaması ücretsiz mi?", a: "Evet, tamamen ücretsizdir. Gizli ücret, premium duvarı veya reklam yoktur." },
  { q: "Namaz vakitleri ne kadar doğru?", a: "Diyanet İşleri Başkanlığı hesaplama yöntemi varsayılandır. 5 farklı yöntem seçebilirsiniz." },
  { q: "Kıble pusulası doğru mu?", a: "Evet. Hassas kıble hesaplama ile doğru yönü bulursunuz. Telefonunuzu 8 hareketi ile kalibre ederek daha doğru sonuç alabilirsiniz." },
  { q: "İnternet olmadan kullanabilir miyim?", a: "Kuran, dualar, zikir ve tesbih çevrimdışı çalışır. Namaz vakitleri ve camiler internet gerektirir." },
  { q: "Verilerim güvende mi?", a: "Evet. Tüm veriler cihazınızda saklanır. Sunucuya kişisel veri gönderilmez." },
  { q: "Hangi hesaplama yöntemleri var?", a: "Diyanet, Karaçi, Müslüman Dünya Birliği, Ümmül Kura ve Mısır Fetva Kurulu." },
  { q: "iOS Widget desteği var mı?", a: "Evet! Namaz vakitleri ve günün ayetini gösteren widget ekleyebilirsiniz." },
  { q: "Yakındaki camileri nasıl bulurum?", a: "Daha Fazla → İbadet Araçları → Yakındaki Camiler. 1-10km yarıçapta camiler listelenir." },
  { q: "Zekat, fitre ve kefaret nasıl hesaplanır?", a: "Daha Fazla → Araçlar bölümünden hesaplayıcılara ulaşabilirsiniz." },
  { q: "Android sürümü var mı?", a: "Şu an yalnızca iOS. Android sürümü üzerinde çalışılmaktadır." },
];

export default function SSSPage() {
  return (
    <>
      <div className="page-hero"><span className="section-label">SSS</span><h1>Sıkça Sorulan Sorular</h1><p>Ümmet hakkında merak ettiğiniz her şey</p></div>
      <section style={{ paddingTop: 20 }}>
        <div className="section-inner">
          <div className="faq-list">
            {FAQ.map(f => <details className="faq-item" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </div>
      </section>
      <section className="cta-section"><h2>Sorunuz mu var?</h2><p>Bulamadığınız bir şey varsa bize yazın.</p><a href="mailto:destek@ummetapp.com" className="btn-secondary" style={{ display: "inline-flex" }}>destek@ummetapp.com</a></section>
    </>
  );
}

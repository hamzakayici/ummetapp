import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Dualar — Günlük Dua Rehberi", description: "100+ İslami dua: Sabah akşam duaları, namaz sonrası dualar, yolculuk duaları, yemek duaları ve daha fazlası. Arapça metin ve Türkçe anlamlarıyla." };

const CATEGORIES = [
  {
    name: "Sabah & Akşam Duaları",
    duas: [
      { title: "Sabah Duası", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", meaning: "Sabaha erdik, mülk de Allah'a ait olarak sabaha erdi. Hamd Allah'a aittir.", transliteration: "Asbahnâ ve asbahal-mulku lillâhi vel-hamdu lillâh" },
      { title: "Akşam Duası", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", meaning: "Akşama erdik, mülk de Allah'a ait olarak akşamladı. Hamd Allah'a aittir.", transliteration: "Emseynâ ve emsel-mulku lillâhi vel-hamdu lillâh" },
      { title: "Uyandığında", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", meaning: "Bizi öldürdükten sonra dirilten Allah'a hamd olsun. Dönüş O'nadır.", transliteration: "El-hamdu lillâhillezî ahyânâ ba'de mâ emâtenâ ve ileyhinnuşûr" },
    ],
  },
  {
    name: "Namaz Duaları",
    duas: [
      { title: "Sübhaneke", arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ", meaning: "Allah'ım! Seni her türlü noksanlıklardan tenzih ederim. Seni hamd ile anarım. Senin adın mübarektir. Senin şanın yücedir. Senden başka ilah yoktur.", transliteration: "Sübhânekellâhümme ve bihamdik ve tebârekesmük ve teâlâ ceddük ve lâ ilâhe ğayrük" },
      { title: "Ettehiyyatü", arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ", meaning: "Bütün saygılar, dualar ve güzel sözler Allah'a aittir.", transliteration: "Ettehiyyâtü lillâhi ves-salavâtü vet-tayyibât" },
      { title: "Kunut Duası", arabic: "اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ", meaning: "Allah'ım! Senden yardım dileriz, bağışlanma dileriz.", transliteration: "Allâhümme innâ nesteînüke ve nesteğfiruk" },
    ],
  },
  {
    name: "Yolculuk & Günlük",
    duas: [
      { title: "Yolculuk Duası", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ", meaning: "Bunu bizim hizmetimize vereni tenzih ederiz. Bizim buna gücümüz yetmezdi.", transliteration: "Sübhânellezî sehhara lenâ hâzâ ve mâ künnâ lehü mukrinîn" },
      { title: "Yemek Duası", arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", meaning: "Allah'ım! Bize verdiğin rızıkları mübarek kıl. Bizi ateş azabından koru.", transliteration: "Allâhümme bârik lenâ fîmâ razaktenâ ve kınâ azâbennâr" },
      { title: "Eve Girerken", arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا", meaning: "Allah'ın adıyla girdik, O'nun adıyla çıktık, Rabbimiz Allah'a tevekkül ettik.", transliteration: "Bismillâhi velecnâ ve bismillâhi haracnâ ve alallâhi rabbinâ tevekkelnâ" },
    ],
  },
  {
    name: "Koruma & Şifa Duaları",
    duas: [
      { title: "Ayetel Kürsi", arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", meaning: "Allah, O'ndan başka ilâh yoktur. Daima diri ve yarattıklarını koruyup yönetendir. O'nu ne uyuklama tutar ne de uyku.", transliteration: "Allâhü lâ ilâhe illâ hüvel-hayyül-kayyûm. Lâ te'huzühü sinetün ve lâ nevm" },
      { title: "Şifa Duası", arabic: "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ وَاشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ", meaning: "Ey insanların Rabbi! Sıkıntıyı gider, şifa ver. Şifa veren Sen'sin. Sen'in şifandan başka şifa yoktur.", transliteration: "Allâhümme Rabbennâs, ezhibil-be'se veşfi enteş Şâfî, lâ şifâe illâ şifâuk" },
    ],
  },
  {
    name: "İstiğfar & Tövbe",
    duas: [
      { title: "Seyyidü'l İstiğfar", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ", meaning: "Allah'ım! Sen benim Rabbimsin, Sen'den başka ilah yoktur. Beni Sen yarattın, ben Senin kulunum.", transliteration: "Allâhümme ente Rabbî lâ ilâhe illâ ente halaktenî ve ene abdük" },
      { title: "İstiğfar", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ", meaning: "Azim olan Allah'tan bağışlanmamı dilerim. O'ndan başka ilah yoktur. O Hayy ve Kayyum'dur. O'na tövbe ederim.", transliteration: "Estağfirullâhel-azîm ellezî lâ ilâhe illâ hüvel-hayyel-kayyûme ve etûbü ileyh" },
    ],
  },
];

export default function DualarPage() {
  return (
    <>
      <div className="page-hero">
        <span className="section-label">Dualar</span>
        <h1>Günlük Dua Rehberi</h1>
        <p>Sabah-akşam, namaz, yolculuk ve günlük dualar — Arapça metin, okunuş ve Türkçe anlamlarıyla</p>
      </div>

      <section style={{ paddingTop: 0 }}>
        <div className="section-inner" style={{ maxWidth: 800 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} style={{ marginBottom: 40 }}>
              <h2 className="dua-category-title">{cat.name}</h2>
              {cat.duas.map(dua => (
                <div className="dua-card" key={dua.title}>
                  <h3>{dua.title}</h3>
                  <p className="dua-arabic">{dua.arabic}</p>
                  <p className="dua-transliteration">{dua.transliteration}</p>
                  <p className="dua-meaning">{dua.meaning}</p>
                </div>
              ))}
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "var(--text-dim)", marginBottom: 16, fontSize: 14 }}>100+ dua, kategoriler ve favori kaydetme için Ümmet uygulamasını indirin.</p>
            <a href="/#download" className="btn-primary" style={{ display: "inline-flex" }}>Uygulamayı İndir</a>
          </div>
        </div>
      </section>
    </>
  );
}

// Delailül Hayrat — İmam Muhammed b. Süleyman el-Cezûlî (v. 1465)
// Hz. Muhammed (s.a.v) üzerine salavat koleksiyonu
// Geleneksel 7 günlük hizb düzeni

export type DelailEntry = {
  arabic: string;
  turkish: string;
};

export type DelailHizb = {
  day: string;
  dayAr: string;
  title: string;
  entries: DelailEntry[];
};

export const DELAIL_INTRO = {
  title: "Delâilü'l-Hayrât",
  titleAr: "دلائل الخيرات",
  author: "İmam Muhammed b. Süleyman el-Cezûlî",
  description:
    "Hz. Peygamber (s.a.v) üzerine salât ve selâm getirmek için yazılmış en meşhur salavat kitabıdır. 7 hizbe (güne) bölünmüştür. Her gün bir hizb okunması tavsiye edilir.",
};

export const DELAIL_HIZBS: DelailHizb[] = [
  {
    day: "Pazartesi",
    dayAr: "الإثنين",
    title: "Birinci Hizb",
    entries: [
      { arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", turkish: "Rahmân ve Rahîm olan Allah'ın adıyla." },
      { arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", turkish: "Hamd, âlemlerin Rabbi Allah'a mahsustur." },
      { arabic: "وَالصَّلَاةُ وَالسَّلَامُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ", turkish: "Salât ve selâm, Efendimiz Muhammed'e, âline ve ashabının tamamına olsun." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ عَدَدَ مَنْ صَلَّى عَلَيْهِ", turkish: "Allah'ım! Ona salât edenlerin sayısınca Efendimiz Muhammed'e salât eyle." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ عَدَدَ مَنْ لَمْ يُصَلِّ عَلَيْهِ", turkish: "Allah'ım! Ona salât etmeyenlerin sayısınca Efendimiz Muhammed'e salât eyle." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ كَمَا أَمَرْتَ بِالصَّلَاةِ عَلَيْهِ", turkish: "Allah'ım! Emrettiğin şekilde Efendimiz Muhammed'e salât eyle." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ كَمَا يَنْبَغِي أَنْ يُصَلَّى عَلَيْهِ", turkish: "Allah'ım! Layık olduğu şekilde Efendimiz Muhammed'e salât eyle." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ حَتَّى لَا يَبْقَى مِنَ الصَّلَاةِ شَيْءٌ", turkish: "Allah'ım! Salâttan bir şey kalmayıncaya kadar Muhammed'e salât eyle." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ الْحَبِيبِ الْعَالِي الْقَدْرِ الْعَظِيمِ الْجَاهِ", turkish: "Allah'ım! Ümmî Peygamber, sevgili, kadri yüce, şanı büyük Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ", turkish: "Ve onun âline ve ashabına selâm eyle." },
    ],
  },
  {
    day: "Salı",
    dayAr: "الثلاثاء",
    title: "İkinci Hizb",
    entries: [
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الْأَهْوَالِ وَالْآفَاتِ", turkish: "Allah'ım! Bizi bütün dehşetlerden ve âfetlerden kurtaracak bir salât ile Efendimiz Muhammed'e ve âline salât eyle." },
      { arabic: "وَتَقْضِي لَنَا بِهَا جَمِيعَ الْحَاجَاتِ", turkish: "Ve onunla bütün ihtiyaçlarımızı karşıla." },
      { arabic: "وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ", turkish: "Ve onunla bizi bütün günahlardan temizle." },
      { arabic: "وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ", turkish: "Ve onunla bizi katında en yüce derecelere yükselt." },
      { arabic: "وَتُبَلِّغُنَا بِهَا أَقْصَى الْغَايَاتِ مِنْ جَمِيعِ الْخَيْرَاتِ فِي الْحَيَاةِ وَبَعْدَ الْمَمَاتِ", turkish: "Ve onunla hayatta ve öldükten sonra bütün hayırların en son gayesine ulaştır." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ الْفَاتِحِ لِمَا أُغْلِقَ", turkish: "Allah'ım! Kapalı olanı açan Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَالْخَاتِمِ لِمَا سَبَقَ", turkish: "Ve geçmişi mühürleyen." },
      { arabic: "نَاصِرِ الْحَقِّ بِالْحَقِّ وَالْهَادِي إِلَى صِرَاطِكَ الْمُسْتَقِيمِ", turkish: "Hak ile hakkı destekleyen ve dosdoğru yoluna hidayet eden." },
      { arabic: "وَعَلَى آلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ الْعَظِيمِ", turkish: "Ve onun âline, kadri ve büyük miktarının hakkı olarak salât eyle." },
    ],
  },
  {
    day: "Çarşamba",
    dayAr: "الأربعاء",
    title: "Üçüncü Hizb",
    entries: [
      { arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ شَجَرَةِ الْأَصْلِ النُّورَانِيَّةِ", turkish: "Allah'ım! Nurlu aslın ağacı olan Efendimiz Muhammed'e salât, selâm ve bereket eyle." },
      { arabic: "وَلَمْعَةِ الْقَبْضَةِ الرَّحْمَانِيَّةِ", turkish: "Ve Rahmânî avucun parıltısı olan." },
      { arabic: "وَأَفْضَلِ الْخَلِيقَةِ الْإِنْسَانِيَّةِ", turkish: "Ve insanlık yaratılışının en faziletlisi olan." },
      { arabic: "وَأَشْرَفِ الصُّورَةِ الْجِسْمَانِيَّةِ", turkish: "Ve cismanî suretin en şereflisi olan." },
      { arabic: "وَمَعْدِنِ الْأَسْرَارِ الرَّبَّانِيَّةِ", turkish: "Ve Rabbânî sırların madeni olan." },
      { arabic: "وَخَزَائِنِ الْعُلُومِ الْاِصْطِفَائِيَّةِ", turkish: "Ve seçilmişlik ilimlerinin hazinesi olan." },
      { arabic: "صَاحِبِ الْقَبْضَةِ الْأَصْلِيَّةِ وَالْبَهْجَةِ السَّنِيَّةِ وَالرُّتْبَةِ الْعَلِيَّةِ", turkish: "Aslî kabzanın, yüce sevinçin ve yüksek mertebenin sahibi olan." },
      { arabic: "وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيمًا", turkish: "Ve onun âline ve ashabına bol bol selâm eyle." },
    ],
  },
  {
    day: "Perşembe",
    dayAr: "الخميس",
    title: "Dördüncü Hizb",
    entries: [
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ بَحْرِ أَنْوَارِكَ", turkish: "Allah'ım! Nurlarının denizi olan Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَمَعْدِنِ أَسْرَارِكَ وَلِسَانِ حُجَّتِكَ", turkish: "Sırlarının madeni ve hüccetinin lisanı olan." },
      { arabic: "وَعَرُوسِ مَمْلَكَتِكَ وَإِمَامِ حَضْرَتِكَ", turkish: "Mülkünün gelini ve huzurunun imamı olan." },
      { arabic: "وَطِرَازِ مُلْكِكَ وَخَزَائِنِ رَحْمَتِكَ", turkish: "Mülkünün süsü ve rahmetinin hazinesi olan." },
      { arabic: "وَطَرِيقِ شَرِيعَتِكَ الْمُتَلَذِّذِ بِتَوْحِيدِكَ", turkish: "Şeriatının yolu, tevhidinle lezzet alan." },
      { arabic: "إِنْسَانِ عَيْنِ الْوُجُودِ", turkish: "Varlığın gözbebeği olan." },
      { arabic: "وَالسَّبَبِ فِي كُلِّ مَوْجُودٍ", turkish: "Ve her var olanın sebebi olan." },
      { arabic: "وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيمًا كَثِيرًا", turkish: "Ve onun âline ve ashabına çokça selâm eyle." },
    ],
  },
  {
    day: "Cuma",
    dayAr: "الجمعة",
    title: "Beşinci Hizb",
    entries: [
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا وَمَوْلَانَا مُحَمَّدٍ عَدَدَ مَا فِي عِلْمِ اللَّهِ", turkish: "Allah'ım! Allah'ın ilminde olanların sayısınca Efendimiz ve Mevlâmız Muhammed'e salât eyle." },
      { arabic: "صَلَاةً دَائِمَةً بِدَوَامِ مُلْكِ اللَّهِ", turkish: "Allah'ın mülkünün devamıyla daimî bir salât ile." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ مَا ذَكَرَهُ الذَّاكِرُونَ", turkish: "Allah'ım! Zikredenler onu zikrettiğinde Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ مَا غَفَلَ عَنْ ذِكْرِهِ الْغَافِلُونَ", turkish: "Ve gafiller onun zikrinden gafil kaldığında Efendimiz Muhammed'e salât eyle." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْأَوَّلِينَ", turkish: "Allah'ım! Öncekilerde Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْآخِرِينَ", turkish: "Ve sonrakilerde Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَصَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ فِي الْمَلَأِ الْأَعْلَى إِلَى يَوْمِ الدِّينِ", turkish: "Ve yüce toplulukta kıyamet gününe kadar Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ", turkish: "Ve onun âline ve ashabına selâm eyle." },
    ],
  },
  {
    day: "Cumartesi",
    dayAr: "السبت",
    title: "Altıncı Hizb",
    entries: [
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تَمْلَأُ خَزَائِنَ اللَّهِ نُورًا", turkish: "Allah'ım! Allah'ın hazinelerini nurla dolduracak bir salât ile Efendimiz Muhammed'e salât eyle." },
      { arabic: "وَتَكُونُ لَنَا فَرَجًا وَفَرَحًا وَسُرُورًا", turkish: "Ve bize kurtuluş, sevinç ve neşe olsun." },
      { arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تَرْضَى بِهَا عَنَّا", turkish: "Allah'ım! Bizden razı olacağın bir salât ile Muhammed'e salât eyle." },
      { arabic: "وَتَقْضِي بِهَا حَوَائِجَنَا وَتُطَهِّرُ بِهَا قُلُوبَنَا", turkish: "Ve onunla ihtiyaçlarımızı karşıla ve kalplerimizi temizle." },
      { arabic: "وَتَشْرَحُ بِهَا صُدُورَنَا وَتُنَوِّرُ بِهَا قُبُورَنَا", turkish: "Ve onunla göğüslerimizi aç ve kabirlerimizi nurlandır." },
      { arabic: "وَتَغْفِرُ بِهَا ذُنُوبَنَا", turkish: "Ve onunla günahlarımızı bağışla." },
      { arabic: "وَنَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", turkish: "Ve senden dünya ve ahirette af ve afiyet dileriz." },
      { arabic: "وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ", turkish: "Ve onun bütün âline ve ashabına olsun." },
    ],
  },
  {
    day: "Pazar",
    dayAr: "الأحد",
    title: "Yedinci Hizb",
    entries: [
      { arabic: "اللَّهُمَّ صَلِّ أَفْضَلَ صَلَوَاتِكَ عَلَى أَسْعَدِ مَخْلُوقَاتِكَ", turkish: "Allah'ım! En faziletli salâtını yaratılmışların en mutlusu üzerine eyle." },
      { arabic: "سَيِّدِنَا مُحَمَّدٍ نُورِ الْأَنْوَارِ", turkish: "Efendimiz Muhammed, nurların nuru." },
      { arabic: "وَسِرِّ الْأَسْرَارِ وَسَيِّدِ الْأَبْرَارِ", turkish: "Sırların sırrı ve iyilerin efendisi." },
      { arabic: "وَزِينَةِ الْأَنْبِيَاءِ الْمُخْتَارِينَ الْأَخْيَارِ", turkish: "Seçilmiş hayırlı peygamberlerin süsü." },
      { arabic: "وَأَكْرَمِ مَنْ أَظْلَمَ عَلَيْهِ اللَّيْلُ وَأَشْرَقَ عَلَيْهِ النَّهَارُ", turkish: "Üzerine gece karanlık çöken ve gündüz ışıyan en şerefli zât." },
      { arabic: "عَدَدَ قَطْرِ الْأَمْطَارِ وَعَدَدَ أَوْرَاقِ الْأَشْجَارِ", turkish: "Yağmur damlalarının sayısınca ve ağaç yapraklarının sayısınca." },
      { arabic: "وَعَدَدَ أَنْفَاسِ الْمُسْتَغْفِرِينَ بِالْأَسْحَارِ", turkish: "Ve seherlerde istiğfar edenlerin nefesleri sayısınca." },
      { arabic: "وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ تَسْلِيمًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ", turkish: "Ve onun âline ve ashabına çokça, güzel ve mübarek bir selâm eyle." },
    ],
  },
];

/**
 * Bugünün hizb'ini al (haftanın gününe göre)
 */
export function getTodaysHizb(): DelailHizb {
  const dayIndex = new Date().getDay(); // 0=Pazar … 6=Cumartesi
  // Pazartesi'den başlayacak şekilde düzenle
  const hizbIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DELAIL_HIZBS[hizbIndex];
}

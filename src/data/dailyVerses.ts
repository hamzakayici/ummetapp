// Günlük Ayet Koleksiyonu — 366 günlük (artık yıl dahil)
// Her gün farklı bir ayet gösterilir

export type DailyVerse = {
  surah: string;      // Sure adı (Türkçe)
  surahAr: string;    // Sure adı (Arapça)
  ayah: number;       // Ayet numarası
  arabic: string;     // Arapça metin
  turkish: string;    // Türkçe meal
  reference: string;  // Referans
};

export const DAILY_VERSES: DailyVerse[] = [
  { surah: "Fâtiha", surahAr: "الفاتحة", ayah: 1, arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", turkish: "Rahmân ve Rahîm olan Allah'ın adıyla.", reference: "1:1" },
  { surah: "Bakara", surahAr: "البقرة", ayah: 286, arabic: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", turkish: "Allah, hiçbir kimseyi gücünün yetmediği bir şeyle yükümlü kılmaz.", reference: "2:286" },
  { surah: "Bakara", surahAr: "البقرة", ayah: 152, arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", turkish: "Öyleyse siz beni anın ki ben de sizi anayım. Bana şükredin, nankörlük etmeyin.", reference: "2:152" },
  { surah: "Bakara", surahAr: "البقرة", ayah: 255, arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", turkish: "Allah, O'ndan başka ilâh yoktur. O, Hay ve Kayyûm'dur.", reference: "2:255" },
  { surah: "Bakara", surahAr: "البقرة", ayah: 186, arabic: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", turkish: "Kullarım sana beni sorduğunda, muhakkak ben çok yakınım.", reference: "2:186" },
  { surah: "Âl-i İmrân", surahAr: "آل عمران", ayah: 139, arabic: "وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ", turkish: "Gevşemeyin, üzülmeyin; eğer iman ediyorsanız üstün olan sizsiniz.", reference: "3:139" },
  { surah: "Âl-i İmrân", surahAr: "آل عمران", ayah: 159, arabic: "فَتَوَكَّلْ عَلَى اللَّهِ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ", turkish: "Allah'a tevekkül et. Çünkü Allah, tevekkül edenleri sever.", reference: "3:159" },
  { surah: "Nisâ", surahAr: "النساء", ayah: 29, arabic: "وَلَا تَقْتُلُوا أَنفُسَكُمْ إِنَّ اللَّهَ كَانَ بِكُمْ رَحِيمًا", turkish: "Kendinizi öldürmeyin. Şüphesiz Allah size karşı çok merhametlidir.", reference: "4:29" },
  { surah: "Mâide", surahAr: "المائدة", ayah: 2, arabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى", turkish: "İyilik ve takva üzerinde yardımlaşın.", reference: "5:2" },
  { surah: "En'âm", surahAr: "الأنعام", ayah: 59, arabic: "وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا يَعْلَمُهَا إِلَّا هُوَ", turkish: "Gaybın anahtarları O'nun katındadır, onları ancak O bilir.", reference: "6:59" },
  { surah: "A'râf", surahAr: "الأعراف", ayah: 56, arabic: "وَادْعُوهُ خَوْفًا وَطَمَعًا إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ", turkish: "O'na korku ve ümit ile dua edin. Allah'ın rahmeti iyilik edenlere yakındır.", reference: "7:56" },
  { surah: "Enfâl", surahAr: "الأنفال", ayah: 46, arabic: "وَاصْبِرُوا إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", turkish: "Sabredin. Çünkü Allah sabredenlerle beraberdir.", reference: "8:46" },
  { surah: "Tevbe", surahAr: "التوبة", ayah: 51, arabic: "قُل لَّن يُصِيبَنَا إِلَّا مَا كَتَبَ اللَّهُ لَنَا", turkish: "De ki: Allah'ın bizim için yazdığından başkası bize asla erişmez.", reference: "9:51" },
  { surah: "Yûnus", surahAr: "يونس", ayah: 62, arabic: "أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ", turkish: "Bilesiniz ki, Allah'ın dostlarına korku yoktur ve onlar üzülmeyeceklerdir.", reference: "10:62" },
  { surah: "Hûd", surahAr: "هود", ayah: 88, arabic: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ", turkish: "Başarım ancak Allah'ın yardımı iledir. O'na tevekkül ettim, O'na yöneliyorum.", reference: "11:88" },
  { surah: "Yûsuf", surahAr: "يوسف", ayah: 87, arabic: "لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ", turkish: "Allah'ın rahmetinden ümit kesmeyin. Çünkü inkârcı toplumdan başkası Allah'ın rahmetinden ümit kesmez.", reference: "12:87" },
  { surah: "Ra'd", surahAr: "الرعد", ayah: 28, arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", turkish: "Bilesiniz ki, kalpler ancak Allah'ı anmakla huzur bulur.", reference: "13:28" },
  { surah: "İbrâhîm", surahAr: "ابراهيم", ayah: 7, arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", turkish: "Andolsun, eğer şükrederseniz elbette size nimetimi artırırım.", reference: "14:7" },
  { surah: "Hicr", surahAr: "الحجر", ayah: 56, arabic: "وَمَن يَقْنَطُ مِن رَّحْمَةِ رَبِّهِ إِلَّا الضَّالُّونَ", turkish: "Rabbinin rahmetinden sapıklardan başka kim ümit keser!", reference: "15:56" },
  { surah: "Nahl", surahAr: "النحل", ayah: 97, arabic: "مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَى وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً", turkish: "Erkek olsun kadın olsun, kim mümin olarak iyi iş yaparsa, onu güzel bir hayatla yaşatırız.", reference: "16:97" },
  { surah: "İsrâ", surahAr: "الإسراء", ayah: 23, arabic: "وَبِالْوَالِدَيْنِ إِحْسَانًا", turkish: "Ana-babaya iyilik edin.", reference: "17:23" },
  { surah: "Kehf", surahAr: "الكهف", ayah: 10, arabic: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا", turkish: "Rabbimiz! Bize katından bir rahmet ver ve bize işimizde bir kurtuluş yolu hazırla.", reference: "18:10" },
  { surah: "Meryem", surahAr: "مريم", ayah: 96, arabic: "إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ سَيَجْعَلُ لَهُمُ الرَّحْمَنُ وُدًّا", turkish: "İman edip salih amel işleyenlere Rahmân bir sevgi yaratacaktır.", reference: "19:96" },
  { surah: "Tâ-Hâ", surahAr: "طه", ayah: 114, arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", turkish: "Ve de ki: Rabbim! İlmimi artır.", reference: "20:114" },
  { surah: "Enbiyâ", surahAr: "الأنبياء", ayah: 87, arabic: "لَّا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", turkish: "Senden başka ilâh yoktur. Seni tenzih ederim. Ben gerçekten zalimlerden oldum.", reference: "21:87" },
  { surah: "Hac", surahAr: "الحج", ayah: 77, arabic: "وَافْعَلُوا الْخَيْرَ لَعَلَّكُمْ تُفْلِحُونَ", turkish: "Hayır yapın ki kurtuluşa eresiniz.", reference: "22:77" },
  { surah: "Mü'minûn", surahAr: "المؤمنون", ayah: 1, arabic: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ", turkish: "Gerçekten müminler kurtuluşa ermiştir.", reference: "23:1" },
  { surah: "Nûr", surahAr: "النور", ayah: 35, arabic: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", turkish: "Allah, göklerin ve yerin nûrudur.", reference: "24:35" },
  { surah: "Furkân", surahAr: "الفرقان", ayah: 74, arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ", turkish: "Rabbimiz! Bize eşlerimizden ve çocuklarımızdan göz aydınlığı bağışla.", reference: "25:74" },
  { surah: "Kasas", surahAr: "القصص", ayah: 24, arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", turkish: "Rabbim! Doğrusu bana indireceğin her hayra muhtacım.", reference: "28:24" },
  { surah: "Ankebût", surahAr: "العنكبوت", ayah: 69, arabic: "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا", turkish: "Bizim uğrumuzda cihat edenleri yollarımıza iletiriz.", reference: "29:69" },
  { surah: "Lokmân", surahAr: "لقمان", ayah: 17, arabic: "وَاصْبِرْ عَلَى مَا أَصَابَكَ إِنَّ ذَلِكَ مِنْ عَزْمِ الْأُمُورِ", turkish: "Başına gelenlere sabret. Doğrusu bunlar, azmedilmeye değer işlerdir.", reference: "31:17" },
  { surah: "Ahzâb", surahAr: "الأحزاب", ayah: 56, arabic: "إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ", turkish: "Allah ve melekleri Peygamber'e salât ederler.", reference: "33:56" },
  { surah: "Yâsîn", surahAr: "يس", ayah: 58, arabic: "سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ", turkish: "Merhametli Rabb'den bir söz olarak: Selâm!", reference: "36:58" },
  { surah: "Zümer", surahAr: "الزمر", ayah: 53, arabic: "يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", turkish: "Ey kendilerine kötülük edip aşırı giden kullarım! Allah'ın rahmetinden ümidinizi kesmeyin.", reference: "39:53" },
  { surah: "Mü'min", surahAr: "غافر", ayah: 60, arabic: "ادْعُونِي أَسْتَجِبْ لَكُمْ", turkish: "Bana dua edin, kabul edeyim.", reference: "40:60" },
  { surah: "Şûrâ", surahAr: "الشورى", ayah: 30, arabic: "وَمَا أَصَابَكُم مِّن مُّصِيبَةٍ فَبِمَا كَسَبَتْ أَيْدِيكُمْ وَيَعْفُو عَن كَثِيرٍ", turkish: "Başınıza gelen her musibet, kendi ellerinizin kazandığı yüzündendir. O, birçoğunu da bağışlar.", reference: "42:30" },
  { surah: "Muhammed", surahAr: "محمد", ayah: 7, arabic: "إِن تَنصُرُوا اللَّهَ يَنصُرْكُمْ وَيُثَبِّتْ أَقْدَامَكُمْ", turkish: "Eğer siz Allah'a yardım ederseniz, O da size yardım eder ve ayaklarınızı sabit kılar.", reference: "47:7" },
  { surah: "Fetih", surahAr: "الفتح", ayah: 29, arabic: "مُّحَمَّدٌ رَّسُولُ اللَّهِ", turkish: "Muhammed, Allah'ın Resûlüdür.", reference: "48:29" },
  { surah: "Hucurât", surahAr: "الحجرات", ayah: 13, arabic: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ", turkish: "Allah katında en değerliniz, en çok takva sahibi olanınızdır.", reference: "49:13" },
  { surah: "Necm", surahAr: "النجم", ayah: 39, arabic: "وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَى", turkish: "İnsan için ancak çalıştığının karşılığı vardır.", reference: "53:39" },
  { surah: "Rahmân", surahAr: "الرحمن", ayah: 13, arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", turkish: "Öyleyse Rabbinizin hangi nimetlerini yalanlarsınız?", reference: "55:13" },
  { surah: "Hadîd", surahAr: "الحديد", ayah: 4, arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ وَاللَّهُ بِمَا تَعْمَلُونَ بَصِيرٌ", turkish: "Nerede olursanız olun, O sizinle beraberdir.", reference: "57:4" },
  { surah: "Haşr", surahAr: "الحشر", ayah: 22, arabic: "هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُوَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ هُوَ الرَّحْمَنُ الرَّحِيمُ", turkish: "O, öyle Allah'tır ki O'ndan başka ilâh yoktur. Görülmeyeni ve görüleni bilendir. O, Rahmân ve Rahîm'dir.", reference: "59:22" },
  { surah: "Talâk", surahAr: "الطلاق", ayah: 3, arabic: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", turkish: "Kim Allah'a tevekkül ederse, O ona yeter.", reference: "65:3" },
  { surah: "Mülk", surahAr: "الملك", ayah: 1, arabic: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", turkish: "Mülk elinde bulunan Allah yücedir. O, her şeye hakkıyla gücü yetendir.", reference: "67:1" },
  { surah: "Kalem", surahAr: "القلم", ayah: 4, arabic: "وَإِنَّكَ لَعَلَى خُلُقٍ عَظِيمٍ", turkish: "Şüphesiz sen büyük bir ahlâk üzerindesin.", reference: "68:4" },
  { surah: "Müzzemmil", surahAr: "المزمل", ayah: 8, arabic: "وَاذْكُرِ اسْمَ رَبِّكَ وَتَبَتَّلْ إِلَيْهِ تَبْتِيلًا", turkish: "Rabbinin adını an ve bütün varlığınla O'na yönel.", reference: "73:8" },
  { surah: "İnsân", surahAr: "الانسان", ayah: 9, arabic: "إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ لَا نُرِيدُ مِنكُمْ جَزَاءً وَلَا شُكُورًا", turkish: "Biz sizi ancak Allah rızası için doyuruyoruz. Sizden ne bir karşılık ne de teşekkür istiyoruz.", reference: "76:9" },
  { surah: "Nebe'", surahAr: "النبأ", ayah: 38, arabic: "رَّبِّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا الرَّحْمَنِ", turkish: "Göklerin, yerin ve ikisi arasındakilerin Rabbi, Rahmân.", reference: "78:38" },
  { surah: "İnşirâh", surahAr: "الشرح", ayah: 5, arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", turkish: "Muhakkak zorlukla beraber kolaylık vardır.", reference: "94:5" },
  { surah: "İnşirâh", surahAr: "الشرح", ayah: 6, arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", turkish: "Gerçekten zorlukla beraber kolaylık vardır.", reference: "94:6" },
  { surah: "Tîn", surahAr: "التين", ayah: 4, arabic: "لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ", turkish: "Biz insanı en güzel biçimde yarattık.", reference: "95:4" },
  { surah: "Alak", surahAr: "العلق", ayah: 1, arabic: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", turkish: "Yaratan Rabbinin adıyla oku.", reference: "96:1" },
  { surah: "Kadr", surahAr: "القدر", ayah: 1, arabic: "إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ", turkish: "Biz onu Kadir gecesinde indirdik.", reference: "97:1" },
  { surah: "Zilzâl", surahAr: "الزلزلة", ayah: 7, arabic: "فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", turkish: "Kim zerre ağırlığınca hayır işlerse onu görür.", reference: "99:7" },
  { surah: "Asr", surahAr: "العصر", ayah: 1, arabic: "وَالْعَصْرِ ★ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ", turkish: "Asra yemin ederim ki, insan gerçekten ziyan içindedir.", reference: "103:1-2" },
  { surah: "Kevser", surahAr: "الكوثر", ayah: 1, arabic: "إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ", turkish: "Kuşkusuz biz sana Kevser'i verdik.", reference: "108:1" },
  { surah: "İhlâs", surahAr: "الإخلاص", ayah: 1, arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", turkish: "De ki: O, Allah'tır, bir tektir.", reference: "112:1" },
  { surah: "Felak", surahAr: "الفلق", ayah: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ", turkish: "De ki: Sabahın Rabbine sığınırım.", reference: "113:1" },
  { surah: "Nâs", surahAr: "الناس", ayah: 1, arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ", turkish: "De ki: İnsanların Rabbine sığınırım.", reference: "114:1" },
  { surah: "Bakara", surahAr: "البقرة", ayah: 45, arabic: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", turkish: "Sabır ve namazla yardım isteyin.", reference: "2:45" },
  { surah: "Bakara", surahAr: "البقرة", ayah: 153, arabic: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", turkish: "Ey iman edenler! Sabır ve namazla yardım isteyin. Allah sabredenlerle beraberdir.", reference: "2:153" },
  { surah: "Bakara", surahAr: "البقرة", ayah: 201, arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", turkish: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver. Bizi ateş azabından koru.", reference: "2:201" },
];

/**
 * Bugünün ayetini al — yılın gününe göre döner
 */
export function getDailyVerse(): DailyVerse {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

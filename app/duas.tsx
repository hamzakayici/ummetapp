import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../src/utils/haptics";

type Dua = { id: number; title: string; arabic: string; tr: string; source?: string };
type DuaCategory = { category: string; icon: string; color: string; items: Dua[] };

const FAVS_KEY = "@ummet_dua_favs";

const DUAS: DuaCategory[] = [
  {
    category: "Sabah & Akşam",
    icon: "weather-sunset",
    color: "#F97316",
    items: [
      { id: 1, title: "Sabah Duası", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا شَرِيكَ لَهُ", tr: "Sabaha eriştik, mülk de Allah'ın olarak sabaha erişti. Hamd Allah'a mahsustur.", source: "Müslim" },
      { id: 2, title: "Akşam Duası", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا شَرِيكَ لَهُ", tr: "Akşama eriştik, mülk de Allah'ın olarak akşama erişti. Hamd Allah'a mahsustur.", source: "Müslim" },
      { id: 3, title: "Uyumadan Önce", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", tr: "Allah'ım! Senin adınla ölür ve dirilirim.", source: "Buhârî" },
      { id: 4, title: "Uyanınca", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", tr: "Bizi öldürdükten sonra dirilten Allah'a hamd olsun. Dönüş O'nadır.", source: "Buhârî" },
      { id: 5, title: "Sabah Zikri", arabic: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ", tr: "İslam fıtratı üzere, ihlas kelimesi üzere sabahladık.", source: "Ahmed" },
      { id: 6, title: "Akşam Zikri", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", tr: "Allah'ın eksiksiz kelimelerine sığınırım, yarattığı her şeyin şerrinden.", source: "Müslim" },
      { id: 7, title: "Koruma Duası", arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", tr: "O Allah ki, ismiyle birlikte ne yerde ne gökte hiçbir şey zarar veremez.", source: "Tirmizî" },
    ],
  },
  {
    category: "Namaz Duaları",
    icon: "mosque",
    color: "#D4AF37",
    items: [
      { id: 10, title: "Sübhaneke", arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ", tr: "Allah'ım! Sen her türlü noksanlıktan münezzehsin. Seni hamd ile tesbih ederim." },
      { id: 11, title: "Ettehiyyatü", arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ", tr: "Bütün tahiyyat, salavat ve tayyibat Allah'a mahsustur. Selam sana ey Nebi!" },
      { id: 12, title: "Allahümme Salli", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ", tr: "Allah'ım! İbrahim'e ve ailesine rahmet ettiğin gibi Muhammed'e ve ailesine de rahmet et." },
      { id: 13, title: "Allahümme Bârik", arabic: "اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ", tr: "Allah'ım! İbrahim'e ve ailesine bereket verdiğin gibi Muhammed'e ve ailesine de bereket ver." },
      { id: 14, title: "Rabbenâ Âtinâ", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", tr: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver. Bizi ateşin azabından koru.", source: "Bakara 201" },
      { id: 15, title: "Rabbenâ Lâ Tüzağ", arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا", tr: "Rabbimiz! Unutur ya da yanılırsak bizi sorumlu tutma.", source: "Bakara 286" },
      { id: 16, title: "Kunut Duası", arabic: "اللَّهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ", tr: "Allah'ım! Senden yardım dileriz, mağfiret dileriz, sana iman ederiz, sana tevekkül ederiz." },
      { id: 17, title: "Rükûdan Kalkınca", arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ رَبَّنَا وَلَكَ الْحَمْدُ", tr: "Allah kendisine hamd edeni işitti. Rabbimiz! Hamd sana mahsustur." },
      { id: 18, title: "Secde Duası", arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى", tr: "Yüce Rabbimi her türlü eksiklikten tenzih ederim." },
    ],
  },
  {
    category: "Günlük Hayat",
    icon: "home-heart",
    color: "#10B981",
    items: [
      { id: 20, title: "Yemekten Önce", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", tr: "Allah'ın adıyla ve Allah'ın bereketine sığınarak.", source: "Tirmizî" },
      { id: 21, title: "Yemekten Sonra", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", tr: "Bizi yediren, içiren ve Müslümanlardan kılan Allah'a hamd olsun.", source: "Ebû Dâvûd" },
      { id: 22, title: "Eve Girerken", arabic: "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا", tr: "Allah'ın adıyla girdik, Allah'ın adıyla çıktık ve Rabbimiz Allah'a tevekkül ettik.", source: "Ebû Dâvûd" },
      { id: 23, title: "Evden Çıkarken", arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", tr: "Allah'ın adıyla, Allah'a tevekkül ettim. Güç ve kuvvet ancak Allah'tandır.", source: "Tirmizî" },
      { id: 24, title: "Yolculuk Duası", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ", tr: "Bunu bizim hizmetimize veren Allah münezzehtir. Biz Rabbimize döneceğiz.", source: "Zuhruf 13-14" },
      { id: 25, title: "Tuvalete Girerken", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ", tr: "Allah'ım! Erkek ve dişi şeytanlardan sana sığınırım.", source: "Buhârî" },
      { id: 26, title: "Tuvaletten Çıkınca", arabic: "غُفْرَانَكَ", tr: "Mağfiretini dilerim.", source: "Tirmizî" },
      { id: 27, title: "Abdest Alırken", arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", tr: "Rahmân ve Rahîm olan Allah'ın adıyla." },
      { id: 28, title: "Abdest Sonrası", arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", tr: "Şehadet ederim ki Allah'tan başka ilah yoktur ve Muhammed O'nun kulu ve elçisidir.", source: "Müslim" },
      { id: 29, title: "Ayna Bakarken", arabic: "اللَّهُمَّ كَمَا حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي", tr: "Allah'ım! Yaratılışımı güzel kıldığın gibi ahlakımı da güzelleştir.", source: "Ahmed" },
      { id: 30, title: "Yeni Elbise Giyerken", arabic: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ", tr: "Benim hiçbir güç ve kuvvetim olmaksızın bunu giydiren ve bana rızık olarak veren Allah'a hamd olsun.", source: "Tirmizî" },
    ],
  },
  {
    category: "İstiğfar & Tövbe",
    icon: "hand-heart",
    color: "#8B5CF6",
    items: [
      { id: 40, title: "Seyyidül İstiğfar", arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", tr: "Allah'ım! Rabbim sensin. Senden başka ilah yoktur. Beni yarattın. Ben senin kulunum. Gücüm yettiğince sana olan ahdime ve vaadime bağlıyım.", source: "Buhârî" },
      { id: 41, title: "İstiğfar", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ", tr: "Hayy ve Kayyûm olan, kendisinden başka ilah bulunmayan yüce Allah'tan mağfiret diliyorum.", source: "Tirmizî" },
      { id: 42, title: "Tövbe Duası", arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ", tr: "Rabbim! Beni bağışla ve tövbemi kabul et. Çünkü sen tövbeleri kabul eden ve merhamet edensin.", source: "Tirmizî" },
      { id: 43, title: "Günahtan Arınma", arabic: "اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ", tr: "Allah'ım! Günahlarımı su, kar ve dolu ile yıka.", source: "Buhârî" },
    ],
  },
  {
    category: "Şifa & Koruma",
    icon: "shield-cross",
    color: "#EF4444",
    items: [
      { id: 50, title: "Şifa Duası", arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِ أَنْتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا", tr: "Allah'ım! İnsanların Rabbi! Hastalığı gider, şifa ver. Şifa veren sensin. Senin şifandan başka şifa yoktur.", source: "Buhârî" },
      { id: 51, title: "Nazar Duası", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ", tr: "Her şeytandan, zararlı hayvanlardan ve nazar değdiren gözlerden Allah'ın eksiksiz kelimelerine sığınırım.", source: "Buhârî" },
      { id: 52, title: "Sıkıntı Duası", arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ", tr: "Senden başka ilah yoktur. Seni tenzih ederim. Ben zalimlerden oldum.", source: "Enbiyâ 87" },
      { id: 53, title: "Korku Duası", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ", tr: "Allah'ım! Gam, keder, acizlik, tembellik, korkaklık ve cimrilikten sana sığınırım.", source: "Buhârî" },
      { id: 54, title: "Göz Ağrısı Duası", arabic: "أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ", tr: "Hissettiğim ve korktuğum şeyin şerrinden, Allah'ın izzetine ve kudretine sığınırım.", source: "Müslim" },
      { id: 55, title: "Fırtına Duası", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا وَأَعُوذُ بِكَ مِنْ شَرِّهَا", tr: "Allah'ım! Bunun hayrını senden ister, şerrinden sana sığınırım.", source: "Müslim" },
    ],
  },
  {
    category: "Dua & Yakarış",
    icon: "hands-pray",
    color: "#3B82F6",
    items: [
      { id: 60, title: "Hayırlı İş", arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", tr: "Rabbim! Göğsümü genişlet ve işimi kolaylaştır.", source: "Tâhâ 25-26" },
      { id: 61, title: "İlim Duası", arabic: "رَبِّ زِدْنِي عِلْمًا", tr: "Rabbim! İlmimi artır.", source: "Tâhâ 114" },
      { id: 62, title: "Hidayet Duası", arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً", tr: "Rabbimiz! Bizi hidayete erdirdikten sonra kalplerimizi kaydırma ve bize katından bir rahmet bağışla.", source: "Âl-i İmrân 8" },
      { id: 63, title: "Sabır Duası", arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", tr: "Rabbimiz! Üzerimize sabır yağdır, ayaklarımızı sabit kıl.", source: "Bakara 250" },
      { id: 64, title: "Bereket Duası", arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", tr: "Allah'ım! Bize verdiğin rızıkta bereket ihsan et ve bizi cehennem azabından koru." },
      { id: 65, title: "Güzel Ahlak", arabic: "اللَّهُمَّ اهْدِنِي لأَحْسَنِ الأَخْلاقِ لا يَهْدِي لأَحْسَنِهَا إِلا أَنْتَ", tr: "Allah'ım! Beni en güzel ahlaka eriştir. O'na ancak sen eriştirebilirsin.", source: "Müslim" },
      { id: 66, title: "Cennet Duası", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ", tr: "Allah'ım! Senden cenneti dilerim ve cehennemden sana sığınırım.", source: "Ebû Dâvûd" },
    ],
  },
  {
    category: "Aile & Çocuk",
    icon: "account-heart",
    color: "#EC4899",
    items: [
      { id: 70, title: "Anne-Baba Duası", arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", tr: "Rabbim! Küçükken beni yetiştirdikleri gibi onlara merhamet et.", source: "İsrâ 24" },
      { id: 71, title: "Evlat Duası", arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ", tr: "Rabbimiz! Bize eşlerimizden ve çocuklarımızdan gözümüzü aydın edecekler bağışla.", source: "Furkan 74" },
      { id: 72, title: "Salih Evlat", arabic: "رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ", tr: "Rabbim! Bana salihlerden (çocuklar) bağışla.", source: "Sâffât 100" },
      { id: 73, title: "Hamile Duası", arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنْتَ خَيْرُ الْوَارِثِينَ", tr: "Rabbim! Beni yalnız bırakma. En hayırlı varis sensin.", source: "Enbiyâ 89" },
      { id: 74, title: "Evlilik Duası", arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", tr: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver.", source: "Bakara 201" },
    ],
  },
  {
    category: "Rızık & Bereket",
    icon: "sprout",
    color: "#84CC16",
    items: [
      { id: 80, title: "Rızık Duası", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا", tr: "Allah'ım! Senden faydalı ilim, helal rızık ve makbul amel isterim.", source: "İbn Mâce" },
      { id: 81, title: "Borç Duası", arabic: "اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ", tr: "Allah'ım! Haramından uzak tutarak helalinle beni zengin kıl. Lütfunla beni senden başkalarından müstağni kıl.", source: "Tirmizî" },
      { id: 82, title: "İş Duası", arabic: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", tr: "Rabbim! Bana indireceğin her hayra muhtacım.", source: "Kasas 24" },
      { id: 83, title: "Fakirlik Duası", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْفَقْرِ وَالْقِلَّةِ", tr: "Allah'ım! Fakirlikten ve azlıktan sana sığınırım.", source: "Nesâî" },
    ],
  },
  {
    category: "Tesbih & Zikir",
    icon: "counter",
    color: "#EAB308",
    items: [
      { id: 90, title: "Sübhanallah", arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ", tr: "Allah'ı hamd ile tesbih ederim. Yüce Allah'ı tenzih ederim.", source: "Buhârî" },
      { id: 91, title: "Lâ Havle", arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", tr: "Güç ve kuvvet ancak Allah'tandır.", source: "Buhârî" },
      { id: 92, title: "Hasbünallah", arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", tr: "Allah bize yeter, O ne güzel vekildir.", source: "Buhârî" },
      { id: 93, title: "Kelime-i Tevhid", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", tr: "Allah'tan başka ilah yoktur. O tektir, ortağı yoktur. Mülk O'nundur, hamd O'nadır. O her şeye kadirdir.", source: "Buhârî" },
      { id: 94, title: "Salavat", arabic: "اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِ سَيِّدِنَا مُحَمَّدٍ", tr: "Allah'ım! Efendimiz Muhammed'e ve ailesine salat eyle." },
      { id: 95, title: "Besmele", arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", tr: "Rahmân ve Rahîm olan Allah'ın adıyla." },
    ],
  },
  {
    category: "Cenaze & Ahiret",
    icon: "candelabra",
    color: "#6B7280",
    items: [
      { id: 100, title: "Cenaze Duası", arabic: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ", tr: "Allah'ım! Onu bağışla, merhamet et, afiyet ver ve affeyle.", source: "Müslim" },
      { id: 101, title: "Kabir Ziyareti", arabic: "السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ", tr: "Ey bu kabirlerdeki mümin ve Müslümanlar! Size selam olsun.", source: "Müslim" },
      { id: 102, title: "Ahiret Duası", arabic: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا", tr: "Rabbimiz! Cehennem azabını bizden uzaklaştır. Onun azabı sürekli bir helaktir.", source: "Furkan 65" },
    ],
  },
];

export default function DuasScreen() {
  const insets = useSafeAreaInsets();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(DUAS[0].category);
  const [expandedDua, setExpandedDua] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [favIds, setFavIds] = useState<number[]>([]);
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const d = await AsyncStorage.getItem(FAVS_KEY);
        if (d) {
          const parsed = JSON.parse(d);
          if (Array.isArray(parsed)) setFavIds(parsed);
        }
      } catch {}
    })();
  }, []);

  const toggleFav = useCallback(async (id: number) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    const updated = favIds.includes(id) ? favIds.filter((f) => f !== id) : [...favIds, id];
    setFavIds(updated);
    await AsyncStorage.setItem(FAVS_KEY, JSON.stringify(updated));
  }, [favIds]);

  const totalDuas = DUAS.reduce((s, c) => s + c.items.length, 0);

  const filteredCategories = useMemo(() => {
    if (!search.trim() && !showFavsOnly) return DUAS;
    const q = search.toLowerCase();
    return DUAS.map((cat) => ({
      ...cat,
      items: cat.items.filter((d) => {
        const matchSearch = !q || d.title.toLowerCase().includes(q) || d.tr.toLowerCase().includes(q);
        const matchFav = !showFavsOnly || favIds.includes(d.id);
        return matchSearch && matchFav;
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [search, showFavsOnly, favIds]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#1B4332", "#0A0F14"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 14, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>Dua Kitabı</Text>
            <Text style={{ color: "rgba(212,175,55,0.6)", fontSize: 13, marginTop: 2 }}>{totalDuas} dua · {DUAS.length} kategori</Text>
          </View>
          <TouchableOpacity onPress={() => setShowFavsOnly(!showFavsOnly)}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: showFavsOnly ? "rgba(229,57,53,0.15)" : "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={showFavsOnly ? "heart" : "heart-outline"} size={20} color={showFavsOnly ? "#E53935" : "rgba(255,255,255,0.6)"} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Arama */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, backgroundColor: "rgba(10,24,18,0.8)", borderRadius: 12, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}>
          <Ionicons name="search" size={16} color="#6B7280" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Dua ara..."
            placeholderTextColor="#6B7280"
            style={{ flex: 1, color: "#FFFFFF", fontSize: 14, marginLeft: 8 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {filteredCategories.map((category, catIndex) => (
          <Animated.View key={category.category} entering={FadeInDown.delay(catIndex * 60).springify()}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
              style={{ marginHorizontal: 16, marginTop: 12 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: expandedCategory === category.category ? `${category.color}15` : "rgba(10,24,18,0.8)", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${category.color}18`, alignItems: "center", justifyContent: "center" }}>
                    <MaterialCommunityIcons name={category.icon as any} size={16} color={category.color} />
                  </View>
                  <Text style={{ color: expandedCategory === category.category ? category.color : "#FFFFFF", fontSize: 15, fontWeight: "700", marginLeft: 10 }}>
                    {category.category}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: "#6B7280", fontSize: 12, marginRight: 6 }}>{category.items.length}</Text>
                  <Ionicons name={expandedCategory === category.category ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
                </View>
              </View>
            </TouchableOpacity>

            {expandedCategory === category.category && category.items.map((dua) => (
              <TouchableOpacity
                key={dua.id}
                activeOpacity={0.8}
                onPress={() => setExpandedDua(expandedDua === dua.id ? null : dua.id)}
              >
                <View style={{ marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 14, backgroundColor: expandedDua === dua.id ? "rgba(212,175,55,0.06)" : "rgba(10,24,18,0.6)", borderWidth: 1, borderColor: expandedDua === dua.id ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <MaterialCommunityIcons name="hands-pray" size={14} color="#D4AF37" />
                      <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600", marginLeft: 8, flex: 1 }}>{dua.title}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <TouchableOpacity onPress={() => toggleFav(dua.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name={favIds.includes(dua.id) ? "heart" : "heart-outline"} size={16} color={favIds.includes(dua.id) ? "#E53935" : "#6B7280"} />
                      </TouchableOpacity>
                      <Ionicons name={expandedDua === dua.id ? "chevron-up" : "chevron-down"} size={14} color="#6B7280" />
                    </View>
                  </View>

                  {expandedDua === dua.id && (
                    <View style={{ marginTop: 12 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 20, textAlign: "right", lineHeight: 36, fontFamily: "NotoNaskhArabic_700Bold" }}>
                        {dua.arabic}
                      </Text>
                      <View style={{ height: 1, backgroundColor: "rgba(27,67,50,0.15)", marginVertical: 10 }} />
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 22 }}>{dua.tr}</Text>
                      {dua.source && (
                        <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 8, fontWeight: "600" }}>{dua.source}</Text>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ))}

        {filteredCategories.length === 0 && (
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <MaterialCommunityIcons name="book-search" size={48} color="#6B7280" />
            <Text style={{ color: "#6B7280", fontSize: 15, marginTop: 12 }}>
              {showFavsOnly ? "Henüz favori dua eklenmemiş" : "Dua bulunamadı"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

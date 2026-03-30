// Supabase Edge Function — send-daily-verse
// Tüm kayıtlı cihazlara günlük ayet push bildirimi gönderir
// Deploy: supabase functions deploy send-daily-verse --project-ref txvqxjrjbmjwhgddztma

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ═══ Günlük Ayet Verileri (dailyVerses.ts ile senkron) ═══
const DAILY_VERSES = [
  { surah: "Fâtiha", reference: "1:1", turkish: "Rahmân ve Rahîm olan Allah'ın adıyla." },
  { surah: "Bakara", reference: "2:286", turkish: "Allah, hiçbir kimseyi gücünün yetmediği bir şeyle yükümlü kılmaz." },
  { surah: "Bakara", reference: "2:152", turkish: "Öyleyse siz beni anın ki ben de sizi anayım. Bana şükredin, nankörlük etmeyin." },
  { surah: "Bakara", reference: "2:255", turkish: "Allah, O'ndan başka ilâh yoktur. O, Hay ve Kayyûm'dur." },
  { surah: "Bakara", reference: "2:186", turkish: "Kullarım sana beni sorduğunda, muhakkak ben çok yakınım." },
  { surah: "Âl-i İmrân", reference: "3:139", turkish: "Gevşemeyin, üzülmeyin; eğer iman ediyorsanız üstün olan sizsiniz." },
  { surah: "Âl-i İmrân", reference: "3:159", turkish: "Allah'a tevekkül et. Çünkü Allah, tevekkül edenleri sever." },
  { surah: "Nisâ", reference: "4:29", turkish: "Kendinizi öldürmeyin. Şüphesiz Allah size karşı çok merhametlidir." },
  { surah: "Mâide", reference: "5:2", turkish: "İyilik ve takva üzerinde yardımlaşın." },
  { surah: "En'âm", reference: "6:59", turkish: "Gaybın anahtarları O'nun katındadır, onları ancak O bilir." },
  { surah: "A'râf", reference: "7:56", turkish: "O'na korku ve ümit ile dua edin. Allah'ın rahmeti iyilik edenlere yakındır." },
  { surah: "Enfâl", reference: "8:46", turkish: "Sabredin. Çünkü Allah sabredenlerle beraberdir." },
  { surah: "Tevbe", reference: "9:51", turkish: "De ki: Allah'ın bizim için yazdığından başkası bize asla erişmez." },
  { surah: "Yûnus", reference: "10:62", turkish: "Bilesiniz ki, Allah'ın dostlarına korku yoktur ve onlar üzülmeyeceklerdir." },
  { surah: "Hûd", reference: "11:88", turkish: "Başarım ancak Allah'ın yardımı iledir. O'na tevekkül ettim, O'na yöneliyorum." },
  { surah: "Yûsuf", reference: "12:87", turkish: "Allah'ın rahmetinden ümit kesmeyin. Çünkü inkârcı toplumdan başkası Allah'ın rahmetinden ümit kesmez." },
  { surah: "Ra'd", reference: "13:28", turkish: "Bilesiniz ki, kalpler ancak Allah'ı anmakla huzur bulur." },
  { surah: "İbrâhîm", reference: "14:7", turkish: "Andolsun, eğer şükrederseniz elbette size nimetimi artırırım." },
  { surah: "Hicr", reference: "15:56", turkish: "Rabbinin rahmetinden sapıklardan başka kim ümit keser!" },
  { surah: "Nahl", reference: "16:97", turkish: "Erkek olsun kadın olsun, kim mümin olarak iyi iş yaparsa, onu güzel bir hayatla yaşatırız." },
  { surah: "İsrâ", reference: "17:23", turkish: "Ana-babaya iyilik edin." },
  { surah: "Kehf", reference: "18:10", turkish: "Rabbimiz! Bize katından bir rahmet ver ve bize işimizde bir kurtuluş yolu hazırla." },
  { surah: "Meryem", reference: "19:96", turkish: "İman edip salih amel işleyenlere Rahmân bir sevgi yaratacaktır." },
  { surah: "Tâ-Hâ", reference: "20:114", turkish: "Ve de ki: Rabbim! İlmimi artır." },
  { surah: "Enbiyâ", reference: "21:87", turkish: "Senden başka ilâh yoktur. Seni tenzih ederim. Ben gerçekten zalimlerden oldum." },
  { surah: "Hac", reference: "22:77", turkish: "Hayır yapın ki kurtuluşa eresiniz." },
  { surah: "Mü'minûn", reference: "23:1", turkish: "Gerçekten müminler kurtuluşa ermiştir." },
  { surah: "Nûr", reference: "24:35", turkish: "Allah, göklerin ve yerin nûrudur." },
  { surah: "Furkân", reference: "25:74", turkish: "Rabbimiz! Bize eşlerimizden ve çocuklarımızdan göz aydınlığı bağışla." },
  { surah: "Kasas", reference: "28:24", turkish: "Rabbim! Doğrusu bana indireceğin her hayra muhtacım." },
  { surah: "Ankebût", reference: "29:69", turkish: "Bizim uğrumuzda cihat edenleri yollarımıza iletiriz." },
  { surah: "Lokmân", reference: "31:17", turkish: "Başına gelenlere sabret. Doğrusu bunlar, azmedilmeye değer işlerdir." },
  { surah: "Ahzâb", reference: "33:56", turkish: "Allah ve melekleri Peygamber'e salât ederler." },
  { surah: "Yâsîn", reference: "36:58", turkish: "Merhametli Rabb'den bir söz olarak: Selâm!" },
  { surah: "Zümer", reference: "39:53", turkish: "Ey kendilerine kötülük edip aşırı giden kullarım! Allah'ın rahmetinden ümidinizi kesmeyin." },
  { surah: "Mü'min", reference: "40:60", turkish: "Bana dua edin, kabul edeyim." },
  { surah: "Şûrâ", reference: "42:30", turkish: "Başınıza gelen her musibet, kendi ellerinizin kazandığı yüzündendir. O, birçoğunu da bağışlar." },
  { surah: "Muhammed", reference: "47:7", turkish: "Eğer siz Allah'a yardım ederseniz, O da size yardım eder ve ayaklarınızı sabit kılar." },
  { surah: "Fetih", reference: "48:29", turkish: "Muhammed, Allah'ın Resûlüdür." },
  { surah: "Hucurât", reference: "49:13", turkish: "Allah katında en değerliniz, en çok takva sahibi olanınızdır." },
  { surah: "Necm", reference: "53:39", turkish: "İnsan için ancak çalıştığının karşılığı vardır." },
  { surah: "Rahmân", reference: "55:13", turkish: "Öyleyse Rabbinizin hangi nimetlerini yalanlarsınız?" },
  { surah: "Hadîd", reference: "57:4", turkish: "Nerede olursanız olun, O sizinle beraberdir." },
  { surah: "Haşr", reference: "59:22", turkish: "O, öyle Allah'tır ki O'ndan başka ilâh yoktur. Görülmeyeni ve görüleni bilendir. O, Rahmân ve Rahîm'dir." },
  { surah: "Talâk", reference: "65:3", turkish: "Kim Allah'a tevekkül ederse, O ona yeter." },
  { surah: "Mülk", reference: "67:1", turkish: "Mülk elinde bulunan Allah yücedir. O, her şeye hakkıyla gücü yetendir." },
  { surah: "Kalem", reference: "68:4", turkish: "Şüphesiz sen büyük bir ahlâk üzerindesin." },
  { surah: "Müzzemmil", reference: "73:8", turkish: "Rabbinin adını an ve bütün varlığınla O'na yönel." },
  { surah: "İnsân", reference: "76:9", turkish: "Biz sizi ancak Allah rızası için doyuruyoruz. Sizden ne bir karşılık ne de teşekkür istiyoruz." },
  { surah: "Nebe'", reference: "78:38", turkish: "Göklerin, yerin ve ikisi arasındakilerin Rabbi, Rahmân." },
  { surah: "İnşirâh", reference: "94:5", turkish: "Muhakkak zorlukla beraber kolaylık vardır." },
  { surah: "İnşirâh", reference: "94:6", turkish: "Gerçekten zorlukla beraber kolaylık vardır." },
  { surah: "Tîn", reference: "95:4", turkish: "Biz insanı en güzel biçimde yarattık." },
  { surah: "Alak", reference: "96:1", turkish: "Yaratan Rabbinin adıyla oku." },
  { surah: "Kadr", reference: "97:1", turkish: "Biz onu Kadir gecesinde indirdik." },
  { surah: "Zilzâl", reference: "99:7", turkish: "Kim zerre ağırlığınca hayır işlerse onu görür." },
  { surah: "Asr", reference: "103:1-2", turkish: "Asra yemin ederim ki, insan gerçekten ziyan içindedir." },
  { surah: "Kevser", reference: "108:1", turkish: "Kuşkusuz biz sana Kevser'i verdik." },
  { surah: "İhlâs", reference: "112:1", turkish: "De ki: O, Allah'tır, bir tektir." },
  { surah: "Felak", reference: "113:1", turkish: "De ki: Sabahın Rabbine sığınırım." },
  { surah: "Nâs", reference: "114:1", turkish: "De ki: İnsanların Rabbine sığınırım." },
  { surah: "Bakara", reference: "2:45", turkish: "Sabır ve namazla yardım isteyin." },
  { surah: "Bakara", reference: "2:153", turkish: "Ey iman edenler! Sabır ve namazla yardım isteyin. Allah sabredenlerle beraberdir." },
  { surah: "Bakara", reference: "2:201", turkish: "Rabbimiz! Bize dünyada da iyilik ver, ahirette de iyilik ver. Bizi ateş azabından koru." },
];

function getDailyVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % DAILY_VERSES.length;
  return DAILY_VERSES[index];
}

// ═══ Expo Push API — toplu gönderim ═══
async function sendExpoPushNotifications(
  tokens: string[],
  title: string,
  body: string,
) {
  const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
  const BATCH_SIZE = 100;

  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const batch = tokens.slice(i, i + BATCH_SIZE);
    const messages = batch.map((token) => ({
      to: token,
      sound: "default",
      title,
      body,
      data: { type: "daily_verse" },
    }));

    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messages),
    });
  }
}

// ═══ Edge Function Handler ═══
Deno.serve(async (req) => {
  try {
    // Service role ile Supabase client oluştur
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Günün ayetini hesapla
    const verse = getDailyVerse();

    // 2. Tüm push token'ları çek
    const { data: tokenRows, error } = await supabase
      .from("push_tokens")
      .select("expo_push_token");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!tokenRows || tokenRows.length === 0) {
      return new Response(
        JSON.stringify({ message: "Kayıtlı token yok", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const tokens = tokenRows.map((r: { expo_push_token: string }) => r.expo_push_token);

    // 3. Push bildirim gönder — sadece Türkçe
    const title = `📖 Günün Ayeti — ${verse.surah} ${verse.reference}`;
    const body = verse.turkish;

    await sendExpoPushNotifications(tokens, title, body);

    return new Response(
      JSON.stringify({
        message: "Günün ayeti gönderildi",
        sent: tokens.length,
        verse: `${verse.surah} ${verse.reference}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});

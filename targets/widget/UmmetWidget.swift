import WidgetKit
import SwiftUI
import CoreLocation

// MARK: - Data Models
struct VerseInfo {
    let arabic: String
    let turkish: String
    let reference: String
}

struct PrayerInfo: Identifiable {
    let id = UUID()
    let name: String
    let time: String
}

// MARK: - Hardcoded Verses (day of year cycle)
let VERSES: [(ar: String, tr: String, ref: String)] = [
    ("بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ", "Rahmân ve Rahîm olan Allah'ın adıyla.", "Fâtiha 1:1"),
    ("لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا", "Allah, hiçbir kimseyi gücünün yetmediği bir şeyle yükümlü kılmaz.", "Bakara 2:286"),
    ("فَاذْكُرُونِي أَذْكُرْكُمْ", "Siz beni anın ki ben de sizi anayım.", "Bakara 2:152"),
    ("وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", "Kullarım sana beni sorduğunda, muhakkak ben çok yakınım.", "Bakara 2:186"),
    ("وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ", "Gevşemeyin, üzülmeyin; iman ediyorsanız üstün olan sizsiniz.", "Âl-i İmrân 3:139"),
    ("فَتَوَكَّلْ عَلَى اللَّهِ إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ", "Allah'a tevekkül et. Allah, tevekkül edenleri sever.", "Âl-i İmrân 3:159"),
    ("وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى", "İyilik ve takva üzerinde yardımlaşın.", "Mâide 5:2"),
    ("وَاصْبِرُوا إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "Sabredin. Allah sabredenlerle beraberdir.", "Enfâl 8:46"),
    ("لَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", "Allah'ın rahmetinden ümit kesmeyin.", "Yûsuf 12:87"),
    ("أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "Kalpler ancak Allah'ı anmakla huzur bulur.", "Ra'd 13:28"),
    ("لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ", "Eğer şükrederseniz elbette size nimetimi artırırım.", "İbrâhîm 14:7"),
    ("وَبِالْوَالِدَيْنِ إِحْسَانًا", "Ana-babaya iyilik edin.", "İsrâ 17:23"),
    ("وَقُل رَّبِّ زِدْنِي عِلْمًا", "Ve de ki: Rabbim! İlmimi artır.", "Tâ-Hâ 20:114"),
    ("لَّا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ", "Senden başka ilâh yoktur. Seni tenzih ederim.", "Enbiyâ 21:87"),
    ("وَافْعَلُوا الْخَيْرَ لَعَلَّكُمْ تُفْلِحُونَ", "Hayır yapın ki kurtuluşa eresiniz.", "Hac 22:77"),
    ("قَدْ أَفْلَحَ الْمُؤْمِنُونَ", "Gerçekten müminler kurtuluşa ermiştir.", "Mü'minûn 23:1"),
    ("اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ", "Allah, göklerin ve yerin nûrudur.", "Nûr 24:35"),
    ("رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", "Rabbim! Bana indireceğin her hayra muhtacım.", "Kasas 28:24"),
    ("وَاصْبِرْ عَلَى مَا أَصَابَكَ", "Başına gelenlere sabret.", "Lokmân 31:17"),
    ("سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ", "Merhametli Rabb'den bir söz olarak: Selâm!", "Yâsîn 36:58"),
    ("يَا عِبَادِيَ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", "Ey kullarım! Allah'ın rahmetinden ümidinizi kesmeyin.", "Zümer 39:53"),
    ("ادْعُونِي أَسْتَجِبْ لَكُمْ", "Bana dua edin, kabul edeyim.", "Mü'min 40:60"),
    ("إِن تَنصُرُوا اللَّهَ يَنصُرْكُمْ", "Allah'a yardım ederseniz, O da size yardım eder.", "Muhammed 47:7"),
    ("إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ", "Allah katında en değerliniz, en çok takva sahibi olanınızdır.", "Hucurât 49:13"),
    ("وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَى", "İnsan için ancak çalıştığının karşılığı vardır.", "Necm 53:39"),
    ("فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", "Rabbinizin hangi nimetlerini yalanlarsınız?", "Rahmân 55:13"),
    ("وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", "Nerede olursanız olun, O sizinle beraberdir.", "Hadîd 57:4"),
    ("وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", "Kim Allah'a tevekkül ederse, O ona yeter.", "Talâk 65:3"),
    ("تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ", "Mülk elinde bulunan Allah yücedir.", "Mülk 67:1"),
    ("فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", "Muhakkak zorlukla beraber kolaylık vardır.", "İnşirâh 94:5"),
    ("اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ", "Yaratan Rabbinin adıyla oku.", "Alak 96:1"),
    ("فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", "Kim zerre ağırlığınca hayır işlerse onu görür.", "Zilzâl 99:7"),
    ("قُلْ هُوَ اللَّهُ أَحَدٌ", "De ki: O, Allah'tır, bir tektir.", "İhlâs 112:1"),
]

func getDailyVerse() -> VerseInfo {
    let cal = Calendar.current
    let dayOfYear = cal.ordinality(of: .day, in: .year, for: .now) ?? 1
    let idx = (dayOfYear - 1) % VERSES.count
    let v = VERSES[idx]
    return VerseInfo(arabic: v.ar, turkish: v.tr, reference: v.ref)
}

// MARK: - Timeline Entry
struct UmmetEntry: TimelineEntry {
    let date: Date
    let verse: VerseInfo
    let prayers: [PrayerInfo]
    let nextPrayerName: String
    let nextPrayerTime: String
    let iftarTime: String
    let sahurTime: String
}

// MARK: - Provider
struct UmmetProvider: TimelineProvider {

    func placeholder(in context: Context) -> UmmetEntry {
        UmmetEntry(
            date: .now,
            verse: getDailyVerse(),
            prayers: [
                PrayerInfo(name: "İmsak", time: "05:45"),
                PrayerInfo(name: "Öğle", time: "13:00"),
                PrayerInfo(name: "İkindi", time: "16:10"),
                PrayerInfo(name: "Akşam", time: "18:30"),
                PrayerInfo(name: "Yatsı", time: "20:00"),
            ],
            nextPrayerName: "Öğle",
            nextPrayerTime: "13:00",
            iftarTime: "18:30",
            sahurTime: "05:30"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (UmmetEntry) -> ()) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<UmmetEntry>) -> ()) {
        // Namaz vakitlerini API'den çek
        fetchPrayerTimes { prayers in
            let verse = getDailyVerse()

            let cal = Calendar.current
            let comps = cal.dateComponents([.hour, .minute], from: .now)
            let nowMins = (comps.hour ?? 0) * 60 + (comps.minute ?? 0)

            var nextName = prayers.first?.name ?? "İmsak"
            var nextTime = prayers.first?.time ?? "05:45"

            for p in prayers {
                let parts = p.time.split(separator: ":").compactMap { Int($0) }
                if parts.count == 2, parts[0] * 60 + parts[1] > nowMins {
                    nextName = p.name
                    nextTime = p.time
                    break
                }
            }

            // İftar = Akşam (Maghrib), Sahur = İmsak (Fajr)
            var iftarT = ""
            var sahurT = ""
            for p in prayers {
                if p.name == "Akşam" { iftarT = p.time }
                if p.name == "İmsak" { sahurT = p.time }
            }

            let entry = UmmetEntry(
                date: .now,
                verse: verse,
                prayers: prayers,
                nextPrayerName: nextName,
                nextPrayerTime: nextTime,
                iftarTime: iftarT.isEmpty ? "18:30" : iftarT,
                sahurTime: sahurT.isEmpty ? "05:30" : sahurT
            )

            // Her 30 dakikada yenile
            let next = cal.date(byAdding: .minute, value: 30, to: .now)!
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }

    private func fetchPrayerTimes(completion: @escaping ([PrayerInfo]) -> Void) {
        // Konum al
        let locManager = CLLocationManager()
        let lat = locManager.location?.coordinate.latitude ?? 41.0082
        let lon = locManager.location?.coordinate.longitude ?? 28.9784

        let formatter = DateFormatter()
        formatter.dateFormat = "dd-MM-yyyy"
        let dateStr = formatter.string(from: .now)

        let urlStr = "https://api.aladhan.com/v1/timings/\(dateStr)?latitude=\(lat)&longitude=\(lon)&method=13&tune=2,2,1,1,1,0,1,1,0"
        guard let url = URL(string: urlStr) else {
            completion(fallbackPrayers())
            return
        }

        URLSession.shared.dataTask(with: url) { data, _, error in
            guard let data = data, error == nil else {
                completion(self.fallbackPrayers())
                return
            }

            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let dataObj = json["data"] as? [String: Any],
                   let timings = dataObj["timings"] as? [String: String] {

                    let nameMap: [(key: String, name: String)] = [
                        ("Fajr", "İmsak"),
                        ("Dhuhr", "Öğle"),
                        ("Asr", "İkindi"),
                        ("Maghrib", "Akşam"),
                        ("Isha", "Yatsı"),
                    ]

                    var prayers: [PrayerInfo] = []
                    for item in nameMap {
                        if let time = timings[item.key] {
                            // "(EET)" kısmını kaldır
                            let cleanTime = time.replacingOccurrences(of: "\\s*\\(.*\\)", with: "", options: .regularExpression)
                            prayers.append(PrayerInfo(name: item.name, time: cleanTime))
                        }
                    }

                    if !prayers.isEmpty {
                        completion(prayers)
                        return
                    }
                }
            } catch {}

            completion(self.fallbackPrayers())
        }.resume()
    }

    private func fallbackPrayers() -> [PrayerInfo] {
        [
            PrayerInfo(name: "İmsak", time: "05:45"),
            PrayerInfo(name: "Öğle", time: "13:00"),
            PrayerInfo(name: "İkindi", time: "16:10"),
            PrayerInfo(name: "Akşam", time: "18:30"),
            PrayerInfo(name: "Yatsı", time: "20:00"),
        ]
    }
}

// MARK: - Lock Screen Views

/// Günlük Ayet — kilit ekranı rectangular widget
struct VerseWidgetView: View {
    let entry: UmmetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.verse.arabic)
                .font(.system(size: 16, weight: .bold))
                .minimumScaleFactor(0.7)
                .lineLimit(1)

            Text(entry.verse.turkish)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(.secondary)
                .lineLimit(2)
                .minimumScaleFactor(0.8)

            Text(entry.verse.reference)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Namaz Vakitleri — kilit ekranı rectangular widget
struct PrayerWidgetView: View {
    let entry: UmmetEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(entry.nextPrayerName)
                    .font(.system(size: 15, weight: .bold))
                Spacer()
                Text(entry.nextPrayerTime)
                    .font(.system(size: 22, weight: .heavy, design: .rounded))
            }

            if !entry.prayers.isEmpty {
                HStack(spacing: 4) {
                    ForEach(Array(entry.prayers.prefix(5).enumerated()), id: \.offset) { idx, p in
                        if idx > 0 {
                            Text("·").font(.system(size: 11)).foregroundStyle(.tertiary)
                        }
                        VStack(spacing: 0) {
                            Text(String(p.name.prefix(3)))
                                .font(.system(size: 10, weight: .medium))
                                .foregroundStyle(.tertiary)
                            Text(p.time)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// İftar & Sahur — kilit ekranı rectangular widget
struct IftarSahurWidgetView: View {
    let entry: UmmetEntry

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("İftar")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.secondary)
                Text(entry.iftarTime)
                    .font(.system(size: 24, weight: .heavy, design: .rounded))
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("Sahur")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.secondary)
                Text(entry.sahurTime)
                    .font(.system(size: 24, weight: .heavy, design: .rounded))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Widget Definitions

struct DailyVerseWidget: Widget {
    let kind = "DailyVerseWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: UmmetProvider()) { entry in
            if #available(iOS 17.0, *) {
                VerseWidgetView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                VerseWidgetView(entry: entry)
                    .padding(.horizontal, 4)
            }
        }
        .configurationDisplayName("Günün Ayeti")
        .description("Her gün farklı bir Kur'an ayeti")
        .supportedFamilies([.accessoryRectangular])
    }
}

struct PrayerTimesWidget: Widget {
    let kind = "PrayerTimesWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: UmmetProvider()) { entry in
            if #available(iOS 17.0, *) {
                PrayerWidgetView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                PrayerWidgetView(entry: entry)
                    .padding(.horizontal, 4)
            }
        }
        .configurationDisplayName("Namaz Vakitleri")
        .description("Günlük namaz vakitleri")
        .supportedFamilies([.accessoryRectangular])
    }
}

struct IftarSahurWidget: Widget {
    let kind = "IftarSahurWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: UmmetProvider()) { entry in
            if #available(iOS 17.0, *) {
                IftarSahurWidgetView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                IftarSahurWidgetView(entry: entry)
                    .padding(.horizontal, 4)
            }
        }
        .configurationDisplayName("İftar & Sahur")
        .description("Günlük iftar ve sahur vakitleri")
        .supportedFamilies([.accessoryRectangular])
    }
}

// MARK: - Widget Bundle

@main
struct UmmetWidgetBundle: WidgetBundle {
    var body: some Widget {
        DailyVerseWidget()
        PrayerTimesWidget()
        IftarSahurWidget()
    }
}

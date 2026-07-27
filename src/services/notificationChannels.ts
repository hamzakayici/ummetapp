import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

/**
 * Android bildirim kanalları.
 *
 * ⚠️ NEDEN GEREKLİ
 * Android 8 (Oreo) ve sonrasında bildirim sesi doğrudan bildirime verilemez —
 * sesi KANAL taşır. Kanal yoksa sistem varsayılan sesi çalar, yani makam bazlı
 * ezan seslerimiz duyulmaz. iOS'ta böyle bir kısıt yok, ses bildirimin kendi
 * alanında gider.
 *
 * ⚠️ KANAL SESİ SONRADAN DEĞİŞTİRİLEMEZ
 * Bir kanal oluşturulduktan sonra Android sesini/önemini değiştirmeye izin
 * vermez (kullanıcı ayarını ezmemek için). Ses değişirse kanal KİMLİĞİ de
 * değişmeli — bu yüzden id'lerde sürüm eki var: `ezan_fajr_v1`.
 * Yeni ses eklerken v2 yapın ve eskisini `deleteNotificationChannelAsync` ile silin.
 *
 * Ses dosyaları android/app/src/main/res/raw/ altında olmalı — bunu
 * plugins/withEzanSounds.js prebuild sırasında yapıyor.
 */

/** Kanal sürümü — ses veya önem değişirse artırın */
const CHANNEL_VERSION = "v1";

export type PrayerKey = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

type ChannelSpec = {
  id: string;
  name: string;
  sound: string;
  description: string;
};

const PRAYER_CHANNELS: Record<PrayerKey, ChannelSpec> = {
  Fajr: {
    id: `ezan_fajr_${CHANNEL_VERSION}`,
    name: "İmsak — Saba makamı",
    sound: "ezan_fajr.mp3",
    description: "Sabah namazı vakti bildirimi",
  },
  Dhuhr: {
    id: `ezan_dhuhr_${CHANNEL_VERSION}`,
    name: "Öğle — Rast makamı",
    sound: "ezan_dhuhr.mp3",
    description: "Öğle namazı vakti bildirimi",
  },
  Asr: {
    id: `ezan_asr_${CHANNEL_VERSION}`,
    name: "İkindi — Hicaz makamı",
    sound: "ezan_asr.mp3",
    description: "İkindi namazı vakti bildirimi",
  },
  Maghrib: {
    id: `ezan_maghrib_${CHANNEL_VERSION}`,
    name: "Akşam — Segâh makamı",
    sound: "ezan_maghrib.mp3",
    description: "Akşam namazı vakti bildirimi",
  },
  Isha: {
    id: `ezan_isha_${CHANNEL_VERSION}`,
    name: "Yatsı — Bayatî makamı",
    sound: "ezan_isha.mp3",
    description: "Yatsı namazı vakti bildirimi",
  },
};

/** Ezan dışındaki bildirimler — varsayılan ses */
export const GENERAL_CHANNEL_ID = `genel_${CHANNEL_VERSION}`;
export const DAILY_VERSE_CHANNEL_ID = `gunun_ayeti_${CHANNEL_VERSION}`;

/** Bir namaz vakti için kanal kimliği (Android). iOS'ta kullanılmaz. */
export function channelIdFor(prayerKey: string): string | undefined {
  if (Platform.OS !== "android") return undefined;
  return PRAYER_CHANNELS[prayerKey as PrayerKey]?.id ?? GENERAL_CHANNEL_ID;
}

/**
 * Kanalları oluşturur. Uygulama açılışında bir kez çağrılmalı —
 * bildirim zamanlamadan ÖNCE, yoksa kanal yokken zamanlanan bildirim
 * varsayılan sesle gider.
 *
 * Android dışında hiçbir şey yapmaz.
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  try {
    // Vakit kanalları — her biri kendi ezan sesiyle
    for (const spec of Object.values(PRAYER_CHANNELS)) {
      await Notifications.setNotificationChannelAsync(spec.id, {
        name: spec.name,
        description: spec.description,
        importance: Notifications.AndroidImportance.HIGH,
        sound: spec.sound,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#D4AF37",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });
    }

    await Notifications.setNotificationChannelAsync(GENERAL_CHANNEL_ID, {
      name: "Genel bildirimler",
      description: "Duyurular ve uygulama bildirimleri",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
      lightColor: "#D4AF37",
    });

    await Notifications.setNotificationChannelAsync(DAILY_VERSE_CHANNEL_ID, {
      name: "Günün ayeti",
      description: "Her sabah gönderilen ayet bildirimi",
      importance: Notifications.AndroidImportance.LOW,
      sound: "default",
      lightColor: "#D4AF37",
    });

    // Eski sürümlerden kalan varsayılan kanalı temizle —
    // kullanıcı listesinde "Miscellaneous" gibi anlamsız bir giriş kalmasın
    await Notifications.deleteNotificationChannelAsync("default").catch(() => {});
  } catch (e) {
    // Kanal kurulumu başarısız olursa bildirimler varsayılan sesle gider;
    // uygulamayı çökertmeye değmez
    console.warn("Bildirim kanalları kurulamadı:", e);
  }
}

/** Ayarlar ekranında "bildirim ayarlarını aç" için — kullanıcı sesi buradan yönetir */
export function prayerChannelIds(): string[] {
  return Object.values(PRAYER_CHANNELS).map((c) => c.id);
}

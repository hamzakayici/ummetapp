import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSettingsStore } from "../src/stores/appStore";

const CALC_METHODS = [
  { id: 13, name: "Diyanet İşleri Başkanlığı" },
  { id: 2, name: "İslami Bilimler Üniversitesi, Karaçi" },
  { id: 3, name: "Müslüman Dünya Birliği" },
  { id: 4, name: "Ümmül Kura, Mekke" },
  { id: 5, name: "Mısır Genel Fetva Kurulu" },
];

const REMINDER_OPTIONS = [
  { id: "at_time", label: "Vakit girdiğinde", icon: "bell-ring-outline" as const, desc: "Tam vakit girişinde bildirim" },
  { id: "5_min", label: "5 dk önce", icon: "bell-outline" as const, desc: "Vakitten 5 dakika önce" },
  { id: "15_min", label: "15 dk önce", icon: "bell-badge-outline" as const, desc: "Vakitten 15 dakika önce" },
  { id: "30_min", label: "30 dk önce", icon: "bell-circle-outline" as const, desc: "Vakitten 30 dakika önce" },
];

function SectionTitle({ title }: { title: string }) {
  return (
    <Text style={{ color: "rgba(212,175,55,0.5)", fontSize: 11, fontWeight: "700", marginTop: 24, marginBottom: 10, marginLeft: 4, textTransform: "uppercase", letterSpacing: 1.5 }}>
      {title}
    </Text>
  );
}

function SettingsRow({ icon, iconColor, title, subtitle, right, onPress }: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; iconColor: string;
  title: string; subtitle?: string; right?: React.ReactNode; onPress?: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={onPress ? 0.7 : 1} onPress={onPress} disabled={!onPress}>
      <View style={{
        flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 8, borderRadius: 16,
        backgroundColor: "rgba(10,24,18,0.7)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
      }}>
        <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(27,67,50,0.2)", marginRight: 12 }}>
          <MaterialCommunityIcons name={icon} size={18} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "#ECDFCC", fontSize: 15, fontWeight: "600" }}>{title}</Text>
          {subtitle && <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { hapticEnabled, notificationsEnabled, calculationMethod, toggleHaptic, toggleNotifications, setCalculationMethod } = useSettingsStore();

  // Bildirim ayarları (lokal state — store'a da eklenebilir)
  const [reminderTime, setReminderTime] = useState("at_time");
  const [prayerNotifs, setPrayerNotifs] = useState({
    Fajr: true, Sunrise: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true,
  });
  const [dailyVerseNotif, setDailyVerseNotif] = useState(true);
  const [fridayReminder, setFridayReminder] = useState(true);

  const togglePrayerNotif = (key: string) => {
    setPrayerNotifs((prev) => ({ ...prev, [key]: !(prev as any)[key] }));
  };

  const PRAYER_NOTIF_LIST = [
    { key: "Fajr", label: "İmsak", icon: "weather-sunset-up" },
    { key: "Sunrise", label: "Güneş", icon: "white-balance-sunny" },
    { key: "Dhuhr", label: "Öğle", icon: "weather-sunny" },
    { key: "Asr", label: "İkindi", icon: "weather-sunny-alert" },
    { key: "Maghrib", label: "Akşam", icon: "weather-sunset-down" },
    { key: "Isha", label: "Yatsı", icon: "weather-night" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />

      {/* Header */}
      <LinearGradient colors={["#1B4332", "#0A0E17"]} style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginLeft: 12 }}>Ayarlar</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: insets.bottom + 40 }}>

        {/* ═══ GENEL ═══ */}
        <SectionTitle title="Genel" />

        <SettingsRow icon="vibrate" iconColor="#A78BFA" title="Haptic Geri Bildirim" subtitle="Dokunmatik titreşim"
          right={<Switch value={hapticEnabled} onValueChange={toggleHaptic} trackColor={{ false: "#3A3F47", true: "#2D6A4F" }} thumbColor={hapticEnabled ? "#D4AF37" : "#f4f3f4"} />} />

        {/* ═══ BİLDİRİMLER ═══ */}
        <SectionTitle title="Bildirimler" />

        <SettingsRow icon="bell-outline" iconColor="#F97316" title="Namaz Vakti Bildirimleri" subtitle="Ezan vakitlerinde hatırlatma"
          right={<Switch value={notificationsEnabled} onValueChange={toggleNotifications} trackColor={{ false: "#3A3F47", true: "#2D6A4F" }} thumbColor={notificationsEnabled ? "#D4AF37" : "#f4f3f4"} />} />

        {notificationsEnabled && (
          <>
            {/* Hatırlatma Zamanı */}
            <View style={{
              padding: 14, borderRadius: 16, marginBottom: 8,
              backgroundColor: "rgba(10,24,18,0.7)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
            }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600", marginBottom: 10 }}>Hatırlatma Zamanı</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {REMINDER_OPTIONS.map((opt) => (
                  <TouchableOpacity key={opt.id} activeOpacity={0.7} onPress={() => setReminderTime(opt.id)}>
                    <View style={{
                      flexDirection: "row", alignItems: "center",
                      paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
                      backgroundColor: reminderTime === opt.id ? "rgba(212,175,55,0.12)" : "rgba(27,67,50,0.15)",
                      borderWidth: 1, borderColor: reminderTime === opt.id ? "rgba(212,175,55,0.3)" : "rgba(255,255,255,0.04)",
                    }}>
                      <MaterialCommunityIcons name={opt.icon} size={14} color={reminderTime === opt.id ? "#D4AF37" : "rgba(255,255,255,0.35)"} />
                      <Text style={{ color: reminderTime === opt.id ? "#D4AF37" : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "600", marginLeft: 6, }}>{opt.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Vakit Bazlı Bildirimler */}
            <View style={{
              padding: 14, borderRadius: 16, marginBottom: 8,
              backgroundColor: "rgba(10,24,18,0.7)", borderWidth: 1, borderColor: "rgba(255,255,255,0.04)",
            }}>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600", marginBottom: 10 }}>Vakit Bildirimleri</Text>
              {PRAYER_NOTIF_LIST.map((p) => (
                <View key={p.key} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
                  <MaterialCommunityIcons name={p.icon as any} size={18} color={(prayerNotifs as any)[p.key] ? "#D4AF37" : "rgba(255,255,255,0.2)"} />
                  <Text style={{ flex: 1, color: (prayerNotifs as any)[p.key] ? "#ECDFCC" : "rgba(255,255,255,0.3)", fontSize: 14, fontWeight: "600", marginLeft: 12 }}>{p.label}</Text>
                  <Switch
                    value={(prayerNotifs as any)[p.key]}
                    onValueChange={() => togglePrayerNotif(p.key)}
                    trackColor={{ false: "#3A3F47", true: "#2D6A4F" }}
                    thumbColor={(prayerNotifs as any)[p.key] ? "#D4AF37" : "#f4f3f4"}
                    style={{ transform: [{ scale: 0.85 }] }}
                  />
                </View>
              ))}
            </View>

            {/* Ek Bildirimler */}
            <SettingsRow icon="book-open-page-variant" iconColor="#8B5CF6" title="Günün Ayeti" subtitle="Her sabah bir ayet hatırlatması"
              right={<Switch value={dailyVerseNotif} onValueChange={setDailyVerseNotif} trackColor={{ false: "#3A3F47", true: "#2D6A4F" }} thumbColor={dailyVerseNotif ? "#D4AF37" : "#f4f3f4"} />} />

            <SettingsRow icon="calendar-star" iconColor="#22D3EE" title="Cuma Hatırlatıcı" subtitle="Cuma namazı öncesi bildirim"
              right={<Switch value={fridayReminder} onValueChange={setFridayReminder} trackColor={{ false: "#3A3F47", true: "#2D6A4F" }} thumbColor={fridayReminder ? "#D4AF37" : "#f4f3f4"} />} />
          </>
        )}

        {/* ═══ NAMAZ VAKTİ HESAPLAMASI ═══ */}
        <SectionTitle title="Namaz Vakti Hesaplaması" />

        {CALC_METHODS.map((method) => (
          <TouchableOpacity key={method.id} activeOpacity={0.7} onPress={() => setCalculationMethod(method.id)}>
            <View style={{
              flexDirection: "row", alignItems: "center", padding: 14, marginBottom: 6, borderRadius: 16,
              backgroundColor: calculationMethod === method.id ? "rgba(212,175,55,0.06)" : "rgba(10,24,18,0.7)",
              borderWidth: 1, borderColor: calculationMethod === method.id ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.04)",
            }}>
              <Ionicons name={calculationMethod === method.id ? "radio-button-on" : "radio-button-off"} size={20} color={calculationMethod === method.id ? "#D4AF37" : "rgba(255,255,255,0.2)"} />
              <Text style={{ color: calculationMethod === method.id ? "#D4AF37" : "#ECDFCC", fontSize: 14, fontWeight: calculationMethod === method.id ? "700" : "500", marginLeft: 12 }}>{method.name}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* ═══ HAKKINDA ═══ */}
        <SectionTitle title="Hakkında" />

        <SettingsRow icon="information-outline" iconColor="#5A6B78" title="Versiyon" subtitle="1.0.0"
          right={<Text style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>Ümmet</Text>} />

        <View style={{ alignItems: "center", marginTop: 30 }}>
          <MaterialCommunityIcons name="star-crescent" size={20} color="rgba(255,255,255,0.15)" />
          <Text style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, marginTop: 6 }}>Ümmet v1.0.0 · Bismillah</Text>
        </View>
      </ScrollView>
    </View>
  );
}

import { useCallback, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../../src/utils/haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import { useKazaStore, useWeeklyStore } from "../../src/stores/appStore";

const { width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 65;

type PrayerType = "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi" | "vitir";
type TabType = "namaz" | "oruc" | "gunluk";

const PRAYER_CONFIG: Record<PrayerType, { label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] }> = {
  sabah: { label: "Sabah", icon: "weather-sunset-up" },
  ogle: { label: "Öğle", icon: "white-balance-sunny" },
  ikindi: { label: "İkindi", icon: "weather-partly-cloudy" },
  aksam: { label: "Akşam", icon: "weather-sunset-down" },
  yatsi: { label: "Yatsı", icon: "weather-night" },
  vitir: { label: "Vitir", icon: "moon-waning-crescent" },
};

const WEEKDAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// Namaz kartı
function PrayerCard({
  type,
  total,
  completed,
  onIncrement,
  onDecrement,
  onSetTotal,
  index,
}: {
  type: PrayerType;
  total: number;
  completed: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSetTotal: () => void;
  index: number;
}) {
  const remaining = Math.max(total - completed, 0);
  const progress = total > 0 ? Math.min((completed / total) * 100, 100) : 0;
  const config = PRAYER_CONFIG[type];
  const isDone = total > 0 && remaining === 0;

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 80).springify()}>
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 16,
        borderRadius: 16,
        backgroundColor: isDone ? "rgba(64,192,87,0.08)" : "rgba(10,24,18,0.8)",
        borderWidth: 1,
        borderColor: isDone ? "rgba(64,192,87,0.2)" : "rgba(27,67,50,0.15)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              backgroundColor: isDone ? "rgba(64,192,87,0.15)" : "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name={config.icon} size={20} color={isDone ? "#40C057" : "#D4AF37"} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ color: isDone ? "#40C057" : "#FFFFFF", fontSize: 17, fontWeight: "700" }}>
              {config.label}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>
              {total === 0 ? "Borç girilmedi" : isDone ? "Tamamlandı ✓" : `${remaining} kaldı`}
            </Text>
          </View>
        </View>

        {/* Sayaç ve Yüzde */}
        <View style={{ alignItems: "center" }}>
          <Text style={{ color: isDone ? "#40C057" : "#D4AF37", fontSize: 22, fontWeight: "800" }}>
            {completed}
          </Text>
          <TouchableOpacity onPress={onSetTotal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: "#6B7280", fontSize: 12 }}>/ {total || "?"}</Text>
          </TouchableOpacity>
          {total > 0 && (
            <View style={{ marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: isDone ? "rgba(64,192,87,0.15)" : "rgba(212,175,55,0.12)" }}>
              <Text style={{ color: isDone ? "#40C057" : "#D4AF37", fontSize: 10, fontWeight: "700" }}>
                %{progress.toFixed(0)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress bar */}
      {total > 0 && (
        <View style={{ marginTop: 12 }}>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.08)" }}>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                width: `${progress}%`,
                backgroundColor: isDone ? "#40C057" : progress > 50 ? "#D4AF37" : "#2D6A4F",
              }}
            />
          </View>
        </View>
      )}

      {/* Butonlar */}
      {total === 0 ? (
        <TouchableOpacity onPress={onSetTotal} activeOpacity={0.7} style={{ marginTop: 12 }}>
          <View
            style={{
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: "rgba(212,175,55,0.08)",
              borderWidth: 1,
              borderColor: "rgba(212,175,55,0.2)",
              borderStyle: "dashed",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="arrow-up" size={14} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 14, fontWeight: "600", marginLeft: 4 }}>
                Önce borç sayısını girin
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>
          <TouchableOpacity
            onPress={onDecrement}
            style={{ flex: 1 }}
            activeOpacity={0.7}
            disabled={completed === 0}
          >
            <View
              style={{
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: completed > 0 ? "rgba(229,57,53,0.12)" : "rgba(255,255,255,0.8)",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name="remove" size={16} color={completed > 0 ? "#E53935" : "#6B7280"} />
              <Text style={{ color: completed > 0 ? "#E53935" : "#6B7280", fontSize: 14, fontWeight: "700", marginLeft: 4 }}>
                Geri Al
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onIncrement} style={{ flex: 2 }} activeOpacity={0.7}>
            <LinearGradient
              colors={isDone ? ["#2D6A4F", "#1B4332"] : ["#1B4332", "#2D6A4F"]}
              style={{
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              <Ionicons name="add" size={16} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 14, fontWeight: "700", marginLeft: 4 }}>
                Kıldım
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </Animated.View>
  );
}

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("namaz");
  const { prayers, fasting, incrementPrayer, decrementPrayer, setPrayerTotal, incrementFasting, incrementAdak, setFastingTotal, setAdakTotal } = useKazaStore();
  const { getWeekData, markToday, unmarkToday, trackedDays } = useWeeklyStore();
  const weekData = getWeekData();
  const todayMarked = trackedDays[new Date().toISOString().split("T")[0]] || false;

  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4500);
  }, []);

  // Genel istatistik
  const totalOwed = Object.values(prayers).reduce((s, p) => s + p.total, 0);
  const totalCompleted = Object.values(prayers).reduce((s, p) => s + p.completed, 0);
  const totalRemaining = Math.max(totalOwed - totalCompleted, 0);
  const overallProgress = totalOwed > 0 ? Math.min((totalCompleted / totalOwed) * 100, 100) : 0;

  // Tahmini bitiş
  const daysToFinish = totalRemaining > 0 ? Math.ceil(totalRemaining / 6) : 0;
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysToFinish);

  const handleIncrement = useCallback((type: PrayerType) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    
    // Check if debt becomes zero
    const currentCompleted = prayers[type].completed;
    const currentTotal = prayers[type].total;
    if (currentTotal > 0 && currentCompleted + 1 === currentTotal) {
      hapticNotification(NotificationFeedbackType.Success);
      triggerConfetti();
    }
    
    incrementPrayer(type);
  }, [prayers, incrementPrayer, triggerConfetti]);

  const handleDecrement = useCallback((type: PrayerType) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    decrementPrayer(type);
  }, []);

  const handleSetTotal = useCallback((type: PrayerType) => {
    const config = PRAYER_CONFIG[type];
    Alert.prompt(
      `${config.label} Borcu`,
      "Toplam kaza borcu sayısını girin:",
      (text) => {
        const num = parseInt(text || "0", 10);
        if (!isNaN(num) && num >= 0) {
          setPrayerTotal(type, num);
        }
      },
      "plain-text",
      String(prayers[type].total || ""),
      "number-pad"
    );
  }, [prayers]);

  const handleSetFastingTotal = useCallback(() => {
    Alert.prompt(
      "Oruç Borcu",
      "Toplam kaza orucu sayısını girin:",
      (text) => {
        const num = parseInt(text || "0", 10);
        if (!isNaN(num) && num >= 0) setFastingTotal(num);
      },
      "plain-text",
      String(fasting.totalOwed || ""),
      "number-pad"
    );
  }, [fasting]);

  const handleSetAdakTotal = useCallback(() => {
    Alert.prompt(
      "Adak Orucu",
      "Toplam adak orucu sayısını girin:",
      (text) => {
        const num = parseInt(text || "0", 10);
        if (!isNaN(num) && num >= 0) setAdakTotal(num);
      },
      "plain-text",
      String(fasting.adak || ""),
      "number-pad"
    );
  }, [fasting]);

  const tabs: { key: TabType; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] }[] = [
    { key: "namaz", label: "Kaza Namaz", icon: "mosque" },
    { key: "oruc", label: "Kaza Oruç", icon: "food-off" },
    { key: "gunluk", label: "Günlük", icon: "calendar-check" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#1B4332", "#2D6A4F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top + 12, paddingBottom: 18, paddingHorizontal: 20 }}
      >
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: "700" }}>Kaza Takibi</Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 4 }}>
                Namaz ve oruç borçlarınızı takip edin
              </Text>
            </View>
            {totalOwed > 0 && (
              <View style={{ alignItems: "center", backgroundColor: "rgba(212,175,55,0.12)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 }}>
                <Text style={{ color: "#D4AF37", fontSize: 18, fontWeight: "800" }}>%{overallProgress.toFixed(0)}</Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: "600" }}>İLERLEME</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 14,
          padding: 4,
          borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={{ flex: 1 }} activeOpacity={0.7}>
            <View
              style={{
                paddingVertical: 12,
                borderRadius: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activeTab === tab.key ? "#1B4332" : "transparent",
              }}
            >
              <MaterialCommunityIcons name={tab.icon} size={15} color={activeTab === tab.key ? "#D4AF37" : "rgba(255,255,255,0.6)"} />
              <Text
                style={{
                  marginLeft: 5,
                  fontSize: 13,
                  fontWeight: "700",
                  color: activeTab === tab.key ? "#D4AF37" : "rgba(255,255,255,0.6)",
                }}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* NAMAZ */}
      {activeTab === "namaz" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}>
          {/* Genel durum */}
          <View style={{ marginHorizontal: 16, marginTop: 14 }}>
            <LinearGradient
              colors={["rgba(212,175,55,0.1)", "rgba(10,24,18,0.8)"]}
              style={{
                padding: 18,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.15)",
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Toplam Borç</Text>
                  <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800" }}>
                    {totalOwed.toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Kılınan</Text>
                  <Text style={{ color: "#D4AF37", fontSize: 28, fontWeight: "800" }}>
                    {totalCompleted.toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Kalan</Text>
                  <Text style={{ color: totalRemaining === 0 ? "#40C057" : "#E53935", fontSize: 28, fontWeight: "800" }}>
                    {totalRemaining.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 14 }}>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <LinearGradient
                    colors={["#D4AF37", "#40C057"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: 8,
                      borderRadius: 4,
                      width: `${overallProgress}%`,
                    }}
                  />
                </View>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4, textAlign: "right" }}>
                  %{overallProgress.toFixed(0)} tamamlandı
                </Text>
              </View>
            </LinearGradient>
          </View>

          {/* Vakit kartları */}
          <View style={{ marginTop: 14 }}>
            {(Object.keys(prayers) as PrayerType[]).map((type, index) => (
              <PrayerCard
                key={type}
                type={type}
                total={prayers[type].total}
                completed={prayers[type].completed}
                onIncrement={() => handleIncrement(type)}
                onDecrement={() => handleDecrement(type)}
                onSetTotal={() => handleSetTotal(type)}
                index={index}
              />
            ))}
          </View>

          {/* Tahmini bitiş */}
          {totalRemaining > 0 && (
            <View
              style={{
                marginHorizontal: 16,
                marginTop: 4,
                padding: 14,
                borderRadius: 14,
                backgroundColor: "rgba(212,175,55,0.06)",
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.1)",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MaterialCommunityIcons name="timer-sand" size={18} color="#D4AF37" />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "600" }}>
                  Günde 6 kaza kılarsanız: {daysToFinish} gün
                </Text>
                <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
                  Tahmini bitiş: {finishDate.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </Text>
              </View>
            </View>
          )}

          {/* Nasıl çalışır */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 10,
              padding: 14,
              borderRadius: 14,
              backgroundColor: "rgba(10,24,18,0.7)",
              borderWidth: 1,
              borderColor: "rgba(27,67,50,0.1)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#D4AF37" />
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 20, marginLeft: 6, flex: 1 }}>
                Her vaktin yanındaki sayıya basarak toplam borcunuzu girebilirsiniz. "Kıldım" butonuyla kazanızı artırın.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ORUÇ */}
      {activeTab === "oruc" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}>
          {/* Kaza orucu */}
          <View style={{ marginHorizontal: 16, marginTop: 14 }}>
            <LinearGradient
              colors={["rgba(212,175,55,0.1)", "rgba(10,24,18,0.8)"]}
              style={{ padding: 18, borderRadius: 16, borderWidth: 1, borderColor: "rgba(212,175,55,0.15)" }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <MaterialCommunityIcons name="food-off" size={20} color="#D4AF37" />
                <Text style={{ color: "#D4AF37", fontSize: 18, fontWeight: "700", marginLeft: 8 }}>Kaza Orucu</Text>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Toplam</Text>
                  <TouchableOpacity onPress={handleSetFastingTotal}>
                    <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800" }}>
                      {fasting.totalOwed || "?"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Tutulan</Text>
                  <Text style={{ color: "#D4AF37", fontSize: 28, fontWeight: "800" }}>{fasting.completed}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Kalan</Text>
                  <Text style={{ color: "#E53935", fontSize: 28, fontWeight: "800" }}>
                    {Math.max(fasting.totalOwed - fasting.completed, 0)}
                  </Text>
                </View>
              </View>

              {fasting.totalOwed > 0 && (
                <View style={{ marginTop: 14 }}>
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        width: `${Math.min((fasting.completed / fasting.totalOwed) * 100, 100)}%`,
                        backgroundColor: fasting.completed >= fasting.totalOwed ? "#40C057" : "#D4AF37",
                      }}
                    />
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Oruç tutma butonu */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { 
              hapticImpact(ImpactFeedbackStyle.Medium); 
              if (fasting.totalOwed > 0 && fasting.completed + 1 === fasting.totalOwed) {
                hapticNotification(NotificationFeedbackType.Success);
                triggerConfetti();
              }
              incrementFasting(); 
            }}
            style={{ marginHorizontal: 16, marginTop: 12 }}
          >
            <LinearGradient colors={["#1B4332", "#2D6A4F"]} style={{ padding: 18, borderRadius: 16, alignItems: "center" }}>
              <MaterialCommunityIcons name="food-off" size={32} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 18, fontWeight: "700", marginTop: 8 }}>
                Bugün Oruç Tuttum
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
                Dokunarak oruç kaydı ekleyin
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Adak orucu */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              padding: 16,
              borderRadius: 16,
              backgroundColor: "rgba(10,24,18,0.8)",
              borderWidth: 1,
              borderColor: "rgba(27,67,50,0.15)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <MaterialCommunityIcons name="hands-pray" size={20} color="#FFFFFF" />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>Adak Orucu</Text>
                  <TouchableOpacity onPress={handleSetAdakTotal}>
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>
                      {fasting.adakCompleted}/{fasting.adak || "?"} tutuldu
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => { hapticImpact(ImpactFeedbackStyle.Light); incrementAdak(); }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#1B4332", "#2D6A4F"]}
                  style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, flexDirection: "row", alignItems: "center" }}
                >
                  <Ionicons name="add" size={16} color="#D4AF37" />
                  <Text style={{ color: "#D4AF37", fontSize: 14, fontWeight: "700", marginLeft: 4 }}>Tuttum</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Nafile oruç */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              padding: 16,
              borderRadius: 16,
              backgroundColor: "rgba(10,24,18,0.7)",
              borderWidth: 1,
              borderColor: "rgba(27,67,50,0.1)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <MaterialCommunityIcons name="calendar-star" size={18} color="#D4AF37" />
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginLeft: 8 }}>Tavsiye Edilen Oruç Günleri</Text>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {["Pazartesi", "Perşembe", "Eyyam-ı Biyd (13-14-15)", "Arefe Günü", "Aşure Günü"].map((day) => (
                <View key={day} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "500" }}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* GÜNLÜK TAKİP */}
      {activeTab === "gunluk" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 20 }}>
          {/* Haftalık takip */}
          <View style={{ marginHorizontal: 16, marginTop: 14 }}>
            <LinearGradient
              colors={["rgba(212,175,55,0.1)", "rgba(10,24,18,0.8)"]}
              style={{ padding: 18, borderRadius: 16, borderWidth: 1, borderColor: "rgba(212,175,55,0.15)" }}
            >
              <Text style={{ color: "#D4AF37", fontSize: 18, fontWeight: "700", marginBottom: 14 }}>
                Bu Haftanız
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {WEEKDAY_LABELS.map((day, i) => {
                  const active = weekData[i];
                  return (
                    <View key={day} style={{ alignItems: "center", gap: 6 }}>
                      <Text style={{ color: active ? "#D4AF37" : "#6B7280", fontSize: 12, fontWeight: "600" }}>{day}</Text>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: active ? "rgba(212,175,55,0.2)" : "rgba(10,24,18,0.7)",
                          borderWidth: 1,
                          borderColor: active ? "rgba(212,175,55,0.4)" : "rgba(27,67,50,0.1)",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {active ? (
                          <Ionicons name="checkmark" size={18} color="#D4AF37" />
                        ) : (
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(90,107,120,0.3)" }} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 12, textAlign: "center" }}>
                {weekData.filter(Boolean).length}/7 gün tamamlandı
              </Text>
            </LinearGradient>
          </View>

          {/* Bugünü işaretle */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              hapticImpact(ImpactFeedbackStyle.Medium);
              todayMarked ? unmarkToday() : markToday();
            }}
            style={{ marginHorizontal: 16, marginTop: 12 }}
          >
            <LinearGradient
              colors={todayMarked ? ["#2D6A4F", "#1B4332"] : ["#1B4332", "#2D6A4F"]}
              style={{ padding: 18, borderRadius: 16, alignItems: "center" }}
            >
              <Ionicons name={todayMarked ? "checkmark-circle" : "add-circle-outline"} size={36} color={todayMarked ? "#40C057" : "#D4AF37"} />
              <Text style={{ color: todayMarked ? "#40C057" : "#D4AF37", fontSize: 18, fontWeight: "700", marginTop: 8 }}>
                {todayMarked ? "Bugün Tamamlandı ✓" : "Bugünü Tamamla"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
                {todayMarked ? "Geri almak için tekrar dokunun" : "5 vakit namaz, zikir, Kuran okuma"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Motivasyon */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              padding: 16,
              borderRadius: 16,
              backgroundColor: "rgba(10,24,18,0.7)",
              borderWidth: 1,
              borderColor: "rgba(27,67,50,0.1)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialCommunityIcons name="hands-pray" size={18} color="#D4AF37" />
              <Text style={{ color: "#D4AF37", fontSize: 15, fontWeight: "700", marginLeft: 6 }}>
                İbadet Hatırlatmaları
              </Text>
            </View>
            {[
              "5 vakit namazı vaktinde kılın",
              "Sabah ve akşam zikirlerini okuyun",
              "Günde en az 1 sayfa Kuran okuyun",
              "Sünnet namazlarını kaçırmayın",
              "Abdestli gezmeye özen gösterin",
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#2D6A4F", marginRight: 10 }} />
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 22 }}>{item}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Confetti overlay */}
      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: width / 2, y: -20 }}
          autoStart={true}
          fadeOut={true}
          fallSpeed={2500}
          colors={['#D4AF37', '#40C057', '#F0D060', '#A78BFA', '#F43F5E']}
        />
      )}
    </View>
  );
}

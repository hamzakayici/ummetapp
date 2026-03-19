import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  toHijri,
  getHijriMonthDays,
  ISLAMIC_EVENTS,
  HIJRI_MONTHS,
  HIJRI_MONTHS_AR,
  type HijriDate,
} from "../src/utils/hijriCalendar";

const WEEKDAY_HEADERS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export default function HijriCalendarScreen() {
  const insets = useSafeAreaInsets();
  const todayHijri = useMemo(() => toHijri(), []);
  const [currentMonth, setCurrentMonth] = useState(todayHijri.month);
  const [currentYear, setCurrentYear] = useState(todayHijri.year);

  const monthDays = useMemo(
    () => getHijriMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // Bu aydaki İslami günler
  const eventsThisMonth = useMemo(
    () => ISLAMIC_EVENTS.filter((e) => e.month === currentMonth),
    [currentMonth]
  );

  // İlk günün haftanın hangi gününe denk geldiğini bul
  const firstDayWeekday = useMemo(() => {
    if (monthDays.length === 0) return 0;
    const d = monthDays[0].gregorian.getDay();
    return d === 0 ? 6 : d - 1; // Pazartesi = 0
  }, [monthDays]);

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToday = () => {
    setCurrentMonth(todayHijri.month);
    setCurrentYear(todayHijri.year);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      {/* Header */}
      <LinearGradient
        colors={["#1A1040", "#0A0E17"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.08)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#A78BFA" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#E8D5FF", fontSize: 22, fontWeight: "700" }}>
              Hicri Takvim
            </Text>
            <Text style={{ color: "rgba(167,139,250,0.6)", fontSize: 13, marginTop: 2 }}>
              {todayHijri.weekday}, {todayHijri.formatted}
            </Text>
          </View>

          <TouchableOpacity onPress={goToday}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: "rgba(167,139,250,0.15)",
              }}
            >
              <Text style={{ color: "#A78BFA", fontSize: 13, fontWeight: "600" }}>Bugün</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={[1]}
        keyExtractor={() => "content"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        renderItem={() => (
          <View>
            {/* Ay navigasyonu */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginHorizontal: 20,
                  marginTop: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  backgroundColor: "rgba(10,24,18,0.8)",
                  borderWidth: 1,
                  borderColor: "rgba(167,139,250,0.15)",
                }}
              >
                <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="chevron-back" size={24} color="#A78BFA" />
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "700" }}>
                    {HIJRI_MONTHS[currentMonth - 1]}
                  </Text>
                  <Text style={{ color: "#6B7280", fontSize: 14, marginTop: 2 }}>
                    {HIJRI_MONTHS_AR[currentMonth - 1]} — {currentYear}
                  </Text>
                </View>

                <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="chevron-forward" size={24} color="#A78BFA" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Haftanın günleri başlığı */}
            <View
              style={{
                flexDirection: "row",
                marginHorizontal: 20,
                marginTop: 16,
                marginBottom: 6,
              }}
            >
              {WEEKDAY_HEADERS.map((day) => (
                <View key={day} style={{ flex: 1, alignItems: "center" }}>
                  <Text
                    style={{
                      color: day === "Cum" ? "#A78BFA" : "#6B7280",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Takvim grid */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View
                style={{
                  marginHorizontal: 20,
                  paddingVertical: 8,
                  paddingHorizontal: 4,
                  borderRadius: 16,
                  backgroundColor: "rgba(10,24,18,0.7)",
                  borderWidth: 1,
                  borderColor: "rgba(167,139,250,0.06)",
                }}
              >
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {/* Boş günler */}
                  {Array.from({ length: firstDayWeekday }).map((_, i) => (
                    <View key={`empty-${i}`} style={{ width: "14.28%", height: 48 }} />
                  ))}

                  {/* Günler */}
                  {monthDays.map((d) => {
                    const event = eventsThisMonth.find((e) => e.day === d.hijriDay);
                    const isFriday = d.gregorian.getDay() === 5;

                    return (
                      <View
                        key={d.hijriDay}
                        style={{
                          width: "14.28%",
                          height: 48,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 19,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: d.isToday
                              ? "#A78BFA"
                              : event
                              ? "rgba(167,139,250,0.15)"
                              : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              color: d.isToday
                                ? "#FFF"
                                : event
                                ? "#A78BFA"
                                : isFriday
                                ? "#A78BFA"
                                : "rgba(255,255,255,0.6)",
                              fontSize: 16,
                              fontWeight: d.isToday || event ? "700" : "500",
                            }}
                          >
                            {d.hijriDay}
                          </Text>
                        </View>
                        {event && !d.isToday && (
                          <View
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: "#A78BFA",
                              marginTop: 1,
                            }}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </Animated.View>

            {/* Bu aydaki önemli günler */}
            {eventsThisMonth.length > 0 && (
              <Animated.View entering={FadeInDown.delay(300).springify()}>
                <Text
                  style={{
                    color: "#A78BFA",
                    fontSize: 18,
                    fontWeight: "700",
                    marginHorizontal: 20,
                    marginTop: 20,
                    marginBottom: 10,
                  }}
                >
                  Önemli Günler
                </Text>
                {eventsThisMonth.map((event, idx) => (
                  <View
                    key={idx}
                    style={{
                      marginHorizontal: 20,
                      marginBottom: 8,
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: "rgba(10,24,18,0.8)",
                      borderWidth: 1,
                      borderColor: "rgba(167,139,250,0.15)",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(167,139,250,0.15)", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                      <MaterialCommunityIcons name={event.icon as any} size={22} color="#A78BFA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                        {event.name}
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 2 }}>
                        {event.day} {HIJRI_MONTHS[event.month - 1]} — {event.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}

            {/* Miladi karşılık bilgisi */}
            {monthDays.length > 0 && (
              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <View
                  style={{
                    marginHorizontal: 20,
                    marginTop: 16,
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: "rgba(10,24,18,0.7)",
                    borderWidth: 1,
                    borderColor: "rgba(167,139,250,0.06)",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons name="calendar-sync" size={18} color="#6B7280" />
                  <Text style={{ color: "#6B7280", fontSize: 13, marginLeft: 8, flex: 1 }}>
                    Miladi karşılık: {monthDays[0].gregorian.toLocaleDateString("tr-TR", { day: "numeric", month: "long" })} — {monthDays[monthDays.length - 1].gregorian.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>
        )}
      />
    </View>
  );
}

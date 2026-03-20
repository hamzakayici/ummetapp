import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  DELAIL_INTRO,
  DELAIL_HIZBS,
  getTodaysHizb,
  type DelailHizb,
  type DelailEntry,
} from "../src/data/delailulHayrat";

const DAY_ICONS: Record<string, string> = {
  Pazartesi: "calendar-today",
  Salı: "calendar-today",
  Çarşamba: "calendar-today",
  Perşembe: "calendar-today",
  Cuma: "star-crescent",
  Cumartesi: "calendar-today",
  Pazar: "calendar-today",
};

export default function DelailulHayratScreen() {
  const insets = useSafeAreaInsets();
  const [selectedHizb, setSelectedHizb] = useState<DelailHizb | null>(null);
  const todaysHizb = getTodaysHizb();

  // Varsayılan olarak bugünün hizbini göster
  useEffect(() => {
    setSelectedHizb(todaysHizb);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient
        colors={["#0A0E17", "#0F1923", "#0A0E17"]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(27,67,50,0.06)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={22} color="#D4AF37" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#D4AF37", fontSize: 20, fontWeight: "700" }}>
              {DELAIL_INTRO.title}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>
              {DELAIL_INTRO.titleAr} — {DELAIL_INTRO.author}
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tanıtım Kartı */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <LinearGradient
              colors={["rgba(27,67,50,0.4)", "rgba(15,25,35,0.8)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                marginHorizontal: 20,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: "rgba(212,175,55,0.15)",
              }}
            >
              {/* Dekoratif üst çizgi */}
              <LinearGradient
                colors={["transparent", "rgba(212,175,55,0.4)", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 1,
                  position: "absolute",
                  top: 0,
                  left: 30,
                  right: 30,
                  borderRadius: 1,
                }}
              />

              {/* İkon ve başlık */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(212,175,55,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(212,175,55,0.2)",
                }}>
                  <MaterialCommunityIcons name="book-open-variant" size={22} color="#D4AF37" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: "#D4AF37", fontSize: 16, fontWeight: "700" }}>
                    Delâilü'l-Hayrât Nedir?
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                    Salavat-ı Şerîfe Mecmuası
                  </Text>
                </View>
              </View>

              {/* Ayırıcı */}
              <View style={{
                height: 1,
                backgroundColor: "rgba(212,175,55,0.08)",
                marginBottom: 14,
              }} />

              <Text style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 14,
                lineHeight: 24,
                letterSpacing: 0.2,
              }}>
                {DELAIL_INTRO.description}
              </Text>

              {/* Alt bilgi */}
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 14,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: "rgba(212,175,55,0.08)",
              }}>
                <MaterialCommunityIcons name="calendar-check" size={14} color="rgba(212,175,55,0.5)" />
                <Text style={{ color: "rgba(212,175,55,0.5)", fontSize: 12, marginLeft: 6 }}>
                  Her gün bir hizb okunur · 7 günde tamamlanır
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Gün Seçici */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}
            >
              {DELAIL_HIZBS.map((hizb, idx) => {
                const isSelected = selectedHizb?.day === hizb.day;
                const isToday = todaysHizb.day === hizb.day;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedHizb(hizb)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: isSelected
                        ? "rgba(212,175,55,0.2)"
                        : "rgba(27,67,50,0.03)",
                      borderWidth: 1,
                      borderColor: isSelected
                        ? "rgba(212,175,55,0.4)"
                        : isToday
                        ? "rgba(212,175,55,0.15)"
                        : "rgba(27,67,50,0.03)",
                      alignItems: "center",
                      minWidth: 80,
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#D4AF37" : isToday ? "#D4AF37" : "rgba(255,255,255,0.5)",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {hizb.day}
                    </Text>
                    <Text
                      style={{
                        color: isSelected ? "#D4AF37" : "rgba(255,255,255,0.3)",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {hizb.dayAr}
                    </Text>
                    {isToday && (
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: "#D4AF37",
                          marginTop: 4,
                        }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>

          {/* Hizb Başlığı */}
          {selectedHizb && (
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={{ paddingHorizontal: 20, marginBottom: 12 }}
            >
              <Text style={{ color: "#D4AF37", fontSize: 20, fontWeight: "700" }}>
                {selectedHizb.title}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                {selectedHizb.day} — {selectedHizb.dayAr}
              </Text>
            </Animated.View>
          )}

          {/* Salavat Kartları */}
          {selectedHizb?.entries.map((entry, idx) => (
            <Animated.View
              key={`${selectedHizb.day}-${idx}`}
              entering={FadeInDown.delay(350 + idx * 60).springify()}
              style={{
                marginHorizontal: 20,
                marginBottom: 12,
              }}
            >
              <LinearGradient
                colors={["#141E2B", "#0F1923"]}
                style={{
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "rgba(212,175,55,0.08)",
                }}
              >
                {/* Numara */}
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "rgba(212,175,55,0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "rgba(212,175,55,0.5)", fontSize: 12, fontWeight: "700" }}>
                    {idx + 1}
                  </Text>
                </View>

                {/* Arapça */}
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 26,
                    lineHeight: 46,
                    textAlign: "right",
                    fontWeight: "500",
                    marginBottom: 12,
                    paddingRight: 32,
                  }}
                >
                  {entry.arabic}
                </Text>

                {/* Ayırıcı */}
                <View
                  style={{
                    height: 1,
                    backgroundColor: "rgba(212,175,55,0.1)",
                    marginBottom: 10,
                  }}
                />

                {/* Türkçe */}
                <Text
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 17,
                    lineHeight: 28,
                  }}
                >
                  {entry.turkish}
                </Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../src/utils/haptics";

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen ad, e-posta ve mesaj alanlarını doldurun.");
      return;
    }
    hapticNotification(NotificationFeedbackType.Success);
    setSending(true);

    try {
      const res = await fetch("https://ummetapp.com/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });

      if (res.ok) {
        Alert.alert("Gönderildi", "Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.", [
          { text: "Tamam", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Hata", "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
      }
    } catch {
      Alert.alert("Bağlantı Hatası", "İnternet bağlantınızı kontrol edin ve tekrar deneyin.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(27,67,50,0.15)",
    borderRadius: 14,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 12,
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <LinearGradient colors={["#1B4332", "#2D6A4F"]} style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={22} color="#D4AF37" />
            </TouchableOpacity>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700", marginLeft: 12 }}>Bize Yazın</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Bilgi kartı */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <View style={{ flexDirection: "row", padding: 14, borderRadius: 14, backgroundColor: "rgba(212,175,55,0.06)", borderWidth: 1, borderColor: "rgba(212,175,55,0.15)", marginBottom: 20 }}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#D4AF37" />
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginLeft: 10, flex: 1, lineHeight: 18 }}>
                Öneri, şikayet veya sorularınızı bize iletebilirsiniz. En kısa sürede dönüş yapacağız.
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Ad Soyad</Text>
            <TextInput
              style={inputStyle}
              value={name}
              onChangeText={setName}
              placeholder="Adınız"
              placeholderTextColor="#6B7280"
            />

            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginBottom: 6 }}>E-posta</Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Konu</Text>
            <TextInput
              style={inputStyle}
              value={subject}
              onChangeText={setSubject}
              placeholder="Öneri / Şikayet / Soru"
              placeholderTextColor="#6B7280"
            />

            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Mesajınız</Text>
            <TextInput
              style={{ ...inputStyle, minHeight: 120, textAlignVertical: "top" }}
              value={message}
              onChangeText={setMessage}
              placeholder="Mesajınızı buraya yazın..."
              placeholderTextColor="#6B7280"
              multiline
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <TouchableOpacity activeOpacity={0.8} onPress={handleSend} disabled={sending}>
              <LinearGradient
                colors={["#1B4332", "#2D6A4F"]}
                style={{ paddingVertical: 16, borderRadius: 14, alignItems: "center", opacity: sending ? 0.6 : 1 }}
              >
                <Text style={{ color: "#D4AF37", fontSize: 16, fontWeight: "700" }}>
                  {sending ? "Gönderiliyor..." : "Gönder"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

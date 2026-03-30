import { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../../src/utils/haptics";
import Animated, {
  FadeInDown, FadeInUp, FadeInRight, FadeInLeft, FadeOutLeft, FadeOutRight,
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, withRepeat
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import { useDhikrStore, useSharedDhikrStore } from "../../src/stores/appStore";
import { supabase } from "../../src/services/supabase";
import { getSharedDhikrByCode, createSharedDhikr } from "../../src/services/sharedDhikr";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.55;

const PRESETS = [
  { name: "Sübhanallah", arabic: "سُبْحَانَ اللَّهِ", target: 33, color: "#40C057" },
  { name: "Elhamdülillah", arabic: "الْحَمْدُ لِلَّهِ", target: 33, color: "#3B82F6" },
  { name: "Allahu Ekber", arabic: "اللَّهُ أَكْبَرُ", target: 33, color: "#D4AF37" },
  { name: "Lâ ilâhe illallah", arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", target: 100, color: "#F0D060" },
  { name: "Estağfirullah", arabic: "أَسْتَغْفِرُ اللَّهَ", target: 100, color: "#A78BFA" },
  { name: "Salavat", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100, color: "#F43F5E" },
];

const SHARED_PRESETS = [
  { name: "Salavat", color: "#F43F5E" },
  { name: "Kelime-i Tevhid", color: "#F0D060" },
  { name: "İhlas Suresi", color: "#3B82F6" },
  { name: "Yasin-i Şerif", color: "#A78BFA" },
  { name: "Kur'an Hatmi (Cüz)", color: "#D4AF37" },
  { name: "Ayet-el Kürsi", color: "#40C057" },
  { name: "Estağfirullah", color: "#8A9BA8" },
];

export default function DhikrScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Tabs: personal | shared
  const [activeTab, setActiveTab] = useState<"personal" | "shared">("personal");

  // Personal state
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [count, setCount] = useState(0);
  const { incrementDaily, getTodayCount } = useDhikrStore();
  const totalToday = getTodayCount();

  const target = PRESETS[selectedPreset].target;
  const progress = Math.min((count / target) * 100, 100);
  const isComplete = count >= target;
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [liveUsers, setLiveUsers] = useState(1);
  const pulseOpacity = useSharedValue(1);

  // Shared state
  const { joinedDhikrs, addJoinedDhikr } = useSharedDhikrStore();
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createTarget, setCreateTarget] = useState("70000");
  const [createPresetIndex, setCreatePresetIndex] = useState(0);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true
    );

    const room = supabase.channel('dhikr_room', {
      config: { presence: { key: Math.random().toString(36).substr(2, 9) } },
    });

    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState();
        let count = 0;
        for (const id in newState) { count += newState[id].length; }
        setLiveUsers(Math.max(count, 1));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await room.track({ online_at: new Date().toISOString() });
        }
      });

    return () => { supabase.removeChannel(room); };
  }, []);

  const scaleValue = useSharedValue(1);
  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleValue.value }] }));

  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const preset = PRESETS[selectedPreset];

  const handleCount = useCallback(() => {
    hapticImpact(ImpactFeedbackStyle.Medium);
    
    // Ripple effect outwards
    rippleScale.value = 0.5;
    rippleOpacity.value = 0.6;
    rippleScale.value = withTiming(1.6, { duration: 400 });
    rippleOpacity.value = withTiming(0, { duration: 400 });

    scaleValue.value = withSequence(withSpring(0.85, { damping: 12 }), withSpring(1, { damping: 10 }));
    
    setCount((prev) => {
      const next = prev + 1;
      if (next === target) {
        hapticNotification(NotificationFeedbackType.Success);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
      return next;
    });
    incrementDaily(1);
  }, [target]);

  const handleReset = useCallback(() => {
    hapticNotification(NotificationFeedbackType.Success);
    setCount(0);
  }, []);

  const handleJoin = async () => {
    if (joinCode.length < 5) return;
    setIsJoining(true);
    setJoinError("");
    hapticImpact(ImpactFeedbackStyle.Light);
    
    const { data, error } = await getSharedDhikrByCode(joinCode);
    setIsJoining(false);

    if (error || !data) {
      setJoinError("Kampanya bulunamadı. Kodu kontrol edin.");
      hapticNotification(NotificationFeedbackType.Error);
      return;
    }

    addJoinedDhikr({
      id: data.id,
      title: data.title,
      presetName: data.preset_name,
      shareCode: data.share_code,
    });
    
    setJoinCode("");
    hapticNotification(NotificationFeedbackType.Success);
    router.push(`/shared-dhikr/${data.id}`);
  };

  const handleCreate = async () => {
    if (!createTitle || !createTarget) return;
    setIsCreating(true);
    hapticImpact(ImpactFeedbackStyle.Light);

    const targetNum = parseInt(createTarget.replace(/[^0-9]/g, "")) || 1000;
    
    const { data, error } = await createSharedDhikr(createTitle, SHARED_PRESETS[createPresetIndex].name, targetNum);
    setIsCreating(false);

    if (error || !data) {
      hapticNotification(NotificationFeedbackType.Error);
      alert("Kampanya oluşturulurken bir hata oluştu.");
      return;
    }

    addJoinedDhikr({
      id: data.id,
      title: data.title,
      presetName: data.preset_name,
      shareCode: data.share_code,
    });

    setCreateTitle("");
    hapticNotification(NotificationFeedbackType.Success);
    router.push(`/shared-dhikr/${data.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#1B4332", "#0A0F14"]} style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ color: "#ECDFCC", fontSize: 22, fontWeight: "700" }}>Zikir & Tesbih</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <MaterialCommunityIcons name="counter" size={14} color="#8A9BA8" />
                <Text style={{ color: "#8A9BA8", fontSize: 13, marginLeft: 6 }}>Bugün: {totalToday} zikir</Text>
              </View>
            </View>
          </View>

          {/* TABS (Kişisel / Ortak) */}
          <View style={{ flexDirection: "row", marginTop: 20, backgroundColor: "rgba(27,67,50,0.5)", borderRadius: 12, padding: 4 }}>
            <TouchableOpacity 
              style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, backgroundColor: activeTab === "personal" ? "#1B4332" : "transparent" }}
              onPress={() => setActiveTab("personal")}
              activeOpacity={0.8}
            >
              <Text style={{ color: activeTab === "personal" ? "#ECDFCC" : "#5A6B78", fontWeight: "600", fontSize: 13 }}>Kişisel Zikir</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={{ flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10, backgroundColor: activeTab === "shared" ? "#1B4332" : "transparent" }}
              onPress={() => setActiveTab("shared")}
              activeOpacity={0.8}
            >
              <Text style={{ color: activeTab === "shared" ? "#ECDFCC" : "#5A6B78", fontWeight: "600", fontSize: 13 }}>Ortak Hatim & Zikir</Text>
            </TouchableOpacity>
          </View>

          {/* REALTIME GLOBAL ZİKİR HALKASI (Only in Personal tab roughly equivalent to random online people) */}
          {activeTab === "personal" && (
            <Animated.View entering={FadeInDown.springify()} style={{ marginTop: 16, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(64,192,87,0.12)", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(64,192,87,0.2)" }}>
              <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#40C057", marginRight: 8, shadowColor: "#40C057", shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }, pulseStyle]} />
              <Text style={{ color: "#40C057", fontSize: 13, fontWeight: "600", flex: 1 }}>
                {liveUsers === 1 ? "Küresel zikir halkasına bağlandınız" : `Şu an dünyada ${liveUsers} kişiyle zikir halkasındasınız`}
              </Text>
              <MaterialCommunityIcons name="earth" size={16} color="#40C057" style={{ opacity: 0.6 }} />
            </Animated.View>
          )}
        </Animated.View>
      </LinearGradient>

      {activeTab === "personal" ? (
        // ================= KİŞİSEL MOD =================
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          {/* Presets */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 16, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {PRESETS.map((p, i) => (
                <TouchableOpacity key={p.name} onPress={() => { setSelectedPreset(i); setCount(0); }} activeOpacity={0.7}>
                  <View style={{
                    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: selectedPreset === i ? `${p.color}60` : "rgba(27,67,50,0.15)",
                    backgroundColor: selectedPreset === i ? `${p.color}12` : "rgba(18,26,36,0.5)",
                  }}>
                    <Text style={{ color: selectedPreset === i ? p.color : "#5A6B78", fontSize: 12, fontWeight: "600" }}>{p.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Arapça */}
          <Animated.View entering={FadeInDown.delay(250).springify()} style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ color: preset.color, fontSize: 24, fontFamily: "NotoNaskhArabic_700Bold", opacity: 0.8 }}>
              {preset.arabic}
            </Text>
          </Animated.View>

          {/* Counter - Tıklanabilir büyük daire */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Animated.View style={buttonStyle}>
                <TouchableOpacity onPress={handleCount} activeOpacity={0.85} style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: "center", justifyContent: "center" }}>
                  {/* Ripple Effect Layer */}
                  <Animated.View style={[{
                    position: "absolute",
                    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
                    backgroundColor: preset.color,
                  }, rippleStyle]} />

                  <View style={{ position: "absolute", width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, borderWidth: 3, borderColor: "rgba(27,67,50,0.15)" }} />
                  <View style={{
                    position: "absolute", width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
                    borderWidth: 3,
                    borderColor: isComplete ? "#40C057" : preset.color,
                    borderTopColor: progress < 25 ? "transparent" : (isComplete ? "#40C057" : preset.color),
                    borderRightColor: progress < 50 ? "transparent" : (isComplete ? "#40C057" : preset.color),
                    borderBottomColor: progress < 75 ? "transparent" : (isComplete ? "#40C057" : preset.color),
                    transform: [{ rotate: "-90deg" }], opacity: 0.6,
                  }} />
                  <View style={{ position: "absolute", width: CIRCLE_SIZE - 20, height: CIRCLE_SIZE - 20, borderRadius: (CIRCLE_SIZE - 20) / 2, borderWidth: 1, borderColor: `${preset.color}15` }} />

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: preset.color, fontSize: 14, fontWeight: "600", opacity: 0.7 }}>{preset.name}</Text>
                    <Text style={{ color: isComplete ? "#40C057" : "#ECDFCC", fontSize: 58, fontWeight: "800", lineHeight: 68 }}>{count}</Text>
                    <Text style={{ color: "#5A6B78", fontSize: 14, fontWeight: "500" }}>/ {target}</Text>
                    {isComplete && (
                      <Animated.View entering={FadeInDown.springify()} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                        <Ionicons name="checkmark-circle" size={16} color="#40C057" />
                        <Text style={{ color: "#40C057", fontSize: 13, fontWeight: "700", marginLeft: 4 }}>Tamamlandı!</Text>
                      </Animated.View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>

            {/* İlerleme */}
            <View style={{ marginTop: 20, width: width - 80, height: 4, borderRadius: 2, backgroundColor: "rgba(27,67,50,0.15)" }}>
              <Animated.View style={{ height: 4, borderRadius: 2, backgroundColor: isComplete ? "#40C057" : preset.color, width: `${progress}%` }} />
            </View>

            <View style={{ flexDirection: "row", marginTop: 16, gap: 20 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#5A6B78", fontSize: 11, fontWeight: "500" }}>İlerleme</Text>
                <Text style={{ color: preset.color, fontSize: 18, fontWeight: "700" }}>%{progress.toFixed(0)}</Text>
              </View>
              <View style={{ width: 1, height: 30, backgroundColor: "rgba(27,67,50,0.2)" }} />
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#5A6B78", fontSize: 11, fontWeight: "500" }}>Kalan</Text>
                <Text style={{ color: "#ECDFCC", fontSize: 18, fontWeight: "700" }}>{Math.max(target - count, 0)}</Text>
              </View>
              <View style={{ width: 1, height: 30, backgroundColor: "rgba(27,67,50,0.2)" }} />
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#5A6B78", fontSize: 11, fontWeight: "500" }}>Bugün</Text>
                <Text style={{ color: "#ECDFCC", fontSize: 18, fontWeight: "700" }}>{totalToday}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleReset} style={{ marginTop: 20 }} activeOpacity={0.7}>
              <View style={{ paddingHorizontal: 22, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: "rgba(243,87,87,0.2)", backgroundColor: "rgba(243,87,87,0.05)", flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="refresh" size={14} color="#F35757" />
                <Text style={{ color: "#F35757", fontSize: 13, fontWeight: "600", marginLeft: 6 }}>Sıfırla</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
      ) : (

        // ================= ORTAK MOD =================
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }}>
          
          <Animated.View entering={FadeInRight.delay(100).springify()} style={{ marginTop: 24, backgroundColor: "rgba(18,26,36,0.6)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(27,67,50,0.2)" }}>
            <Text style={{ color: "#ECDFCC", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Davet Kodu ile Katıl</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                style={{ flex: 1, backgroundColor: "#0A0F14", borderRadius: 10, borderWidth: 1, borderColor: "#233345", color: "#ECDFCC", paddingHorizontal: 16, height: 48, fontSize: 15, fontFamily: "Inter_600SemiBold", textTransform: "uppercase" }}
                placeholder="Örn: A7X9Z2"
                placeholderTextColor="#5A6B78"
                autoCapitalize="characters"
                maxLength={6}
                value={joinCode}
                onChangeText={setJoinCode}
              />
              <TouchableOpacity
                style={{ backgroundColor: "#40C057", borderRadius: 10, height: 48, paddingHorizontal: 20, justifyContent: "center", alignItems: "center" }}
                activeOpacity={0.8}
                onPress={handleJoin}
                disabled={isJoining || joinCode.length < 5}
              >
                {isJoining ? <ActivityIndicator color="#0A1A14" /> : <Text style={{ color: "#0A1A14", fontWeight: "700", fontSize: 14 }}>Katıl</Text>}
              </TouchableOpacity>
            </View>
            {joinError ? <Text style={{ color: "#F35757", fontSize: 12, marginTop: 8 }}>{joinError}</Text> : null}
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(200).springify()} style={{ marginTop: 16, backgroundColor: "rgba(18,26,36,0.6)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(27,67,50,0.2)" }}>
            <Text style={{ color: "#ECDFCC", fontSize: 16, fontWeight: "700", marginBottom: 6 }}>Yeni Zikir Dağıt</Text>
            <Text style={{ color: "#8A9BA8", fontSize: 13, marginBottom: 16 }}>Arkadaşlarınla paylaşmak için hedefler belirle.</Text>
            
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#5A6B78", fontSize: 12, fontWeight: "600", marginBottom: 6, marginLeft: 2 }}>Kampanya Başlığı</Text>
                  <TextInput
                    style={{ backgroundColor: "#0A0F14", borderRadius: 10, borderWidth: 1, borderColor: "#233345", color: "#ECDFCC", paddingHorizontal: 16, height: 48, fontSize: 15 }}
                    placeholder="Örn: Filistin için Salavat"
                    placeholderTextColor="#5A6B78"
                    value={createTitle}
                    onChangeText={setCreateTitle}
                  />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={{ color: "#5A6B78", fontSize: 12, fontWeight: "600", marginBottom: 6, marginLeft: 2 }}>Hedef Sayı</Text>
                  <TextInput
                    style={{ backgroundColor: "#0A0F14", borderRadius: 10, borderWidth: 1, borderColor: "#233345", color: "#ECDFCC", paddingHorizontal: 16, height: 48, fontSize: 15 }}
                    placeholder="70000"
                    placeholderTextColor="#5A6B78"
                    keyboardType="number-pad"
                    value={createTarget}
                    onChangeText={setCreateTarget}
                  />
                </View>
              </View>

              <View>
                 <Text style={{ color: "#5A6B78", fontSize: 12, fontWeight: "600", marginBottom: 6, marginLeft: 2 }}>Zikir Türü Seçin</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                   {SHARED_PRESETS.map((p, i) => (
                     <TouchableOpacity 
                       key={`shared-${p.name}`} 
                       onPress={() => setCreatePresetIndex(i)}
                       activeOpacity={0.7}
                       style={{
                         paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                         borderWidth: 1.5,
                         borderColor: createPresetIndex === i ? `${p.color}60` : "rgba(27,67,50,0.15)",
                         backgroundColor: createPresetIndex === i ? `${p.color}12` : "rgba(18,26,36,0.5)",
                       }}
                     >
                       <Text style={{ color: createPresetIndex === i ? p.color : "#5A6B78", fontSize: 12, fontWeight: "600" }}>{p.name}</Text>
                     </TouchableOpacity>
                   ))}
                 </ScrollView>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: "#1B4332", borderWidth: 1, borderColor: "#2D6A4F", borderRadius: 10, height: 48, marginTop: 8, justifyContent: "center", alignItems: "center" }}
                activeOpacity={0.8}
                onPress={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? <ActivityIndicator color="#40C057" /> : <Text style={{ color: "#40C057", fontWeight: "700", fontSize: 14 }}>Halkayı Başlat</Text>}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Mevcut Katıldığı Zikirler */}
          {joinedDhikrs.length > 0 && (
            <Animated.View entering={FadeInRight.delay(300).springify()} style={{ marginTop: 24 }}>
              <Text style={{ color: "#ECDFCC", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Katıldığım Zikirler</Text>
              <View style={{ gap: 12 }}>
                {joinedDhikrs.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    onPress={() => router.push(`/shared-dhikr/${item.id}`)}
                    activeOpacity={0.8}
                    style={{ backgroundColor: "rgba(18,26,36,0.6)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(27,67,50,0.2)", flexDirection: "row", alignItems: "center" }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(64,192,87,0.1)", justifyContent: "center", alignItems: "center" }}>
                      <FontAwesome5 name="users" size={16} color="#40C057" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: "#ECDFCC", fontSize: 15, fontWeight: "600" }} numberOfLines={1}>{item.title}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                        <Text style={{ color: "#8A9BA8", fontSize: 12 }}>{item.presetName} • </Text>
                        <Text style={{ color: "#40C057", fontSize: 12, fontWeight: "600" }}>Benim Katkım: {item.myContribution}</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#5A6B78" />
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

        </ScrollView>
      )}

      {showConfetti && (
        <ConfettiCannon
          count={120}
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

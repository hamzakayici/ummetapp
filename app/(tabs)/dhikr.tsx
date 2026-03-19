import { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { hapticImpact, hapticNotification, ImpactFeedbackStyle, NotificationFeedbackType } from "../../src/utils/haptics";
import Animated, {
  FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, withRepeat
} from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";
import { useDhikrStore } from "../../src/stores/appStore";
import { supabase } from "../../src/services/supabase";

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

export default function DhikrScreen() {
  const insets = useSafeAreaInsets();
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

          {/* REALTIME GLOBAL ZİKİR HALKASI */}
          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(64,192,87,0.12)", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(64,192,87,0.2)" }}>
            <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#40C057", marginRight: 8, shadowColor: "#40C057", shadowOpacity: 0.8, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }, pulseStyle]} />
            <Text style={{ color: "#40C057", fontSize: 13, fontWeight: "600", flex: 1 }}>
              {liveUsers === 1 ? "Küresel zikir halkasına bağlandınız" : `Şu an dünyada ${liveUsers} kişiyle zikir halkasındasınız`}
            </Text>
            <MaterialCommunityIcons name="earth" size={16} color="#40C057" style={{ opacity: 0.6 }} />
          </View>
        </Animated.View>
      </LinearGradient>

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

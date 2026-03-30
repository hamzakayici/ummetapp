import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Share, Vibration } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming, withRepeat } from "react-native-reanimated";
import ConfettiCannon from "react-native-confetti-cannon";

import { supabase } from "../../src/services/supabase";
import { getSharedDhikrById, incrementSharedDhikr, SharedDhikr } from "../../src/services/sharedDhikr";
import { useSharedDhikrStore } from "../../src/stores/appStore";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.6;

export default function LiveSharedDhikrScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [dhikrData, setDhikrData] = useState<SharedDhikr | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const incrementMyContribution = useSharedDhikrStore((state) => state.incrementMyContribution);
  const myTotalContribution = useSharedDhikrStore((state) => state.getContribution(id as string));

  // Batching sistemi için refs: Çok hızlı basmaları toplayıp saniyede 1 kere veritabanına atacağız.
  const unsyncedCount = useRef(0);
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  // Animasyon Değerleri
  const scaleValue = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  
  const pulseOpacity = useSharedValue(1);
  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      true
    );
  }, []);

  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: scaleValue.value }] }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    
    // 1. Veriyi çek
    const fetchDhikr = async () => {
      const { data, error } = await getSharedDhikrById(id);
      if (error || !data) {
        alert("Zikir bulunamadı veya silinmiş.");
        router.back();
        return;
      }
      if (isMounted) {
        setDhikrData(data);
        setLoading(false);
      }
    };

    fetchDhikr();

    // 2. Canlı veritabanı dinlemesi (Realtime)
    const channel = supabase
      .channel(`shared_dhikr_${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shared_dhikrs",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          if (isMounted && payload.new) {
            setDhikrData((prev) => {
              // Eğer hedefe yeni ulaştıysa konfeti
              if (prev && payload.new.current_count >= payload.new.target_count && prev.current_count < prev.target_count) {
                setShowConfetti(true);
              }
              return payload.new as SharedDhikr;
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      // Çıkarken senkronlanmamış kalan zikirleri son kez at:
      if (unsyncedCount.current > 0) {
        incrementSharedDhikr(id, unsyncedCount.current);
      }
    };
  }, [id]);


  const handlePress = useCallback(() => {
    if (!dhikrData) return;
    
    // Zaten bittiyse devam etme (isteğe bağlı, şimdilik hedefe ulaşılsa bile eklenebilir ama engelliyoruz)
    if (dhikrData.current_count >= dhikrData.target_count) {
      Vibration.vibrate([0, 50, 0, 50]); 
      return; 
    }

    Vibration.vibrate(40); // Haptic
    
    // Ripple Effect
    rippleScale.value = 0.5;
    rippleOpacity.value = 0.6;
    rippleScale.value = withTiming(1.6, { duration: 400 });
    rippleOpacity.value = withTiming(0, { duration: 400 });
    scaleValue.value = withSequence(withSpring(0.85, { damping: 12 }), withSpring(1, { damping: 10 }));

    // Local state anlık güncelleme (Daha akıcı UX için)
    setDhikrData((prev) => prev ? { ...prev, current_count: prev.current_count + 1 } : prev);
    incrementMyContribution(id, 1);

    // Batching işlemleri
    unsyncedCount.current += 1;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);

    // Kullanıcı durduğunda (1 saniye hareketsizlik) veritabanına yolla
    syncTimeout.current = setTimeout(() => {
      if (unsyncedCount.current > 0) {
        const amount = unsyncedCount.current;
        unsyncedCount.current = 0; // Sıfırla
        incrementSharedDhikr(id, amount);
      }
    }, 1000);
    
  }, [dhikrData, id]);

  const onShare = async () => {
    if (!dhikrData) return;
    try {
      await Share.share({
        message: `Hayırlı günler! Birlikte "${dhikrData.title}" için zikir halkası başlattım.\n\nHedef: ${dhikrData.target_count} ${dhikrData.preset_name}\n\nUygulamayı indirip Zikir -> Ortak Zikir sekmesine girerek katılabilirsin.\n\n🎟️ KATILIM KODU: ${dhikrData.share_code}`,
      });
    } catch (error) {
      console.log("Paylaşım hatası", error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0E17", justifyContent: "center", alignItems: "center" }}>
         <ActivityIndicator size="large" color="#40C057" />
      </View>
    );
  }

  if (!dhikrData) return null;

  const progress = Math.min((dhikrData.current_count / dhikrData.target_count) * 100, 100);
  const isComplete = dhikrData.current_count >= dhikrData.target_count;
  const dbColor = "#40C057";

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#1B4332", "#0A0F14"]} style={{ paddingTop: insets.top + 8, paddingBottom: 24, paddingHorizontal: 20 }}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100).springify()} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" }}>
             <Ionicons name="arrow-back" size={20} color="#ECDFCC" />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(64,192,87,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 }}>
             <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#40C057", marginRight: 6 }, pulseStyle]} />
             <Text style={{ color: "#40C057", fontSize: 13, fontWeight: "600" }}>Canlı Senkronize</Text>
          </View>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={{ marginTop: 24 }}>
           <Text style={{ color: "#8A9BA8", fontSize: 14, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 }}>{dhikrData.preset_name}</Text>
           <Text style={{ color: "#ECDFCC", fontSize: 26, fontWeight: "800", marginTop: 4 }}>{dhikrData.title}</Text>
           
           <TouchableOpacity onPress={onShare} activeOpacity={0.8}>
             <View style={{ marginTop: 16, backgroundColor: "rgba(64,192,87,0.15)", borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "rgba(64,192,87,0.3)" }}>
               <View>
                 <Text style={{ color: "#8A9BA8", fontSize: 11, fontWeight: "600" }}>Davet Kodu</Text>
                 <Text style={{ color: "#ECDFCC", fontSize: 22, fontWeight: "800", letterSpacing: 2 }}>{dhikrData.share_code}</Text>
               </View>
               <View style={{ backgroundColor: "#40C057", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: "row", alignItems: "center" }}>
                 <Ionicons name="share-social" size={16} color="#0A1A14" />
                 <Text style={{ color: "#0A1A14", fontWeight: "700", marginLeft: 6 }}>Paylaş</Text>
               </View>
             </View>
           </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Main Counter Hub */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ alignItems: "center", marginBottom: 30 }}>
             <Text style={{ color: "#5A6B78", fontSize: 13, fontWeight: "600" }}>Senin Doğrudan Katkın</Text>
             <Text style={{ color: "#40C057", fontSize: 24, fontWeight: "800" }}>{myTotalContribution}</Text>
          </Animated.View>

          {/* CIRCLE CLICKER */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Animated.View style={buttonStyle}>
                <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: "center", justifyContent: "center" }}>
                  
                  {/* Ripple Effect Layer */}
                  <Animated.View style={[{
                    position: "absolute",
                    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
                    backgroundColor: dbColor,
                  }, rippleStyle]} />

                  {/* Base Circle Border */}
                  <View style={{ position: "absolute", width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, borderWidth: 3, borderColor: "rgba(27,67,50,0.15)" }} />
                  
                  {/* Progress Arc Simulation */}
                  <View style={{
                    position: "absolute", width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
                    borderWidth: 4,
                    borderColor: dbColor,
                    borderTopColor: progress < 25 ? "transparent" : dbColor,
                    borderRightColor: progress < 50 ? "transparent" : dbColor,
                    borderBottomColor: progress < 75 ? "transparent" : dbColor,
                    transform: [{ rotate: "-90deg" }], opacity: 0.8,
                  }} />
                  
                  <View style={{ position: "absolute", width: CIRCLE_SIZE - 20, height: CIRCLE_SIZE - 20, borderRadius: (CIRCLE_SIZE - 20) / 2, borderWidth: 1, borderColor: `${dbColor}15` }} />

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: dbColor, fontSize: 13, fontWeight: "600", opacity: 0.8 }}>Toplam Çekilen</Text>
                    <Text style={{ color: isComplete ? "#D4AF37" : "#ECDFCC", fontSize: 50, fontWeight: "800", lineHeight: 60 }} adjustsFontSizeToFit numberOfLines={1}>
                        {dhikrData.current_count.toLocaleString("tr-TR")}
                    </Text>
                    <Text style={{ color: "#5A6B78", fontSize: 14, fontWeight: "500" }}>/ {dhikrData.target_count.toLocaleString("tr-TR")}</Text>
                    {isComplete && (
                      <Animated.View entering={FadeInDown.springify()} style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                        <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                        <Text style={{ color: "#D4AF37", fontSize: 13, fontWeight: "700", marginLeft: 4 }}>Hedefe Ulaşıldı!</Text>
                      </Animated.View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>


          {/* ProgressBar System */}
          <Animated.View entering={FadeInDown.delay(350).springify()} style={{ marginTop: 40, alignItems: "center" }}>
             <View style={{ width: width - 80, height: 6, borderRadius: 3, backgroundColor: "rgba(27,67,50,0.15)", overflow: "hidden" }}>
               <Animated.View style={{ height: 6, borderRadius: 3, backgroundColor: isComplete ? "#D4AF37" : dbColor, width: `${progress}%` }} />
             </View>
             
             <View style={{ flexDirection: "row", width: width - 80, justifyContent: "space-between", marginTop: 8 }}>
                <Text style={{ color: "#5A6B78", fontSize: 12, fontWeight: "600" }}>Kalan: {Math.max(dhikrData.target_count - dhikrData.current_count, 0).toLocaleString("tr-TR")}</Text>
                <Text style={{ color: "#40C057", fontSize: 12, fontWeight: "600" }}>%{progress.toFixed(1)}</Text>
             </View>
          </Animated.View>

      </View>

      {showConfetti && (
        <ConfettiCannon count={150} origin={{ x: width / 2, y: -20 }} fallSpeed={2500} autoStart={true} fadeOut={true} colors={['#D4AF37', '#40C057', '#F0D060']} />
      )}
    </View>
  );
}

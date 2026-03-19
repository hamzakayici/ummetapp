import { useEffect } from "react";
import { Tabs } from "expo-router";
import { View, Text, Pressable, Platform, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const TAB_CONFIG: {
  name: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
}[] = [
  { name: "index", icon: "mosque", label: "Namaz" },
  { name: "quran", icon: "book-open-page-variant", label: "Kuran" },
  { name: "tracker", icon: "chart-timeline-variant-shimmer", label: "Takip" },
  { name: "dhikr", icon: "infinity", label: "Zikir" },
  { name: "more", icon: "star-crescent", label: "Diğer" },
];

const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.8 };

function AnimatedTab({
  icon,
  label,
  isFocused,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(isFocused ? 1.15 : 1);
  const translateY = useSharedValue(isFocused ? -2 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.15 : 1, SPRING_CONFIG);
    translateY.value = withSpring(isFocused ? -2 : 0, SPRING_CONFIG);
  }, [isFocused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
      }}
    >
      <Animated.View style={[{ alignItems: "center", justifyContent: "center" }, animStyle]}>
        <MaterialCommunityIcons
          name={icon}
          size={isFocused ? 26 : 21}
          color={isFocused ? "#D4AF37" : "#5A6B78"}
        />
        <Text
          style={{
            fontSize: isFocused ? 10.5 : 10,
            marginTop: 2,
            fontWeight: isFocused ? "700" : "500",
            color: isFocused ? "#D4AF37" : "#5A6B78",
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: "absolute",
        bottom: Platform.OS === "ios" ? Math.max(insets.bottom, 12) : 16,
        left: 20,
        right: 20,
        height: 64,
        borderRadius: 32,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 20,
      }}
    >
      <BlurView tint="dark" intensity={90} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(8, 12, 18, 0.55)" }]} />

      <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG.find((t) => t.name === route.name);
          if (!config) return null;

          return (
            <AnimatedTab
              key={route.key}
              icon={config.icon}
              label={config.label}
              isFocused={isFocused}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false, }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="quran" />
      <Tabs.Screen name="tracker" />
      <Tabs.Screen name="dhikr" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

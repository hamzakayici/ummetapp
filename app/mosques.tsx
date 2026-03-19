import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Linking, Platform, RefreshControl } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import { fetchNearbyMosques, formatDistance, type Mosque } from "../src/services/mosqueService";
import { hapticImpact, ImpactFeedbackStyle } from "../src/utils/haptics";

const RADIUS_OPTIONS = [1000, 3000, 5000, 10000]; // metre
const RADIUS_LABELS = ["1 km", "3 km", "5 km", "10 km"];

export default function MosquesScreen() {
  const insets = useSafeAreaInsets();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radiusIdx, setRadiusIdx] = useState(2); // 5km varsayılan
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

  const loadMosques = useCallback(async (radius?: number) => {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Konum izni verilmedi. Ayarlardan konum iznini açın.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLat(loc.coords.latitude);
      setUserLon(loc.coords.longitude);

      const data = await fetchNearbyMosques(
        loc.coords.latitude,
        loc.coords.longitude,
        radius ?? RADIUS_OPTIONS[radiusIdx],
      );
      setMosques(data);
    } catch (e: any) {
      setError(e.message || "Camiler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [radiusIdx]);

  useEffect(() => {
    loadMosques();
  }, []);

  const handleRadiusChange = (idx: number) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    setRadiusIdx(idx);
    setLoading(true);
    setMosques([]);
    loadMosques(RADIUS_OPTIONS[idx]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMosques();
  };

  const openInMaps = (mosque: Mosque) => {
    hapticImpact(ImpactFeedbackStyle.Light);
    const url = Platform.select({
      ios: `maps:0,0?q=${mosque.name}@${mosque.lat},${mosque.lon}`,
      android: `geo:${mosque.lat},${mosque.lon}?q=${mosque.lat},${mosque.lon}(${encodeURIComponent(mosque.name)})`,
    });
    if (url) Linking.openURL(url);
  };

  const renderMosque = useCallback(({ item, index }: { item: Mosque; index: number }) => {
    const isNear = item.distance < 500;
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => openInMaps(item)}>
        <View style={{
          marginHorizontal: 16, marginBottom: 10, padding: 16, borderRadius: 16,
          backgroundColor: "rgba(10,24,18,0.7)", borderWidth: 1,
          borderColor: isNear ? "rgba(45,106,79,0.2)" : "rgba(255,255,255,0.04)",
        }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {/* İkon */}
            <View style={{
              width: 44, height: 44, borderRadius: 14,
              backgroundColor: isNear ? "rgba(45,106,79,0.2)" : "rgba(27,67,50,0.15)",
              alignItems: "center", justifyContent: "center", marginRight: 14,
            }}>
              <MaterialCommunityIcons name="mosque" size={22} color={isNear ? "#40C057" : "#5A6B78"} />
            </View>

            {/* Bilgi */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700", marginBottom: 3 }} numberOfLines={2}>
                {item.name}
              </Text>
              {item.address && (
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 2 }} numberOfLines={1}>
                  {item.address}
                </Text>
              )}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <MaterialCommunityIcons name="map-marker-distance" size={13} color={isNear ? "#40C057" : "#5A6B78"} />
                <Text style={{ color: isNear ? "#40C057" : "#5A6B78", fontSize: 12, fontWeight: "600", marginLeft: 4 }}>
                  {formatDistance(item.distance)}
                </Text>
              </View>
            </View>

            {/* Navigasyon */}
            <View style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: "rgba(45,106,79,0.15)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Ionicons name="navigate" size={16} color="#40C057" />
            </View>
          </View>

          {/* Telefon / Website */}
          {(item.phone || item.website) && (
            <View style={{ flexDirection: "row", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)", gap: 12 }}>
              {item.phone && (
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="call-outline" size={13} color="#5A6B78" />
                  <Text style={{ color: "#5A6B78", fontSize: 12, marginLeft: 4 }}>{item.phone}</Text>
                </TouchableOpacity>
              )}
              {item.website && (
                <TouchableOpacity onPress={() => Linking.openURL(item.website!)} style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="globe-outline" size={13} color="#5A6B78" />
                  <Text style={{ color: "#5A6B78", fontSize: 12, marginLeft: 4 }}>Web Sitesi</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />

      {/* Header */}
      <LinearGradient colors={["#1B4332", "#0A0E17"]} style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color="#40C057" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "700" }}>Yakındaki Camiler</Text>
            <Text style={{ color: "rgba(64,192,87,0.6)", fontSize: 13, marginTop: 2 }}>
              {loading ? "Aranıyor..." : `${mosques.length} cami bulundu`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Yarıçap Filtreleri */}
      <View style={{ paddingVertical: 12 }}>
        <FlatList
          horizontal
          data={RADIUS_LABELS}
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => handleRadiusChange(index)} activeOpacity={0.7}>
              <View style={{
                flexDirection: "row", alignItems: "center",
                paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                backgroundColor: radiusIdx === index ? "#2D6A4F" : "rgba(10,24,18,0.8)",
                borderWidth: 1, borderColor: radiusIdx === index ? "#40C057" : "rgba(255,255,255,0.06)",
              }}>
                <MaterialCommunityIcons name="map-marker-radius" size={14} color={radiusIdx === index ? "#40C057" : "rgba(255,255,255,0.4)"} />
                <Text style={{ color: radiusIdx === index ? "#40C057" : "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600", marginLeft: 6 }}>{item}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Liste */}
      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#40C057" />
          <Text style={{ color: "#5A6B78", fontSize: 14, marginTop: 12 }}>Yakındaki camiler aranıyor...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
          <MaterialCommunityIcons name="map-marker-off" size={48} color="#5A6B78" />
          <Text style={{ color: "#ECDFCC", fontSize: 16, fontWeight: "600", textAlign: "center", marginTop: 14 }}>{error}</Text>
          <TouchableOpacity onPress={() => { setLoading(true); loadMosques(); }} style={{ marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: "rgba(45,106,79,0.3)" }}>
            <Text style={{ color: "#40C057", fontSize: 14, fontWeight: "600" }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={mosques}
          keyExtractor={(m) => String(m.id)}
          renderItem={renderMosque}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#40C057" />}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <MaterialCommunityIcons name="mosque" size={48} color="#5A6B78" />
              <Text style={{ color: "#5A6B78", fontSize: 15, marginTop: 12 }}>Bu yarıçapta cami bulunamadı</Text>
              <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginTop: 4 }}>Yarıçapı artırmayı deneyin</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

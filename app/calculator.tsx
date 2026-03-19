import { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";

type CalcType = "zekat" | "fitre" | "kefaret";

const CONFIGS: Record<CalcType, { title: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; color: string; bg: [string, string] }> = {
  zekat: { title: "Zekât Hesaplayıcı", icon: "cash-multiple", color: "#22D3EE", bg: ["#164E63", "#0A0E17"] },
  fitre: { title: "Fitre Hesaplayıcı", icon: "grain", color: "#84CC16", bg: ["#365314", "#0A0E17"] },
  kefaret: { title: "Kefâret Hesaplayıcı", icon: "calculator-variant", color: "#F59E0B", bg: ["#78350F", "#0A0E17"] },
};

// ═══ 2025 Diyanet Değerleri ═══
const GOLD_PRICE_PER_GRAM = 3180;   // 2025 Mart ortalama gram altın (TL)
const SILVER_PRICE_PER_GRAM = 38;   // 2025 Mart ortalama gram gümüş (TL)
const NISAP_GOLD_GRAM = 80.18;      // 20 miskal = 80.18 gram altın
const NISAP_SILVER_GRAM = 561.2;    // 40 miskal = 561.2 gram gümüş
const NISAP_GOLD_TL = NISAP_GOLD_GRAM * GOLD_PRICE_PER_GRAM;
const FITRE_AMOUNT = 430;           // 2025 Diyanet fitre miktarı (TL)
const FIDYE_DAILY = 430;            // 2025 fitre = fidye günlük miktarı
const KEFARET_DAYS = 60;            // Peş peşe oruç gün sayısı

function safeNum(val: string): number {
  const n = parseFloat(val.replace(",", ".")) || 0;
  return Math.max(0, n);
}

function safeInt(val: string): number {
  const n = parseInt(val) || 0;
  return Math.max(0, Math.min(n, 9999));
}

function formatTL(amount: number): string {
  return amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Input Field ───
function InputField({ label, value, onChange, icon, suffix }: {
  label: string; value: string; onChange: (v: string) => void;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; suffix?: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: "600", marginBottom: 6, marginLeft: 4 }}>{label}</Text>
      <View style={{
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(10,24,18,0.7)", borderRadius: 14,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", paddingHorizontal: 14,
      }}>
        <MaterialCommunityIcons name={icon} size={18} color="rgba(255,255,255,0.25)" />
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.15)"
          style={{ flex: 1, color: "#FFFFFF", fontSize: 17, fontWeight: "600", paddingVertical: 14, marginLeft: 10 }}
        />
        {suffix && <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, fontWeight: "600" }}>{suffix}</Text>}
      </View>
    </View>
  );
}

// ─── Sonuç Satırı ───
function ResultRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 }}>
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: "500" }}>{label}</Text>
      <Text style={{ color: accent ? "#D4AF37" : "#FFFFFF", fontSize: accent ? 20 : 16, fontWeight: accent ? "800" : "600" }}>{value}</Text>
    </View>
  );
}

// ─── Bilgi Kutusu ───
function InfoBox({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", padding: 14, borderRadius: 12, backgroundColor: "rgba(10,24,18,0.5)", marginTop: 16 }}>
      <MaterialCommunityIcons name="information-outline" size={16} color="rgba(255,255,255,0.3)" style={{ marginTop: 2, marginRight: 10 }} />
      <Text style={{ flex: 1, color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 18 }}>{text}</Text>
    </View>
  );
}

// ═══ ZEKÂT ═══
function ZekatCalculator() {
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [cash, setCash] = useState("");
  const [stocks, setStocks] = useState("");
  const [property, setProperty] = useState("");
  const [debts, setDebts] = useState("");

  const goldVal = safeNum(gold) * GOLD_PRICE_PER_GRAM;
  const silverVal = safeNum(silver) * SILVER_PRICE_PER_GRAM;
  const cashVal = safeNum(cash);
  const stockVal = safeNum(stocks);
  const propertyVal = safeNum(property);
  const debtVal = safeNum(debts);

  const totalAssets = goldVal + silverVal + cashVal + stockVal + propertyVal;
  const netAssets = totalAssets - debtVal;
  const zekatDue = netAssets >= NISAP_GOLD_TL;
  const zekatAmount = zekatDue ? netAssets * 0.025 : 0;

  const hasInput = gold || silver || cash || stocks || property || debts;

  return (
    <>
      <InputField label="Altın (gram)" value={gold} onChange={setGold} icon="gold" suffix="gram" />
      <InputField label="Gümüş (gram)" value={silver} onChange={setSilver} icon="circle-outline" suffix="gram" />
      <InputField label="Nakit Para" value={cash} onChange={setCash} icon="cash" suffix="₺" />
      <InputField label="Hisse / Yatırım" value={stocks} onChange={setStocks} icon="chart-line" suffix="₺" />
      <InputField label="Kira Geliri / Ticari Mal" value={property} onChange={setProperty} icon="store" suffix="₺" />
      <InputField label="Borçlar (Düşülecek)" value={debts} onChange={setDebts} icon="minus-circle-outline" suffix="₺" />

      {hasInput ? (
        <View style={{
          marginTop: 20, padding: 18, borderRadius: 16,
          backgroundColor: zekatDue ? "rgba(212,175,55,0.08)" : "rgba(18,26,36,0.6)",
          borderWidth: 1, borderColor: zekatDue ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)",
        }}>
          {/* Başlık */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <MaterialCommunityIcons name={zekatDue ? "check-circle" : "information"} size={18} color={zekatDue ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
            <Text style={{ color: zekatDue ? "#D4AF37" : "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: "700", marginLeft: 8 }}>
              {zekatDue ? "Zekât vermeniz gerekiyor" : "Nisap miktarına ulaşılmadı"}
            </Text>
          </View>

          {/* Detay */}
          {goldVal > 0 && <ResultRow label="Altın değeri" value={`${formatTL(goldVal)} ₺`} />}
          {silverVal > 0 && <ResultRow label="Gümüş değeri" value={`${formatTL(silverVal)} ₺`} />}
          {cashVal > 0 && <ResultRow label="Nakit" value={`${formatTL(cashVal)} ₺`} />}
          {stockVal > 0 && <ResultRow label="Hisse / Yatırım" value={`${formatTL(stockVal)} ₺`} />}
          {propertyVal > 0 && <ResultRow label="Kira / Ticari Mal" value={`${formatTL(propertyVal)} ₺`} />}
          {debtVal > 0 && <ResultRow label="Borçlar (−)" value={`−${formatTL(debtVal)} ₺`} />}

          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 8 }} />
          <ResultRow label="Toplam Net Varlık" value={`${formatTL(netAssets)} ₺`} />
          <ResultRow label="Nisap (80.18g Altın)" value={`${formatTL(NISAP_GOLD_TL)} ₺`} />

          {zekatDue && (
            <>
              <View style={{ height: 1, backgroundColor: "rgba(212,175,55,0.15)", marginVertical: 10 }} />
              <ResultRow label="Zekât Miktarı (%2.5)" value={`${formatTL(zekatAmount)} ₺`} accent />
            </>
          )}
        </View>
      ) : null}

      <InfoBox text={`Zekât, nisap miktarına ulaşan ve üzerinden 1 yıl geçen malvarlığının %2,5'idir. Nisap: ${NISAP_GOLD_GRAM}g altın = ${formatTL(NISAP_GOLD_TL)} ₺ (${new Date().getFullYear()} tahmini).`} />
    </>
  );
}

// ═══ FİTRE ═══
function FitreCalculator() {
  const [familySize, setFamilySize] = useState("1");
  const count = safeInt(familySize) || 1;
  const total = count * FITRE_AMOUNT;

  return (
    <>
      <InputField label="Aile Kişi Sayısı" value={familySize} onChange={setFamilySize} icon="account-group" suffix="kişi" />

      <View style={{
        marginTop: 20, padding: 18, borderRadius: 16,
        backgroundColor: "rgba(132,204,22,0.06)", borderWidth: 1, borderColor: "rgba(132,204,22,0.15)",
      }}>
        <ResultRow label="Kişi başı fitre" value={`${FITRE_AMOUNT} ₺`} />
        <ResultRow label="Kişi sayısı" value={`${count}`} />
        <View style={{ height: 1, backgroundColor: "rgba(132,204,22,0.1)", marginVertical: 8 }} />
        <ResultRow label="Toplam Fitre" value={`${formatTL(total)} ₺`} accent />
      </View>

      <InfoBox text="Fitre (sadaka-i fıtır), Ramazan'da oruç tutabilecek her Müslümanın bayram namazından önce vermesi gereken sadakadır. Miktar Diyanet İşleri Başkanlığı'nca yıllık belirlenir." />
    </>
  );
}

// ═══ KEFÂRET ═══
function KefaretCalculator() {
  const [days, setDays] = useState("1");
  const count = safeInt(days) || 1;

  // Kefâret: kasten bozulan her oruç için 60 gün peş peşe oruç VEYA 60 fakir doyurmak
  const kefaretFastDays = count * KEFARET_DAYS;
  const kefaretFeedCost = count * KEFARET_DAYS * FIDYE_DAILY;

  // Fidye: sağlık sebebiyle oruç tutamayanlara — gün başına 1 fitre
  const fidye = count * FIDYE_DAILY;

  return (
    <>
      <InputField label="Gün Sayısı" value={days} onChange={setDays} icon="calendar-remove" suffix="gün" />

      {/* Kefâret — Oruç */}
      <View style={{
        marginTop: 16, padding: 18, borderRadius: 16,
        backgroundColor: "rgba(245,158,11,0.06)", borderWidth: 1, borderColor: "rgba(245,158,11,0.12)",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <MaterialCommunityIcons name="food-apple" size={18} color="#F59E0B" />
          <Text style={{ color: "#F59E0B", fontSize: 15, fontWeight: "700", marginLeft: 8 }}>Kefâret: Oruç Tutmak</Text>
        </View>
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800" }}>{kefaretFastDays} gün</Text>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 6, lineHeight: 18 }}>
          Kasten bozulan her oruç için aralıksız {KEFARET_DAYS} gün oruç tutulmalıdır.
          {count > 1 ? ` (${count} oruç × ${KEFARET_DAYS} gün)` : ""}
        </Text>
      </View>

      {/* Kefâret — Fakir Doyurmak */}
      <View style={{
        marginTop: 12, padding: 18, borderRadius: 16,
        backgroundColor: "rgba(245,158,11,0.06)", borderWidth: 1, borderColor: "rgba(245,158,11,0.12)",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <MaterialCommunityIcons name="hand-heart" size={18} color="#F59E0B" />
          <Text style={{ color: "#F59E0B", fontSize: 15, fontWeight: "700", marginLeft: 8 }}>Kefâret: Fakir Doyurmak</Text>
        </View>
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800" }}>{formatTL(kefaretFeedCost)} ₺</Text>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 6, lineHeight: 18 }}>
          Oruç tutamıyorsanız, {KEFARET_DAYS} fakiri sabah-akşam doyurmak gerekir.
          {count > 1 ? ` (${count} oruç × ${KEFARET_DAYS} × ${FIDYE_DAILY} ₺)` : ` (${KEFARET_DAYS} × ${FIDYE_DAILY} ₺)`}
        </Text>
      </View>

      {/* Fidye */}
      <View style={{
        marginTop: 12, padding: 18, borderRadius: 16,
        backgroundColor: "rgba(212,175,55,0.06)", borderWidth: 1, borderColor: "rgba(212,175,55,0.12)",
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <MaterialCommunityIcons name="heart-pulse" size={18} color="#D4AF37" />
          <Text style={{ color: "#D4AF37", fontSize: 15, fontWeight: "700", marginLeft: 8 }}>Fidye (Oruç Tutamayanlar)</Text>
        </View>
        <Text style={{ color: "#D4AF37", fontSize: 28, fontWeight: "800" }}>{formatTL(fidye)} ₺</Text>
        <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 6, lineHeight: 18 }}>
          Hastalık veya yaşlılık sebebiyle oruç tutamayan kişiler, her gün için fidye verir.
          {count > 1 ? ` (${count} gün × ${FIDYE_DAILY} ₺)` : ""}
        </Text>
      </View>

      <InfoBox text="Kefâret, Ramazan orucunu bilerek ve kasten bozan kişinin ödemesi gereken cezadır. Fidye ise sağlık engeli sebebiyle oruç tutamayanların her gün için ödediği miktardır. Miktar Diyanet'in belirlediği fitre bedeline eşittir." />
    </>
  );
}

// ═══ ANA SAYFA ═══
export default function CalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { type } = useLocalSearchParams<{ type: string }>();
  const calcType = (type as CalcType) || "zekat";
  const config = CONFIGS[calcType];

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E17" }}>
      <LinearGradient colors={["#0A0E17", "#1B4332", "#0A0E17"]} locations={[0, 0.4, 1]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />

      {/* Header */}
      <LinearGradient colors={config.bg} style={{ paddingTop: insets.top + 8, paddingBottom: 18, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="chevron-back" size={22} color={config.color} />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
            <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
            <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "700", marginLeft: 8 }}>{config.title}</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
        >
          {calcType === "zekat" && <ZekatCalculator />}
          {calcType === "fitre" && <FitreCalculator />}
          {calcType === "kefaret" && <KefaretCalculator />}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

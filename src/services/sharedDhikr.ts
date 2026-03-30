import { supabase } from "./supabase";

export interface SharedDhikr {
  id: string;
  title: string;
  preset_name: string;
  target_count: number;
  current_count: number;
  share_code: string;
  creator_device_id?: string;
  created_at?: string;
}

// Yeni bir kampanya üretimi
export const createSharedDhikr = async (
  title: string,
  presetName: string,
  targetCount: number,
  deviceId?: string
): Promise<{ data: SharedDhikr | null; error: any }> => {
  // Rastgele 6 haneli kod
  const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from("shared_dhikrs")
    .insert([
      {
        title,
        preset_name: presetName,
        target_count: targetCount,
        share_code: shareCode,
        creator_device_id: deviceId,
      },
    ])
    .select()
    .single();

  return { data, error };
};

// Koda göre kampanyayı bulma
export const getSharedDhikrByCode = async (
  code: string
): Promise<{ data: SharedDhikr | null; error: any }> => {
  const { data, error } = await supabase
    .from("shared_dhikrs")
    .select("*")
    .ilike("share_code", code.trim())
    .single();

  return { data, error };
};

export const getSharedDhikrById = async (
  id: string
): Promise<{ data: SharedDhikr | null; error: any }> => {
  const { data, error } = await supabase
    .from("shared_dhikrs")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
};

// Cihazın / Kullanıcının daha önce katıldığı veya oluşturduğu zikirleri listelemek 
// (Yerel AsyncStorage'da ID tutmak daha mantıklı anonimlik olduğu için, bunu State üzerinden çözeceğiz)

// Toplu Artırma: 
// Butona her basıldığında network call yaparsak hem kotayı hızlı doldururuz hem de performansı etkileriz.
// O yüzden batch işlemi yapmalıyız. 
export const incrementSharedDhikr = async (id: string, amount: number) => {
  const { error } = await supabase.rpc("increment_shared_dhikr", {
    dhikr_id: id,
    amount: amount,
  });
  if (error) {
    console.error("Zikir arttırma hatası:", error);
  }
};

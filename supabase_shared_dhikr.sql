-- ==========================================
-- UMMET APP: ORTAK ZİKİR (ZİKİR DAĞITMA) SQL
-- Bu scripti Supabase Dashboard -> SQL Editor alanına yapıştırıp "Run" ediniz.
-- ==========================================

-- 1. Shared Dhikrs Tablosunun Oluşturulması
CREATE TABLE IF NOT EXISTS public.shared_dhikrs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    preset_name TEXT NOT NULL,
    target_count BIGINT NOT NULL DEFAULT 0,
    current_count BIGINT NOT NULL DEFAULT 0,
    share_code TEXT UNIQUE NOT NULL,
    creator_device_id TEXT, -- Opsiyonel cihaz ID takibi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Realtime'ı bu tablo için kolayca açmak için (Insert, Update, Delete bildirimleri)
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_dhikrs;

-- Güvenlik (RLS): Herkes okuyabilir, herkes yeni zikir oluşturabilir (Anonim sisteme uygun)
ALTER TABLE public.shared_dhikrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes okuyabilir" 
ON public.shared_dhikrs FOR SELECT 
USING (true);

CREATE POLICY "Herkes oluşturabilir" 
ON public.shared_dhikrs FOR INSERT 
WITH CHECK (true);

-- (Update yetkisini bilerek kapattık, doğrudan update etmek yerine RPC kullanılmalı!)
-- Sadece silmeyi tamamen engelliyoruz. Zikirler kalıcı olsun.
CREATE POLICY "Kimse silemez"
ON public.shared_dhikrs FOR DELETE
USING (false);

-- ==========================================
-- 2. Çoklu Tıklamalardaki Kayıpları Önlemek İçin 
-- RPC (Eşzamanlı Arttırma Fonksiyonu)
-- ==========================================
CREATE OR REPLACE FUNCTION increment_shared_dhikr(dhikr_id UUID, amount INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Belirtilen ID'deki hedefi sadece verilen miktar kadar (amount) artır.
    -- Bu yöntem conflict/race condition yaratmaz, aynı anda 100 kişi yapsa bile hepsi toplanır.
    UPDATE public.shared_dhikrs
    SET current_count = current_count + amount
    WHERE id = dhikr_id;
END;
$$;

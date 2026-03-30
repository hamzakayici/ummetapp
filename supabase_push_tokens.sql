-- ═══════════════════════════════════════════════════════════════
-- Push Tokens Tablosu — Expo Push Notification için
-- Supabase Dashboard > SQL Editor'dan çalıştırın
-- ═══════════════════════════════════════════════════════════════

-- 1. push_tokens tablosu
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expo_push_token TEXT UNIQUE NOT NULL,
  platform TEXT DEFAULT 'ios',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS (Row Level Security) — anon key ile INSERT/UPDATE izni
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Herkes kendi token'ını ekleyebilsin
CREATE POLICY "Allow anonymous insert" ON push_tokens
  FOR INSERT TO anon WITH CHECK (true);

-- Herkes kendi token'ını güncelleyebilsin (upsert için)
CREATE POLICY "Allow anonymous update" ON push_tokens
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Sadece service_role (Edge Function) tüm token'ları okuyabilsin
CREATE POLICY "Service role can read all" ON push_tokens
  FOR SELECT TO service_role USING (true);

-- 3. updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- 4. Index — token araması hızlansın
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(expo_push_token);

-- ═══════════════════════════════════════════════════════════════
-- Cron Job — Her gün 04:00 UTC (07:00 TR) Edge Function tetikle
-- NOT: pg_cron ve pg_net extension'ları Supabase Dashboard >
-- Database > Extensions'dan etkinleştirilmiş olmalı
-- ═══════════════════════════════════════════════════════════════

-- pg_cron extension'ını etkinleştir (zaten aktifse hata vermez)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;

-- Cron job oluştur (Edge Function URL'nizi ve service_role key'inizi girin)
-- SELECT cron.schedule(
--   'send-daily-verse',
--   '0 4 * * *',  -- Her gün 04:00 UTC = 07:00 TR
--   $$
--   SELECT net.http_post(
--     url := 'https://txvqxjrjbmjwhgddztma.supabase.co/functions/v1/send-daily-verse',
--     headers := '{"Authorization": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
--     body := '{}'::jsonb
--   );
--   $$
-- );

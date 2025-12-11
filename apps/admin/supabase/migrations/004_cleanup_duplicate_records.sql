-- ============================================
-- Migration: Limpar registros duplicados
-- ============================================
-- Este script remove registros duplicados, mantendo apenas o mais recente
-- Execute este script se houver múltiplos registros nas tabelas
-- Data: 2024

-- Limpar dark_links_seo: manter apenas o registro mais recente
DO $$
DECLARE
  latest_seo_id UUID;
BEGIN
  -- Pegar o ID do registro mais recente
  SELECT id INTO latest_seo_id
  FROM dark_links_seo
  ORDER BY created_at DESC
  LIMIT 1;

  -- Deletar todos os outros registros
  IF latest_seo_id IS NOT NULL THEN
    DELETE FROM dark_links_seo
    WHERE id != latest_seo_id;
    
    RAISE NOTICE 'Registros duplicados de dark_links_seo removidos. Mantido registro: %', latest_seo_id;
  END IF;
END $$;

-- Limpar dark_links_settings: manter apenas o registro mais recente
DO $$
DECLARE
  latest_settings_id UUID;
BEGIN
  -- Pegar o ID do registro mais recente
  SELECT id INTO latest_settings_id
  FROM dark_links_settings
  ORDER BY created_at DESC
  LIMIT 1;

  -- Deletar todos os outros registros
  IF latest_settings_id IS NOT NULL THEN
    DELETE FROM dark_links_settings
    WHERE id != latest_settings_id;
    
    RAISE NOTICE 'Registros duplicados de dark_links_settings removidos. Mantido registro: %', latest_settings_id;
  END IF;
END $$;


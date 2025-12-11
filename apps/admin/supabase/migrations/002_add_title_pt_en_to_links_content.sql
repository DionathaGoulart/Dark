-- ============================================
-- Migration: Adicionar campos title_pt e title_en à tabela links_content
-- ============================================
-- Execute este script se a tabela links_content já existir sem esses campos
-- Data: 2024

-- Adicionar colunas title_pt e title_en se não existirem
DO $$
BEGIN
  -- Adicionar title_pt se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'links_content' AND column_name = 'title_pt'
  ) THEN
    ALTER TABLE links_content ADD COLUMN title_pt TEXT;
  END IF;

  -- Adicionar title_en se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'links_content' AND column_name = 'title_en'
  ) THEN
    ALTER TABLE links_content ADD COLUMN title_en TEXT;
  END IF;

  -- Migrar dados existentes: se houver title preenchido mas não houver title_pt ou title_en, copiar
  UPDATE links_content
  SET 
    title_pt = COALESCE(title_pt, title),
    title_en = COALESCE(title_en, title)
  WHERE title IS NOT NULL 
    AND (title_pt IS NULL OR title_en IS NULL);
END $$;

-- Tornar title opcional (remover NOT NULL se existir)
DO $$
BEGIN
  -- Verificar se a constraint NOT NULL existe e remover se necessário
  ALTER TABLE links_content ALTER COLUMN title DROP NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Se não houver constraint NOT NULL, ignora o erro
    NULL;
END $$;


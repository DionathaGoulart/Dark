-- ============================================
-- Migration: Adicionar campos footer_text_pt e footer_text_en
-- ============================================
-- Este script adiciona suporte a múltiplos idiomas no texto do rodapé
-- Data: 2025

-- ============================================
-- Adicionar novos campos
-- ============================================
ALTER TABLE portfolio_settings
ADD COLUMN IF NOT EXISTS footer_text_pt TEXT,
ADD COLUMN IF NOT EXISTS footer_text_en TEXT;

-- ============================================
-- Migrar dados existentes
-- ============================================
-- Copiar o footer_text antigo para ambos os novos campos se não estiverem preenchidos
UPDATE portfolio_settings
SET 
  footer_text_pt = COALESCE(footer_text_pt, footer_text, '© 2025 Todos os direitos reservados.'),
  footer_text_en = COALESCE(footer_text_en, footer_text, '© 2025 All rights reserved.')
WHERE footer_text IS NOT NULL OR footer_text_pt IS NULL OR footer_text_en IS NULL;

-- ============================================
-- Comentários nas colunas
-- ============================================
COMMENT ON COLUMN portfolio_settings.footer_text_pt IS 'Texto do rodapé em português';
COMMENT ON COLUMN portfolio_settings.footer_text_en IS 'Texto do rodapé em inglês';
COMMENT ON COLUMN portfolio_settings.footer_text IS 'Texto do rodapé (legado - mantido para compatibilidade)';


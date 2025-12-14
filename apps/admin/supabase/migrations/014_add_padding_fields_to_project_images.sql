-- ============================================
-- Migration: Adicionar campos de padding nas imagens de projeto
-- ============================================
-- Adiciona campos opcionais para padding lateral e vertical

ALTER TABLE portfolio_project_images
ADD COLUMN IF NOT EXISTS padding_horizontal INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS padding_vertical INTEGER DEFAULT NULL;

COMMENT ON COLUMN portfolio_project_images.padding_horizontal IS 'Padding lateral (horizontal) em pixels. Opcional.';
COMMENT ON COLUMN portfolio_project_images.padding_vertical IS 'Padding vertical em pixels. Opcional.';


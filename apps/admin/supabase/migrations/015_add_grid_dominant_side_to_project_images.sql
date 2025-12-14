-- ============================================
-- Migration: Adicionar campo de lado dominante para grids de 2 colunas
-- ============================================
-- Adiciona campo para controlar qual lado do grid de 2 colunas é dominante

ALTER TABLE portfolio_project_images
ADD COLUMN IF NOT EXISTS grid_dominant_side TEXT DEFAULT 'none' CHECK (grid_dominant_side IN ('none', 'left', 'right'));

COMMENT ON COLUMN portfolio_project_images.grid_dominant_side IS 'Lado dominante para grids de 2 colunas: none (igual), left (esquerda maior), right (direita maior)';


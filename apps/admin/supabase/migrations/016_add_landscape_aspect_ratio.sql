-- ============================================
-- Migration: Adicionar opção landscape (4:3) aos aspect ratios
-- ============================================
-- Adiciona a opção 'landscape' (4:3) aos aspect ratios disponíveis

-- Remover a constraint antiga
ALTER TABLE portfolio_project_images
DROP CONSTRAINT IF EXISTS portfolio_project_images_aspect_ratio_check;

-- Adicionar nova constraint com 'landscape' incluído
ALTER TABLE portfolio_project_images
ADD CONSTRAINT portfolio_project_images_aspect_ratio_check 
CHECK (aspect_ratio IN ('square', 'wide', 'portrait', 'card', 'cinema', 'tall', 'auto', 'landscape'));

-- Atualizar comentário
COMMENT ON COLUMN portfolio_project_images.aspect_ratio IS 'Proporção da imagem: square, wide, portrait, card, cinema, tall, auto, landscape (4:3)';


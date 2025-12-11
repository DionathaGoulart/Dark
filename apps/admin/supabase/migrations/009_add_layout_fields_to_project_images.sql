-- ============================================
-- Migration: Adicionar campos de layout para imagens de projetos
-- ============================================
-- Data: 2024

-- Adicionar campos de layout na tabela portfolio_project_images
ALTER TABLE portfolio_project_images
ADD COLUMN IF NOT EXISTS layout_type TEXT DEFAULT 'solo' CHECK (layout_type IN ('solo', 'grid-2', 'grid-3', 'grid-5')),
ADD COLUMN IF NOT EXISTS aspect_ratio TEXT DEFAULT 'auto' CHECK (aspect_ratio IN ('square', 'wide', 'portrait', 'card', 'cinema', 'tall', 'auto')),
ADD COLUMN IF NOT EXISTS object_fit TEXT DEFAULT 'cover' CHECK (object_fit IN ('cover', 'contain')),
ADD COLUMN IF NOT EXISTS grid_group_id UUID;

-- Criar índice para grid_group_id para melhor performance
CREATE INDEX IF NOT EXISTS idx_portfolio_project_images_grid_group ON portfolio_project_images(grid_group_id);

-- Atualizar imagens existentes para ter valores padrão
UPDATE portfolio_project_images
SET 
  layout_type = COALESCE(layout_type, 'solo'),
  aspect_ratio = COALESCE(aspect_ratio, 'auto'),
  object_fit = COALESCE(object_fit, 'cover')
WHERE layout_type IS NULL OR aspect_ratio IS NULL OR object_fit IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN portfolio_project_images.layout_type IS 'Tipo de layout: solo (imagem única), grid-2 (2 colunas), grid-3 (3 colunas), grid-5 (5 colunas)';
COMMENT ON COLUMN portfolio_project_images.aspect_ratio IS 'Proporção da imagem: square, wide, portrait, card, cinema, tall, auto';
COMMENT ON COLUMN portfolio_project_images.object_fit IS 'Como a imagem se ajusta: cover (preencher) ou contain (conter)';


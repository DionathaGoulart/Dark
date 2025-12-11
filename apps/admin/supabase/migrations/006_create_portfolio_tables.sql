-- ============================================
-- Migration: Criar tabelas para Portfolio CMS
-- ============================================
-- Este script cria todas as tabelas necessárias para o sistema de CMS do Portfolio
-- Data: 2024

-- ============================================
-- Função para atualizar updated_at automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Tabela: portfolio_seo
-- ============================================
-- Armazena configurações de SEO do Portfolio (PT/EN, Open Graph, Twitter Cards, Analytics, Robots)

CREATE TABLE IF NOT EXISTS portfolio_seo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- SEO Português
  title_pt TEXT,
  description_pt TEXT,
  keywords_pt TEXT,
  canonical_url_pt TEXT,
  -- SEO Inglês
  title_en TEXT,
  description_en TEXT,
  keywords_en TEXT,
  canonical_url_en TEXT,
  -- Open Graph (comum para ambos)
  og_image_url TEXT,
  og_type TEXT DEFAULT 'website',
  og_site_name TEXT,
  -- Twitter Cards
  twitter_card_type TEXT DEFAULT 'summary_large_image',
  twitter_site TEXT,
  twitter_creator TEXT,
  -- Analytics e Tracking
  ga_measurement_id TEXT,
  -- Robots
  robots_txt TEXT DEFAULT 'index, follow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_seo_updated_at
  BEFORE UPDATE ON portfolio_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir registro inicial
INSERT INTO portfolio_seo (
  title_pt, description_pt, keywords_pt,
  title_en, description_en, keywords_en,
  robots_txt
) VALUES (
  'Dark - Portfolio', 'Portfolio de arte digital e design', 'dark, portfolio, arte digital, design',
  'Dark - Portfolio', 'Digital art and design portfolio', 'dark, portfolio, digital art, design',
  'index, follow'
) ON CONFLICT DO NOTHING;

-- ============================================
-- Tabela: portfolio_settings
-- ============================================
-- Armazena configurações gerais do Portfolio

CREATE TABLE IF NOT EXISTS portfolio_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Imagens
  site_icon_url TEXT,
  logo_url TEXT,
  -- Links Sociais
  instagram_url TEXT,
  youtube_url TEXT,
  -- Outros
  footer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_settings_updated_at
  BEFORE UPDATE ON portfolio_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir registro inicial
INSERT INTO portfolio_settings (
  instagram_url, youtube_url, footer_text
) VALUES (
  'https://www.instagram.com/darkning.art',
  'https://www.youtube.com/@darkning_art',
  '© 2024 Dark. All rights reserved.'
) ON CONFLICT DO NOTHING;

-- ============================================
-- Tabela: portfolio_navigation
-- ============================================
-- Armazena links de navegação do menu

CREATE TABLE IF NOT EXISTS portfolio_navigation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label_pt TEXT NOT NULL,
  label_en TEXT NOT NULL,
  href TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_navigation_updated_at
  BEFORE UPDATE ON portfolio_navigation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir links padrão
INSERT INTO portfolio_navigation (label_pt, label_en, href, order_index) VALUES
  ('Início', 'Home', '/', 0),
  ('Sobre', 'About', '/about', 1),
  ('Projetos', 'Projects', '/projects', 2),
  ('Contato', 'Contact', '/contact', 3),
  ('Lojas', 'Stores', '/stores', 4)
ON CONFLICT DO NOTHING;

-- ============================================
-- Tabela: portfolio_pages
-- ============================================
-- Armazena páginas dinâmicas do Portfolio

CREATE TABLE IF NOT EXISTS portfolio_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_pt TEXT,
  content_en TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_pages_updated_at
  BEFORE UPDATE ON portfolio_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir página About padrão
INSERT INTO portfolio_pages (slug, title_pt, title_en, content_pt, content_en) VALUES
  ('about', 'Sobre', 'About',
   'Dark é uma ilustradora brasileira autodidata, especializada em horror com fortes influências de manga. Seu trabalho é conhecido pelo domínio da técnica de preto e branco, criando imagens impactantes, densas e visualmente perturbadoras.',
   'Dark is a self taught Brazilian illustrator, specialized in horror with strong influences from manga. Her work is known for its mastery of black and white technique, creating impactful, dense, and visually unsettling imagery.')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Tabela: portfolio_home_images
-- ============================================
-- Armazena imagens da página inicial com ordem

CREATE TABLE IF NOT EXISTS portfolio_home_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text_pt TEXT,
  alt_text_en TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_home_images_updated_at
  BEFORE UPDATE ON portfolio_home_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Tabela: portfolio_projects
-- ============================================
-- Armazena projetos do Portfolio

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_pt TEXT,
  description_en TEXT,
  cover_image_url TEXT NOT NULL,
  layout_type TEXT DEFAULT 'grid' CHECK (layout_type IN ('grid', 'masonry', 'solo')),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir projetos padrão
INSERT INTO portfolio_projects (slug, title_pt, title_en, cover_image_url, layout_type, order_index) VALUES
  ('facesofhorror', 'Faces do Horror', 'Faces of Horror', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/pj1_cover.webp', 'grid', 0),
  ('tshirt-raglan', 'Camiseta Faces Macabras', 'Macabre Faces T-shirt', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/pj2_cover.webp', 'grid', 1),
  ('ladybugs', 'Joaninhas Assassinas', 'Killer Ladybugs', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/pj3_cover.webp', 'grid', 2),
  ('creepy', 'Rostos Assustadores', 'Creepy Faces', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/pj4_cover.webp', 'grid', 3),
  ('horror-art', 'Arte de Horror', 'Horror Art', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/pj5_cover.webp', 'grid', 4),
  ('halloween', 'Camisetas de Halloween', 'Halloween T-shirts', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/pj6_cover.webp', 'grid', 5),
  ('fantasy', 'Criaturas Fantásticas', 'Fantasy Creatures', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/pj7_cover.webp', 'grid', 6),
  ('arachnophobia', 'Aracnofobia', 'Arachnophobia', 'https://res.cloudinary.com/dlaxva1qb/image/upload/v1758048739/p8_cover.webp', 'grid', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Tabela: portfolio_project_images
-- ============================================
-- Armazena imagens de cada projeto

CREATE TABLE IF NOT EXISTS portfolio_project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text_pt TEXT,
  alt_text_en TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_project_images_updated_at
  BEFORE UPDATE ON portfolio_project_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_portfolio_project_images_project_id ON portfolio_project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_project_images_order ON portfolio_project_images(project_id, order_index);


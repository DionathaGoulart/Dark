-- ============================================
-- Migration: Criar tabelas para Dark Links
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- Data: 2024

-- ============================================
-- Tabela: dark_links_seo
-- ============================================
-- Armazena todas as configurações de SEO do site Dark Links
-- Suporta configurações em Português e Inglês

CREATE TABLE IF NOT EXISTS dark_links_seo (
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

-- Inserir registro inicial com valores padrão
INSERT INTO dark_links_seo (
  title_pt, 
  description_pt, 
  keywords_pt,
  title_en, 
  description_en, 
  keywords_en,
  robots_txt
) VALUES (
  'Dark Links', 
  'Links do artista Dark', 
  'dark, artista, links',
  'Dark Links', 
  'Dark artist links', 
  'dark, artist, links',
  'index, follow'
) ON CONFLICT DO NOTHING;

-- ============================================
-- Tabela: dark_links_settings
-- ============================================
-- Armazena configurações gerais do site Dark Links
-- Inclui imagens, textos e links sociais

CREATE TABLE IF NOT EXISTS dark_links_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Imagens
  site_icon_url TEXT,
  profile_image_url TEXT,
  
  -- Textos
  title TEXT,
  subtitle_pt TEXT,
  subtitle_en TEXT,
  
  -- Links Sociais
  youtube_url TEXT,
  email TEXT,
  instagram_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir registro inicial com valores padrão
INSERT INTO dark_links_settings (
  title, 
  subtitle_pt, 
  subtitle_en,
  youtube_url, 
  email, 
  instagram_url
) VALUES (
  '@DARK',
  'dark ilustrador',
  'dark illustrator',
  'https://www.youtube.com/channel/UCw1OmBxX3P-xY_GGkmslJ9g',
  'darkning.arts@gmail.com',
  'https://www.instagram.com/thedarkk.art/'
) ON CONFLICT DO NOTHING;

-- ============================================
-- Tabela: links_content (se não existir)
-- ============================================
-- Armazena os cards de links exibidos no site
-- Esta tabela pode já existir, então usamos IF NOT EXISTS

CREATE TABLE IF NOT EXISTS links_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  title_pt TEXT,
  title_en TEXT,
  url TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inserir cards padrão do Dark Links (apenas se a tabela estiver vazia)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM links_content LIMIT 1) THEN
    INSERT INTO links_content (title_pt, title_en, url, order_index) VALUES
      ('Roupas, adesivos e mais (Redbubble)', 'Clothing, stickers and more (Redbubble)', 'http://GoodDark.redbubble.com', 0),
      ('Compre minha arte no Brasil (Colab55)', 'Buy my art in Brazil (Colab55)', 'https://www.colab55.com/@darkning', 1),
      ('Prints (INPRNT)', 'Prints (INPRNT)', 'https://www.inprnt.com/gallery/darkning/', 2),
      ('Meus pôsteres exclusivos na Displate 🤍', 'My exclusive posters on Displate 🤍', 'https://displate.com/Darkning?art=683cd403062f7', 3),
      ('Portfólio', 'Portfolio', 'https://dark.art.br', 4),
      ('Doar (づ⁠ ᴗ _ᴗ)づ⁠☕', 'Donate (づ⁠ ᴗ _ᴗ)づ⁠☕', 'https://ko-fi.com/darkning', 5);
  END IF;
END $$;

-- ============================================
-- Função para atualizar updated_at automaticamente
-- ============================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_dark_links_seo_updated_at ON dark_links_seo;
CREATE TRIGGER update_dark_links_seo_updated_at
  BEFORE UPDATE ON dark_links_seo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dark_links_settings_updated_at ON dark_links_settings;
CREATE TRIGGER update_dark_links_settings_updated_at
  BEFORE UPDATE ON dark_links_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_links_content_updated_at ON links_content;
CREATE TRIGGER update_links_content_updated_at
  BEFORE UPDATE ON links_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Índices para melhor performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_links_content_order ON links_content(order_index);
CREATE INDEX IF NOT EXISTS idx_links_content_created_at ON links_content(created_at);

-- ============================================
-- Comentários nas tabelas
-- ============================================

COMMENT ON TABLE dark_links_seo IS 'Armazena configurações de SEO do site Dark Links em PT/EN';
COMMENT ON TABLE dark_links_settings IS 'Armazena configurações gerais do site Dark Links';
COMMENT ON TABLE links_content IS 'Armazena os cards de links exibidos no site Dark Links';


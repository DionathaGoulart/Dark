-- ============================================
-- Migration: Habilitar RLS e criar políticas de acesso
-- ============================================
-- Execute este script para permitir acesso às tabelas do Dark Links
-- Data: 2024

-- ============================================
-- Habilitar Row Level Security (RLS)
-- ============================================
-- Primeiro, desabilitar RLS temporariamente para permitir acesso
-- Depois, habilitar com políticas adequadas

-- Desabilitar RLS temporariamente (se já estiver habilitado)
ALTER TABLE IF EXISTS dark_links_seo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dark_links_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS links_content DISABLE ROW LEVEL SECURITY;

-- Agora habilitar RLS com políticas
ALTER TABLE IF EXISTS dark_links_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dark_links_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS links_content ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas para dark_links_seo
-- ============================================

-- Permitir leitura pública (qualquer um pode ler)
DROP POLICY IF EXISTS "Permitir leitura pública de SEO" ON dark_links_seo;
CREATE POLICY "Permitir leitura pública de SEO"
  ON dark_links_seo
  FOR SELECT
  USING (true);

-- Permitir inserção/atualização apenas para usuários autenticados
DROP POLICY IF EXISTS "Permitir escrita autenticada de SEO" ON dark_links_seo;
CREATE POLICY "Permitir escrita autenticada de SEO"
  ON dark_links_seo
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- Políticas para dark_links_settings
-- ============================================

-- Permitir leitura pública (qualquer um pode ler)
DROP POLICY IF EXISTS "Permitir leitura pública de settings" ON dark_links_settings;
CREATE POLICY "Permitir leitura pública de settings"
  ON dark_links_settings
  FOR SELECT
  USING (true);

-- Permitir inserção/atualização apenas para usuários autenticados
DROP POLICY IF EXISTS "Permitir escrita autenticada de settings" ON dark_links_settings;
CREATE POLICY "Permitir escrita autenticada de settings"
  ON dark_links_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- Políticas para links_content
-- ============================================

-- Permitir leitura pública (qualquer um pode ler)
DROP POLICY IF EXISTS "Permitir leitura pública de links" ON links_content;
CREATE POLICY "Permitir leitura pública de links"
  ON links_content
  FOR SELECT
  USING (true);

-- Permitir inserção/atualização apenas para usuários autenticados
DROP POLICY IF EXISTS "Permitir escrita autenticada de links" ON links_content;
CREATE POLICY "Permitir escrita autenticada de links"
  ON links_content
  FOR ALL
  USING (auth.role() = 'authenticated');


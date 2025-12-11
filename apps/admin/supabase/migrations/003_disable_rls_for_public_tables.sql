-- ============================================
-- Migration: Desabilitar RLS para tabelas públicas
-- ============================================
-- Execute este script se preferir desabilitar RLS completamente
-- Essas tabelas contêm dados públicos que devem ser acessíveis sem autenticação
-- Data: 2024

-- Desabilitar Row Level Security para tabelas públicas
ALTER TABLE IF EXISTS dark_links_seo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS dark_links_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS links_content DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Permitir leitura pública de SEO" ON dark_links_seo;
DROP POLICY IF EXISTS "Permitir escrita autenticada de SEO" ON dark_links_seo;
DROP POLICY IF EXISTS "Permitir leitura pública de settings" ON dark_links_settings;
DROP POLICY IF EXISTS "Permitir escrita autenticada de settings" ON dark_links_settings;
DROP POLICY IF EXISTS "Permitir leitura pública de links" ON links_content;
DROP POLICY IF EXISTS "Permitir escrita autenticada de links" ON links_content;


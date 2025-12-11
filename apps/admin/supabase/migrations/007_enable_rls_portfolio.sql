-- ============================================
-- Migration: Habilitar RLS para tabelas do Portfolio
-- ============================================
-- Data: 2024

-- Desabilitar Row Level Security para tabelas públicas do Portfolio
ALTER TABLE IF EXISTS portfolio_seo DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio_navigation DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio_home_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS portfolio_project_images DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Public read access for portfolio_seo" ON portfolio_seo;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio_seo" ON portfolio_seo;
DROP POLICY IF EXISTS "Authenticated users can update portfolio_seo" ON portfolio_seo;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio_seo" ON portfolio_seo;

DROP POLICY IF EXISTS "Public read access for portfolio_settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio_settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Authenticated users can update portfolio_settings" ON portfolio_settings;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio_settings" ON portfolio_settings;

DROP POLICY IF EXISTS "Public read access for portfolio_navigation" ON portfolio_navigation;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio_navigation" ON portfolio_navigation;
DROP POLICY IF EXISTS "Authenticated users can update portfolio_navigation" ON portfolio_navigation;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio_navigation" ON portfolio_navigation;

DROP POLICY IF EXISTS "Public read access for portfolio_pages" ON portfolio_pages;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio_pages" ON portfolio_pages;
DROP POLICY IF EXISTS "Authenticated users can update portfolio_pages" ON portfolio_pages;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio_pages" ON portfolio_pages;

DROP POLICY IF EXISTS "Public read access for portfolio_home_images" ON portfolio_home_images;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio_home_images" ON portfolio_home_images;
DROP POLICY IF EXISTS "Authenticated users can update portfolio_home_images" ON portfolio_home_images;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio_home_images" ON portfolio_home_images;

DROP POLICY IF EXISTS "Public read access for portfolio_projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio_projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can update portfolio_projects" ON portfolio_projects;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio_projects" ON portfolio_projects;

DROP POLICY IF EXISTS "Public read access for portfolio_project_images" ON portfolio_project_images;
DROP POLICY IF EXISTS "Authenticated users can insert portfolio_project_images" ON portfolio_project_images;
DROP POLICY IF EXISTS "Authenticated users can update portfolio_project_images" ON portfolio_project_images;
DROP POLICY IF EXISTS "Authenticated users can delete portfolio_project_images" ON portfolio_project_images;


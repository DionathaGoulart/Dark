-- Tabela para armazenar links UTM gerados
CREATE TABLE IF NOT EXISTS portfolio_utm_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  base_url TEXT NOT NULL,
  utm_source VARCHAR(100) NOT NULL,
  utm_medium VARCHAR(100) NOT NULL,
  utm_campaign VARCHAR(100) NOT NULL,
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  generated_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE portfolio_utm_links ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Allow public read access on portfolio_utm_links" 
ON portfolio_utm_links FOR SELECT 
USING (true);

-- Política para permitir inserção/atualização/exclusão por usuários autenticados
CREATE POLICY "Allow authenticated users to manage portfolio_utm_links" 
ON portfolio_utm_links FOR ALL 
USING (auth.role() = 'authenticated');

-- Índice para ordenação
CREATE INDEX idx_portfolio_utm_links_created_at ON portfolio_utm_links(created_at DESC);


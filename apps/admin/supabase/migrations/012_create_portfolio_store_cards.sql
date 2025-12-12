-- ============================================
-- Migration: Criar tabela portfolio_store_cards
-- ============================================
-- Este script cria a tabela para armazenar os cards da página Store
-- Data: 2025

-- ============================================
-- Tabela: portfolio_store_cards
-- ============================================
-- Armazena cards de lojas/links da página Store

CREATE TABLE IF NOT EXISTS portfolio_store_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_pt TEXT,
  title_en TEXT,
  url TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_store_cards_updated_at
  BEFORE UPDATE ON portfolio_store_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_portfolio_store_cards_order ON portfolio_store_cards(order_index);
CREATE INDEX IF NOT EXISTS idx_portfolio_store_cards_active ON portfolio_store_cards(is_active);

-- Cards padrão não são mais inseridos automaticamente
-- Os cards devem ser criados manualmente através do painel admin


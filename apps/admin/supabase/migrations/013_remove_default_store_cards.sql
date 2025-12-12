-- ============================================
-- Migration: Remover cards padrão da Store
-- ============================================
-- Este script remove os cards padrão que foram inseridos na migration 012
-- Execute apenas se você já executou a migration 012 e quer remover os cards padrão
-- Data: 2025

-- Remover cards padrão (caso existam)
DELETE FROM portfolio_store_cards
WHERE url IN (
  'http://GoodDark.redbubble.com',
  'https://www.inprnt.com/gallery/darkning/',
  'https://displate.com/Darkning?art=683cd403062f7'
);


-- ============================================
-- Migration: Adicionar campo contact_email
-- ============================================
-- Este script adiciona o campo de email de contato nas configurações do portfolio
-- Data: 2025

-- ============================================
-- Adicionar novo campo
-- ============================================
ALTER TABLE portfolio_settings
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- ============================================
-- Migrar dados existentes
-- ============================================
-- Definir valor padrão se não houver email configurado
UPDATE portfolio_settings
SET contact_email = 'darkning.arts@gmail.com'
WHERE contact_email IS NULL OR contact_email = '';

-- ============================================
-- Comentário na coluna
-- ============================================
COMMENT ON COLUMN portfolio_settings.contact_email IS 'Email de contato exibido na página de contato e que recebe mensagens do formulário';


-- ============================================
-- Migration: Configurar políticas de Storage
-- ============================================
-- Este script configura as políticas RLS para o bucket dark-links-assets
-- Execute este script APÓS criar o bucket dark-links-assets no Supabase Storage
-- Data: 2024

-- IMPORTANTE: Certifique-se de que o bucket 'dark-links-assets' foi criado antes de executar este script
-- O bucket deve estar marcado como PÚBLICO

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- Política para permitir leitura pública (todos podem ver as imagens)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dark-links-assets');

-- Política para permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dark-links-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dark-links-assets' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'dark-links-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dark-links-assets' 
  AND auth.role() = 'authenticated'
);


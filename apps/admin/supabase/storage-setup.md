# Configuração do Supabase Storage para Dark Links

Este guia explica como configurar o bucket de storage no Supabase para permitir upload de imagens (favicon e foto de perfil).

## Passo 1: Criar o Bucket

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure o bucket:
   - **Name**: `dark-links-assets`
   - **Public bucket**: ✅ **Marque como público** (para que as imagens sejam acessíveis publicamente)
   - **File size limit**: `5242880` (5MB) ou o valor desejado
   - **Allowed MIME types**: Deixe vazio para permitir todos os tipos de imagem, ou especifique: `image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon`
6. Clique em **Create bucket**

## Passo 2: Configurar Políticas de Acesso (RLS)

Após criar o bucket, você precisa configurar as políticas de acesso para permitir upload e leitura.

### Opção 1: Via SQL Editor (Recomendado)

1. Vá em **SQL Editor** no Supabase Dashboard
2. Clique em **New Query**
3. Abra o arquivo `supabase/migrations/005_setup_storage_policies.sql`
4. Copie e cole todo o conteúdo, OU use o SQL abaixo:

```sql
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
```

5. Clique em **Run**

**Nota**: Se você já criou as políticas manualmente pela interface, pode pular este passo. O script SQL acima apenas garante que as políticas estejam configuradas corretamente.

### Opção 2: Via Interface do Supabase

1. Vá em **Storage** > **Policies**
2. Selecione o bucket `dark-links-assets`
3. Clique em **New Policy**
4. Crie as políticas manualmente seguindo as mesmas regras acima

## Passo 3: Verificar Configuração

Após configurar, você pode testar fazendo upload de uma imagem pelo painel admin. O arquivo será salvo em:
- Caminho: `dark-links/icon-[timestamp].[ext]` ou `dark-links/profile-[timestamp].[ext]`
- URL pública: `https://[seu-projeto].supabase.co/storage/v1/object/public/dark-links-assets/dark-links/[nome-do-arquivo]`

## Troubleshooting

### Erro: "Bucket not found"
- Certifique-se de que o bucket `dark-links-assets` foi criado
- Verifique se o nome está exatamente como no código (case-sensitive)

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram criadas corretamente
- Certifique-se de estar autenticado no painel admin

### Erro: "File size exceeds limit"
- Aumente o limite de tamanho do bucket nas configurações
- Ou reduza o tamanho do arquivo antes de fazer upload

### Imagens não aparecem
- Verifique se o bucket está marcado como **público**
- Verifique se a política de leitura pública foi criada
- Verifique se a URL está correta no banco de dados


# Configuração do Supabase Storage para Portfolio

Este guia explica como configurar o bucket de storage no Supabase para permitir upload de imagens do Portfolio (logo, ícone, imagens da home, capas de projetos, imagens de projetos).

## Passo 1: Criar o Bucket

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Storage** no menu lateral
4. Clique em **New bucket**
5. Configure o bucket:
   - **Name**: `portfolio-assets`
   - **Public bucket**: ✅ **Marque como público** (para que as imagens sejam acessíveis publicamente)
   - **File size limit**: `10485760` (10MB) ou o valor desejado
   - **Allowed MIME types**: Deixe vazio para permitir todos os tipos de imagem, ou especifique: `image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/x-icon`
6. Clique em **Create bucket**

## Passo 2: Configurar Políticas de Acesso (RLS)

Após criar o bucket, você precisa configurar as políticas de acesso para permitir upload e leitura.

### Opção 1: Via SQL Editor (Recomendado)

1. Vá em **SQL Editor** no Supabase Dashboard
2. Clique em **New Query**
3. Abra o arquivo `supabase/migrations/008_setup_portfolio_storage_policies.sql`
4. Copie e cole todo o conteúdo
5. Clique em **Run**

**Nota**: Se você já criou as políticas manualmente pela interface, pode pular este passo. O script SQL acima apenas garante que as políticas estejam configuradas corretamente.

### Opção 2: Via Interface do Supabase

1. Vá em **Storage** > **Policies**
2. Selecione o bucket `portfolio-assets`
3. Clique em **New Policy**
4. Crie as políticas manualmente seguindo as mesmas regras do SQL acima

## Passo 3: Verificar Configuração

Após configurar, você pode testar fazendo upload de uma imagem pelo painel admin. Os arquivos serão salvos em:
- **Settings**: `portfolio/icon-[timestamp].[ext]` ou `portfolio/logo-[timestamp].[ext]`
- **Home**: `portfolio/home/home-[timestamp].[ext]`
- **Projects**: `portfolio/projects/project-cover-[timestamp].[ext]`
- **Project Images**: `portfolio/projects/[project-id]/project-[project-id]-[timestamp].[ext]`

URL pública: `https://[seu-projeto].supabase.co/storage/v1/object/public/portfolio-assets/[caminho-do-arquivo]`

## Estrutura de Pastas

O bucket `portfolio-assets` organiza os arquivos da seguinte forma:

```
portfolio-assets/
├── portfolio/
│   ├── icon-[timestamp].[ext]          # Ícone do site
│   ├── logo-[timestamp].[ext]          # Logo
│   ├── home/
│   │   └── home-[timestamp].[ext]     # Imagens da home
│   └── projects/
│       ├── project-cover-[timestamp].[ext]  # Capas de projetos
│       └── [project-id]/
│           └── project-[project-id]-[timestamp].[ext]  # Imagens do projeto
```

## Troubleshooting

### Erro: "Bucket not found"
- Certifique-se de que o bucket `portfolio-assets` foi criado
- Verifique se o nome está exatamente como no código (case-sensitive)

### Erro: "new row violates row-level security policy"
- Verifique se as políticas RLS foram criadas corretamente
- Certifique-se de estar autenticado no painel admin
- Execute a migration `008_setup_portfolio_storage_policies.sql`

### Erro: "File size exceeds limit"
- Aumente o limite de tamanho do bucket nas configurações
- Ou reduza o tamanho do arquivo antes de fazer upload

### Imagens não aparecem
- Verifique se o bucket está marcado como **público**
- Verifique se a política de leitura pública foi criada
- Verifique se a URL está correta no banco de dados


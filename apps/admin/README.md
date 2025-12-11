# Admin Panel

Painel de administração para gerenciar os sites Portfolio e Dark Links.

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Preencha as variáveis:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase

## Estrutura do Banco de Dados

### Executar Migrations

**IMPORTANTE**: Antes de usar o painel, você precisa executar as migrations no Supabase.

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Abra o arquivo `supabase/migrations/001_create_dark_links_tables.sql`
6. Copie e cole todo o conteúdo no SQL Editor
7. Clique em **Run** (ou pressione `Ctrl+Enter`)

Para mais detalhes, veja o [README das migrations](./supabase/migrations/README.md).

### Configurar Storage para Upload de Imagens

Para permitir upload de imagens, você precisa configurar os buckets de storage no Supabase.

**IMPORTANTE**: 
- Para **Dark Links**: Siga o guia em [storage-setup.md](./supabase/storage-setup.md) para configurar o bucket `dark-links-assets` e as políticas de acesso.
- Para **Portfolio**: Siga o guia em [portfolio-storage-setup.md](./supabase/portfolio-storage-setup.md) para configurar o bucket `portfolio-assets` e as políticas de acesso.

### Tabelas Criadas

As migrations criam as seguintes tabelas:

- **portfolio_content**: Conteúdo do portfolio (já deve existir)
- **links_content**: Cards de links do Dark Links
- **dark_links_seo**: Configurações de SEO (PT/EN, Open Graph, Twitter Cards, Analytics, Robots)
- **dark_links_settings**: Configurações gerais (imagens, textos, links sociais)

Todas as tabelas incluem:
- Campos `created_at` e `updated_at` automáticos
- Triggers para atualizar `updated_at` automaticamente
- Valores iniciais padrão inseridos automaticamente

Para ver a estrutura completa, consulte o arquivo de migration: `supabase/migrations/001_create_dark_links_tables.sql`

## Executar

```bash
npm run dev
```

O painel estará disponível em `http://localhost:3002`

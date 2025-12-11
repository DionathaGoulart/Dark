# Migrations do Supabase

Este diretório contém os arquivos SQL de migration para criar as tabelas necessárias no Supabase.

## Como executar as migrations

### Opção 1: Via SQL Editor do Supabase (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. **IMPORTANTE**: Execute as migrations na ordem:
   - Primeiro: `001_create_dark_links_tables.sql` (cria as tabelas)
   - **Se a tabela `links_content` já existir sem os campos `title_pt` e `title_en`**, execute também:
     - `002_add_title_pt_en_to_links_content.sql` (adiciona campos de idioma)
   - **SEMPRE execute uma das opções de RLS**:
     - `003_disable_rls_for_public_tables.sql` (recomendado - desabilita RLS para dados públicos)
     - OU `003_enable_rls_and_policies.sql` (habilita RLS com políticas - use se precisar de controle de acesso)
   - **Se houver múltiplos registros nas tabelas** (erro "Results contain 5 rows"), execute:
     - `004_cleanup_duplicate_records.sql` (remove duplicados, mantém apenas o mais recente)
   - **Para habilitar upload de imagens do Dark Links**, execute:
     - `005_setup_storage_policies.sql` (configura políticas RLS para o bucket `dark-links-assets`)
     - **IMPORTANTE**: Crie o bucket `dark-links-assets` no Supabase Storage antes de executar esta migration
   - **Para habilitar upload de imagens do Portfolio**, execute:
     - `008_setup_portfolio_storage_policies.sql` (configura políticas RLS para o bucket `portfolio-assets`)
     - **IMPORTANTE**: Crie o bucket `portfolio-assets` no Supabase Storage antes de executar esta migration
6. Copie e cole o conteúdo de cada arquivo
7. Clique em **Run** (ou pressione `Ctrl+Enter`)

### ⚠️ IMPORTANTE: Erro "Could not find the 'title_en' column"

Se você receber este erro ao salvar cards, significa que a tabela `links_content` existe mas não tem as colunas `title_pt` e `title_en`. 

**Solução**: Execute a migration `002_add_title_pt_en_to_links_content.sql` no SQL Editor do Supabase.

### Opção 2: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
# Navegue até o diretório do admin
cd apps/admin

# Execute a migration
supabase db push
```

### Opção 3: Via psql

```bash
# Conecte ao banco de dados do Supabase
psql -h [SEU_HOST] -U postgres -d postgres

# Execute o arquivo SQL
\i supabase/migrations/001_create_dark_links_tables.sql
```

## Estrutura das Tabelas

### dark_links_seo
Armazena todas as configurações de SEO:
- SEO em Português (título, descrição, palavras-chave, URL canônica)
- SEO em Inglês (título, descrição, palavras-chave, URL canônica)
- Open Graph (imagem, tipo, nome do site)
- Twitter Cards (tipo, site, creator)
- Google Analytics Measurement ID
- Robots.txt

### dark_links_settings
Armazena configurações gerais:
- URLs de imagens (ícone do site, foto do perfil)
- Textos (título, subtítulo PT/EN)
- Links sociais (YouTube, Email, Instagram)

### links_content
Armazena os cards de links:
- Título, URL, descrição
- URL do ícone
- Ordem de exibição

## Verificação

Após executar a migration, você pode verificar se as tabelas foram criadas:

```sql
-- Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'dark_links%' OR table_name = 'links_content';

-- Verificar dados iniciais
SELECT * FROM dark_links_seo;
SELECT * FROM dark_links_settings;
SELECT * FROM links_content;
```

## Troubleshooting

### Erro: "relation already exists"
Se você já executou a migration antes, as tabelas já existem. Isso é normal e seguro ignorar.

### Erro: "permission denied"
Certifique-se de estar usando uma conta com permissões de administrador no Supabase.

### Erro: "function already exists"
A função `update_updated_at_column` pode já existir. Isso é normal e seguro ignorar.

### Erro: 406 (Not Acceptable) ao buscar dados
Este erro geralmente indica problemas de permissões (RLS - Row Level Security).

**Solução**: Você tem duas opções:

**Opção 1 (Recomendada para dados públicos)**: Execute `003_disable_rls_for_public_tables.sql` para desabilitar RLS completamente. Essas tabelas contêm dados públicos que devem ser acessíveis.

**Opção 2**: Execute `003_enable_rls_and_policies.sql` para habilitar RLS com políticas de acesso. Use esta opção se precisar de controle de acesso mais granular.

### Erro: "Results contain 5 rows, application/vnd.pgrst.object+json requires 1 row"
Este erro indica que há múltiplos registros nas tabelas `dark_links_seo` ou `dark_links_settings`.

**Solução**: Execute a migration `004_cleanup_duplicate_records.sql` para remover registros duplicados, mantendo apenas o mais recente. O código já foi ajustado para buscar o registro mais recente, mas é recomendado limpar os duplicados.


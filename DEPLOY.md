# Guia de Deploy na Netlify

Este guia explica como fazer deploy dos 3 sites separadamente na Netlify, cada um com sua própria URL.

## 📋 Pré-requisitos

1. Conta na Netlify
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Node.js 18+ instalado localmente

## 🚀 Deploy do Portfolio

### Opção 1: Deploy via Netlify UI

1. Acesse [Netlify](https://app.netlify.com)
2. Clique em "Add new site" > "Import an existing project"
3. Conecte seu repositório Git
4. Configure as seguintes opções:
   - **Base directory**: `apps/portfolio`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/portfolio/.next`
   - **Node version**: `18` (ou superior)

5. Adicione variáveis de ambiente se necessário (ex: `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
6. Clique em "Deploy site"

### Opção 2: Deploy via Netlify CLI

```bash
# Instale o Netlify CLI globalmente
npm install -g netlify-cli

# Faça login
netlify login

# Navegue até o diretório do portfolio
cd apps/portfolio

# Inicialize o site
netlify init

# Siga as instruções e escolha:
# - Base directory: apps/portfolio
# - Build command: npm run build
# - Publish directory: .next

# Faça o deploy
netlify deploy --prod
```

## 🔗 Deploy do Dark-Links

### Opção 1: Deploy via Netlify UI

1. Acesse [Netlify](https://app.netlify.com)
2. Clique em "Add new site" > "Import an existing project"
3. **IMPORTANTE**: Selecione o mesmo repositório, mas configure como um novo site
4. Configure as seguintes opções:
   - **Base directory**: `apps/dark-links`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/dark-links/.next`
   - **Node version**: `18` (ou superior)

5. Adicione variáveis de ambiente se necessário (ex: `NEXT_PUBLIC_GA_MEASUREMENT_ID`)
6. Clique em "Deploy site"
7. Configure um domínio personalizado ou use o subdomínio fornecido pela Netlify

### Opção 2: Deploy via Netlify CLI

```bash
# Navegue até o diretório do dark-links
cd apps/dark-links

# Inicialize o site (criará um novo site)
netlify init

# Siga as instruções e escolha:
# - Base directory: apps/dark-links
# - Build command: npm run build
# - Publish directory: .next

# Faça o deploy
netlify deploy --prod
```

## 🌐 Deploy do Admin

### Opção 1: Deploy via Netlify UI

1. Acesse [Netlify](https://app.netlify.com)
2. Clique em "Add new site" > "Import an existing project"
3. **IMPORTANTE**: Selecione o mesmo repositório, mas configure como um novo site
4. Configure as seguintes opções:
   - **Base directory**: `apps/admin`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/admin/.next`
   - **Node version**: `18` (ou superior)

5. Clique em "Deploy site"
6. Configure um domínio personalizado ou use o subdomínio fornecido pela Netlify

### Opção 2: Deploy via Netlify CLI

```bash
# Navegue até o diretório do admin
cd apps/admin

# Inicialize o site (criará um novo site)
netlify init

# Siga as instruções e escolha:
# - Base directory: apps/admin
# - Build command: npm run build
# - Publish directory: .next

# Faça o deploy
netlify deploy --prod
```

## ⚙️ Configuração de Build no Netlify

Para cada site, você pode criar um arquivo `netlify.toml` na raiz do projeto ou configurar diretamente no painel da Netlify.

### Configuração no painel da Netlify

Para cada site, configure:

1. **Site settings** > **Build & deploy** > **Build settings**
2. Configure:
   - **Base directory**: `apps/[nome-do-app]`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/[nome-do-app]/.next`

### Variáveis de Ambiente

Se seus sites precisarem de variáveis de ambiente:

1. Vá em **Site settings** > **Environment variables**
2. Adicione as variáveis necessárias:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (para analytics)
   - Outras variáveis conforme necessário

## 🔄 Deploy Automático

Após configurar, cada push para o repositório Git irá:

1. Detectar mudanças nos arquivos
2. Executar o build apenas do site afetado (graças ao Turbo)
3. Fazer deploy automaticamente

## 📝 Notas Importantes

1. **Cada site é independente**: Você terá 3 sites separados na Netlify, cada um com sua própria URL
2. **Domínios personalizados**: Você pode configurar domínios personalizados para cada site nas configurações do site
3. **Build otimizado**: O Turbo otimiza os builds, então apenas os sites afetados serão reconstruídos
4. **Variáveis de ambiente**: Configure as variáveis de ambiente específicas para cada site se necessário

## 🐛 Troubleshooting

### Build falha

- Verifique se o **Base directory** está correto
- Verifique se o **Publish directory** está correto (deve ser `apps/[nome]/.next`)
- Verifique se todas as dependências estão no `package.json` raiz

### Erro de módulo não encontrado

- Certifique-se de que todas as dependências estão instaladas
- Execute `npm install` na raiz do projeto antes do deploy

### Site não atualiza após deploy

- Limpe o cache do Netlify
- Verifique se o **Publish directory** está correto


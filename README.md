# Dark Portfolio Monorepo

Monorepo com 3 sites Next.js gerenciados pelo Turbo:

1. **Portfolio** (`apps/portfolio`) - Portfólio principal
2. **Dark-Links** (`apps/dark-links`) - Página de links
3. **Site3** (`apps/site3`) - Preset base para futuros projetos

## 🚀 Tecnologias

- Next.js 15
- TypeScript
- Tailwind CSS
- Turbo (Monorepo)

## 📁 Estrutura do Projeto

```
Dark-Portifolio/
├── apps/                    # Aplicações Next.js
│   ├── portfolio/          # Portfólio principal
│   ├── dark-links/         # Página de links
│   └── site3/              # Preset base
├── package.json             # Configuração do monorepo
└── turbo.json               # Configuração do Turbo
```

Para mais detalhes sobre a estrutura, veja [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

### Executar todos os sites simultaneamente
```bash
npm run dev
```

Isso irá iniciar os 3 sites ao mesmo tempo:
- **Portfolio**: http://localhost:3000
- **Dark-Links**: http://localhost:3001
- **Site3**: http://localhost:3002

### Executar um site específico
```bash
npm run dev:portfolio
npm run dev:dark-links
npm run dev:site3
```

## 🏗️ Build

### Build de todos os sites
```bash
npm run build
```

### Build de um site específico
```bash
npm run build:portfolio
npm run build:dark-links
npm run build:site3
```

## 📡 Deploy na Netlify

Cada site pode ser deployado separadamente na Netlify com URLs diferentes.

Para instruções detalhadas, veja [DEPLOY.md](./DEPLOY.md).

### Resumo Rápido

1. Crie um novo site no Netlify
2. Configure:
   - **Base directory**: `apps/[nome-do-app]`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/[nome-do-app]/.next`
   - **Node version**: 18 ou superior

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa **todos os 3 sites simultaneamente**
- `npm run build` - Build de todos os sites
- `npm run lint` - Lint de todos os sites
- `npm run dev:portfolio` - Executa apenas o portfolio (porta 3000)
- `npm run dev:dark-links` - Executa apenas o dark-links (porta 3001)
- `npm run dev:site3` - Executa apenas o site3 (porta 3002)

## 📝 Documentação

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura detalhada do projeto
- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy na Netlify
- [docs/STRUCTURE_GUIDE.md](./docs/STRUCTURE_GUIDE.md) - Guia visual da estrutura

## 📌 Portas dos Apps

Cada app roda em uma porta diferente quando executado simultaneamente:

- **Portfolio**: http://localhost:3000
- **Dark-Links**: http://localhost:3001
- **Site3**: http://localhost:3002

## 💡 Dicas

- Use `npm run dev` para desenvolver todos os sites ao mesmo tempo
- O Turbo otimiza os builds, reconstruindo apenas o que mudou
- Cada site é independente e pode ter sua própria configuração
- Para parar todos os processos, use `Ctrl+C` no terminal

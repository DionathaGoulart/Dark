# 📁 Estrutura do Projeto

Este documento descreve a organização completa do monorepo.

## 🏗️ Estrutura Geral

```
Dark-Portifolio/
├── apps/                    # Aplicações Next.js
│   ├── portfolio/          # Portfólio principal
│   ├── dark-links/         # Página de links
│   └── site3/              # Preset base
├── config/                  # Configurações compartilhadas (futuro)
├── docs/                    # Documentação
├── package.json             # Configuração do monorepo
├── turbo.json               # Configuração do Turbo
└── README.md                # Documentação principal
```

## 📦 Estrutura de Cada App

Cada app segue uma estrutura Next.js padronizada:

```
apps/[app-name]/
├── src/
│   ├── app/                 # Next.js App Router (rotas)
│   │   ├── layout.tsx       # Layout raiz
│   │   ├── page.tsx         # Página inicial
│   │   └── [routes]/        # Outras rotas
│   ├── components/          # Componentes específicos do app
│   ├── core/                # Funcionalidades core
│   │   └── providers/      # Providers (Theme, I18n, etc)
│   ├── features/            # Features específicas
│   │   ├── analytics/       # Analytics
│   │   └── [feature]/       # Outras features
│   ├── pages/               # Componentes de página (legado/compartilhado)
│   ├── shared/              # Código compartilhado
│   │   ├── components/      # Componentes compartilhados
│   │   │   ├── layouts/     # Layouts
│   │   │   └── ui/          # Componentes UI
│   │   ├── hooks/           # Hooks customizados
│   │   ├── translations/   # Traduções i18n
│   │   └── utils/           # Utilitários
│   ├── styles/              # Estilos globais
│   ├── types/               # Definições de tipos TypeScript
│   └── assets/              # Assets estáticos
├── public/                  # Arquivos públicos
├── package.json             # Dependências do app
├── next.config.ts           # Configuração Next.js
├── tsconfig.json            # Configuração TypeScript
├── tailwind.config.js       # Configuração Tailwind
├── postcss.config.js       # Configuração PostCSS
└── netlify.toml            # Configuração Netlify
```

## 📂 Descrição das Pastas

### `src/app/`
Pasta do Next.js App Router. Contém as rotas da aplicação usando o sistema de roteamento baseado em arquivos.

### `src/components/`
Componentes específicos do app que não são compartilhados.

### `src/core/`
Funcionalidades fundamentais da aplicação:
- **providers/**: Providers React (Theme, I18n, etc.)

### `src/features/`
Features específicas e isoladas:
- **analytics/**: Configuração e tracking de analytics
- Cada feature é auto-contida com seus próprios hooks, utils e types

### `src/pages/`
Componentes de página reutilizáveis (podem ser usados em múltiplas rotas).

### `src/shared/`
Código compartilhado dentro do app:
- **components/**: Componentes reutilizáveis
  - **layouts/**: Layouts (Header, Footer, MainLayout, etc.)
  - **ui/**: Componentes de UI (botões, inputs, etc.)
- **hooks/**: Hooks customizados
- **translations/**: Arquivos de tradução (pt.ts, en.ts)
- **utils/**: Funções utilitárias

### `src/styles/`
Estilos globais (CSS/Tailwind).

### `src/types/`
Definições de tipos TypeScript organizadas por domínio.

### `src/assets/`
Assets estáticos (imagens, ícones, etc.).

### `public/`
Arquivos públicos servidos diretamente (favicons, screenshots, etc.).

## 🔧 Arquivos de Configuração

### Na Raiz
- `package.json`: Configuração do monorepo com workspaces
- `turbo.json`: Configuração do Turbo para builds otimizados
- `.gitignore`: Arquivos ignorados pelo Git

### Em Cada App
- `package.json`: Dependências específicas do app
- `next.config.ts`: Configuração Next.js
- `tsconfig.json`: Configuração TypeScript
- `tailwind.config.js`: Configuração Tailwind CSS
- `postcss.config.js`: Configuração PostCSS
- `netlify.toml`: Configuração de deploy Netlify

## 🎯 Convenções

### Nomenclatura
- **Componentes**: PascalCase (ex: `MainLayout.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useTheme.ts`)
- **Utils**: camelCase (ex: `imageUtils.ts`)
- **Types**: PascalCase para interfaces, camelCase para types (ex: `ThemeContextType`, `Theme`)

### Organização
- Cada feature é auto-contida
- Componentes são organizados por tipo (layouts, ui)
- Types são organizados por domínio (core, shared, pages)
- Exports centralizados via `index.ts`

### Imports
Use path aliases configurados no `tsconfig.json`:
- `@/*` → `src/*`
- `@core` → `src/core`
- `@shared` → `src/shared`
- `@features` → `src/features`
- `@types` → `src/types`
- `@assets` → `src/assets`

## 📝 Notas

- O portfolio mantém algumas estruturas legadas que serão migradas gradualmente
- Cada app é independente e pode ter sua própria estrutura específica
- A estrutura é flexível e pode ser adaptada conforme necessário


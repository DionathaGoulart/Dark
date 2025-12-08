# 📖 Guia de Estrutura do Projeto

## 🎯 Visão Geral

Este monorepo contém 3 aplicações Next.js independentes, todas gerenciadas pelo Turbo para builds otimizados.

## 📂 Estrutura Visual

```
Dark-Portifolio/
│
├── 📁 apps/                          # Aplicações Next.js
│   │
│   ├── 📁 portfolio/                 # Portfólio principal
│   │   ├── 📁 src/
│   │   │   ├── 📁 app/               # Next.js App Router
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── [rotas]/
│   │   │   ├── 📁 components/        # Componentes específicos
│   │   │   ├── 📁 core/              # Core do app
│   │   │   │   └── 📁 providers/     # Providers (Theme, I18n)
│   │   │   ├── 📁 features/          # Features isoladas
│   │   │   │   ├── analytics/
│   │   │   │   └── gallery/
│   │   │   ├── 📁 pages/             # Componentes de página
│   │   │   ├── 📁 shared/            # Código compartilhado
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── translations/
│   │   │   │   └── utils/
│   │   │   ├── 📁 styles/            # Estilos globais
│   │   │   ├── 📁 types/             # Tipos TypeScript
│   │   │   └── 📁 assets/            # Assets estáticos
│   │   ├── 📁 public/                # Arquivos públicos
│   │   └── [configs]                  # Configurações do app
│   │
│   ├── 📁 dark-links/                 # Página de links
│   │   └── [mesma estrutura]
│   │
│   └── 📁 site3/                      # Preset base
│       └── [estrutura mínima]
│
├── 📁 config/                         # Configurações compartilhadas (futuro)
├── 📁 docs/                           # Documentação
│
├── 📄 package.json                    # Config do monorepo
├── 📄 turbo.json                      # Config do Turbo
├── 📄 README.md                       # Documentação principal
├── 📄 PROJECT_STRUCTURE.md            # Estrutura detalhada
└── 📄 DEPLOY.md                       # Guia de deploy
```

## 🔍 Detalhamento por Pasta

### `apps/[app-name]/src/app/`
**Next.js App Router** - Sistema de roteamento baseado em arquivos.

- `layout.tsx`: Layout raiz da aplicação
- `page.tsx`: Página inicial (`/`)
- `[nome]/page.tsx`: Outras rotas (`/[nome]`)

### `apps/[app-name]/src/components/`
Componentes específicos do app que não são compartilhados.

### `apps/[app-name]/src/core/`
Funcionalidades fundamentais:
- **providers/**: Providers React globais (Theme, I18n, etc.)

### `apps/[app-name]/src/features/`
Features isoladas e auto-contidas:
- Cada feature tem sua própria pasta
- Contém hooks, utils e types relacionados

### `apps/[app-name]/src/pages/`
Componentes de página reutilizáveis (podem ser usados em múltiplas rotas).

### `apps/[app-name]/src/shared/`
Código compartilhado dentro do app:
- **components/**: Componentes reutilizáveis
  - **layouts/**: Layouts (Header, Footer, etc.)
  - **ui/**: Componentes de UI (botões, inputs, etc.)
- **hooks/**: Hooks customizados
- **translations/**: Arquivos de tradução
- **utils/**: Funções utilitárias

### `apps/[app-name]/src/styles/`
Estilos globais (CSS/Tailwind).

### `apps/[app-name]/src/types/`
Definições de tipos TypeScript organizadas por domínio.

### `apps/[app-name]/src/assets/`
Assets estáticos (imagens, ícones, etc.).

### `apps/[app-name]/public/`
Arquivos públicos servidos diretamente (favicons, screenshots, etc.).

## 🎨 Padrões de Organização

### 1. Separação por Responsabilidade
- **app/**: Rotas e layouts
- **components/**: Componentes específicos
- **core/**: Funcionalidades fundamentais
- **features/**: Features isoladas
- **shared/**: Código compartilhado

### 2. Nomenclatura Consistente
- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `PascalCase` para interfaces

### 3. Exports Centralizados
Cada pasta tem um `index.ts` que exporta seus módulos:
```typescript
// src/shared/components/index.ts
export * from './layouts'
export * from './ui'
```

### 4. Path Aliases
Use aliases configurados no `tsconfig.json`:
```typescript
import { ThemeProvider } from '@/core/providers'
import { MainLayout } from '@/shared/components/layouts'
import { useTheme } from '@/shared/hooks'
```

## 🚀 Fluxo de Desenvolvimento

1. **Criar nova rota**: Adicione `apps/[app]/src/app/[rota]/page.tsx`
2. **Criar componente**: Adicione em `components/` ou `shared/components/`
3. **Criar feature**: Adicione em `features/[feature-name]/`
4. **Adicionar tipos**: Adicione em `types/` organizado por domínio

## 📝 Boas Práticas

1. **Mantenha features isoladas**: Cada feature deve ser auto-contida
2. **Use path aliases**: Facilita refatoração e move de arquivos
3. **Centralize exports**: Use `index.ts` para exports organizados
4. **Organize por domínio**: Agrupe código relacionado
5. **Documente componentes complexos**: Adicione JSDoc para componentes importantes

## 🔄 Migração de Estrutura Antiga

Se encontrar código legado:
- `core/routing/` → Removido (Next.js usa App Router)
- `core/App.tsx` → Removido (usar `app/layout.tsx`)
- `shared/contexts/` → Mover para `core/providers/`


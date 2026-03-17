# Story 1.1: Setup Monorepo Foundation

## Story

**As a** développeur,
**I want** initialiser le monorepo Turborepo avec les 3 packages,
**So that** la structure de base permette le développement parallèle backend/frontend.

## Status

done

## Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Aucune - story initiale

## Acceptance Criteria

### AC1: Monorepo initialisé
**Given** un dossier projet vide
**When** j'exécute les commandes d'initialisation
**Then** le monorepo Turborepo est créé avec pnpm workspaces

### AC2: Packages créés avec configuration TypeScript
**Given** le monorepo initialisé
**When** les packages sont créés
**Then** les packages backend, frontend, shared existent avec leur tsconfig

### AC3: Développement parallèle fonctionnel
**Given** les 3 packages configurés
**When** j'exécute `turbo dev`
**Then** les 3 packages se lancent en parallèle

### AC4: Imports absolus fonctionnels
**Given** les path aliases configurés
**When** j'utilise les imports absolus
**Then** les imports @backend/*, @frontend/*, @remnant/shared fonctionnent

### AC5: TypeScript strict mode activé
**Given** les tsconfig de chaque package
**When** TypeScript compile le projet
**Then** strict mode est activé sur tous les packages

## Tasks

- [x] Task 1: Initialiser le monorepo Turborepo (AC: #1)
  - [x] Créer le dossier remnant
  - [x] Initialiser avec `pnpm dlx create-turbo@latest`
  - [x] Configurer pnpm-workspace.yaml
  - [x] Configurer turbo.json avec tasks (dev, build, lint, test)

- [x] Task 2: Créer le package backend (AC: #2)
  - [x] Créer packages/backend/package.json
  - [x] Installer les dépendances Fastify (fastify, @fastify/jwt, @fastify/cors, etc.)
  - [x] Installer Drizzle ORM + better-sqlite3
  - [x] Installer dev dependencies (typescript, tsx, vitest)
  - [x] Créer tsconfig.json avec strict mode
  - [x] Créer src/index.ts (hello world)

- [x] Task 3: Créer le package frontend (AC: #2)
  - [x] Utiliser `pnpm create vite` avec template react-ts
  - [x] Installer Tailwind CSS + PostCSS
  - [x] Installer socket.io-client, @monaco-editor/react
  - [x] Installer Zustand, TanStack Query, TanStack Router
  - [x] Configurer Tailwind (tailwind.config.js, postcss.config.js)
  - [x] Créer tsconfig.json avec strict mode

- [x] Task 4: Créer le package shared (AC: #2)
  - [x] Créer packages/shared/package.json
  - [x] Créer src/index.ts avec exports
  - [x] Créer src/types/index.ts (placeholder)
  - [x] Créer src/constants/error_codes.ts
  - [x] Créer tsconfig.json avec strict mode

- [x] Task 5: Configurer les path aliases (AC: #4)
  - [x] Créer tsconfig.base.json à la racine
  - [x] Configurer paths: @backend/*, @frontend/*, @remnant/shared
  - [x] Configurer vite.config.ts avec resolve.alias
  - [x] Vérifier que les imports fonctionnent

- [x] Task 6: Valider le setup (AC: #3, #5)
  - [x] Exécuter `pnpm install` à la racine
  - [x] Exécuter `turbo dev` et vérifier les 3 packages
  - [x] Vérifier TypeScript compile sans erreurs
  - [x] Vérifier les imports cross-package fonctionnent

## Technical Implementation

### Architecture Requirements

Cette story implémente le **Starter Template** défini dans l'architecture:

| Décision | Valeur |
|----------|--------|
| Monorepo | Turborepo + pnpm workspaces |
| Packages | backend, frontend, shared |
| TypeScript | Strict mode, ES Modules |
| Build | Vite (frontend), tsx (backend dev), tsc (build) |

### Dependencies à installer

**Backend (packages/backend):**
```json
{
  "dependencies": {
    "fastify": "^5",
    "@fastify/jwt": "^9",
    "@fastify/rate-limit": "^10",
    "@fastify/helmet": "^12",
    "@fastify/cookie": "^10",
    "@fastify/cors": "^10",
    "@fastify/websocket": "^11",
    "socket.io": "^4",
    "drizzle-orm": "^0.35",
    "better-sqlite3": "^11",
    "bcrypt": "^5",
    "zod": "^3",
    "pino": "^9"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^22",
    "@types/better-sqlite3": "^7",
    "@types/bcrypt": "^5",
    "tsx": "^4",
    "vitest": "^2",
    "drizzle-kit": "^0.26"
  }
}
```

**Frontend (packages/frontend):**
```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "@tanstack/react-router": "^1",
    "@tanstack/react-query": "^5",
    "zustand": "^5",
    "socket.io-client": "^4",
    "@monaco-editor/react": "^4"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "vite": "^6",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "vitest": "^2",
    "@testing-library/react": "^16"
  }
}
```

**Shared (packages/shared):**
```json
{
  "dependencies": {
    "zod": "^3"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

### Project Structure Notes

Structure finale attendue après cette story:

```
remnant/
├── package.json              # Workspace root
├── pnpm-workspace.yaml       # packages: ["packages/*"]
├── turbo.json                # Tasks: dev, build, lint, test
├── tsconfig.base.json        # Shared TS config + paths
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── packages/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json     # extends ../../tsconfig.base.json
│   │   └── src/
│   │       └── index.ts      # Hello world Fastify
│   ├── frontend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── routes.tsx
│   │       └── globals.css
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types/
│           │   └── index.ts
│           └── constants/
│               └── error_codes.ts
└── data/                     # Gitignored runtime data
```

### Naming Conventions (CRITICAL)

| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichiers | snake_case | `error_codes.ts`, `api_client.ts` |
| Dossiers | snake_case | `src/types/`, `src/constants/` |
| Composants | PascalCase export | `export function App()` |
| Types | PascalCase | `ApiResponse`, `ErrorCode` |

### turbo.json Configuration

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### tsconfig.base.json Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "baseUrl": ".",
    "paths": {
      "@remnant/shared": ["packages/shared/src"],
      "@remnant/shared/*": ["packages/shared/src/*"],
      "@backend/*": ["packages/backend/src/*"],
      "@frontend/*": ["packages/frontend/src/*"]
    }
  }
}
```

### References

- [Source: architecture.md#Starter-Template-Evaluation]
- [Source: architecture.md#Project-Structure]
- [Source: architecture.md#Implementation-Patterns]
- [Source: epics.md#Story-1.1]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes

- Cette story est la fondation technique du projet
- Aucune base de données n'est créée ici (Story 1.2)
- Le backend ne fait qu'un hello world Fastify
- Le frontend ne fait qu'un hello world React
- L'objectif est d'avoir `turbo dev` fonctionnel

**Implementation completed 2026-03-10:**
- Monorepo Turborepo initialisé avec pnpm workspaces
- 3 packages créés: backend, frontend, shared
- `turbo dev` lance les 3 packages en parallèle
- Backend: Fastify sur port 3001
- Frontend: Vite sur port 3000
- TypeScript strict mode activé sur tous les packages
- Path aliases configurés (@remnant/shared, @backend/*, @frontend/*)
- Note: .eslintrc.js omis (sera ajouté dans une story future si nécessaire)

### Change Log

- 2026-03-10: Initial implementation - monorepo foundation complete
- 2026-03-10: Fixed Tailwind CSS v4 configuration (using @tailwindcss/vite plugin)

### File List

Files created:
- `/package.json` (workspace root)
- `/pnpm-workspace.yaml`
- `/turbo.json`
- `/tsconfig.base.json`
- `/.gitignore`
- `/.prettierrc`
- `/packages/backend/package.json`
- `/packages/backend/tsconfig.json`
- `/packages/backend/src/index.ts`
- `/packages/frontend/package.json`
- `/packages/frontend/tsconfig.json`
- `/packages/frontend/vite.config.ts` (includes @tailwindcss/vite plugin)
- `/packages/frontend/index.html`
- `/packages/frontend/src/main.tsx`
- `/packages/frontend/src/routes.tsx`
- `/packages/frontend/src/globals.css`
- `/packages/shared/package.json`
- `/packages/shared/tsconfig.json`
- `/packages/shared/src/index.ts`
- `/packages/shared/src/types/index.ts`
- `/packages/shared/src/constants/error_codes.ts`

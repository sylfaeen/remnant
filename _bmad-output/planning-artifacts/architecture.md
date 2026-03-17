---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - /Users/louis/Herd/remnant/_bmad-output/planning-artifacts/product-brief-remnant-2026-03-10.md
workflowType: 'architecture'
project_name: 'remnant'
user_name: 'Louis'
date: '2026-03-10'
lastStep: 8
status: 'complete'
completedAt: '2026-03-10'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

| Domaine | Fonctionnalités | Implications Architecturales |
|---------|-----------------|------------------------------|
| **Process Management** | Start/stop/restart, auto-start systemd | Child process lifecycle, signal handling, PID tracking |
| **Real-time Console** | Logs streaming, command execution | WebSocket bidirectionnel, stdout/stdin piping |
| **File Management** | Browser, editor, upload | fs/promises, path validation, éditeur de code intégré |
| **Server Config** | JAR management, JVM flags, ports | Config persistence, validation, PaperMC API |
| **Plugin Management** | Upload, list plugins | File upload handling, directory watching |
| **Scheduled Tasks** | Backups, restarts | Cron-like scheduler, task persistence |
| **Monitoring** | CPU, RAM, players | System metrics polling, RCON or log parsing |
| **Auth & Permissions** | Multi-user, permissions directes | Users table, permission checks per route/action |

**Non-Functional Requirements:**

| NFR | Exigence | Impact Architectural |
|-----|----------|---------------------|
| **Sécurité** | Défense en profondeur, SQLite, permissions | Middleware chain, DB, permission guards |
| **Performance** | Panel léger (<100MB RAM) | SQLite over heavy DB, efficient polling |
| **Fiabilité** | Panel stable 24/7 | Graceful error handling, process recovery |
| **Maintenabilité** | Code TypeScript strict | Strong typing, clear module boundaries |
| **Scalabilité** | Multi-serveurs ready (Docker) | Abstract server management, container orchestration |

**Scale & Complexity:**

- **Domaine principal:** Full-stack TypeScript (Backend-heavy)
- **Niveau de complexité:** Moyenne-Haute
- **Composants architecturaux estimés:** 8-10 modules backend, 6-8 composants frontend

### Technical Constraints & Dependencies

| Contrainte | Décision | Impact |
|------------|----------|--------|
| **Deployment** | Linux natif OU Docker (choix admin) | Docker = utilisateur avancé, pas de hand-holding |
| **Multi-serveurs** | Requiert Docker pour les instances MC | Si Linux natif + multi → Docker requis |
| **Database** | SQLite | Tables users, permissions, config, sessions |
| **Runtime** | Node.js LTS | ES modules, écosystème mature (Fastify, Socket.io) |
| **Nginx** | Obligatoire (natif) ou intégré (Docker) | TLS termination, reverse proxy |
| **Auth model** | Multi-user + permissions directes | Permission list par user, admin par défaut |

### Cross-Cutting Concerns Identified

1. **Authentication Layer** — JWT validation on HTTP routes + WebSocket connections
2. **Permission Guards** — Vérification permissions par route/action/WebSocket event
3. **Database Access** — SQLite connection, migrations, secure queries
4. **Error Handling Strategy** — Consistent error formats, logging, recovery
5. **Configuration Management** — SQLite + environment variables + defaults
6. **Process State Synchronization** — Node ↔ Java/Docker process status
7. **Security Validation** — Path traversal checks, input sanitization, rate limiting
8. **Logging Architecture** — Panel logs vs Minecraft logs, log rotation

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack TypeScript Monorepo** basé sur l'analyse des exigences projet:
- Backend API avec temps réel (WebSocket)
- Frontend SPA avec éditeur de code intégré
- Types partagés entre backend et frontend

### Starter Options Considered

| Option | Forces | Faiblesses | Verdict |
|--------|--------|------------|---------|
| **pnpm workspaces seul** | Simple, léger | Pas de caching, orchestration manuelle | Trop basique |
| **Nx** | Complet, générateurs | Overhead important, courbe d'apprentissage | Trop lourd |
| **Turborepo + pnpm** | Caching, parallélisation, léger | Config initiale | **Retenu** |

### Selected Starter: Turborepo + pnpm Workspaces

**Rationale:**
- Caching intelligent réduit les temps de build
- Léger comparé à Nx (pas de framework opiniated)
- Facile à comprendre et maintenir
- Orchestration des tasks parallèles
- Compatible avec la philosophie "simple et efficace" de Remnant

### Project Structure

```
remnant/
├── package.json              # Workspace root + scripts
├── pnpm-workspace.yaml       # Workspace packages definition
├── turbo.json                # Turborepo task configuration
├── tsconfig.base.json        # Shared TypeScript config
├── packages/
│   ├── backend/              # Fastify + WebSocket natif + SQLite
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── plugins/
│   │   │   └── db/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── frontend/             # React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   ├── public/
│   │   │   ├── manifest.webmanifest
│   │   │   ├── sw.js
│   │   │   └── icon.svg
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   └── shared/               # Types partagés
│       ├── src/
│       │   ├── index.ts
│       │   ├── types/
│       │   └── constants/
│       ├── package.json
│       └── tsconfig.json
├── scripts/
│   └── remnant-cli.sh        # CLI tool
└── docs/                     # VitePress documentation
```

### Initialization Commands

```bash
# 1. Créer le monorepo Turborepo
pnpm dlx create-turbo@latest remnant --package-manager pnpm
cd remnant

# 2. Nettoyer les exemples par défaut
rm -rf apps/* packages/*

# 3. Créer le backend Fastify
mkdir -p packages/backend/src
cd packages/backend
pnpm init -y
pnpm add fastify @fastify/jwt @fastify/rate-limit @fastify/helmet @fastify/cookie @fastify/cors @fastify/websocket
pnpm add drizzle-orm better-sqlite3 bcrypt zod
pnpm add -D typescript @types/node @types/better-sqlite3 @types/bcrypt tsx vitest

# 4. Créer le frontend React + Vite + Tailwind
cd ../..
pnpm create vite packages/frontend --template react-ts
cd packages/frontend
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 5. Créer le package shared
cd ../..
mkdir -p packages/shared/src
cd packages/shared
pnpm init -y
pnpm add -D typescript

# 6. Installer toutes les dépendances
cd ../..
pnpm install
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript strict mode across all packages
- Node.js LTS pour le backend
- ES Modules (ESM) par défaut

**Build Tooling:**
- Turborepo pour orchestration et caching
- Vite pour le frontend (dev server + build)
- tsx pour le backend (dev) + tsc (build)

**Styling Solution:**
- Tailwind CSS avec PostCSS
- Configuration JIT (Just-In-Time)
- Utilitaire `cn()` pour les classes dynamiques (clsx + tailwind-merge)
  - Import: `import { cn } from '@remnant/frontend/lib/cn'`
  - Usage obligatoire pour tout className conditionnel
  - Exemple: `className={cn('base-class', condition && 'conditional-class')}`
  - Ne jamais utiliser de template literals: `` className={`base ${condition}`} ``

**React Types:**
- Ne jamais utiliser `React.X` (ex: `React.FormEvent`) - cause une erreur UMD global
- Toujours importer les types directement depuis 'react'
- `FormEvent` est deprecie - utiliser `SubmitEvent<HTMLFormElement>` pour les formulaires
- Autres evenements: `DragEvent`, `ChangeEvent`, `KeyboardEvent`, `MouseEvent`, etc.
- Exemple: `import { type SubmitEvent, type ChangeEvent } from 'react'`

**Page Component Structure:**
- L'export function principale DOIT etre en premier dans le fichier (apres les imports)
- Les fonctions helper et composants internes doivent etre places APRES l'export principal
- Exemple:
  ```typescript
  // imports...

  export function MyPage() { ... }  // export en premier

  function HelperComponent() { ... }  // helpers apres
  function formatData() { ... }
  ```

**Code Organization:**
- Monorepo avec packages isolés
- Types partagés via `@remnant/shared`
- Imports aliasés (@remnant/backend/*, @remnant/frontend/*, @remnant/shared/*)

**Development Experience:**
- Hot reload frontend (Vite HMR)
- Hot reload backend (tsx watch)
- Parallel dev servers via Turborepo
- Commande unique: `turbo dev`

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Database: SQLite avec Drizzle ORM
- Auth: JWT via @fastify/jwt + token versioning
- Real-time: WebSocket natif pour console
- API: tRPC (type-safe) + REST pour uploads

**Important Decisions (Shape Architecture):**
- State management: Zustand
- Data fetching: TanStack Query
- Validation: Zod (partagé backend/frontend)
- Logging: pino

**Deferred Decisions (Post-MVP):**
- API versioning (si besoin de breaking changes)
- Cache distribué (si scaling nécessaire)
- CDN pour assets statiques

---

### Data Architecture

| Décision | Choix | Version | Rationale |
|----------|-------|---------|-----------|
| **Database** | SQLite | 3.x | Léger, fichier unique, parfait pour GSMP |
| **ORM** | Drizzle ORM | latest | Type-safe, léger, proche du SQL |
| **Migrations** | drizzle-kit | latest | Push (dev), Generate+Migrate (prod) |
| **Caching** | In-memory simple | N/A | Map pour permissions, pas de Redis |

**Schema Overview:**
```
users (id, username, password_hash, permissions[], token_version, locale, created_at, updated_at)
sessions (id, user_id, refresh_token, expires_at, created_at)
servers (id, name, path, config_json, is_active)
scheduled_tasks (id, server_id, type, cron_expression, config_json)
```

---

### Authentication & Security

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **JWT Library** | @fastify/jwt | Intégration native Fastify |
| **Access Token** | 15min, mémoire JS | Court-lived, non persisté |
| **Refresh Token** | Cookie httpOnly + SQLite | Sécurisé, révocable |
| **Révocation** | Token versioning | Simple, colonne `token_version` |
| **Password Hash** | bcrypt (cost ≥12) | Standard sécurisé |

**Rate Limiting:**
| Route | Limite |
|-------|--------|
| `/api/auth/login` | 5 req/min par IP |
| `/api/*` (auth) | 100 req/min par user |
| WebSocket | Throttle serveur |

**Security Middleware Chain:**
```
Request → Helmet → CORS → Rate Limit → JWT Verify → Permission Guard → Handler
```

---

### API & Communication Patterns

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **API Style** | tRPC + WebSocket | tRPC pour type-safety end-to-end, WS pour temps réel |
| **tRPC Version** | v11 | Meilleure inférence TypeScript |
| **Transformer** | superjson | Support Date, Map, Set |
| **Validation** | Zod | Type-safe, intégré avec tRPC |
| **File Uploads** | REST (hybride) | tRPC ne supporte pas multipart/form-data |

**tRPC Routers:**
```
/trpc
  ├── auth       # login, logout, refresh, me
  ├── users      # list, byId, create, update, delete, updateLocale
  ├── servers    # list, byId, create, update, delete, start, stop, restart
  ├── files      # list, read, write, delete, mkdir, rename, info
  ├── jars       # getVersions, getBuilds, download, progress, list, setActive
  ├── plugins    # list, delete
  ├── tasks      # list, create, update, delete, toggle
  ├── settings   # get, update, checkVersion
  └── java       # detectVersions
```

**REST Routes (file uploads/downloads):**
- `POST /api/servers/:id/files/upload` — Upload files
- `GET /api/servers/:id/files/download` — Download files
- `POST /api/servers/:id/plugins` — Upload plugins
- `POST /api/servers/:id/backups` — Create backup
- `GET /api/servers/:id/backups/:name/download` — Download backup
- `DELETE /api/servers/:id/backups/:name` — Delete backup

**WebSocket Events:**
| Event | Direction | Description |
|-------|-----------|-------------|
| `console:output` | Server→Client | Logs Minecraft |
| `console:input` | Client→Server | Commande à exécuter |
| `server:status` | Server→Client | État du serveur (running/stopped) |
| `metrics:update` | Server→Client | CPU, RAM, players |

---

### Frontend Architecture

| Décision | Choix | Version | Rationale |
|----------|-------|---------|-----------|
| **State Management** | Zustand | latest | Léger (~1KB), API simple |
| **Routing** | TanStack Router | v1 | Type-safe, intégration TanStack Query |
| **Data Fetching** | TanStack Query | v5 | Caching, loading states |
| **Components** | Feature-based | N/A | Intuitif pour ce projet |

**Project Structure:**
```
src/
├── features/
│   ├── layout/        # Sidebar, MobileNav, AppShell, MainLayout
│   ├── auth/          # Auth store, login hook
│   └── i18n/          # i18n config, locales (en.json, fr.json)
├── pages/
│   └── app/
│       ├── dashboard/
│       ├── servers/    # Server pages + features (header, section compounds)
│       ├── users/
│       └── settings/
├── hooks/              # use_auth, use_servers, use_files, etc.
├── components/ui/      # Button, Card, Dialog, Input, etc. (Radix UI)
└── lib/                # Utils (cn), tRPC client, API client
```

**Frontend Routes:**
| Route | Component | Description |
|---|---|---|
| `/` | LoginPage | Page de connexion |
| `/app` | DashboardPage | Dashboard principal |
| `/app/servers` | ServersPage | Liste des serveurs |
| `/app/users` | UsersPage | Gestion utilisateurs |
| `/app/settings` | SettingsPage | Paramètres application |
| `/app/servers/$id` | ServerDashboardPage | Dashboard serveur |
| `/app/servers/$id/files` | ServerFilesPage | Navigateur de fichiers |
| `/app/servers/$id/files/edit` | ServerFileEditorPage | Éditeur de fichier |
| `/app/servers/$id/plugins` | ServerPluginsPage | Gestion plugins |
| `/app/servers/$id/backups` | ServerBackupsPage | Gestion backups |
| `/app/servers/$id/tasks` | ServerTasksPage | Tâches planifiées |
| `/app/servers/$id/settings` | ServerSettingsPage | Paramètres serveur |

**UI Components:**
- Composants Radix UI (Button, Card, Dialog, Input, Select, etc.)
- Éditeur de code intégré pour l'édition de fichiers serveur
- Pattern Compound Component utilisé pour `ServerPageHeader` et `ServerSection`

---

### Infrastructure & Deployment

| Décision | Choix | Rationale |
|----------|-------|-----------|
| **CI/CD** | GitHub Actions | Gratuit open-source, bien intégré |
| **Env Config** | `.env` + `env.ts` bootstrap | Résolution `$HOME`, génération auto des secrets, écriture au démarrage |
| **Logging** | pino | Natif Fastify, JSON, performant |
| **Production** | Fastify sert frontend | Un seul process |
| **Docker** | Multi-stage build | Image minimale |

**GitHub Actions Pipeline:**
```
Push → Install → Lint → Test → Build → (Deploy si tag)
```

**Environment Variables (`.env`):**
```
REMNANT_HOME=/opt/remnant
SERVERS_BASE_PATH=/opt/remnant/servers
BACKUPS_BASE_PATH=/opt/remnant/backups
DATABASE_PATH=/opt/remnant/remnant.db

JWT_SECRET=              # auto-généré au premier lancement
COOKIE_SECRET=           # auto-généré au premier lancement
SECURE_COOKIES=false
```

**Path Management (`packages/backend/src/services/paths.ts`):**
- Source unique pour tous les chemins : `SERVERS_BASE_PATH`, `BACKUPS_BASE_PATH`, `DATABASE_PATH`, `APP_DIR`
- Tous dérivés de `REMNANT_HOME` avec fallback `/opt/remnant`
- Override possible par variable d'environnement individuelle

**Bootstrap (`packages/backend/src/env.ts`):**
- Préchargé via `--import` avant le code applicatif (ESM)
- Résout les variables shell (`$HOME`) dans les valeurs `.env`
- Génère `JWT_SECRET` et `COOKIE_SECRET` si vides, les écrit dans le `.env`

### Progressive Web App (PWA)

| Élément | Détail |
|---------|--------|
| **Manifest** | `public/manifest.webmanifest` — nom "Remnant", display standalone, thème emerald |
| **Service Worker** | `public/sw.js` — minimal, active l'installabilité PWA |
| **Icône** | `public/icon.svg` — gradient emerald/amber avec lettre "R" |
| **Meta tags** | theme-color, apple-mobile-web-app-capable, viewport-fit=cover |

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Setup monorepo (Turborepo + pnpm)
2. Backend foundation (Fastify + Drizzle + SQLite)
3. Auth system (JWT + permissions)
4. Frontend foundation (React + Zustand + TanStack Query)
5. Real-time layer (Native WebSocket)
6. Feature modules (console, files, server control, etc.)

**Cross-Component Dependencies:**
- `@shared` → Types partagés entre backend et frontend
- Zod schemas → Validation backend + frontend
- WebSocket types → Events typés end-to-end
- Drizzle types → Inférence depuis le schema DB

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Addressed:** 15+ areas where inconsistencies could occur

---

### Naming Patterns

**Database (Drizzle/SQLite):**
| Élément | Convention | Exemple |
|---------|------------|---------|
| Tables | snake_case, pluriel | `users`, `scheduled_tasks` |
| Colonnes | snake_case | `created_at`, `token_version` |
| Foreign keys | `{table}_id` | `user_id`, `server_id` |
| Index | `idx_{table}_{column}` | `idx_users_username` |

**API (Fastify):**
| Élément | Convention | Exemple |
|---------|------------|---------|
| Endpoints | kebab-case, pluriel | `/api/servers`, `/api/scheduled-tasks` |
| Paramètres URL | camelCase | `/api/servers/:serverId` |
| Query params | camelCase | `?includeDeleted=true` |
| JSON body/response | snake_case | `{ "user_id": 1, "created_at": "..." }` |

**Code (TypeScript):**
| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichiers | snake_case | `server_control.tsx`, `api_client.ts` |
| Dossiers | snake_case | `server_control/`, `scheduled_tasks/` |
| Composants (export) | PascalCase | `export function ServerControl()` |
| Fonctions | camelCase | `getServerStatus()` |
| Types/Interfaces | PascalCase | `ServerConfig`, `User` |
| Constants | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE` |

---

### Structure Patterns

**Tests:**
```
packages/{package}/
├── src/
│   └── {feature}/
│       └── {file}.ts
└── tests/
    └── {feature}/
        └── {file}.test.ts
```

**Imports — Tous absolus:**
```typescript
// Alias configurés dans tsconfig
import { Button } from '@remnant/frontend/components/ui/button'
import { useServerStore } from '@remnant/frontend/stores/server_store'
import { ServerStatus } from '@remnant/shared'
```

**Alias Configuration:**
| Alias | Path |
|-------|------|
| `@remnant/frontend/*` | `packages/frontend/src/*` |
| `@remnant/backend/*` | `packages/backend/src/*` |
| `@remnant/shared` | `packages/shared/src` |

---

### Format Patterns

**API Response Format:**
```typescript
// Success
{
  success: true,
  data: T
}

// Error
{
  success: false,
  error: {
    code: string,      // "AUTH_INVALID_CREDENTIALS"
    message: string,   // Human-readable
    details?: unknown  // Validation errors, etc.
  }
}
```

**Data Formats:**
| Type | Format | Exemple |
|------|--------|---------|
| JSON fields | snake_case | `user_id`, `created_at` |
| Dates | ISO 8601 | `"2026-03-10T14:30:00Z"` |
| Booleans | true/false | `is_active: true` |
| Null | explicit null | `deleted_at: null` |

---

### Internationalization (i18n) Patterns

**MANDATORY REQUIREMENT:** All frontend text MUST be translated. No hardcoded strings allowed.

**Stack:**
| Library | Version | Purpose |
|---------|---------|---------|
| react-i18next | latest | React integration |
| i18next | latest | Core i18n framework |
| i18next-browser-languagedetector | latest | Auto language detection |

**Locale Files Structure:**
```
packages/frontend/src/i18n/
├── index.ts              # i18n configuration
└── locales/
    ├── en.json           # English translations (default/fallback)
    └── fr.json           # French translations
```

**Translation Key Conventions:**
| Pattern | Format | Example |
|---------|--------|---------|
| Namespace | feature/page name | `common`, `nav`, `servers`, `users` |
| Key | descriptive camelCase | `serverName`, `confirmDelete`, `saveChanges` |
| Full key | `namespace.key` | `servers.serverName`, `common.save` |

**Standard Namespaces:**
- `common` — Shared actions: save, cancel, delete, confirm, yes, no, back, create, update, warning
- `nav` — Navigation: dashboard, servers, users, console, files, plugins, settings, tasks, logout
- `errors` — Error messages: generic, notFound, unauthorized, serverError, invalidFileType
- `notifications` — Toast messages: saveSuccess, deleteSuccess, uploadFailed
- `{feature}` — Feature-specific: servers.*, users.*, files.*, plugins.*, tasks.*

**Component Implementation Pattern:**
```typescript
// ✅ CORRECT: Using useTranslation hook
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('myFeature.title')}</h1>
      <button>{t('common.save')}</button>
      <p>{t('myFeature.description')}</p>
    </div>
  );
}

// ❌ WRONG: Hardcoded strings
export function MyComponent() {
  return (
    <div>
      <h1>My Title</h1>           {/* NO! Use t('myFeature.title') */}
      <button>Save</button>        {/* NO! Use t('common.save') */}
      <p>Some description</p>      {/* NO! Use t('myFeature.description') */}
    </div>
  );
}
```

**JSON Translation File Format:**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm",
    "yes": "Yes",
    "no": "No",
    "back": "Back",
    "create": "Create",
    "update": "Update",
    "warning": "Warning"
  },
  "myFeature": {
    "title": "Feature Title",
    "description": "Feature description text",
    "fieldLabel": "Field Label",
    "placeholder": "Enter value..."
  }
}
```

**i18n Implementation Checklist for New Components:**
1. [ ] Import `useTranslation` from 'react-i18next'
2. [ ] Add `const { t } = useTranslation()` in component
3. [ ] Replace ALL hardcoded strings with `t()` calls
4. [ ] Add translation keys to `en.json`
5. [ ] Add translation keys to `fr.json`
6. [ ] Test component in both languages

**Language Persistence:**
- Storage key: `remnant-language` in localStorage
- Default/Fallback: English (`en`)
- Supported: English (`en`), French (`fr`)

**Persistance de la langue utilisateur:**
- La préférence de langue est stockée dans la colonne `locale` de la table `users`
- Le endpoint `users.updateLocale` permet de sauvegarder la préférence
- Au login, la langue est automatiquement restaurée depuis le profil utilisateur
- Fallback: localStorage si l'utilisateur n'est pas connecté

**Language Selector Components:**
- `LanguageSelector` — Full dropdown for login page
- `LanguageSelectorCompact` — Toggle button for dashboard header

---

### Communication Patterns

**WebSocket Events:**
| Convention | Format | Exemple |
|------------|--------|---------|
| Event name | `namespace:action` | `console:output`, `server:status` |
| Payload | Typed object | `{ type, data, timestamp }` |

```typescript
// Event payload structure
interface SocketEvent<T> {
  type: string
  data: T
  timestamp: string  // ISO 8601
}
```

**Zustand Stores:**
| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichier | snake_case | `use_server_store.ts` |
| Hook export | camelCase | `useServerStore` |
| Actions | camelCase | `startServer()`, `updateStatus()` |
| State keys | snake_case | `is_running`, `server_config` |

---

### Process Patterns

**Error Codes Standardisés:**
```typescript
// @remnant/shared/constants/error_codes.ts
export const ErrorCodes = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Server
  SERVER_NOT_FOUND: 'SERVER_NOT_FOUND',
  SERVER_ALREADY_RUNNING: 'SERVER_ALREADY_RUNNING',
  SERVER_START_FAILED: 'SERVER_START_FAILED',

  // Files
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_PATH_FORBIDDEN: 'FILE_PATH_FORBIDDEN',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',

  // Generic
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const
```

**Error Handling Chain:**
| Couche | Pattern |
|--------|---------|
| Backend routes | Try/catch → ApiError with code |
| Fastify error handler | Global handler → formatted response |
| Frontend queries | TanStack Query `onError` |
| UI | Toast notifications |

**Loading States:**
| Contexte | Implémentation |
|----------|----------------|
| Data fetching | TanStack Query `isLoading` |
| Mutations | TanStack Query `isPending` |
| UI components | Skeleton loaders |
| Boutons | Disabled + spinner |

**Logging Levels:**
| Level | Usage |
|-------|-------|
| `error` | Erreurs critiques, exceptions |
| `warn` | Comportements anormaux non-bloquants |
| `info` | Actions importantes (login, server start) |
| `debug` | Détails pour développement |

---

### Enforcement Guidelines

**All AI Agents MUST:**
- Utiliser snake_case pour tous les fichiers
- Utiliser les imports absolus avec alias
- Suivre le format de réponse API standard
- Utiliser les ErrorCodes définis dans @shared
- Placer les tests dans le dossier `tests/`
- Documenter les nouvelles constantes dans @shared
- Utiliser `Array<T>` au lieu de `T[]` pour les types tableaux (cohérence avec les génériques)
- **TRADUIRE tous les textes frontend** via react-i18next (aucune chaîne hardcodée)
- Ajouter les clés de traduction dans `en.json` ET `fr.json` pour chaque nouveau texte

**Pattern Verification:**
- ESLint rules pour naming conventions et `@typescript-eslint/array-type: generic`
- TypeScript strict pour type safety
- PR review checklist pour patterns

---

### Pattern Examples

**Good Example — tRPC Router:**
```typescript
// packages/backend/src/trpc/routers/servers.ts
import { router } from '../index';
import { protectedProcedure } from '../middlewares/auth';
import { ServerService } from '../../services/server_service';

const serverService = new ServerService();

export const serversRouter = router({
  list: protectedProcedure.query(async () => {
    return serverService.getAllServers();
  }),

  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return serverService.getServerById(input.id);
    }),
});
// Frontend: trpc.servers.list.useQuery() - Ctrl+Click navigates here!
```

**Anti-Patterns:**
```typescript
// ❌ Wrong: camelCase filename
// ServerControl.tsx → ✅ server_control.tsx

// ❌ Wrong: relative imports cross-package
import { User } from '../../../shared/types'
// ✅ Correct:
import { User } from '@remnant/shared'

// ❌ Wrong: camelCase in JSON response
{ "userId": 1, "createdAt": "..." }
// ✅ Correct:
{ "user_id": 1, "created_at": "..." }

// ❌ Wrong: inline error message
return { success: false, error: { message: 'Bad auth' } }
// ✅ Correct:
return { success: false, error: { code: ErrorCodes.AUTH_INVALID_CREDENTIALS, message: '...' } }

// ❌ Wrong: array shorthand syntax
const items: string[] = []
Promise<ApiResponse<Server[]>>
// ✅ Correct: generic Array<T> syntax (cohérent avec les autres génériques)
const items: Array<string> = []
Promise<ApiResponse<Array<Server>>>

// ❌ Wrong: hardcoded strings in frontend components
<h1>Server Settings</h1>
<button>Save Changes</button>
// ✅ Correct: all text must use i18n
const { t } = useTranslation();
<h1>{t('settings.title')}</h1>
<button>{t('common.save')}</button>
```

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
remnant/
├── package.json                      # Workspace root config + scripts globaux
├── pnpm-workspace.yaml               # Définition des packages workspace
├── turbo.json                        # Configuration Turborepo (tasks, caching)
├── tsconfig.base.json                # Config TypeScript partagée
├── .env.example                      # Template variables d'environnement
├── .gitignore                        # Fichiers exclus du versioning
├── .eslintrc.js                      # Config ESLint racine
├── .prettierrc                       # Config Prettier
├── README.md                         # Documentation projet
├── LICENSE                           # MIT License
├── docker-compose.yml                # Multi-container setup (dev + MC servers)
├── Dockerfile                        # Production multi-stage build
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + Test + Build on push/PR
│       └── release.yml               # Build + Tag on version
│
├── packages/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json             # Extends tsconfig.base.json
│   │   ├── drizzle.config.ts         # Config Drizzle-kit
│   │   ├── src/
│   │   │   ├── index.ts              # Entry point, server bootstrap
│   │   │   ├── app.ts                # Fastify app factory
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── index.ts          # Config loader (Zod validated)
│   │   │   │   └── env.ts            # Environment schema
│   │   │   │
│   │   │   ├── db/
│   │   │   │   ├── index.ts          # Database connection (Drizzle)
│   │   │   │   ├── schema/
│   │   │   │   │   ├── index.ts      # Schema exports
│   │   │   │   │   ├── users.ts      # Users table
│   │   │   │   │   ├── sessions.ts   # Sessions table
│   │   │   │   │   ├── servers.ts    # Servers table
│   │   │   │   │   └── tasks.ts      # Scheduled tasks table
│   │   │   │   └── migrations/       # Drizzle migrations
│   │   │   │
│   │   │   ├── trpc/
│   │   │   │   ├── index.ts          # Context, base procedures, superjson
│   │   │   │   ├── router.ts         # Root router (AppRouter)
│   │   │   │   ├── middlewares/
│   │   │   │   │   └── auth.ts       # protectedProcedure
│   │   │   │   └── routers/
│   │   │   │       ├── auth.ts       # login, logout, refresh, me
│   │   │   │       ├── users.ts      # list, byId, create, update, delete
│   │   │   │       ├── servers.ts    # list, byId, CRUD, start/stop/restart
│   │   │   │       ├── files.ts      # list, read, write, delete, mkdir, rename
│   │   │   │       ├── jars.ts       # getVersions, getBuilds, download, list
│   │   │   │       ├── plugins.ts    # list, delete
│   │   │   │       └── tasks.ts      # list, create, update, delete, toggle
│   │   │   │
│   │   │   ├── routes/               # REST uniquement pour uploads
│   │   │   │   ├── index.ts          # Route registration
│   │   │   │   ├── files.ts          # POST upload (multipart)
│   │   │   │   ├── plugins.ts        # POST upload (multipart)
│   │   │   │   └── websocket.ts      # WebSocket /ws/console
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── auth_service.ts   # JWT, password hashing, token versioning
│   │   │   │   ├── user_service.ts   # User CRUD, permission management
│   │   │   │   ├── server_service.ts # Server process management
│   │   │   │   ├── file_service.ts   # File operations, path validation
│   │   │   │   ├── plugin_service.ts # Plugin management
│   │   │   │   ├── task_service.ts   # Scheduled task execution
│   │   │   │   └── metrics_service.ts# System metrics collection
│   │   │   │
│   │   │   ├── socket/
│   │   │   │   ├── index.ts          # Socket.io setup + auth middleware
│   │   │   │   └── handlers/
│   │   │   │       ├── console_handler.ts   # console:* events
│   │   │   │       ├── server_handler.ts    # server:* events
│   │   │   │       └── metrics_handler.ts   # metrics:* events
│   │   │   │
│   │   │   ├── plugins/              # Fastify plugins
│   │   │   │   ├── auth.ts           # JWT plugin setup
│   │   │   │   ├── rate_limit.ts     # Rate limiting config
│   │   │   │   └── error_handler.ts  # Global error handler
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── auth_guard.ts     # JWT verification hook
│   │   │   │   └── permission_guard.ts # Permission check hook
│   │   │   │
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts         # Pino logger setup
│   │   │   │   ├── path_validator.ts # Path traversal protection
│   │   │   │   └── process_manager.ts# Child process utilities
│   │   │   │
│   │   │   └── types/
│   │   │       └── fastify.d.ts      # Fastify type augmentations
│   │   │
│   │   └── tests/
│   │       ├── setup.ts              # Test setup (vitest)
│   │       ├── routes/
│   │       │   ├── auth.test.ts
│   │       │   ├── servers.test.ts
│   │       │   └── files.test.ts
│   │       ├── services/
│   │       │   ├── auth_service.test.ts
│   │       │   └── server_service.test.ts
│   │       └── utils/
│   │           └── path_validator.test.ts
│   │
│   ├── frontend/
│   │   ├── package.json
│   │   ├── tsconfig.json             # Extends tsconfig.base.json
│   │   ├── vite.config.ts            # Vite config + alias
│   │   ├── tailwind.config.js        # Tailwind configuration
│   │   ├── postcss.config.js         # PostCSS config
│   │   ├── index.html                # HTML entry point
│   │   ├── src/
│   │   │   ├── main.tsx              # React entry point
│   │   │   ├── components/auth_initializer.tsx  # Auth initialization
│   │   │   ├── routes.tsx            # TanStack Router configuration
│   │   │   ├── globals.css           # Tailwind imports + global styles
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── login.tsx         # Login page
│   │   │   │   ├── dashboard.tsx     # Main dashboard
│   │   │   │   ├── console.tsx       # Console page
│   │   │   │   ├── files.tsx         # File browser page
│   │   │   │   ├── plugins.tsx       # Plugins management page
│   │   │   │   ├── settings.tsx      # Server settings page
│   │   │   │   ├── tasks.tsx         # Scheduled tasks page
│   │   │   │   └── users.tsx         # User management page
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Composants UI génériques
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── modal.tsx
│   │   │   │   │   ├── toast.tsx
│   │   │   │   │   ├── skeleton.tsx
│   │   │   │   │   └── dropdown.tsx
│   │   │   │   │
│   │   │   │   ├── layout/
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   └── main_layout.tsx
│   │   │   │   │
│   │   │   │   ├── console/
│   │   │   │   │   ├── console_output.tsx
│   │   │   │   │   └── command_input.tsx
│   │   │   │   │
│   │   │   │   ├── files/
│   │   │   │   │   ├── file_tree.tsx
│   │   │   │   │   ├── file_editor.tsx  # Éditeur de code intégré
│   │   │   │   │   └── upload_zone.tsx
│   │   │   │   │
│   │   │   │   ├── server/
│   │   │   │   │   ├── server_controls.tsx
│   │   │   │   │   ├── server_status.tsx
│   │   │   │   │   └── server_config_form.tsx
│   │   │   │   │
│   │   │   │   ├── monitoring/
│   │   │   │   │   ├── resource_chart.tsx
│   │   │   │   │   └── players_list.tsx
│   │   │   │   │
│   │   │   │   ├── plugins/
│   │   │   │   │   ├── plugin_list.tsx
│   │   │   │   │   └── plugin_upload.tsx
│   │   │   │   │
│   │   │   │   └── settings/
│   │   │   │       ├── jvm_flags_form.tsx
│   │   │   │       └── port_config_form.tsx
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── use_auth_store.ts      # Auth state + actions
│   │   │   │   ├── use_server_store.ts    # Server state + status
│   │   │   │   ├── use_console_store.ts   # Console logs buffer
│   │   │   │   └── use_ui_store.ts        # UI state (sidebar, theme)
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── use_socket.ts          # Socket.io connection hook
│   │   │   │   ├── use_server_status.ts   # Server status subscription
│   │   │   │   └── use_metrics.ts         # Metrics subscription
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── trpc.ts                # tRPC client + httpBatchLink
│   │   │   │   ├── api.ts                 # ApiError class (pour uploads REST)
│   │   │   │   ├── cn.ts                  # Tailwind class merge utility
│   │   │   │   ├── socket_client.ts       # Socket.io client setup
│   │   │   │   └── query_client.ts        # TanStack Query setup
│   │   │   │
│   │   │   ├── i18n/                      # Internationalization (MANDATORY)
│   │   │   │   ├── index.ts               # i18n configuration
│   │   │   │   └── locales/
│   │   │   │       ├── en.json            # English translations (default)
│   │   │   │       └── fr.json            # French translations
│   │   │   │
│   │   │   └── types/
│   │   │       └── index.ts               # Frontend-specific types
│   │   │
│   │   └── tests/
│   │       ├── setup.ts                   # Test setup (vitest + testing-library)
│   │       ├── components/
│   │       │   ├── ui/
│   │       │   │   └── button.test.tsx
│   │       │   └── console/
│   │       │       └── console_output.test.tsx
│   │       └── stores/
│   │           └── use_auth_store.test.ts
│   │
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json              # Extends tsconfig.base.json
│       ├── src/
│       │   ├── index.ts               # Public exports
│       │   │
│       │   ├── types/
│       │   │   ├── index.ts           # Type exports
│       │   │   ├── user.ts            # User, Permission types
│       │   │   ├── server.ts          # Server, ServerConfig types
│       │   │   ├── api.ts             # ApiResponse, ApiError types
│       │   │   └── socket.ts          # Socket event types
│       │   │
│       │   ├── schemas/
│       │   │   ├── index.ts           # Schema exports
│       │   │   ├── auth.ts            # Login, register schemas
│       │   │   ├── server.ts          # Server config schemas
│       │   │   └── files.ts           # File operation schemas
│       │   │
│       │   └── constants/
│       │       ├── index.ts           # Constants exports
│       │       ├── error_codes.ts     # ErrorCodes enum
│       │       ├── permissions.ts     # Permission constants
│       │       └── socket_events.ts   # Socket event names
│       │
│       └── tests/
│           └── schemas/
│               └── auth.test.ts
│
└── data/                              # Runtime data (gitignored)
    ├── remnant.db                     # SQLite database
    └── logs/                          # Panel logs
```

---

### Architectural Boundaries

**API Boundaries:**

| Boundary | Description | Authentication |
|----------|-------------|----------------|
| `/trpc/auth.*` | Authentication (tRPC) | Public (login), Protected (logout, refresh, me) |
| `/trpc/users.*` | User management (tRPC) | Protected (protectedProcedure) |
| `/trpc/servers.*` | Server CRUD + control (tRPC) | Protected |
| `/trpc/files.*` | File operations (tRPC) | Protected |
| `/trpc/jars.*` | JAR management (tRPC) | Protected |
| `/trpc/plugins.*` | Plugin list/delete (tRPC) | Protected |
| `/trpc/tasks.*` | Scheduled tasks (tRPC) | Protected |
| `/api/servers/:id/files/upload` | File upload (REST) | JWT Bearer |
| `/api/servers/:id/plugins` | Plugin upload (REST) | JWT Bearer |
| `/ws/console` | Real-time console | JWT in query params |

**Component Boundaries:**

| Layer | Responsibility | Communication Pattern |
|-------|----------------|----------------------|
| **tRPC Routers** | API procedures, Zod validation | Calls Services |
| **REST Routes** | File uploads (multipart) | Calls Services |
| **Services** | Business logic | Calls DB, external APIs |
| **WebSocket Handlers** | Console streaming | Uses Services, emits to clients |
| **Middlewares** | Auth (protectedProcedure) | tRPC middleware chain |
| **DB Schema** | Data structure | Used by Services via Drizzle |

**Data Boundaries:**

| Data Type | Storage | Access Pattern |
|-----------|---------|----------------|
| Users & Permissions | SQLite `users` | Service → Drizzle → SQLite |
| Sessions | SQLite `sessions` | Service → Drizzle → SQLite |
| Server Config | SQLite `servers` | Service → Drizzle → SQLite |
| Server Files | Filesystem | Service → fs/promises → Disk |
| Console Logs | Memory buffer | Service → Socket.io → Clients |
| Metrics | Memory (polling) | Service → Socket.io → Clients |

---

### Requirements to Structure Mapping

**Epic: Authentication & Authorization**
- tRPC: `backend/src/trpc/routers/auth.ts`, `backend/src/trpc/routers/users.ts`
- Middleware: `backend/src/trpc/middlewares/auth.ts` (protectedProcedure)
- Services: `backend/src/services/auth_service.ts`, `backend/src/services/user_service.ts`
- DB: `backend/src/db/schema/users.ts`, `backend/src/db/schema/sessions.ts`
- Frontend: `frontend/src/pages/login.tsx`, `frontend/src/pages/users.tsx`
- Hooks: `frontend/src/hooks/use_auth.ts`, `frontend/src/hooks/use_users.ts`
- Stores: `frontend/src/stores/auth_store.ts`

**Epic: Server Management**
- tRPC: `backend/src/trpc/routers/servers.ts`
- Services: `backend/src/services/server_service.ts`
- DB: `backend/src/db/schema/servers.ts`
- Frontend: `frontend/src/pages/dashboard.tsx`, `frontend/src/pages/servers.tsx`
- Hooks: `frontend/src/hooks/use_servers.ts`

**Epic: Real-time Console**
- WebSocket: `backend/src/routes/websocket.ts`
- Services: `backend/src/services/server_process_manager.ts` (stdin/stdout)
- Frontend: `frontend/src/pages/console.tsx`
- Hooks: `frontend/src/hooks/use_console.ts`

**Epic: File Management**
- tRPC: `backend/src/trpc/routers/files.ts`
- REST: `backend/src/routes/files.ts` (upload uniquement)
- Services: `backend/src/services/file_service.ts`
- Frontend: `frontend/src/pages/files.tsx`, `frontend/src/pages/file_editor.tsx`
- Hooks: `frontend/src/hooks/use_files.ts`

**Epic: JAR Management**
- tRPC: `backend/src/trpc/routers/jars.ts`
- Services: `backend/src/services/jar_service.ts`
- Frontend: `frontend/src/pages/server_settings.tsx`
- Hooks: `frontend/src/hooks/use_jars.ts`

**Epic: Plugin Management**
- tRPC: `backend/src/trpc/routers/plugins.ts` (list, delete)
- REST: `backend/src/routes/plugins.ts` (upload)
- Frontend: `frontend/src/pages/plugins.tsx`
- Hooks: `frontend/src/hooks/use_plugins.ts`

**Epic: Scheduled Tasks**
- tRPC: `backend/src/trpc/routers/tasks.ts`
- Services: `backend/src/services/task_scheduler.ts`
- DB: `backend/src/db/schema/scheduled_tasks.ts`
- Frontend: `frontend/src/pages/tasks.tsx`
- Hooks: `frontend/src/hooks/use_tasks.ts`

---

### Cross-Cutting Concerns Mapping

**Shared Types & Schemas:**
- Location: `packages/shared/src/`
- Used by: Backend (validation), Frontend (type safety)
- Import: `import { ... } from '@remnant/shared'`

**Error Handling:**
- Constants: `shared/src/constants/error_codes.ts`
- Backend handler: `backend/src/plugins/error_handler.ts`
- Frontend display: `frontend/src/components/ui/toast.tsx`

**Logging:**
- Backend: `backend/src/utils/logger.ts` (pino)
- Output: `data/logs/` (runtime)

**Security:**
- Rate limiting: `backend/src/plugins/rate_limit.ts`
- Path validation: `backend/src/utils/path_validator.ts`
- Auth guards: `backend/src/guards/`

---

### Integration Points

**Internal Communication:**

| From | To | Method |
|------|----|--------|
| Frontend pages | Backend API | tRPC hooks (type-safe, Ctrl+Click navigation) |
| Frontend | Backend uploads | REST fetch (multipart/form-data) |
| Frontend | Backend real-time | WebSocket /ws/console |
| tRPC routers | Services | Direct function calls |
| Services | Database | Drizzle ORM queries |
| Services | Minecraft process | Child process spawn |

**External Integrations:**

| Integration | Location | Purpose |
|-------------|----------|---------|
| PaperMC API | `backend/src/services/server_service.ts` | JAR download |
| System metrics | `backend/src/services/metrics_service.ts` | CPU/RAM polling |

**Data Flow:**

```
User Action → React Component → Zustand Store → tRPC hook
    → tRPC Client → tRPC Router → Service → Drizzle → SQLite
    → Response → TanStack Cache → Zustand → Component Re-render

Uploads (REST):
Form → fetch() → Fastify Route → Service → Filesystem

Real-time Console:
MC Process stdout → Server Service → WebSocket Handler
    → Frontend Socket Client → Console Store → Console Component
```

---

### Development Workflow Integration

**Development Commands:**
```bash
# Start all packages in dev mode (parallel)
turbo dev

# Run tests across all packages
turbo test

# Build all packages
turbo build

# Lint all packages
turbo lint
```

**Package Scripts:**
| Package | `dev` | `build` | `test` |
|---------|-------|---------|--------|
| backend | `tsx watch src/index.ts` | `tsc` | `vitest` |
| frontend | `vite` | `vite build` | `vitest` |
| shared | `tsc --watch` | `tsc` | `vitest` |

**Production Build:**
- Frontend built to `packages/frontend/dist/`
- Backend serves frontend static files
- Single process deployment

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- ✅ Turborepo + pnpm workspaces fonctionnent parfaitement ensemble
- ✅ Fastify + Socket.io : compatibilité native via @fastify/websocket
- ✅ Drizzle ORM + SQLite : combinaison recommandée, types inférés
- ✅ React + Vite + Tailwind : stack mature et bien intégré
- ✅ Zustand + TanStack Query : pas de conflit, responsabilités complémentaires
- ✅ Toutes les versions sont compatibles (Node.js LTS + packages latest)

**Pattern Consistency:**
- ✅ snake_case uniforme : fichiers, dossiers, JSON API, DB
- ✅ Imports absolus cohérents via aliases tsconfig
- ✅ Format de réponse API standardisé avec ErrorCodes
- ✅ Events WebSocket avec convention `namespace:action`

**Structure Alignment:**
- ✅ Monorepo 3 packages aligné avec la séparation backend/frontend/shared
- ✅ Tests dans dossier dédié `tests/` comme demandé
- ✅ Structure feature-based pour les composants frontend

---

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**

| Requirement | Architectural Support |
|-------------|----------------------|
| Server Start/Stop/Restart | `server_service.ts` + child process management |
| Auto-start systemd | Documentation + scripts (hors panel) |
| Console temps réel | Socket.io `console:*` events + handlers |
| File browser + editor | Routes `files.ts` + éditeur de code intégré |
| JAR management | `server_service.ts` + PaperMC API integration |
| JVM flags config | `servers` table + settings page |
| Plugin upload | Routes `plugins.ts` + upload handling |
| Scheduled tasks | `tasks.ts` routes/service + cron execution |
| Monitoring CPU/RAM | `metrics_service.ts` + Socket.io broadcast |
| Players list | `server_service.ts` via RCON ou log parsing |
| Multi-user + permissions | `users` table + permission guards |

**Non-Functional Requirements Coverage:**

| NFR | Architectural Support |
|-----|----------------------|
| Sécurité | JWT + bcrypt + rate limiting + path validation + permission guards |
| Performance (<100MB) | SQLite + pas de Docker panel + polling efficace |
| Fiabilité 24/7 | Graceful error handling + process recovery |
| Maintenabilité | TypeScript strict + structure claire + tests |
| Multi-serveurs ready | Architecture abstraite + Docker optional |

---

### Implementation Readiness Validation ✅

**Decision Completeness:**
- ✅ Toutes les technologies ont des versions spécifiées (LTS/latest)
- ✅ Patterns documentés avec exemples concrets
- ✅ Anti-patterns identifiés pour éviter les erreurs

**Structure Completeness:**
- ✅ Arborescence complète avec tous les fichiers
- ✅ Mapping requirements → structure explicite
- ✅ Points d'intégration clairement définis

**Pattern Completeness:**
- ✅ 15+ points de conflit potentiels adressés
- ✅ Conventions de nommage exhaustives
- ✅ Patterns de communication spécifiés
- ✅ Error handling et loading states documentés

---

### Gap Analysis Results

**Critical Gaps:** Aucun

**Important Gaps (non-bloquants):**
1. **Permissions list** : Les permissions exactes ne sont pas listées (à définir lors de l'implémentation)
2. **RCON vs log parsing** : Stratégie pour récupérer les joueurs connectés à préciser

**Nice-to-Have:**
1. Documentation Swagger/OpenAPI (post-MVP)
2. Scripts d'installation automatisés
3. Guide de contribution pour l'open-source

---

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

---

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Architecture légère alignée avec la philosophie "simple et efficace"
- Types partagés end-to-end garantissent la cohérence
- Sécurité en profondeur dès la conception
- Structure claire permettant le travail en parallèle

**Areas for Future Enhancement:**
- API versioning si breaking changes nécessaires
- Cache distribué si scaling requis
- Documentation API automatisée

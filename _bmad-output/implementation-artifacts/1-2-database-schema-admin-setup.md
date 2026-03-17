# Story 1.2: Database Schema & Admin Setup

## Story

**As a** administrateur,
**I want** que la base de données soit initialisée avec un admin par défaut,
**So that** je puisse me connecter dès la première utilisation.

## Status

done

## Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1.1 completed

## Acceptance Criteria

### AC1: Initialisation de la base de données
**Given** le backend démarre pour la première fois
**When** aucune base de données n'existe
**Then** la base SQLite est créée dans `data/remnant.db`
**And** les tables `users` et `sessions` sont créées via Drizzle

### AC2: Création de l'admin par défaut
**Given** la base de données est initialisée
**When** aucun utilisateur n'existe en base
**Then** un admin par défaut est créé (username: admin, password: password)
**And** le mot de passe est hashé avec bcrypt (cost >= 12)
**And** l'admin a toutes les permissions

### AC3: Pas de doublon admin
**Given** un utilisateur admin existe déjà
**When** le backend redémarre
**Then** aucun nouvel admin n'est créé

### AC4: Base SQLite dans le bon répertoire
**Given** le backend démarre
**When** l'initialisation de la base de données s'exécute
**Then** la base SQLite est créée dans `data/remnant.db`

### AC5: Démarrage sans erreur
**Given** la DB est initialisée avec le schema et le seed
**When** le backend démarre
**Then** le backend démarre sans erreur avec la DB initialisée

## Tasks

- [x] Task 1: Créer le schema Drizzle pour `users` (AC: #1)
  - [x] Créer `packages/backend/src/db/schema/users.ts`
  - [x] Définir colonnes: id, username, password_hash, permissions, token_version, created_at, updated_at
  - [x] Ajouter index sur username (unique)
  - [x] Exporter le schema depuis `packages/backend/src/db/schema/index.ts`

- [x] Task 2: Créer le schema Drizzle pour `sessions` (AC: #1)
  - [x] Créer `packages/backend/src/db/schema/sessions.ts`
  - [x] Définir colonnes: id, user_id, refresh_token, expires_at, created_at
  - [x] Ajouter foreign key vers users
  - [x] Exporter le schema depuis index.ts

- [x] Task 3: Configurer la connexion SQLite avec Drizzle (AC: #4)
  - [x] Créer `packages/backend/src/db/index.ts`
  - [x] Configurer better-sqlite3 avec chemin `data/remnant.db`
  - [x] Créer le dossier `data/` s'il n'existe pas
  - [x] Exporter l'instance db drizzle

- [x] Task 4: Créer drizzle.config.ts (AC: #1)
  - [x] Créer `packages/backend/drizzle.config.ts`
  - [x] Configurer schema path et output path
  - [x] Ajouter script `db:push` et `db:generate` dans package.json

- [x] Task 5: Implémenter la fonction de seed admin (AC: #2, #3)
  - [x] Créer `packages/backend/src/db/seed.ts`
  - [x] Vérifier si un utilisateur existe
  - [x] Si non, créer admin avec bcrypt hash (cost 12)
  - [x] Définir permissions admin: ["*"] (toutes permissions)

- [x] Task 6: Intégrer l'initialisation DB au démarrage (AC: #5)
  - [x] Modifier `packages/backend/src/index.ts`
  - [x] Appeler drizzle push (ou migrate) au démarrage
  - [x] Appeler seed après initialisation
  - [x] Logger les étapes d'initialisation

- [x] Task 7: Ajouter les types User dans shared (AC: #1)
  - [x] Mettre à jour `packages/shared/src/types/index.ts`
  - [x] Ajouter type User avec permissions
  - [x] Ajouter type Permission

## Technical Implementation

### Architecture Requirements

Cette story implémente la **Data Architecture** définie dans l'architecture:

| Décision | Valeur |
|----------|--------|
| Database | SQLite 3.x |
| ORM | Drizzle ORM (latest) |
| Migrations | drizzle-kit push (dev) |
| Password Hash | bcrypt (cost >= 12) |

### Database Schema (from Architecture)

```typescript
// users table
users (
  id: integer PRIMARY KEY AUTOINCREMENT,
  username: text NOT NULL UNIQUE,
  password_hash: text NOT NULL,
  permissions: text NOT NULL DEFAULT '[]', // JSON array
  token_version: integer NOT NULL DEFAULT 0,
  created_at: text NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at: text NOT NULL DEFAULT CURRENT_TIMESTAMP
)

// sessions table
sessions (
  id: integer PRIMARY KEY AUTOINCREMENT,
  user_id: integer NOT NULL REFERENCES users(id),
  refresh_token: text NOT NULL UNIQUE,
  expires_at: text NOT NULL,
  created_at: text NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

### Drizzle Schema Pattern

```typescript
// packages/backend/src/db/schema/users.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  permissions: text('permissions').notNull().default('[]'),
  token_version: integer('token_version').notNull().default(0),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

### drizzle.config.ts Pattern

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/remnant.db',
  },
} satisfies Config;
```

### Seed Pattern

```typescript
// packages/backend/src/db/seed.ts
import { db } from './index';
import { users } from './schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

const BCRYPT_ROUNDS = 12;

export async function seedDefaultAdmin() {
  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length === 0) {
    const passwordHash = await bcrypt.hash('password', BCRYPT_ROUNDS);

    await db.insert(users).values({
      username: 'admin',
      password_hash: passwordHash,
      permissions: JSON.stringify(['*']), // All permissions
    });

    console.log('Default admin user created (username: admin, password: password)');
  }
}
```

### Previous Story Learnings (Story 1.1)

- Monorepo structure is in place with packages/backend, packages/frontend, packages/shared
- Drizzle ORM and better-sqlite3 are already installed in backend
- TypeScript strict mode is enabled
- Use snake_case for all file names
- Backend runs on port 3001
- Use absolute imports with @backend/* alias

### Project Structure for This Story

Files to create/modify:
```
packages/backend/
├── drizzle.config.ts           # NEW - Drizzle-kit config
├── src/
│   ├── index.ts                # MODIFY - Add DB init
│   └── db/
│       ├── index.ts            # NEW - DB connection
│       ├── seed.ts             # NEW - Admin seeding
│       └── schema/
│           ├── index.ts        # NEW - Schema exports
│           ├── users.ts        # NEW - Users table
│           └── sessions.ts     # NEW - Sessions table
packages/shared/
└── src/
    └── types/
        └── index.ts            # MODIFY - Add User type
data/
└── remnant.db                  # CREATED AT RUNTIME
```

### Naming Conventions (CRITICAL)

| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichiers | snake_case | `users.ts`, `seed.ts` |
| Tables DB | snake_case, pluriel | `users`, `sessions` |
| Colonnes DB | snake_case | `password_hash`, `token_version` |
| Types TS | PascalCase | `User`, `Session` |

### Security Requirements

- bcrypt cost factor MUST be >= 12
- Default password "password" should be changed by user
- permissions stored as JSON array in text column
- token_version for JWT revocation support

### References

- [Source: architecture.md#Data-Architecture]
- [Source: architecture.md#Authentication-Security]
- [Source: architecture.md#Project-Structure]
- [Source: epics.md#Story-1.2]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes

**Implementation completed 2026-03-10:**
- Tables `users` et `sessions` créées avec Drizzle schema
- Admin par défaut créé (username: admin, password: password)
- Mot de passe hashé avec bcrypt cost 12 (vérifié: $2b$12$...)
- Base SQLite créée dans `data/remnant.db` (racine projet)
- Backend démarre sans erreur avec DB initialisée
- Scripts drizzle-kit ajoutés: db:push, db:generate, db:studio
- Types User et Permission ajoutés dans @remnant/shared

### Change Log

- 2026-03-10: Initial implementation - database schema and admin setup complete

### File List

Files created:
- `packages/backend/drizzle.config.ts`
- `packages/backend/src/db/index.ts`
- `packages/backend/src/db/migrate.ts`
- `packages/backend/src/db/seed.ts`
- `packages/backend/src/db/schema/index.ts`
- `packages/backend/src/db/schema/users.ts`
- `packages/backend/src/db/schema/sessions.ts`

Files modified:
- `packages/backend/src/index.ts`
- `packages/backend/package.json` (add db scripts)
- `packages/shared/src/types/index.ts`

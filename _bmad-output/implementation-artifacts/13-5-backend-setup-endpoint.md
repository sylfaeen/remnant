# Story 13.5: Backend — Endpoint `setup` (création admin + auto-login)

## Story

**As a** administrateur configurant Remnant pour la première fois,
**I want** créer mon compte et être connecté automatiquement,
**So that** je n'aie pas à me reconnecter après l'onboarding.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories 13-1 et 13-2 completed
- Fichiers clés:
  - Modifier: `packages/backend/src/trpc/routers/onboarding.ts` — ajout endpoint `setup`
- Services réutilisés:
  - `UserService.createUser()` ou logique équivalente (hash bcrypt, insertion DB)
  - `AuthService.login()` (génération JWT + refresh token)

## Acceptance Criteria

### AC1: Endpoint public
**Given** l'endpoint `onboarding.setup` existe
**When** un utilisateur non authentifié l'appelle
**Then** il peut créer un compte (c'est un `publicProcedure`)

### AC2: Validation input
**Given** un input invalide (username < 3 chars, password < 8 chars)
**When** j'appelle `setup`
**Then** une erreur Zod est retournée avec les détails de validation

### AC3: Guard définitif
**Given** un utilisateur existe déjà dans la table `users`
**When** j'appelle `setup`
**Then** je reçois `FORBIDDEN` — l'endpoint est verrouillé pour toujours

### AC4: Création admin
**Given** aucun utilisateur n'existe
**When** j'appelle `setup` avec `{ username, password, locale }`
**Then** un utilisateur est créé avec `permissions: ['*']` (admin complet)
**And** le mot de passe est hashé avec bcrypt (cost 12)

### AC5: Auto-login
**Given** l'utilisateur vient d'être créé
**When** le setup se termine
**Then** un JWT access token (15 min) est généré
**And** un refresh token est créé en DB (session 7 jours)
**And** le refresh token est set en cookie httpOnly (même config que `auth.login`)
**And** la réponse contient `{ access_token, user: { id, username, permissions, locale } }`

### AC6: Locale persistée
**Given** le locale `'fr'` est fourni dans l'input
**When** l'utilisateur est créé
**Then** le champ `locale` est persisté en base sur l'utilisateur

## Technical Implementation

### Flow détaillé

```
1. Validate input (Zod — setupRequestSchema)
2. assertNeedsSetup() — FORBIDDEN si users > 0
3. Hash password (bcrypt, 12 rounds)
4. INSERT INTO users (username, password_hash, permissions='["*"]', locale)
5. AuthService.login(username, password, reply) — génère JWT + refresh + cookie
6. Return { access_token, user }
```

### Réutilisation du code existant

- `packages/backend/src/services/user_service.ts` → `createUser()` gère le hash + insert
- `packages/backend/src/services/auth_service.ts` → `login()` gère JWT + refresh + session
- `packages/backend/src/plugins/cookie.ts` → `setRefreshTokenCookie()` gère le cookie

L'endpoint `setup` combine ces deux services dans un seul appel.

### Sécurité

- Le guard `COUNT(users) > 0` est **atomique** — SQLite est single-writer
- Pas de race condition possible entre le check et l'insert
- L'endpoint se verrouille définitivement après le premier setup réussi

## Tasks

- [ ] Task 1: Ajouter `setup` au router onboarding (AC: #1, #2, #3, #4, #5, #6)
  - [ ] Définir comme `publicProcedure.input(setupRequestSchema).mutation`
  - [ ] Guard: réutiliser `assertNeedsSetup()` de story 13-4
  - [ ] Créer l'utilisateur avec `permissions: ['*']` et `locale`
  - [ ] Hash password avec bcrypt (12 rounds) — réutiliser la logique de `UserService`
  - [ ] Appeler `AuthService.login(username, password)` pour générer tokens
  - [ ] Set refresh token cookie via reply (même pattern que `auth.login`)
  - [ ] Retourner `{ access_token, user }`

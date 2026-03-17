# Story 1.3: User Login API

## Story

**As a** administrateur,
**I want** m'authentifier via l'API,
**So that** j'obtienne un token d'accès sécurisé.

## Status

done

## Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1.2 completed

## Acceptance Criteria

### AC1: Login réussi

POST /api/auth/login avec credentials valides retourne un access token JWT (15 min). Un refresh token est stocké en cookie httpOnly.

**Given** un utilisateur existe en base
**When** je POST /api/auth/login avec credentials valides
**Then** je reçois un access token JWT (15 min)
**And** un refresh token est stocké en cookie httpOnly

### AC2: Login échoué

Credentials invalides retournent 401 avec code AUTH_INVALID_CREDENTIALS.

**Given** des credentials invalides
**When** je POST /api/auth/login
**Then** je reçois une erreur 401 avec code AUTH_INVALID_CREDENTIALS

### AC3: Rate limiting

Le rate limiting bloque après 5 tentatives/min par IP.

**Given** 5 tentatives de login en moins d'une minute
**When** je fais une 6ème tentative
**Then** je reçois une erreur 429 RATE_LIMITED

### AC5: Logout

POST /api/auth/logout invalide la session.

### AC6: Refresh token

POST /api/auth/refresh génère un nouveau access token.

## Tasks

- [x] Task 1: Configurer @fastify/jwt (AC: #1)
  - [x] Créer `packages/backend/src/plugins/auth.ts`
  - [x] Configurer JWT avec secret et expiration 15min
  - [x] Enregistrer le plugin dans l'app

- [x] Task 2: Configurer @fastify/rate-limit (AC: #3)
  - [x] Créer `packages/backend/src/plugins/rate_limit.ts`
  - [x] Configurer 5 req/min pour /api/auth/login

- [x] Task 3: Configurer @fastify/cookie (AC: #2)
  - [x] Ajouter le plugin cookie pour les refresh tokens

- [x] Task 4: Créer le service d'authentification (AC: #1, #2, #4)
  - [x] Créer `packages/backend/src/services/auth_service.ts`
  - [x] Implémenter validateCredentials (bcrypt compare)
  - [x] Implémenter generateTokens (access + refresh)
  - [x] Implémenter createSession (stocker refresh en DB)
  - [x] Implémenter invalidateSession (logout)

- [x] Task 5: Créer les routes auth (AC: #1-6)
  - [x] Créer `packages/backend/src/routes/auth.ts`
  - [x] POST /api/auth/login
  - [x] POST /api/auth/logout
  - [x] POST /api/auth/refresh
  - [x] Ajouter validation Zod

- [x] Task 6: Ajouter les schemas Zod dans shared (AC: #1)
  - [x] Créer `packages/shared/src/schemas/auth.ts`
  - [x] LoginRequest, LoginResponse schemas

- [x] Task 7: Tester les endpoints (AC: #1-6)
  - [x] Tester login avec curl
  - [x] Vérifier le JWT retourné
  - [x] Vérifier le cookie refresh

## Technical Implementation

### Architecture Requirements

| Décision | Valeur |
|----------|--------|
| JWT Library | @fastify/jwt |
| Access Token | 15min, en mémoire |
| Refresh Token | Cookie httpOnly + SQLite |
| Rate Limiting | 5 req/min sur /api/auth/login |
| Password Hash | bcrypt (cost >= 12) |

### JWT Configuration

```typescript
// Access token payload
{
  sub: userId,
  username: string,
  permissions: string[],
  tokenVersion: number
}

// Expiration: 15 minutes
// Secret: process.env.JWT_SECRET (min 32 chars)
```

### Cookie Configuration

```typescript
// Refresh token cookie
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
```

### API Response Format

```typescript
// Success login
{
  success: true,
  data: {
    access_token: string,
    user: { id, username, permissions }
  }
}

// Error
{
  success: false,
  error: { code: 'AUTH_INVALID_CREDENTIALS', message: '...' }
}
```

### Previous Story Learnings (Story 1.2)

- Database connection in `packages/backend/src/db/index.ts`
- Users schema with password_hash, token_version columns
- Sessions table ready for refresh tokens
- bcrypt already installed

### Files Structure

```
packages/backend/src/
├── plugins/
│   ├── auth.ts           # NEW - JWT plugin
│   ├── rate_limit.ts     # NEW - Rate limiting
│   └── cookie.ts         # NEW - Cookie plugin
├── services/
│   └── auth_service.ts   # NEW - Auth logic
├── routes/
│   ├── index.ts          # NEW - Route registration
│   └── auth.ts           # NEW - Auth routes
packages/shared/src/
├── schemas/
│   ├── index.ts          # NEW - Schema exports
│   └── auth.ts           # NEW - Auth schemas
```

### References

- [Source: architecture.md#Authentication-Security]
- [Source: architecture.md#API-Communication-Patterns]
- [Source: epics.md#Story-1.3]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes

### File List

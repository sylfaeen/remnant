# Story 13.1: Shared — Schemas Zod Onboarding

## Story

**As a** développeur,
**I want** des schemas Zod partagés pour l'onboarding,
**So that** le backend et le frontend valident les mêmes données.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Aucune — story fondatrice
- Fichiers clés:
  - Créer: `packages/shared/src/schemas/onboarding.ts`
  - Modifier: `packages/shared/src/index.ts` — réexport des schemas

## Acceptance Criteria

### AC1: Schema setupRequest
**Given** les schemas partagés existent
**When** je valide un input de setup
**Then** `setupRequestSchema` valide `{ username, password, locale }` avec les mêmes règles que `createUserSchema` (username 3-32 chars alphanum/underscore/hyphen, password 8-128 chars) + locale optionnel (string nullable)

### AC2: Schema setupResponse
**Given** les schemas partagés existent
**When** le setup renvoie une réponse
**Then** `setupResponseSchema` définit `{ access_token: string, user: { id: number, username: string, permissions: Array<string>, locale: string | null } }`

### AC3: Schema systemCheckResponse
**Given** les schemas partagés existent
**When** le diagnostic système renvoie une réponse
**Then** `systemCheckResponseSchema` définit:
```typescript
{
  java: { installed: boolean, version?: string },
  memory: { totalMB: number, freeMB: number },
  disk: { totalMB: number, freeMB: number },
  firewall: { detected: boolean, type?: string }
}
```

### AC4: Schema needsSetupResponse
**Given** les schemas partagés existent
**When** le check needsSetup renvoie une réponse
**Then** `needsSetupResponseSchema` définit `{ needsSetup: boolean }`

### AC5: Export
**Given** les schemas sont définis dans `packages/shared/src/schemas/onboarding.ts`
**When** j'importe depuis `@remnant/shared`
**Then** tous les schemas et types inférés sont disponibles

## Technical Implementation

### Schema Design

Les schemas doivent réutiliser les règles de validation existantes de `createUserSchema` pour éviter la duplication :

```typescript
import { z } from 'zod';

export const setupRequestSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(32, 'Username must be at most 32 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  locale: z.string().nullable().optional(),
});
```

## Tasks

- [ ] Task 1: Créer `packages/shared/src/schemas/onboarding.ts` (AC: #1, #2, #3, #4)
  - [ ] `setupRequestSchema` — réutiliser les regex de `createUserSchema` pour username/password
  - [ ] `setupResponseSchema` — identique au format de `loginResponseSchema`
  - [ ] `systemCheckResponseSchema` — objets nested pour java, memory, disk, firewall
  - [ ] `needsSetupResponseSchema` — simple boolean wrapper
  - [ ] Exporter les types inférés (`SetupRequest`, `SetupResponse`, `SystemCheckResponse`, `NeedsSetupResponse`)

- [ ] Task 2: Réexporter dans l'index (AC: #5)
  - [ ] Ajouter `export * from './schemas/onboarding'` dans `packages/shared/src/index.ts`

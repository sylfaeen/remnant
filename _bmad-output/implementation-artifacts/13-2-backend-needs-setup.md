# Story 13.2: Backend — Endpoint `needsSetup`

## Story

**As a** application frontend,
**I want** savoir si l'instance nécessite un setup initial,
**So that** je puisse rediriger vers l'onboarding ou le login.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-1 completed
- Fichiers clés:
  - Créer: `packages/backend/src/routes/handlers/onboarding.ts`
  - Modifier: `packages/backend/src/routes/index.ts` — ajout `onboarding: onboardingRouter`

## Acceptance Criteria

### AC1: Endpoint public
**Given** l'endpoint `onboarding.needsSetup` existe
**When** un utilisateur non authentifié l'appelle
**Then** il reçoit une réponse sans erreur 401 (c'est un `publicRoute`)

### AC2: Aucun utilisateur
**Given** la table `users` est vide
**When** j'appelle `needsSetup`
**Then** la réponse est `{ needsSetup: true }`

### AC3: Utilisateur existant
**Given** au moins un utilisateur existe dans la table `users`
**When** j'appelle `needsSetup`
**Then** la réponse est `{ needsSetup: false }`

### AC4: Router enregistré
**Given** le router `onboarding` est créé
**When** le backend démarre
**Then** `onboarding` est accessible dans `appRouter`

## Technical Implementation

### Architecture

```typescript
import { publicRoute, router } from '../index';
import { db } from '../../db';
import { users } from '../../db/schema';
import { count } from 'drizzle-orm';

export const onboardingRouter = router({
  needsSetup: publicRoute.query(async () => {
    const [result] = await db.select({ count: count() }).from(users);
    return { needsSetup: result.count === 0 };
  }),
});
```

### Notes

- `publicRoute` existe déjà dans le projet (utilisé par `auth.login` et `auth.refresh`)
- La query est simple et rapide — pas besoin de cache

## Tasks

- [ ] Task 1: Créer le router onboarding (AC: #1, #2, #3)
  - [ ] Créer `packages/backend/src/routes/handlers/onboarding.ts`
  - [ ] Définir `needsSetup` comme `publicRoute.query`
  - [ ] Query: `SELECT COUNT(*) FROM users` → renvoie `{ needsSetup: count === 0 }`

- [ ] Task 2: Enregistrer le router (AC: #4)
  - [ ] Ajouter `onboarding: onboardingRouter` dans `packages/backend/src/routes/index.ts`

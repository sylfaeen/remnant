# Story 13.4: Backend — Endpoint `systemCheck`

## Story

**As a** page d'onboarding,
**I want** récupérer le diagnostic système,
**So that** je puisse l'afficher à l'admin sur l'écran de bienvenue.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories 13-2 et 13-3 completed
- Fichiers clés:
  - Modifier: `packages/backend/src/trpc/routers/onboarding.ts` — ajout endpoint `systemCheck`

## Acceptance Criteria

### AC1: Endpoint public
**Given** l'endpoint `onboarding.systemCheck` existe
**When** un utilisateur non authentifié l'appelle
**Then** il reçoit le diagnostic système sans erreur 401

### AC2: Guard needsSetup
**Given** au moins un utilisateur existe dans la table `users`
**When** j'appelle `systemCheck`
**Then** je reçois une erreur `FORBIDDEN` — l'endpoint n'est plus accessible

### AC3: Résultat complet
**Given** aucun utilisateur n'existe
**When** j'appelle `systemCheck`
**Then** je reçois `{ java, memory, disk, firewall }` conforme au `systemCheckResponseSchema`

## Technical Implementation

### Guard pattern

Le guard `needsSetup` sera réutilisé par `systemCheck` et `setup`. Extraire en helper :

```typescript
async function assertNeedsSetup() {
  const [result] = await db.select({ count: count() }).from(users);
  if (result.count > 0) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Setup already completed' });
  }
}
```

## Tasks

- [ ] Task 1: Ajouter `systemCheck` au router onboarding (AC: #1, #2, #3)
  - [ ] Définir comme `publicProcedure.query`
  - [ ] Guard: vérifier `COUNT(users) > 0` → throw `TRPCError({ code: 'FORBIDDEN' })`
  - [ ] Appeler `systemCheckService.check()` et retourner le résultat

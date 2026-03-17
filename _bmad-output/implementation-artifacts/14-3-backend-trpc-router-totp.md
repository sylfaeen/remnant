# Story 14.3: Backend — Router tRPC 2FA

## Story

**As a** développeur backend,
**I want** les endpoints tRPC pour le setup, la vérification et la désactivation du 2FA,
**So that** le frontend puisse piloter le flux 2FA complet.

## Status

ready-for-dev

## Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.2 complétée
- Fichiers clés:
  - Créer: `packages/backend/src/trpc/routers/totp.ts`
  - Modifier: `packages/backend/src/trpc/router.ts` — enregistrer le sous-router totp

## Acceptance Criteria

### AC1: Endpoint totp.setup
**Given** un utilisateur authentifié sans 2FA activé
**When** il appelle `totp.setup`
**Then** il reçoit `{ qr_code_uri, secret, recovery_codes }`
**And** les recovery codes sont en clair (affichés une seule fois)
**And** si 2FA déjà activé (verified = true), erreur `TOTP_ALREADY_ENABLED`

### AC2: Endpoint totp.verify
**Given** un utilisateur avec un setup TOTP non vérifié (verified = false)
**When** il appelle `totp.verify` avec un code TOTP valide à 6 chiffres
**Then** le TOTP passe à `verified: true`
**And** si le code est invalide, erreur `TOTP_INVALID_CODE`
**And** si aucun setup n'existe, erreur `TOTP_NOT_ENABLED`

### AC3: Endpoint totp.disable
**Given** un utilisateur avec 2FA activé (verified = true)
**When** il appelle `totp.disable` avec un code TOTP valide
**Then** le secret et les recovery codes sont supprimés
**And** si le code est invalide, erreur `TOTP_INVALID_CODE`
**And** si 2FA non activé, erreur `TOTP_NOT_ENABLED`

### AC4: Endpoint totp.status
**Given** un utilisateur authentifié
**When** il appelle `totp.status`
**Then** il reçoit `{ enabled: boolean }`

### AC5: Protection des routes
**Given** les 4 endpoints ci-dessus
**When** un utilisateur non authentifié tente d'y accéder
**Then** il reçoit une erreur `UNAUTHORIZED`

## Technical Implementation

### Router Structure

```typescript
import { protectedProcedure, router } from '../index';
import { totpVerifyRequestSchema, totpDisableRequestSchema } from '@remnant/shared';
import { totpService } from '../../services/totp_service';
import { TRPCError } from '@trpc/server';
import { ErrorCodes } from '@remnant/shared';

export const totpRouter = router({
  setup: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.sub;
    const isEnabled = await totpService.isTotpEnabled(userId);
    if (isEnabled) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: ErrorCodes.TOTP_ALREADY_ENABLED });
    }
    return totpService.generateTotpSetup(userId);
  }),

  verify: protectedProcedure
    .input(totpVerifyRequestSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifie le code et active le TOTP
    }),

  disable: protectedProcedure
    .input(totpDisableRequestSchema)
    .mutation(async ({ ctx, input }) => {
      // Vérifie le code puis désactive
    }),

  status: protectedProcedure.query(async ({ ctx }) => {
    const enabled = await totpService.isTotpEnabled(ctx.user.sub);
    return { enabled };
  }),
});
```

### Enregistrement dans le router principal

```typescript
// Dans router.ts
import { totpRouter } from './routers/totp';

export const appRouter = router({
  // ... existing routers
  totp: totpRouter,
});
```

## Tasks

- [ ] Task 1: Créer `packages/backend/src/trpc/routers/totp.ts` (AC: #1, #2, #3, #4, #5)
  - [ ] `totp.setup` — mutation protégée, appelle `totpService.generateTotpSetup`
  - [ ] `totp.verify` — mutation protégée, input validé par `totpVerifyRequestSchema`
  - [ ] `totp.disable` — mutation protégée, input validé par `totpDisableRequestSchema`
  - [ ] `totp.status` — query protégée, retourne `{ enabled }`
  - [ ] Gestion d'erreurs avec les codes `TOTP_*` appropriés

- [ ] Task 2: Enregistrer le router (AC: #5)
  - [ ] Ajouter `totp: totpRouter` dans `packages/backend/src/trpc/router.ts`

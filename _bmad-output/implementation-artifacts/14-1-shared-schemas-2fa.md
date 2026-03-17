# Story 14.1: Shared — Schemas Zod 2FA

## Story

**As a** développeur,
**I want** les schemas Zod et types partagés pour le 2FA,
**So that** backend et frontend partagent les mêmes contrats de validation.

## Status

ready-for-dev

## Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Aucune — story initiale de l'epic
- Fichiers clés:
  - Créer: `packages/shared/src/schemas/totp.ts`
  - Modifier: `packages/shared/src/schemas/index.ts` — réexport des schemas
  - Modifier: `packages/shared/src/constants/error_codes.ts` — ajout codes erreur 2FA

## Acceptance Criteria

### AC1: Schema totpSetupResponse
**Given** les schemas partagés existent
**When** le setup TOTP renvoie une réponse
**Then** `totpSetupResponseSchema` définit `{ qr_code_uri: string, secret: string, recovery_codes: Array<string> }`

### AC2: Schema totpVerifyRequest
**Given** les schemas partagés existent
**When** je valide un input de vérification TOTP
**Then** `totpVerifyRequestSchema` valide `{ code: string }` — exactement 6 chiffres (regex `^\d{6}$`)

### AC3: Schema totpDisableRequest
**Given** les schemas partagés existent
**When** je valide un input de désactivation TOTP
**Then** `totpDisableRequestSchema` valide `{ code: string }` — exactement 6 chiffres

### AC4: Schema totpStatusResponse
**Given** les schemas partagés existent
**When** le statut TOTP est demandé
**Then** `totpStatusResponseSchema` définit `{ enabled: boolean }`

### AC5: Error codes 2FA
**Given** les constantes d'erreur partagées
**When** les codes 2FA sont ajoutés
**Then** `TOTP_ALREADY_ENABLED`, `TOTP_NOT_ENABLED`, `TOTP_INVALID_CODE`, `TOTP_SETUP_REQUIRED` existent dans `error_codes.ts`

### AC6: Export
**Given** les schemas sont définis dans `packages/shared/src/schemas/totp.ts`
**When** j'importe depuis `@remnant/shared`
**Then** tous les schemas et types inférés sont disponibles

## Technical Implementation

### Schema Design

```typescript
import { z } from 'zod';

const totpCodeSchema = z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits');

export const totpSetupResponseSchema = z.object({
  qr_code_uri: z.string(),
  secret: z.string(),
  recovery_codes: z.array(z.string()),
});

export const totpVerifyRequestSchema = z.object({
  code: totpCodeSchema,
});

export const totpDisableRequestSchema = z.object({
  code: totpCodeSchema,
});

export const totpStatusResponseSchema = z.object({
  enabled: z.boolean(),
});

export type TotpSetupResponse = z.infer<typeof totpSetupResponseSchema>;
export type TotpVerifyRequest = z.infer<typeof totpVerifyRequestSchema>;
export type TotpDisableRequest = z.infer<typeof totpDisableRequestSchema>;
export type TotpStatusResponse = z.infer<typeof totpStatusResponseSchema>;
```

### Error Codes

```typescript
// Dans error_codes.ts
export const TOTP_ALREADY_ENABLED = 'TOTP_ALREADY_ENABLED';
export const TOTP_NOT_ENABLED = 'TOTP_NOT_ENABLED';
export const TOTP_INVALID_CODE = 'TOTP_INVALID_CODE';
export const TOTP_SETUP_REQUIRED = 'TOTP_SETUP_REQUIRED';
```

## Tasks

- [ ] Task 1: Créer `packages/shared/src/schemas/totp.ts` (AC: #1, #2, #3, #4)
  - [ ] `totpSetupResponseSchema` — qr_code_uri, secret, recovery_codes
  - [ ] `totpVerifyRequestSchema` — code 6 chiffres
  - [ ] `totpDisableRequestSchema` — code 6 chiffres
  - [ ] `totpStatusResponseSchema` — enabled boolean
  - [ ] Exporter les types inférés

- [ ] Task 2: Ajouter les error codes (AC: #5)
  - [ ] Ajouter `TOTP_ALREADY_ENABLED`, `TOTP_NOT_ENABLED`, `TOTP_INVALID_CODE`, `TOTP_SETUP_REQUIRED` dans `error_codes.ts`

- [ ] Task 3: Réexporter dans l'index (AC: #6)
  - [ ] Ajouter `export * from './schemas/totp'` dans `packages/shared/src/schemas/index.ts`

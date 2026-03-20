# Story 14.4: Backend — Intégration 2FA dans le Flow de Login

## Story

**As a** administrateur avec 2FA activé,
**I want** qu'on me demande mon code TOTP après le login,
**So that** mon compte soit protégé même si mon mot de passe est compromis.

## Status

ready-for-dev

## Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.3 complétée
- Fichiers clés:
  - Modifier: `packages/backend/src/routes/handlers/auth.ts` — adapter login, ajouter verifyTotp
  - Modifier: `packages/backend/src/services/auth_service.ts` — token temporaire
  - Modifier: `packages/shared/src/schemas/auth.ts` — étendre loginResponseSchema

## Acceptance Criteria

### AC1: Login avec 2FA — réponse requires_totp
**Given** un utilisateur avec 2FA activé
**When** il soumet ses credentials valides sur `auth.login`
**Then** il reçoit `{ requires_totp: true, totp_token: string }` sans access_token ni refresh cookie
**And** le `totp_token` est un JWT court (5 min) contenant uniquement `{ sub: userId, purpose: 'totp_verification' }`

### AC2: Endpoint auth.verifyTotp — code TOTP
**Given** un utilisateur avec un `totp_token` valide
**When** il appelle `auth.verifyTotp` avec `{ totp_token, code }` et le code TOTP est valide
**Then** il reçoit l'access token complet + le refresh token cookie (flow standard)

### AC3: Endpoint auth.verifyTotp — recovery code
**Given** un utilisateur avec un `totp_token` valide
**When** il appelle `auth.verifyTotp` avec `{ totp_token, code }` et le code est un recovery code valide
**Then** il reçoit l'access token complet + le refresh token cookie
**And** le recovery code est marqué comme consommé

### AC4: Login sans 2FA — inchangé
**Given** un utilisateur sans 2FA activé
**When** il soumet ses credentials valides
**Then** le flow actuel est préservé : access_token + user + refresh cookie directement
**And** `requires_totp` est absent ou `false` dans la réponse

### AC5: Erreurs
**Given** un appel à `auth.verifyTotp`
**When** le totp_token est expiré ou invalide → erreur `AUTH_TOKEN_EXPIRED`
**When** le code TOTP est invalide → erreur `TOTP_INVALID_CODE`
**When** le purpose du token n'est pas `totp_verification` → erreur `AUTH_TOKEN_INVALID`

### AC6: Schema partagé mis à jour
**Given** le schema `loginResponseSchema`
**When** le login est appelé pour un utilisateur avec 2FA
**Then** le schema supporte la variante `{ requires_totp: true, totp_token: string }` en plus de la réponse standard

## Technical Implementation

### Login flow modifié

```
1. Client: auth.login { username, password }
2. Server: valide credentials (bcrypt)
3. Server: check totpService.isTotpEnabled(userId)
   ├── Si NON → flow standard (access_token + refresh cookie)
   └── Si OUI → génère totp_token JWT (5min, purpose: 'totp_verification')
                 retourne { requires_totp: true, totp_token }
4. Client: auth.verifyTotp { totp_token, code }
5. Server: vérifie totp_token JWT, vérifie code TOTP ou recovery code
6. Server: flow standard (access_token + refresh cookie)
```

### Token temporaire

Le `totp_token` est un JWT signé avec le même `JWT_SECRET` mais avec un `purpose` claim pour empêcher sa réutilisation comme access token. Le middleware auth existant doit ignorer les tokens avec `purpose !== undefined`.

### Schema auth étendu

```typescript
export const loginResponseSchema = z.union([
  // Réponse standard (sans 2FA ou après verification)
  z.object({
    access_token: z.string(),
    user: userResponseSchema,
  }),
  // Réponse 2FA — nécessite vérification
  z.object({
    requires_totp: z.literal(true),
    totp_token: z.string(),
  }),
]);

export const verifyTotpRequestSchema = z.object({
  totp_token: z.string(),
  code: z.string(), // TOTP 6 digits OU recovery code alphanumérique
});
```

## Tasks

- [ ] Task 1: Étendre le schema partagé (AC: #6)
  - [ ] Modifier `loginResponseSchema` pour supporter l'union standard/2FA
  - [ ] Ajouter `verifyTotpRequestSchema` dans `packages/shared/src/schemas/auth.ts`

- [ ] Task 2: Modifier `auth_service.ts` (AC: #1)
  - [ ] Ajouter méthode `generateTotpToken(userId)` — JWT 5min avec purpose claim
  - [ ] Ajouter méthode `verifyTotpToken(token)` — vérifie et extrait userId

- [ ] Task 3: Modifier `auth.login` dans le router (AC: #1, #4)
  - [ ] Après validation credentials, check `totpService.isTotpEnabled(userId)`
  - [ ] Si 2FA activé → retourner `{ requires_totp: true, totp_token }` sans cookie
  - [ ] Si 2FA non activé → flow existant inchangé

- [ ] Task 4: Ajouter `auth.verifyTotp` dans le router (AC: #2, #3, #5)
  - [ ] Mutation publique (pas de protectedProcedure — l'auth est via totp_token)
  - [ ] Vérifie totp_token, extrait userId
  - [ ] Tente `totpService.verifyTotpCode` puis fallback `totpService.verifyRecoveryCode`
  - [ ] Si valide → génère access_token + refresh cookie (flow standard)
  - [ ] Gestion d'erreurs appropriée

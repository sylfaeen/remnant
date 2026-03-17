# Story 14.2: Backend — Schema DB & Service TOTP

## Story

**As a** développeur backend,
**I want** le schema DB et le service TOTP,
**So that** les secrets TOTP sont stockés de manière sécurisée et les codes validés correctement.

## Status

ready-for-dev

## Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.1 complétée
- Fichiers clés:
  - Créer: `packages/backend/src/db/schema/user_totp.ts`
  - Créer: `packages/backend/src/db/schema/recovery_codes.ts`
  - Créer: `packages/backend/src/services/totp_service.ts`
  - Modifier: `packages/backend/src/db/schema/index.ts` — réexport des tables
  - Modifier: `packages/backend/src/db/migrate.ts` — migration si nécessaire

## Acceptance Criteria

### AC1: Schema Drizzle user_totp
**Given** la base de données SQLite
**When** la migration est exécutée
**Then** la table `user_totp` existe avec :
- `id` (integer, PK, auto-increment)
- `user_id` (integer, FK → users, unique, cascade delete)
- `encrypted_secret` (text, not null)
- `verified` (integer/boolean, default 0/false)
- `created_at` (text, default now)

### AC2: Schema Drizzle recovery_codes
**Given** la base de données SQLite
**When** la migration est exécutée
**Then** la table `recovery_codes` existe avec :
- `id` (integer, PK, auto-increment)
- `user_id` (integer, FK → users, cascade delete)
- `code_hash` (text, not null)
- `used_at` (text, nullable)

### AC3: Génération du secret TOTP
**Given** un utilisateur sans 2FA activé
**When** le service `generateTotpSetup(userId)` est appelé
**Then** un secret TOTP de 20 bytes est généré
**And** l'URI `otpauth://totp/Remnant:{username}?secret={base32}&issuer=Remnant` est construite
**And** 8 recovery codes alphanumériques sont générés et hashés avec bcrypt en base
**And** le secret est chiffré avant stockage avec `verified: false`
**And** si un setup non vérifié existait déjà, il est remplacé

### AC4: Validation du code TOTP
**Given** un utilisateur avec un secret TOTP stocké
**When** le service `verifyTotpCode(userId, code)` est appelé
**Then** le code est validé avec une fenêtre de tolérance de ±1 période (30s)
**And** retourne `true` si valide, `false` sinon

### AC5: Activation TOTP
**Given** un utilisateur avec un setup TOTP non vérifié
**When** le service `activateTotp(userId, code)` est appelé avec un code valide
**Then** le champ `verified` passe à `true`

### AC6: Validation recovery code
**Given** un utilisateur avec des recovery codes
**When** le service `verifyRecoveryCode(userId, code)` est appelé
**Then** le code est comparé aux hashs non utilisés (where `used_at IS NULL`)
**And** si valide, le code est marqué `used_at = now()` et retourne `true`

### AC7: Désactivation TOTP
**Given** un utilisateur avec 2FA activé
**When** le service `disableTotp(userId)` est appelé
**Then** la ligne `user_totp` et tous les `recovery_codes` de l'utilisateur sont supprimés

### AC8: Statut TOTP
**Given** un utilisateur
**When** le service `isTotpEnabled(userId)` est appelé
**Then** retourne `true` si une entrée `user_totp` existe avec `verified = true`, sinon `false`

## Technical Implementation

### Librairie TOTP

Utiliser `otpauth` (npm) — légère, zéro dépendance, supporte TOTP/HOTP :

```typescript
import { TOTP, Secret } from 'otpauth';

function generateTotpSetup(username: string) {
  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: 'Remnant',
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return {
    uri: totp.toString(),        // otpauth:// URI pour le QR
    secret: secret.base32,       // Secret pour saisie manuelle
  };
}
```

### Chiffrement du secret

Utiliser `crypto.createCipheriv` / `crypto.createDecipheriv` avec AES-256-GCM. La clé de chiffrement est dérivée de `JWT_SECRET` ou d'une variable d'environnement dédiée `TOTP_ENCRYPTION_KEY`.

### Recovery codes

Générer 8 codes de 8 caractères alphanumériques (`crypto.randomBytes` + encoding base36). Hasher chaque code avec bcrypt avant stockage.

## Tasks

- [ ] Task 1: Créer les schemas Drizzle (AC: #1, #2)
  - [ ] Table `user_totp` avec FK vers users, unique sur user_id
  - [ ] Table `recovery_codes` avec FK vers users
  - [ ] Réexporter dans `packages/backend/src/db/schema/index.ts`

- [ ] Task 2: Créer `totp_service.ts` — génération (AC: #3)
  - [ ] Installer `otpauth` comme dépendance backend
  - [ ] `generateTotpSetup(userId)` — génère secret, URI, recovery codes
  - [ ] Chiffrement AES-256-GCM du secret avant stockage
  - [ ] Hash bcrypt des recovery codes
  - [ ] Remplacement d'un setup non vérifié existant

- [ ] Task 3: Créer `totp_service.ts` — validation (AC: #4, #5, #6)
  - [ ] `verifyTotpCode(userId, code)` — déchiffre secret, valide avec window ±1
  - [ ] `activateTotp(userId, code)` — vérifie code puis passe verified à true
  - [ ] `verifyRecoveryCode(userId, code)` — compare aux hashs, marque used_at

- [ ] Task 4: Créer `totp_service.ts` — gestion (AC: #7, #8)
  - [ ] `disableTotp(userId)` — supprime user_totp + recovery_codes
  - [ ] `isTotpEnabled(userId)` — check existence avec verified = true
  - [ ] Export singleton `totpService`

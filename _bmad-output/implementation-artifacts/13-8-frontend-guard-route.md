# Story 13.8: Frontend — Guard `AuthInitializer` + route `/setup`

## Story

**As a** administrateur accédant à Remnant pour la première fois,
**I want** être redirigé automatiquement vers l'onboarding,
**So that** je ne voie jamais un login sans compte existant.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-7 completed
- Fichiers clés:
  - Modifier: `packages/frontend/src/features/auth_initializer.tsx`
  - Modifier: `packages/frontend/src/routes.tsx`

## Acceptance Criteria

### AC1: Check needsSetup au démarrage
**Given** `AuthInitializer` se charge
**When** il appelle `useNeedsSetup()`
**Then** le résultat détermine la redirection initiale

### AC2: Redirect vers /setup
**Given** `needsSetup` est `true`
**When** n'importe quelle URL est demandée (/, /login, /app, etc.)
**Then** l'utilisateur est redirigé vers `/setup`

### AC3: Flow normal
**Given** `needsSetup` est `false`
**When** l'app se charge
**Then** le flow d'authentification actuel est inchangé (refresh token → login ou app)

### AC4: Route déclarée
**Given** la route `/setup` est ajoutée dans `routes.tsx`
**When** l'utilisateur y accède
**Then** la page d'onboarding s'affiche (composant de story 13-9)

### AC5: Protection post-setup
**Given** un utilisateur existe déjà (`needsSetup: false`)
**When** quelqu'un accède manuellement à `/setup`
**Then** il est redirigé vers `/login`

## Technical Implementation

### Flow modifié de AuthInitializer

```
App Load
  ↓
AuthInitializer mounts
  ↓
useNeedsSetup() → { needsSetup }
  ↓
needsSetup === true ? → Navigate to /setup
  ↓ (false)
useRefreshToken() → attempt restore session
  ↓
Success → Navigate to /app
Failure → Navigate to /login
```

### Notes

- Le check `needsSetup` ajoute une requête au démarrage, mais c'est un simple `COUNT(*)` — < 1ms
- Une fois le setup fait, `needsSetup` renvoie toujours `false` — le flow normal n'est pas impacté
- La route `/setup` doit être en dehors du layout authentifié (comme `/login`)

## Tasks

- [ ] Task 1: Modifier AuthInitializer (AC: #1, #2, #3)
  - [ ] Ajouter `useNeedsSetup()` au début du flow d'initialisation
  - [ ] Si `needsSetup: true` → navigate vers `/setup`
  - [ ] Si `needsSetup: false` → continuer le flow actuel (refresh token)
  - [ ] Gérer le loading state pendant le check

- [ ] Task 2: Ajouter la route (AC: #4, #5)
  - [ ] Déclarer `/setup` dans `routes.tsx` comme route publique
  - [ ] Le composant sera importé de `pages/web/setup.tsx` (créé en story 13-9)
  - [ ] Ajouter un guard dans le composant Setup : si `needsSetup: false` → redirect `/login`

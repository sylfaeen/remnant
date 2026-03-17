# Story 13.7: Frontend — Hooks `useOnboarding`

## Story

**As a** composant frontend,
**I want** des hooks tRPC pour l'onboarding,
**So that** je puisse appeler les endpoints `needsSetup`, `systemCheck` et `setup`.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories backend 13-2 à 13-5 completed
- Fichiers clés:
  - Créer: `packages/frontend/src/hooks/use_onboarding.ts`
- Pattern: identique aux hooks existants (`use_servers.ts`, `use_auth.ts`)

## Acceptance Criteria

### AC1: useNeedsSetup
**Given** le hook est utilisé dans un composant
**When** il est appelé
**Then** il renvoie `{ data: { needsSetup: boolean }, isLoading, error }`
**And** c'est un `useQuery` sans auth requise

### AC2: useSystemCheck
**Given** le hook est utilisé avec `needsSetup: true`
**When** il est appelé
**Then** il renvoie le diagnostic système `{ java, memory, disk, firewall }`
**And** il est `enabled: false` quand `needsSetup` est `false`

### AC3: useSetup
**Given** le hook est utilisé dans le wizard
**When** la mutation réussit
**Then** le store auth (`useAuthStore`) est mis à jour avec `access_token` et `user`
**And** la langue est changée via `i18n.changeLanguage(user.locale)` si locale défini

## Technical Implementation

### Pattern

Suivre exactement le pattern des hooks existants :

```typescript
import { trpc } from '@remnant/frontend/lib/trpc';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';

export function useNeedsSetup() {
  return trpc.onboarding.needsSetup.useQuery();
}

export function useSystemCheck(enabled: boolean) {
  return trpc.onboarding.systemCheck.useQuery(undefined, { enabled });
}

export function useSetup() {
  const { setAuth } = useAuthStore();

  return trpc.onboarding.setup.useMutation({
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
    },
  });
}
```

### Notes

- `useNeedsSetup` n'a pas de `refetchInterval` — c'est un check one-shot
- `useSystemCheck` a `enabled` pour ne pas appeler l'endpoint quand le setup est déjà fait
- `useSetup` gère l'auto-login via le store — le cookie refresh est set automatiquement par le backend

## Tasks

- [ ] Task 1: Créer les hooks (AC: #1, #2, #3)
  - [ ] `useNeedsSetup()` — `trpc.onboarding.needsSetup.useQuery()`
  - [ ] `useSystemCheck(enabled: boolean)` — `trpc.onboarding.systemCheck.useQuery(undefined, { enabled })`
  - [ ] `useSetup()` — `trpc.onboarding.setup.useMutation()` avec `onSuccess` qui met à jour le auth store

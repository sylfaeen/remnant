# Story 13.7: Frontend — Hooks `useOnboarding`

## Story

**As a** composant frontend,
**I want** des hooks ts-rest pour l'onboarding,
**So that** je puisse appeler les endpoints `needsSetup` et `setup`.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories backend 13-2 et 13-5 completed
- Fichiers clés:
  - Créer: `packages/frontend/src/hooks/use_onboarding.ts`
- Pattern: identique aux hooks existants (`use_servers.ts`, `use_auth.ts`)

## Acceptance Criteria

### AC1: useNeedsSetup
**Given** le hook est utilisé dans un composant
**When** il est appelé
**Then** il renvoie `{ data: { needsSetup: boolean }, isLoading, error }`
**And** c'est un `useQuery` sans auth requise

### AC2: useSetup
**Given** le hook est utilisé dans le wizard
**When** la mutation réussit
**Then** le store auth (`useAuthStore`) est mis à jour avec `access_token` et `user`
**And** la langue est changée via `i18n.changeLanguage(user.locale)` si locale défini

## Technical Implementation

### Pattern

Suivre exactement le pattern des hooks existants :

```typescript
import { tsRest } from '@remnant/frontend/lib/ts-rest';
import { useAuthStore } from '@remnant/frontend/stores/auth_store';

export function useNeedsSetup() {
  return tsRest.onboarding.needsSetup.useQuery();
}

export function useSetup() {
  const { setAuth } = useAuthStore();

  return tsRest.onboarding.setup.useMutation({
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
    },
  });
}
```

### Notes

- `useNeedsSetup` n'a pas de `refetchInterval` — c'est un check one-shot
- `useSetup` gère l'auto-login via le store — le cookie refresh est set automatiquement par le backend

## Tasks

- [ ] Task 1: Créer les hooks (AC: #1, #2)
  - [ ] `useNeedsSetup()` — `tsRest.onboarding.needsSetup.useQuery()`
  - [ ] `useSetup()` — `tsRest.onboarding.setup.useMutation()` avec `onSuccess` qui met à jour le auth store

# Story 15.5: Mise à jour de DocsLink et intégration globale

## Story

**As a** utilisateur,
**I want** que les liens de documentation existants dans l'app pointent vers la doc interne,
**So that** je reste dans l'application au lieu d'être redirigé vers un site externe.

## Status

done

## Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Story 15.4 (page docs doit être fonctionnelle)
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/app/features/docs_link.tsx`
  - Vérifier: tous les usages existants de `DocsLink` dans l'app

## Acceptance Criteria

### AC1: DocsLink modifié
**Given** le composant `DocsLink`
**When** je clique sur un lien de documentation
**Then** je navigue vers `/app/docs/$slug` via le composant `Link` de TanStack Router

### AC2: Mapping anciens paths
**Given** les anciens paths (ex: `/guide/configuration`)
**When** `DocsLink` résout le chemin
**Then** le slug est extrait en retirant le préfixe `/guide/` (ex: `/guide/configuration` → `configuration`)

### AC3: Tous les DocsLink existants fonctionnent
**Given** tous les usages de `DocsLink` dans l'application
**When** je clique sur chacun
**Then** la navigation vers la bonne page docs interne fonctionne :
  - `ServersPage` → `/guide/server-management` → `server-management`
  - `SettingsPage` → `/guide/configuration` → `configuration`
  - `UsersPage` → `/guide/users` → `users`
  - `ServerPageHeader.Docs` → paths variés via prop

### AC4: i18n
- [x] Le tooltip utilise `t('common.documentation')` — déjà existant
- [x] Pas de nouvelles clés nécessaires

## Tasks

- [x] Task 1: Modifier DocsLink (AC: #1, #2)
  - [x] Remplacer `<a href>` par `<Link to>` de TanStack Router
  - [x] Extraire le slug : `path.replace(/^\/guide\//, '').replace(/^\//, '')`
  - [x] Garder le tooltip et l'icône BookOpen

- [x] Task 2: Vérifier tous les usages (AC: #3)
  - [x] `ServersPage` — `<DocsLink path={'/guide/server-management'} />` ✓
  - [x] `SettingsPage` — `<DocsLink path={'/guide/configuration'} />` ✓
  - [x] `UsersPage` — `<DocsLink path={'/guide/users'} />` ✓
  - [x] `ServerPageHeader.Docs` — prop passthrough ✓

- [x] Task 3: i18n (AC: #4)
  - [x] Tooltip utilise déjà `t('common.documentation')` — aucun changement nécessaire

## Dev Agent Record

### File List

- `packages/frontend/src/pages/app/features/docs_link.tsx` — modifié (`<a>` → `<Link>`)

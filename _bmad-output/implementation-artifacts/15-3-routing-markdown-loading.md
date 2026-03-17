# Story 15.3: Routing et chargement des pages markdown

## Story

**As a** utilisateur,
**I want** que chaque page de documentation ait sa propre URL,
**So that** je puisse naviguer directement vers une section et partager des liens.

## Status

done

## Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Story 15.2 (DocsLayout doit exister pour les routes)
- Fichiers clés:
  - Modifier: `packages/frontend/src/routes.tsx` — routes `/app/docs/$slug`
  - Créer: mapping slug → contenu markdown dans `packages/frontend/src/pages/app/docs/features/docs_content.ts`
- Les 14 fichiers markdown sont dans `packages/frontend/src/pages/app/docs/markdowns/`

## Acceptance Criteria

### AC1: Route dynamique
**Given** les routes de l'application
**When** je navigue vers `/app/docs/installation`
**Then** le contenu de `installation.md` est chargé et affiché

### AC2: Redirection par défaut
**Given** je navigue vers `/app/docs`
**When** la page se charge
**Then** je suis redirigé vers `/app/docs/introduction` via `beforeLoad` redirect

### AC3: Import statique Vite
**Given** les fichiers markdown
**When** ils sont chargés
**Then** l'import est fait via `?raw` (Vite raw import), sans fetch réseau

### AC4: Mapping slug → fichier
**Given** un slug dans l'URL (ex: `server-management`)
**When** le système cherche le fichier correspondant
**Then** le bon fichier markdown est résolu via `docsContent: Record<string, string>`

### AC5: Page 404 docs
**Given** un slug invalide dans l'URL
**When** je navigue vers `/app/docs/non-existant`
**Then** un composant `DocsNotFound` est affiché avec icône et message i18n

## Tasks

- [x] Task 1: Créer le mapping slug → contenu (AC: #3, #4)
  - [x] Importer les 14 fichiers `.md` via Vite `?raw`
  - [x] `Record<string, string>` dans `docs_content.ts`
  - [x] Exports: `docsContent`, `docsSlugs`, `DEFAULT_DOC_SLUG`
  - [x] Déclaration type `*.md?raw` dans `env.d.ts`

- [x] Task 2: Configurer les routes dans routes.tsx (AC: #1, #2)
  - [x] `docsLayoutRoute` parent `/app/docs` avec `DocsLayout`
  - [x] `docsIndexRoute` `/` avec `beforeLoad` redirect vers `DEFAULT_DOC_SLUG`
  - [x] `docsSlugRoute` `$slug` avec `MarkdownPage`
  - [x] Ajout dans le routeTree

- [x] Task 3: Page 404 docs (AC: #5)
  - [x] Vérification slug dans `docsContent` dans `markdown.tsx`
  - [x] Composant `DocsNotFound` avec icône `FileQuestion` et clés i18n

## Dev Agent Record

### File List

- `packages/frontend/src/pages/app/docs/features/docs_content.ts` — créé
- `packages/frontend/src/routes.tsx` — routes docs ajoutées
- `packages/frontend/src/env.d.ts` — déclaration `*.md?raw`

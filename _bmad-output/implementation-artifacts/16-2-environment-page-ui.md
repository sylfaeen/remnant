# Story 16.2: Page Environment dans le frontend

## Story

**As a** administrateur,
**I want** une page dédiée avec un éditeur Monaco pour visualiser et modifier le fichier .env,
**So that** je puisse configurer le panel de manière intuitive depuis l'interface.

## Status

done

## Context

- Epic: 16 - Gestion de l'Environnement (.env)
- Dependencies: Story 16.1 (API backend)
- Fichiers clés:
  - Créer: `packages/frontend/src/pages/app/settings/environment.tsx`
  - Modifier: `packages/frontend/src/routes.tsx` — ajouter route `/app/settings/environment`
  - Modifier: `packages/frontend/src/i18n/locales/en.json` et `fr.json`
- Approche: éditeur Monaco (code editor) affichant le contenu brut du .env, avec bouton Save
- Un bandeau d'avertissement permanent indique qu'un redémarrage est nécessaire pour appliquer les changements

## Acceptance Criteria

### AC1: Route et navigation
**Given** la page Settings
**When** je regarde les sous-pages
**Then** une entrée "Environment" est visible
**And** cliquer dessus navigue vers `/app/settings/environment`

### AC2: Éditeur Monaco
**Given** la page Environment est chargée
**When** les données sont récupérées via `env.getContent`
**Then** le contenu brut du .env est affiché dans un éditeur Monaco
**And** la coloration syntaxique est adaptée au format .env

### AC3: Bandeau de redémarrage
**Given** la page Environment
**When** elle est affichée
**Then** un bandeau d'avertissement en haut indique qu'un redémarrage du panel est nécessaire pour appliquer les modifications

### AC4: Sauvegarde du fichier
**Given** le contenu a été modifié dans l'éditeur
**When** je clique sur le bouton Save
**Then** la mutation `env.saveContent` est appelée avec le contenu complet
**And** un toast de succès confirme la sauvegarde

### AC5: État de chargement
**Given** la page Environment
**When** les données sont en cours de chargement
**Then** un skeleton est affiché à la place de l'éditeur

### AC6: i18n
- [x] Tous les textes UI utilisent `t()`
- [x] Clés de traduction ajoutées à `en.json`
- [x] Clés de traduction ajoutées à `fr.json`

## Tasks

- [x] Task 1: Créer la page `environment.tsx` (AC: #2, #3, #5)
  - [x] `PageContent` avec titre, description et `DocsLink`
  - [x] Bandeau d'avertissement (icône `TriangleAlert`, fond amber) : redémarrage nécessaire
  - [x] Éditeur Monaco avec le contenu brut du .env
  - [x] Skeleton pendant le chargement

- [x] Task 2: Implémenter la sauvegarde (AC: #4)
  - [x] Bouton Save appelle `env.saveContent` avec le contenu complet de l'éditeur
  - [x] Toast succès/erreur
  - [x] Invalidation du cache ts-rest après mutation

- [x] Task 3: Route et navigation (AC: #1)
  - [x] Ajouter route `/app/settings/environment` dans `routes.tsx`
  - [x] Navigation accessible depuis la page Settings

- [x] Task 4: Traductions i18n (AC: #6)
  - [x] Clés `environment.*` dans `en.json`
  - [x] Clés `environment.*` dans `fr.json`
  - [x] Titre, description, bandeau, boutons, toasts

## Dev Agent Record

### Implementation Plan
- Éditeur Monaco affichant le contenu brut du .env (pas de FeatureCard list)
- Bouton Save pour sauvegarder le fichier complet
- Bandeau amber avec TriangleAlert pour l'avertissement de redémarrage
- Nav item accessible depuis Settings

### Completion Notes
- Page environment.tsx créée avec éditeur Monaco
- Sauvegarde complète avec mutation ts-rest + toast + invalidation cache
- Route /app/settings/environment ajoutée dans routes.tsx
- Traductions EN/FR ajoutées (environment.*, toast.env*, nav.environment)

## File List

- `packages/frontend/src/pages/app/settings/environment.tsx` — nouveau : page Environment avec Monaco editor
- `packages/frontend/src/routes.tsx` — modifié : ajout route environmentRoute
- `packages/frontend/src/i18n/locales/en.json` — modifié : ajout clés environment.*, toast.env*, nav.environment
- `packages/frontend/src/i18n/locales/fr.json` — modifié : ajout clés environment.*, toast.env*, nav.environment

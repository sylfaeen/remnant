# Story 16.2: Page Environment dans le frontend

## Story

**As a** administrateur,
**I want** une page dédiée pour visualiser et modifier les variables d'environnement,
**So that** je puisse configurer le panel de manière intuitive depuis l'interface.

## Status

done

## Context

- Epic: 16 - Gestion de l'Environnement (.env)
- Dependencies: Story 16.1 (API backend)
- Fichiers clés:
  - Créer: `packages/frontend/src/pages/app/environment/environment.tsx`
  - Modifier: `packages/frontend/src/routes.tsx` — ajouter route `/app/environment`
  - Modifier: `packages/frontend/src/pages/app/features/layouts/main_layout.tsx` — ajouter nav item
  - Modifier: `packages/frontend/src/i18n/locales/en.json` et `fr.json`
- Utiliser les composants existants: `PageContent`, `FeatureCard`, `Input`, `Button`, `Badge`
- Un bandeau d'avertissement permanent indique qu'un redémarrage est nécessaire pour appliquer les changements

## Acceptance Criteria

### AC1: Route et navigation
**Given** la sidebar principale
**When** je regarde les items de navigation
**Then** une entrée "Environment" est visible avec une icône appropriée
**And** cliquer dessus navigue vers `/app/environment`

### AC2: Affichage des variables
**Given** la page Environment est chargée
**When** les données sont récupérées via `env.getAll`
**Then** toutes les variables sont affichées en liste avec clé et valeur

### AC3: Bandeau de redémarrage
**Given** la page Environment
**When** elle est affichée
**Then** un bandeau d'avertissement en haut indique qu'un redémarrage du panel est nécessaire pour appliquer les modifications

### AC4: Édition d'une variable
**Given** une variable affichée
**When** je modifie sa valeur et je sauvegarde
**Then** la mutation `env.update` est appelée
**And** un toast de succès confirme la modification

### AC5: État de chargement
**Given** la page Environment
**When** les données sont en cours de chargement
**Then** des skeletons sont affichés

### AC6: i18n
- [x] Tous les textes UI utilisent `t()`
- [x] Clés de traduction ajoutées à `en.json`
- [x] Clés de traduction ajoutées à `fr.json`

## Tasks

- [x] Task 1: Créer la page `environment.tsx` (AC: #2, #3, #5)
  - [x] `PageContent` avec titre, description et `DocsLink`
  - [x] Bandeau d'avertissement (icône `TriangleAlert`, fond amber) : redémarrage nécessaire
  - [x] `FeatureCard` avec liste de `FeatureCard.Row` pour chaque variable
  - [x] Skeletons pendant le chargement

- [x] Task 2: Implémenter l'édition inline (AC: #4)
  - [x] Clic sur une variable ouvre un mode édition (input + boutons sauvegarder/annuler)
  - [x] Appel mutation `env.update` à la sauvegarde
  - [x] Toast succès/erreur
  - [x] Invalidation du cache tRPC après mutation

- [x] Task 3: Route et navigation (AC: #1)
  - [x] Ajouter route `/app/environment` dans `routes.tsx` sous `mainLayoutRoute`
  - [x] Ajouter nav item dans `main_layout.tsx` (icône `FileCode`, position avant docs/settings)

- [x] Task 4: Traductions i18n (AC: #6)
  - [x] Clés `environment.*` dans `en.json`
  - [x] Clés `environment.*` dans `fr.json`
  - [x] Titre, description, bandeau, boutons, toasts, placeholders

## Dev Agent Record

### Implementation Plan
- Page suit le pattern exact de Settings page (FeatureCard.Stack > FeatureCard > Header > Body > Row)
- Édition inline avec Input + Check/X buttons, support Enter/Escape
- Bandeau amber avec TriangleAlert pour l'avertissement de redémarrage
- Valeurs en font-jetbrains (monospace)
- Nav item avec FileCode icon, positionné avant docs/settings dans le bottom group

### Completion Notes
- ✅ Page environment.tsx créée avec compound components
- ✅ Édition inline avec mutation tRPC + toast + invalidation cache
- ✅ Route /app/environment ajoutée dans routes.tsx
- ✅ Nav item ajouté avec icône FileCode
- ✅ Traductions EN/FR ajoutées (environment.*, toast.env*, nav.environment)
- ✅ Aucune erreur TypeScript dans les fichiers modifiés

## File List

- `packages/frontend/src/pages/app/environment/environment.tsx` — nouveau : page Environment complète
- `packages/frontend/src/routes.tsx` — modifié : ajout route environmentRoute
- `packages/frontend/src/pages/app/features/layouts/main_layout.tsx` — modifié : ajout nav item FileCode
- `packages/frontend/src/i18n/locales/en.json` — modifié : ajout clés environment.*, toast.env*, nav.environment
- `packages/frontend/src/i18n/locales/fr.json` — modifié : ajout clés environment.*, toast.env*, nav.environment

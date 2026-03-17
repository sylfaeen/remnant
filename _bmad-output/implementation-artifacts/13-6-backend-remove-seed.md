# Story 13.6: Backend — Suppression du seed admin par défaut

## Story

**As a** mainteneur du projet,
**I want** supprimer le seed `admin/password`,
**So that** aucun credential par défaut n'existe en production.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-5 completed (le setup endpoint doit exister avant de supprimer le seed)
- Fichiers clés:
  - Supprimer ou vider: `packages/backend/src/db/seed.ts`
  - Modifier: `packages/backend/src/index.ts` — retirer l'appel `seedDefaultAdmin()`

## Acceptance Criteria

### AC1: Suppression de seedDefaultAdmin
**Given** la fonction `seedDefaultAdmin()` existe dans `seed.ts`
**When** elle est supprimée
**Then** plus aucun utilisateur n'est créé automatiquement au démarrage du backend

### AC2: Retrait de l'appel
**Given** `index.ts` appelle `seedDefaultAdmin()` au démarrage
**When** l'appel est retiré
**Then** le backend démarre sans tenter de créer un admin par défaut

### AC3: Nettoyage fichier
**Given** `seed.ts` ne contient plus de code utile après suppression de `seedDefaultAdmin()`
**When** le fichier est analysé
**Then** il est supprimé entièrement

### AC4: Démarrage sans erreur
**Given** la base de données est vide (aucun utilisateur)
**When** le backend démarre
**Then** il démarre normalement sans erreur
**And** l'application attend que l'onboarding soit complété

## Technical Implementation

### Impact

Cette story est volontairement simple mais **critique** pour la sécurité. Elle doit être implémentée **après** la story 13-5 pour éviter un état où :
- Le seed est supprimé
- L'onboarding n'existe pas encore
- → L'admin ne peut plus se connecter

### Fichiers impactés

| Fichier | Action |
|---------|--------|
| `packages/backend/src/db/seed.ts` | Supprimer |
| `packages/backend/src/index.ts` | Retirer import + appel |

## Tasks

- [ ] Task 1: Supprimer le seed (AC: #1, #2, #3)
  - [ ] Supprimer `seedDefaultAdmin()` de `packages/backend/src/db/seed.ts`
  - [ ] Si le fichier est vide → le supprimer
  - [ ] Retirer `import { seedDefaultAdmin } from './db/seed'` de `packages/backend/src/index.ts`
  - [ ] Retirer l'appel `await seedDefaultAdmin()` de `packages/backend/src/index.ts`

- [ ] Task 2: Vérifier le démarrage (AC: #4)
  - [ ] S'assurer que le backend démarre avec une base vide
  - [ ] Vérifier qu'aucune autre dépendance ne référence `seed.ts`

# Story 16.1: API de lecture et écriture du .env

## Story

**As a** administrateur,
**I want** une API pour lire et sauvegarder le contenu brut du fichier .env,
**So that** je puisse gérer la configuration du panel sans accès SSH.

## Status

done

## Context

- Epic: 16 - Gestion de l'Environnement (.env)
- Dependencies: Aucune — story initiale de l'epic
- Fichiers clés:
  - Créer: `packages/backend/src/routes/handlers/env.ts` — nouveau router ts-rest
  - Modifier: `packages/backend/src/routes/index.ts` — enregistrer le router
- L'API expose le fichier .env comme un blob texte brut (pas de parsing par variable, pas de masquage de secrets)
- `getContent` retourne le contenu brut du fichier .env en string
- `saveContent` reçoit le contenu complet et écrase le fichier .env
- Le fichier .env est lu à froid à chaque appel (pas de cache), pour refléter l'état réel du fichier

## Acceptance Criteria

### AC1: Query env.getContent
**Given** un utilisateur authentifié avec permissions admin
**When** il appelle `env.getContent`
**Then** le contenu brut du fichier .env est retourné en string `{ content: string }`
**And** commentaires, lignes vides et formatage sont préservés tels quels

### AC2: Mutation env.saveContent
**Given** un utilisateur authentifié avec permissions admin
**When** il appelle `env.saveContent` avec `{ content: string }`
**Then** le contenu complet du fichier .env est remplacé par la valeur reçue

### AC3: Audit log
**Given** une sauvegarde du .env
**When** la mutation réussit
**Then** un audit log est enregistré (action `update`, resourceType `env`)

### AC4: Router enregistré
**Given** le router `env` est créé
**When** le backend démarre
**Then** `env` est accessible dans `appRouter`

## Tasks

- [x] Task 1: Créer le router ts-rest `env.ts` (AC: #1)
  - [x] Procédure `getContent` protégée (admin uniquement)
  - [x] Lire le fichier .env et retourner `{ content: string }`

- [x] Task 2: Implémenter la mutation `saveContent` (AC: #2)
  - [x] Recevoir `{ content: string }` et écrire le fichier .env complet
  - [x] Validation Zod basique (content est une string)

- [x] Task 3: Enregistrer le router et audit log (AC: #3, #4)
  - [x] Ajouter `env: envRouter` dans `routes/index.ts`
  - [x] Audit log sur mutation : action `update`, resourceType `env`

## Dev Agent Record

### Implementation Plan
- API simple : `getContent` lit le fichier, `saveContent` l'écrase — pas de CRUD par variable
- Pas de masquage de secrets (le contenu brut est affiché dans un éditeur Monaco)
- Admin-only via `requirePermission('users:manage')`

### Completion Notes
- Router enregistré dans `routes/index.ts`
- Audit log intégré sur mutation `saveContent`

## File List

- `packages/backend/src/routes/handlers/env.ts` — nouveau : router ts-rest env (getContent, saveContent)
- `packages/backend/src/routes/index.ts` — modifié : ajout `env: envRouter`

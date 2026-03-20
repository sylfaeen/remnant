# Story 16.1: API de lecture et écriture du .env

## Story

**As a** administrateur,
**I want** une API pour lire et modifier les variables du fichier .env,
**So that** je puisse gérer la configuration du panel sans accès SSH.

## Status

done

## Context

- Epic: 16 - Gestion de l'Environnement (.env)
- Dependencies: Aucune — story initiale de l'epic
- Fichiers clés:
  - Créer: `packages/backend/src/routes/handlers/env.ts` — nouveau router ts-rest
  - Modifier: `packages/backend/src/routes/index.ts` — enregistrer le router
  - Réutiliser: logique de parsing de `packages/backend/src/env.ts`
- Les secrets (`JWT_SECRET`, `COOKIE_SECRET`, `TOTP_ENCRYPTION_KEY`) doivent être masqués en lecture
- Le fichier .env est lu à froid à chaque appel (pas de cache), pour refléter l'état réel du fichier

## Acceptance Criteria

### AC1: Query env.getAll
**Given** un utilisateur authentifié avec permissions admin
**When** il appelle `env.getAll`
**Then** toutes les variables du .env sont retournées en paires clé/valeur
**And** les commentaires et lignes vides sont ignorés

### AC2: Masquage des secrets
**Given** les variables `JWT_SECRET`, `COOKIE_SECRET`, `TOTP_ENCRYPTION_KEY`
**When** elles sont retournées par `env.getAll`
**Then** leur valeur est masquée (ex: `"abc...xyz"` — 3 premiers + 3 derniers caractères)
**And** un flag `sensitive: true` les identifie

### AC3: Mutation env.update
**Given** un utilisateur authentifié avec permissions admin
**When** il appelle `env.update` avec une clé et une valeur
**Then** la variable est mise à jour dans le fichier .env
**And** les autres lignes (commentaires, ordre) sont préservées

### AC4: Validation Zod
**Given** un appel à `env.update`
**When** la clé est vide ou contient des caractères invalides
**Then** une erreur de validation est retournée

### AC5: Ajout de nouvelle variable
**Given** une clé qui n'existe pas dans le .env
**When** `env.update` est appelé avec cette clé
**Then** la variable est ajoutée à la fin du fichier

### AC6: Audit log
**Given** une modification de variable .env
**When** la mutation réussit
**Then** un audit log est enregistré avec la clé modifiée (sans la valeur)

## Tasks

- [x] Task 1: Créer le router ts-rest `env.ts` (AC: #1, #2)
  - [x] Procédure `getAll` protégée (admin uniquement)
  - [x] Parser le .env : extraire paires clé/valeur, ignorer commentaires et lignes vides
  - [x] Masquer les secrets : 3 premiers + `...` + 3 derniers caractères
  - [x] Retourner `Array<{ key: string; value: string; sensitive: boolean }>`

- [x] Task 2: Implémenter la mutation `update` (AC: #3, #4, #5)
  - [x] Validation Zod : clé non vide, format `^[A-Z_][A-Z0-9_]*$`
  - [x] Lire le .env, remplacer la ligne correspondante ou ajouter en fin de fichier
  - [x] Préserver commentaires, ordre et lignes vides
  - [x] Écrire le fichier modifié

- [x] Task 3: Enregistrer le router et audit log (AC: #6)
  - [x] Ajouter `env: envRouter` dans `routes/index.ts`
  - [x] Audit log sur mutation : action `update`, resourceType `env`, details `{ key }` (sans valeur)

- [x] Task 4: Tests
  - [x] Test unitaire du parsing .env
  - [x] Test unitaire du masquage des secrets
  - [x] Test de la validation Zod (clé invalide)

## Dev Agent Record

### Implementation Plan
- Logique pure (parsing, masquage, mise à jour) extraite dans `env_service.ts` pour testabilité sans effets de bord DB
- Router `env.ts` délègue à `env_service` et ajoute audit log
- Zod validation avec regex `^[A-Z_][A-Z0-9_]*$`
- Admin-only via `requirePermission('users:manage')`

### Completion Notes
- ✅ 15/15 tests unitaires passent (parseEnvFile, maskValue, updateEnvFile, SENSITIVE_KEYS)
- ✅ Router enregistré dans `routes/index.ts`
- ✅ Audit log intégré sur mutation `update`
- ✅ Vitest config créé pour le package backend

## File List

- `packages/backend/src/services/env_service.ts` — nouveau : logique pure de parsing/masquage/écriture .env
- `packages/backend/src/routes/handlers/env.ts` — nouveau : router ts-rest env (getAll, update)
- `packages/backend/src/routes/index.ts` — modifié : ajout `env: envRouter`

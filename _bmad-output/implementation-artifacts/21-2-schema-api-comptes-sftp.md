# Story 21.2: Schema & API des comptes SFTP

## Story

**As a** développeur,
**I want** un modèle de données et des endpoints pour les comptes SFTP,
**So that** le CRUD des accès SFTP par serveur soit supporté.

## Status

backlog

## Context

- Epic: 21 - Gestion des Accès SFTP
- Dependencies: Story 21.1
- Fichiers clés:
  - Créer: `packages/backend/src/db/schema/sftp_accounts.ts` — table sftp_accounts
  - Créer: `packages/shared/src/schemas/sftp.ts` — schemas Zod
  - Modifier: `packages/backend/src/trpc/routers/sftp.ts` — ajout procédures CRUD
  - Modifier: `packages/shared/src/schemas/index.ts` — export des schemas
- Pattern existant : voir `packages/backend/src/db/schema/servers.ts` et `packages/shared/src/schemas/server.ts`

## Acceptance Criteria

### AC1: Table sftp_accounts
**Given** la base de données
**When** la migration est exécutée
**Then** une table `sftp_accounts` est créée avec : `id`, `server_id` (FK → servers), `username`, `password` (hashé), `permissions` (enum: read-only, read-write), `allowed_paths` (JSON array de chemins relatifs), `created_at`, `updated_at`

### AC2: Schemas Zod
**Given** le package shared
**When** les schemas sont définis
**Then** `sftpAccountSchema`, `createSftpAccountSchema`, `updateSftpAccountSchema` sont exportés
**And** les validations incluent : username unique par serveur, password requis à la création

### AC3: Router tRPC
**Given** le backend
**When** le router sftp est étendu
**Then** les procédures `sftp.list(serverId)`, `sftp.create(...)`, `sftp.update(...)`, `sftp.delete(id)` sont disponibles
**And** les mots de passe ne sont jamais renvoyés par l'API (uniquement un booléen `hasPassword`)

## Tasks

- [ ] Créer la table `sftp_accounts` avec Drizzle schema
- [ ] Créer la migration DB
- [ ] Créer les schemas Zod dans shared
- [ ] Ajouter les procédures CRUD au router tRPC sftp
- [ ] Implémenter le hashing des mots de passe
- [ ] Valider l'unicité username par serveur
- [ ] S'assurer que les mots de passe ne sont jamais exposés dans les réponses API

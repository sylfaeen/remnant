# Story 11.1: Backup Management Backend

## Story

**As a** administrateur,
**I want** une API complète pour gérer les backups de mes serveurs,
**So that** je puisse créer, lister, télécharger et supprimer des backups depuis le panel.

## Status

done

## Context

- Epic: 11 - Gestion des Backups
- Dependencies: Aucune — le `BackupService` et la mutation ts-rest `backup` existent déjà partiellement
- Le service `backup_service.ts` supporte déjà `createFullBackup()`, `listBackups()`, `deleteServerDirectory()`
- La mutation `servers.backup` a été ajoutée pour le backup à la volée
- Il manque : list backups endpoint, delete backup endpoint, download backup route, taille formatée

## Acceptance Criteria

### AC1: Lister les backups d'un serveur
**Given** je suis sur la page backups d'un serveur
**When** la page charge
**Then** je vois la liste de tous les backups existants pour ce serveur
**And** chaque backup affiche : nom, taille, date de création

### AC2: Supprimer un backup
**Given** je vois un backup dans la liste
**When** je clique sur supprimer et confirme
**Then** le fichier ZIP est supprimé du disque
**And** la liste se met à jour

### AC3: Télécharger un backup
**Given** je vois un backup dans la liste
**When** je clique sur télécharger
**Then** le fichier ZIP est téléchargé dans mon navigateur

### AC4: Backup sélectif
**Given** je suis sur la page backups
**When** je clique sur "Sauvegarder maintenant"
**Then** une dialog me permet de sélectionner les fichiers/dossiers à inclure
**And** le backend accepte un paramètre `paths` optionnel dans la mutation `backup`
**And** si `paths` est fourni, seuls les fichiers/dossiers sélectionnés sont archivés
**And** si `paths` est vide/absent, un backup complet est créé

## Technical Implementation

### Files to Modify
- `packages/backend/src/services/backup_service.ts` — `deleteBackup(filename)`, `createSelectiveBackup(serverPath, serverName, paths)`
- `packages/backend/src/services/server_service.ts` — `backupServer(id, paths?)` accepte un paramètre optionnel
- `packages/backend/src/routes/handlers/servers.ts` — Mutations `listBackups`, `deleteBackup`, `backup` (avec `paths` optionnel)
- `packages/backend/src/routes/index.ts` — Route download `/api/servers/:id/backups/:filename`

### API Endpoints
- `servers.backup` (ts-rest mutation) — Créer un backup (full ou sélectif via `paths`)
- `servers.listBackups` (ts-rest query) — Lister les backups d'un serveur
- `servers.deleteBackup` (ts-rest mutation) — Supprimer un backup
- `GET /api/servers/:id/backups/:filename` (REST) — Télécharger un backup (stream fichier)

## Tasks

- [x] Ajouter `deleteBackup(filename)` au `BackupService`
- [x] Ajouter `createSelectiveBackup(serverPath, serverName, paths)` au `BackupService`
- [x] Ajouter `listBackups` query ts-rest
- [x] Ajouter `deleteBackup` mutation ts-rest
- [x] Modifier `backup` mutation pour accepter `paths` optionnel
- [x] Ajouter route REST pour le download de backup
- [ ] Tester le flow complet : create (full) → create (sélectif) → list → download → delete

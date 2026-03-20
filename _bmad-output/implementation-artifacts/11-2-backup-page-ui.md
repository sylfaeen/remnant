# Story 11.2: Backup Page UI

## Story

**As a** administrateur,
**I want** une page dédiée aux backups dans la navigation d'un serveur, avec la possibilité de sélectionner les fichiers à sauvegarder,
**So that** je puisse visualiser, créer (full ou sélectif), télécharger et supprimer mes backups facilement.

## Status

done

## Context

- Epic: 11 - Gestion des Backups
- Dependencies: Story 11-1 completed (API endpoints avec support backup sélectif)
- La navigation serveur existe déjà dans `server_layout.tsx` avec les onglets : Dashboard, Console, Files, Plugins, Tasks, Settings
- Il faut ajouter un onglet "Backups" entre "Plugins" et "Tasks"
- Le hook `useBackupServer()` accepte un paramètre `paths` optionnel
- L'API `files.list` existante est réutilisée pour afficher l'arborescence

## Acceptance Criteria

### AC1: Onglet Backups dans la navigation
**Given** je suis sur la page d'un serveur
**When** je regarde la navigation
**Then** je vois un onglet "Backups" avec une icône archive
**And** il est placé entre "Plugins" et "Tasks"

### AC2: Liste des backups
**Given** je suis sur la page Backups
**When** la page charge
**Then** je vois la liste des backups triés par date (plus récent en premier)
**And** chaque backup affiche : nom, taille formatée (MB/GB), date relative
**And** si aucun backup n'existe, un état vide avec message est affiché

### AC3: Dialog de sélection de fichiers au clic sur "Sauvegarder maintenant"
**Given** je suis sur la page Backups
**When** je clique sur "Sauvegarder maintenant"
**Then** une dialog s'ouvre avec l'arborescence des fichiers du serveur
**And** tous les fichiers/dossiers sont cochés par défaut
**And** je peux expand les dossiers (lazy-load via `files.list`)
**And** cocher/décocher un dossier affecte récursivement ses enfants chargés
**And** les boutons "Tout sélectionner" / "Tout désélectionner" sont disponibles
**And** un compteur indique le nombre d'éléments sélectionnés
**And** un bouton "Lancer la sauvegarde" envoie les paths optimisés au backend

### AC4: Télécharger un backup
**Given** je vois un backup dans la liste
**When** je clique sur le bouton de téléchargement
**Then** le fichier ZIP se télécharge dans mon navigateur

### AC5: Supprimer un backup
**Given** je vois un backup dans la liste
**When** je clique sur supprimer
**Then** une confirmation apparaît
**And** si je confirme, le backup est supprimé et disparaît de la liste

### AC6: i18n
**Given** l'interface est en français ou en anglais
**When** je suis sur la page Backups
**Then** tous les textes sont traduits dans la langue active

## Technical Implementation

### Files to Create
- `packages/frontend/src/pages/app/servers/id/backups.tsx` — Page Backups complète avec dialog arborescence
- `packages/frontend/src/hooks/use_backups.ts` — Hooks ts-rest pour list/delete backups

### Files to Modify
- `packages/frontend/src/hooks/use_servers.ts` — `useBackupServer()` accepte `paths?: Array<string>`
- `packages/frontend/src/components/layout/server_layout.tsx` — Ajouter onglet Backups
- `packages/frontend/src/routes.tsx` — Ajouter route `/servers/:id/backups`
- `packages/frontend/src/i18n/locales/en.json` — Clés backups.*
- `packages/frontend/src/i18n/locales/fr.json` — Clés backups.*

### UI Structure — Page
```
┌─────────────────────────────────────────────────────┐
│ [Archive icon] ServerName / Backups                 │
│                                    [Backup Now btn] │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Backups (count)                                 │ │
│ │                                                 │ │
│ │ ┌───────────────────────────────────────────┐   │ │
│ │ │ my-server-2026-03-12T14-30.zip            │   │ │
│ │ │ 156 MB · il y a 2 heures                  │   │ │
│ │ │                     [Download] [Delete]    │   │ │
│ │ └───────────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### UI Structure — Backup Dialog
```
┌─────────────────────────────────────────────────────┐
│ Select files to backup                              │
│ Choose which files and folders to include...        │
│                                                     │
│ [Select all] [Deselect all]       12 items selected │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▶ ☑ 📁 world                                   │ │
│ │ ▶ ☑ 📁 plugins                                 │ │
│ │   ☑ 📄 server.properties              1.2 KB   │ │
│ │   ☑ 📄 paper.yml                      3.4 KB   │ │
│ │   ☐ 📄 logs/latest.log              124.5 MB   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│                     [Cancel] [Start backup]         │
└─────────────────────────────────────────────────────┘
```

### i18n Keys
```json
{
  "backups": {
    "title": "Backups",
    "subtitle": "Manage server backups",
    "backupNow": "Backup now",
    "backingUp": "Backing up...",
    "backupSuccess": "Backup created successfully",
    "backupError": "Error creating backup",
    "deleteError": "Error deleting backup",
    "noBackups": "No backups yet",
    "createFirst": "Create your first backup to protect your server data",
    "dialogTitle": "Select files to backup",
    "dialogDescription": "Choose which files and folders to include in the backup. All files are selected by default.",
    "selectAll": "Select all",
    "deselectAll": "Deselect all",
    "itemsSelected": "items selected",
    "noFiles": "No files found",
    "startBackup": "Start backup"
  }
}
```

## Tasks

- [x] Créer le hook `use_backups.ts` (useBackups, useDeleteBackup)
- [x] Créer la page `backups.tsx` avec liste, download, delete
- [x] Ajouter la dialog de sélection de fichiers avec arborescence
- [x] Lazy-load des sous-dossiers via `tsRestUtils.files.list.fetch()`
- [x] Sélection/désélection récursive des dossiers
- [x] Optimisation des paths (envoyer le dossier parent si tous les enfants sont sélectionnés)
- [x] Modifier `useBackupServer()` pour accepter `paths`
- [x] Ajouter la route dans `routes.tsx`
- [x] Ajouter l'onglet dans `server_layout.tsx`
- [x] Ajouter les clés i18n dans `en.json` et `fr.json`
- [x] Respecter toutes les règles `.claude/rules/`
- [x] Vérifier lint

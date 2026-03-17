# Story 3.2: File Browser UI

## Story

**As a** administrateur,
**I want** une interface pour naviguer dans les fichiers du serveur,
**So that** je puisse visualiser et organiser les fichiers facilement.

## Status

done

## Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Story 3.1 (File Browser API) completed

## Acceptance Criteria

### AC1: File List Display
**Given** je suis sur la page fichiers d'un serveur
**When** la page se charge
**Then** je vois la liste des fichiers et dossiers

### AC2: Navigation
**Given** je suis dans un dossier
**When** je clique sur un sous-dossier
**Then** je navigue dans ce dossier

### AC3: Breadcrumb Navigation
**Given** je suis dans un sous-dossier
**When** je regarde le fil d'Ariane
**Then** je peux cliquer pour remonter dans l'arborescence

### AC4: File Actions
**Given** je survole un fichier
**When** les actions apparaissent
**Then** je peux renommer ou supprimer le fichier

### AC5: Create Folder
**Given** je suis dans un dossier
**When** je clique sur "Nouveau dossier"
**Then** je peux creer un nouveau dossier

## Technical Implementation

### Files Created
- `packages/frontend/src/hooks/use_files.ts` - React Query hooks for file operations
- `packages/frontend/src/pages/files.tsx` - File browser page component

### Files Modified
- `packages/frontend/src/routes.tsx` - Added route `/servers/$id/files`
- `packages/frontend/src/pages/servers.tsx` - Added "Fichiers" link button

### Key Features Implemented
- Directory listing with folder/file icons
- Breadcrumb navigation
- File actions (rename, delete) with confirmation
- New folder creation
- File size formatting
- File type detection for icons
- Edit file link for editable files
- Rename modal dialog

## Tasks

- [x] Create useFiles hook with React Query
- [x] Create FilesPage component
- [x] Add route in routes.tsx
- [x] Add "Fichiers" link in ServerCard

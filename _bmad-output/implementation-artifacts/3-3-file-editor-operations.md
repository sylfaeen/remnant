# Story 3.3: File Editor & Operations

## Story

**As a** administrateur,
**I want** editer et gerer les fichiers,
**So that** je puisse modifier la configuration du serveur.

## Status

done

## Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Stories 3.1 and 3.2 completed

## Acceptance Criteria

### AC1: Monaco Editor
**Given** un fichier est ouvert dans Monaco Editor
**When** je modifie et sauvegarde (Ctrl+S)
**Then** le fichier est ecrit sur le disque via l'API

### AC2: Delete File
**Given** je selectionne un fichier
**When** je clique sur Supprimer et confirme
**Then** le fichier est supprime du serveur

### AC3: File Upload
**Given** je suis dans un dossier
**When** je drag & drop un fichier
**Then** le fichier est uploade dans ce dossier

## Technical Implementation

### Files Created
- `packages/frontend/src/pages/file_editor.tsx` - Monaco Editor page with save functionality

### Files Modified
- `packages/frontend/src/routes.tsx` - Added route `/servers/$id/files/edit`
- `packages/frontend/src/hooks/use_files.ts` - Added `useUploadFile` hook
- `packages/frontend/src/pages/files.tsx` - Added drag & drop upload
- `packages/backend/src/index.ts` - Registered @fastify/multipart plugin
- `packages/backend/src/services/file_service.ts` - Added `uploadFile` method
- `packages/backend/src/routes/files.ts` - Added upload route

### Dependencies Added
- `@fastify/multipart` - For handling file uploads on backend

### Key Features Implemented
- Monaco Editor with syntax highlighting based on file extension
- Ctrl+S keyboard shortcut for saving
- Save status indicator (saving, saved, error)
- File upload via drag & drop
- 100MB max file size for uploads
- Path traversal protection on upload

## Tasks

- [x] Create file editor page with Monaco Editor
- [x] Add route in routes.tsx
- [x] Add upload endpoint to backend
- [x] Add useUploadFile hook
- [x] Add drag & drop upload to files page

---

## Post-Implementation Updates

- **Note :** Monaco Editor a ete remplace par un editeur de code integre plus simple (CodeMirror-like) lors de l'implementation. Monaco etait trop lourd pour un panel de gestion de serveurs. Les references a Monaco dans cette story correspondent au plan initial, pas a l'implementation finale.

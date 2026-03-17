# Story 4.1: Plugin Management

## Story

**As a** administrateur,
**I want** gerer les plugins du serveur,
**So that** je puisse etendre les fonctionnalites.

## Status

done

## Context

- Epic: 4 - Plugins & Automatisation
- Dependencies: Epic 3 completed (file operations already exist)
- Reused file_service from story 3-3

## Acceptance Criteria

### AC1: List Plugins
**Given** je suis sur la page plugins
**When** la page charge
**Then** je vois la liste des fichiers .jar dans le dossier plugins

### AC2: Upload Plugin
**Given** je drag & drop un fichier .jar
**When** l'upload termine
**Then** le plugin apparait dans la liste
**And** un message indique qu'un restart est necessaire

### AC3: Delete Plugin
**Given** je selectionne un plugin
**When** je clique sur Supprimer
**Then** le fichier .jar est supprime du dossier plugins

## Technical Implementation

### Files Created
- `packages/backend/src/routes/plugins.ts` - Plugin management routes
- `packages/frontend/src/pages/plugins.tsx` - Plugins management page
- `packages/frontend/src/hooks/use_plugins.ts` - React Query hooks for plugins

### Files Modified
- `packages/backend/src/routes/index.ts` - Registered plugin routes
- `packages/frontend/src/routes.tsx` - Added /servers/$id/plugins route
- `packages/frontend/src/pages/servers.tsx` - Added Plugins link

### API Endpoints
- `GET /api/servers/:serverId/plugins` - List plugins (.jar files in plugins folder)
- `POST /api/servers/:serverId/plugins` - Upload plugin JAR
- `DELETE /api/servers/:serverId/plugins/:filename` - Delete plugin

### Key Features Implemented
- List all .jar files in server's plugins folder
- Drag & drop upload with .jar validation
- Delete with confirmation
- Restart warning message
- Quick links to other server pages

## Tasks

- [x] Create plugin routes on backend
- [x] Register routes in index.ts
- [x] Create use_plugins.ts hooks
- [x] Create plugins.tsx page
- [x] Add route in routes.tsx
- [x] Add Plugins link in servers.tsx
- [x] Test complete flow (build successful)

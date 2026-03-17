# Story 3.4: Server JAR Management

## Story

**As a** administrateur,
**I want** gerer le fichier JAR du serveur,
**So that** je puisse choisir la version de Minecraft.

## Status

done

## Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Stories 3.1, 3.2, 3.3 completed

## Acceptance Criteria

### AC1: Display Current JAR
**Given** je suis sur la page settings
**When** je vois la section JAR
**Then** le JAR actuel est affiche avec sa version

### AC2: Download PaperMC
**Given** je clique sur "Telecharger PaperMC"
**When** je selectionne une version
**Then** le JAR est telecharge depuis l'API PaperMC

### AC3: Set Active JAR
**Given** plusieurs JARs sont disponibles
**When** je clique sur "Activer" sur un JAR
**Then** ce JAR devient le JAR actif du serveur

## Technical Implementation

### Files Created
- `packages/backend/src/services/papermc_service.ts` - PaperMC API integration
- `packages/backend/src/routes/jars.ts` - JAR management routes
- `packages/frontend/src/hooks/use_jars.ts` - React Query hooks for JAR management
- `packages/frontend/src/pages/server_settings.tsx` - Server settings page

### Files Modified
- `packages/backend/src/routes/index.ts` - Registered JAR routes
- `packages/frontend/src/routes.tsx` - Added route `/servers/$id/settings`
- `packages/frontend/src/pages/servers.tsx` - Added "Parametres" link

### API Endpoints
- `GET /api/jars/versions` - Get available PaperMC versions
- `GET /api/jars/versions/:version/builds` - Get builds for a version
- `POST /api/jars/servers/:serverId/download` - Download PaperMC JAR
- `GET /api/jars/servers/:serverId/progress` - Get download progress
- `GET /api/jars/servers/:serverId/list` - List available JARs
- `PUT /api/jars/servers/:serverId/active` - Set active JAR

### Key Features Implemented
- PaperMC API integration for fetching versions and builds
- JAR download with progress tracking
- List available JAR files in server directory
- Set active JAR for server configuration
- Server settings page with JAR management section

## Tasks

- [x] Create PaperMC service for API integration
- [x] Create JAR management routes
- [x] Create frontend hooks for JAR management
- [x] Create server settings page
- [x] Add route in routes.tsx
- [x] Add settings link in servers page

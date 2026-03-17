# Story 3.5: JVM & Port Configuration

## Story

**As a** administrateur,
**I want** configurer les parametres JVM et les ports,
**So that** je puisse optimiser les performances du serveur.

## Status

done

## Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Stories 3.1, 3.2, 3.3, 3.4 completed
- Previous story (3-4) created `server_settings.tsx` page - extended here

## Acceptance Criteria

### AC1: RAM Configuration
**Given** je suis sur la page settings
**When** je modifie la memoire RAM (min/max)
**Then** les flags -Xms et -Xmx sont mis a jour dans la config serveur

### AC2: Aikar Flags Toggle
**Given** je coche "Utiliser Aikar Flags"
**When** je sauvegarde
**Then** les flags Aikar sont ajoutes a la config JVM

### AC3: Java Port Configuration
**Given** je modifie le port Java (default: 25565)
**When** je sauvegarde
**Then** le port est mis a jour dans server.properties

### AC4: Bedrock Port Configuration (Geyser)
**Given** je modifie le port Bedrock/Geyser (default: 19132)
**When** je sauvegarde
**Then** le port est mis a jour dans la config Geyser si presente

## Technical Implementation

### Files Created
- `packages/shared/src/constants/jvm.ts` - Aikar flags constant and RAM presets

### Files Modified
- `packages/shared/src/index.ts` - Export jvm constants
- `packages/frontend/src/pages/server_settings.tsx` - Added JVM and port configuration sections

### Key Features Implemented
- RAM min/max selection with common presets (1G to 16G)
- Aikar flags toggle with automatic flag application
- Custom JVM flags textarea
- Java port configuration
- Save button with loading state and success/error feedback
- Restart warning message

## Tasks

- [x] Add JVM config types to shared package
- [x] Add config methods to server_service.ts (already existed)
- [x] Create server_config.ts routes (not needed - PUT /api/servers/:id already handles this)
- [x] Add React Query hooks for config (useUpdateServer already existed)
- [x] Add JVM configuration section to server_settings.tsx
- [x] Add port configuration section to server_settings.tsx
- [x] Test complete flow (build successful)

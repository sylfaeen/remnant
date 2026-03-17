# Story 3.1: File Browser API

## Story

**As a** administrateur,
**I want** naviguer dans les fichiers du serveur via l'API,
**So that** je puisse accéder à la configuration.

## Status

done

## Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Epic 2 completed

## Acceptance Criteria

### AC1: List Directory
**Given** je suis authentifié
**When** je GET /api/servers/:id/files?path=/
**Then** je reçois la liste des fichiers et dossiers à la racine du serveur

### AC2: Path Traversal Protection
**Given** un chemin contenant "../"
**When** je fais une requête sur ce chemin
**Then** je reçois une erreur 403 FILE_PATH_TRAVERSAL

### AC3: Read File
**Given** je GET /api/servers/:id/files/read?path=/server.properties
**When** le fichier existe
**Then** je reçois le contenu du fichier

### AC4: Write File
**Given** je PUT /api/servers/:id/files/write avec path et content
**When** la requête est valide
**Then** le fichier est écrit/créé sur le disque

### AC5: Delete File
**Given** je DELETE /api/servers/:id/files?path=/file.txt
**When** le fichier existe
**Then** le fichier est supprimé

## Technical Implementation

### API Endpoints
- `GET /api/servers/:id/files?path=/` - List directory
- `GET /api/servers/:id/files/read?path=` - Read file content
- `PUT /api/servers/:id/files/write` - Write file content
- `DELETE /api/servers/:id/files?path=` - Delete file/directory
- `POST /api/servers/:id/files/mkdir` - Create directory
- `POST /api/servers/:id/files/rename` - Rename/move file
- `GET /api/servers/:id/files/info?path=` - Get file info

### Files to Create
- `src/services/file_service.ts` - File operations with path validation
- `src/routes/files.ts` - API routes

## Tasks

- [x] Create FileService with path traversal protection
- [x] Create file routes with all CRUD operations
- [x] Register routes in index.ts

## Implementation Notes

### Files Created
- `packages/backend/src/services/file_service.ts` - Full file service implementation
- `packages/backend/src/routes/files.ts` - API routes

### Key Features Implemented
- Path traversal protection using path.resolve validation
- File size limit for reading (10MB max)
- Directory listing sorted (directories first, then alphabetically)
- File permissions string generation (rwxr-xr-x format)
- Recursive directory creation/deletion
- File/directory rename and move support

# Story 2.1: Server Process Management API

## Story

**As a** administrateur,
**I want** contrôler le processus serveur Minecraft via l'API,
**So that** je puisse démarrer, arrêter et redémarrer le serveur.

## Status

done

## Context

- Epic: 2 - Contrôle Serveur & Console
- Dependencies: Epic 1 completed

## Acceptance Criteria

### AC1: Start Server
**Given** le serveur est arrêté
**When** je POST /api/servers/:id/start
**Then** le processus Java est spawné avec les flags JVM configurés
**And** le PID est stocké pour le suivi
**And** shell: false est utilisé pour la sécurité

### AC2: Stop Server
**Given** le serveur est en cours d'exécution
**When** je POST /api/servers/:id/stop
**Then** le processus reçoit SIGTERM puis SIGKILL après timeout
**And** le statut passe à "stopped"

### AC3: Restart Server
**Given** le serveur est en cours d'exécution
**When** je POST /api/servers/:id/restart
**Then** le serveur s'arrête puis redémarre automatiquement

### AC4: Server Status
**Given** je veux connaître l'état du serveur
**When** je GET /api/servers/:id
**Then** je reçois le statut (running/stopped), PID, uptime

## Technical Implementation

### Database Schema

```sql
CREATE TABLE servers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,           -- Path to server directory
  jar_file TEXT NOT NULL,       -- JAR filename
  min_ram TEXT DEFAULT '1G',
  max_ram TEXT DEFAULT '2G',
  jvm_flags TEXT DEFAULT '',
  java_port INTEGER DEFAULT 25565,
  auto_start BOOLEAN DEFAULT false,
  created_at TEXT,
  updated_at TEXT
);
```

### API Endpoints

- GET /api/servers - List all servers
- GET /api/servers/:id - Get server details + status
- POST /api/servers - Create server config
- PUT /api/servers/:id - Update server config
- DELETE /api/servers/:id - Delete server config
- POST /api/servers/:id/start - Start server
- POST /api/servers/:id/stop - Stop server
- POST /api/servers/:id/restart - Restart server

### Files to Create

- `src/db/schema/servers.ts` - Drizzle schema
- `src/services/server_process_manager.ts` - Process management
- `src/routes/servers.ts` - API routes

## Tasks

- [x] Create servers table schema
- [x] Create ServerProcessManager service
- [x] Create server routes
- [x] Test start/stop/restart

## Implementation Notes

### Files Created
- `packages/backend/src/db/schema/servers.ts` - Drizzle schema for servers table
- `packages/backend/src/services/server_process_manager.ts` - Process management with EventEmitter
- `packages/backend/src/services/server_service.ts` - CRUD operations for servers
- `packages/backend/src/routes/servers.ts` - API routes
- `packages/shared/src/schemas/server.ts` - Zod validation schemas

### Key Features Implemented
- Aikar's JVM flags for optimal Minecraft performance
- Graceful shutdown: sends "stop" command → SIGTERM → SIGKILL after timeout
- Process tracking with PID and uptime
- shell:false for security
- EventEmitter for console output streaming (console:output event)

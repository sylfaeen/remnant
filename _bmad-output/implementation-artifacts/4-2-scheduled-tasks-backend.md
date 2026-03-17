# Story 4.2: Scheduled Tasks Backend

## Story

**As a** administrateur,
**I want** planifier des taches automatiques,
**So that** le serveur se maintienne sans intervention.

## Status

done

## Context

- Epic: 4 - Plugins & Automatisation
- Dependencies: Story 4-1 completed
- Database schema already has tasks table defined

## Acceptance Criteria

### AC1: Create Restart Task
**Given** je cree une tache de type "restart"
**When** je definis une expression cron (ex: 0 4 * * *)
**Then** la tache est enregistree en base
**And** le scheduler l'execute a l'heure prevue

### AC2: Create Backup Task
**Given** je cree une tache de type "backup"
**When** l'heure de backup arrive
**Then** le dossier world est compresse en .zip
**And** le backup est stocke avec timestamp

## Technical Implementation

### Files to Create
- `packages/backend/src/services/task_scheduler.ts` - Cron scheduler service
- `packages/backend/src/routes/tasks.ts` - Task CRUD routes

### Files to Modify
- `packages/backend/src/db/schema/tasks.ts` - Verify/create tasks table
- `packages/backend/src/routes/index.ts` - Register task routes
- `packages/backend/src/index.ts` - Initialize scheduler on startup

### API Endpoints
- `GET /api/servers/:serverId/tasks` - List scheduled tasks
- `POST /api/servers/:serverId/tasks` - Create scheduled task
- `PUT /api/servers/:serverId/tasks/:taskId` - Update task
- `DELETE /api/servers/:serverId/tasks/:taskId` - Delete task
- `POST /api/servers/:serverId/tasks/:taskId/toggle` - Enable/disable task

## Tasks

- [ ] Create/verify tasks table schema
- [ ] Create task scheduler service with cron
- [ ] Create task routes (CRUD)
- [ ] Register routes
- [ ] Initialize scheduler on startup
- [ ] Test complete flow

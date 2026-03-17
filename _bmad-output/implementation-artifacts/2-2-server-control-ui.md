# Story 2.2: Server Control UI

## Story

**As a** administrateur,
**I want** une interface pour gérer mes serveurs Minecraft,
**So that** je puisse voir leur statut et les contrôler facilement.

## Status

done

## Context

- Epic: 2 - Contrôle Serveur & Console
- Dependencies: Story 2.1 completed

## Acceptance Criteria

### AC1: Server List
**Given** je suis sur la page /servers
**When** la page se charge
**Then** je vois la liste de tous mes serveurs avec leur statut

### AC2: Server Status Display
**Given** un serveur est affiché
**When** son statut change
**Then** le badge de statut se met à jour (Arrêté, Démarrage, En ligne, Arrêt)
**And** les boutons d'action changent selon le statut

### AC3: Start/Stop/Restart Controls
**Given** un serveur est affiché
**When** je clique sur Démarrer/Arrêter/Redémarrer
**Then** l'action correspondante est exécutée via l'API
**And** le statut se met à jour automatiquement

### AC4: Create Server
**Given** je clique sur "Nouveau serveur"
**When** je remplis le formulaire (nom, path, JAR, RAM, port)
**Then** le serveur est créé et apparaît dans la liste

### AC5: Edit Server
**Given** un serveur est arrêté
**When** je clique sur Modifier
**Then** je peux éditer ses paramètres

### AC6: Delete Server
**Given** un serveur est arrêté
**When** je clique sur Supprimer puis Confirmer
**Then** le serveur est supprimé de la liste

## Technical Implementation

### React Hooks
- `useServers()` - Liste tous les serveurs (refresh 5s)
- `useServer(id)` - Détails d'un serveur (refresh 3s)
- `useCreateServer()` - Mutation création
- `useUpdateServer()` - Mutation modification
- `useDeleteServer()` - Mutation suppression
- `useStartServer()` - Mutation démarrage
- `useStopServer()` - Mutation arrêt
- `useRestartServer()` - Mutation redémarrage

### Components
- `ServersPage` - Page principale
- `ServerCard` - Carte de serveur avec actions
- `ServerForm` - Formulaire création/édition
- `StatusBadge` - Badge de statut coloré

### Files to Create
- `src/hooks/use_servers.ts`
- `src/components/server_form.tsx`
- `src/pages/servers.tsx`

## Tasks

- [x] Create useServers hook with all mutations
- [x] Create ServerForm component
- [x] Create ServersPage with ServerCard
- [x] Add route in routes.tsx
- [x] Update dashboard link

## Implementation Notes

### Files Created
- `packages/frontend/src/hooks/use_servers.ts` - All React Query hooks
- `packages/frontend/src/components/server_form.tsx` - Modal form component
- `packages/frontend/src/pages/servers.tsx` - Full page with ServerCard inline

### Key Features Implemented
- Auto-refresh every 5 seconds for real-time status updates
- Disabled edit/delete buttons when server is running
- Delete confirmation dialog
- Loading states on action buttons
- Uptime display for running servers
- RAM and port display in server cards

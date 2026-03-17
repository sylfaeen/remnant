# Story 2.3: Console WebSocket Backend

## Story

**As a** administrateur,
**I want** recevoir les logs en temps réel via WebSocket,
**So that** je puisse suivre l'activité du serveur.

## Status

done

## Context

- Epic: 2 - Contrôle Serveur & Console
- Dependencies: Story 2.1, Story 2.2 completed

## Acceptance Criteria

### AC1: WebSocket Authentication
**Given** je me connecte au WebSocket avec un JWT valide
**When** la connexion est établie
**Then** je reçois un message de type "connected" avec mon username

### AC2: Console Output Streaming
**Given** je suis connecté au WebSocket avec un serverId valide
**When** le serveur Minecraft écrit sur stdout/stderr
**Then** je reçois l'événement console:output avec le contenu et le type

### AC3: Console Input
**Given** je suis connecté au WebSocket
**When** j'envoie un message console:input avec une commande
**Then** la commande est écrite sur stdin du processus MC
**And** je reçois console:input:ack en confirmation

### AC4: Server Events
**Given** je suis connecté au WebSocket
**When** le serveur démarre/s'arrête/a une erreur
**Then** je reçois les événements server:started/server:stopped/server:error

## Technical Implementation

### WebSocket Endpoint
- URL: `ws://localhost:3001/ws/console?token=<jwt>&serverId=<id>`
- Authentication via JWT in query parameter
- One connection per server per client

### Message Types (Server → Client)
- `connected` - Connection successful
- `console:output` - Server stdout/stderr output
- `console:input:ack` - Command sent confirmation
- `server:started` - Server process started
- `server:stopped` - Server process stopped
- `server:error` - Server process error
- `error` - General error message
- `pong` - Response to ping

### Message Types (Client → Server)
- `console:input` - Send command to server stdin
- `ping` - Keep-alive ping

### Files to Create
- `src/routes/websocket.ts` - WebSocket route handler

## Tasks

- [x] Install @fastify/websocket
- [x] Create WebSocket route with JWT auth
- [x] Connect to ServerProcessManager events
- [x] Implement console:input handler
- [x] Implement console:output broadcast

## Implementation Notes

### Files Created
- `packages/backend/src/routes/websocket.ts` - Full WebSocket implementation

### Files Modified
- `packages/backend/src/index.ts` - Register websocket plugin and routes

### Key Features Implemented
- JWT authentication via query parameter (token)
- Per-server connection pooling (Map<serverId, Set<WebSocket>>)
- Event forwarding from ServerProcessManager to WebSocket clients
- Ping/pong for connection keep-alive
- Graceful error handling with close codes (4001-4004)
- Command acknowledgment (console:input:ack)

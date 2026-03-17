# Story 5.2: Players List

## Story

**As a** administrateur,
**I want** voir les joueurs connectes,
**So that** je puisse suivre l'activite du serveur.

## Status

done

## Context

- Epic: 5 - Monitoring & Production
- Dependencies: Story 5-1 completed, WebSocket infrastructure exists
- Console output already streamed via server_process_manager

## Acceptance Criteria

### AC1: Track Players via Log Parsing
**Given** le serveur MC est en cours d'execution
**When** un joueur se connecte/deconnecte
**Then** la liste des joueurs est mise a jour via parsing des logs

### AC2: WebSocket Broadcast of Players
**Given** je suis connecte au WebSocket
**When** la liste des joueurs change
**Then** je recois l'evenement `server:players` avec la liste actualisee

## Technical Implementation

### Files to Create
- `packages/backend/src/services/players_service.ts` - Player tracking via log parsing

### Files to Modify
- `packages/shared/src/types/index.ts` - Add PlayersUpdate types
- `packages/backend/src/routes/websocket.ts` - Add players broadcast
- `packages/backend/src/services/server_process_manager.ts` - Hook log parsing

### Log Patterns to Parse
```
// Player join (vanilla/paper)
[HH:MM:SS INFO]: PlayerName joined the game
[HH:MM:SS INFO]: PlayerName[/IP:PORT] logged in with entity id X

// Player leave
[HH:MM:SS INFO]: PlayerName left the game
[HH:MM:SS INFO]: PlayerName lost connection: reason
```

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `server:players` | Server→Client | Current player list |

### PlayersUpdate Interface
```typescript
interface PlayersUpdate {
  server_id: number;
  players: Array<string>;  // Player names
  count: number;
  timestamp: string;
}
```

## Tasks

- [x] Create PlayersUpdate types in @remnant/shared
- [x] Create PlayersService with log parsing
- [x] Hook into server_process_manager console output
- [x] Broadcast player changes via WebSocket
- [x] Test build

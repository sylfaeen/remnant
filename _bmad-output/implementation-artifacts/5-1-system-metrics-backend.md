# Story 5.1: System Metrics Backend

## Story

**As a** administrateur,
**I want** collecter les metriques systeme du serveur Minecraft,
**So that** je puisse surveiller l'utilisation des ressources en temps reel.

## Status

done

## Context

- Epic: 5 - Monitoring & Production
- Dependencies: Epic 2 completed (server process management)
- WebSocket infrastructure already exists for console streaming

## Acceptance Criteria

### AC1: Collect CPU/RAM from MC Process
**Given** le serveur Minecraft est en cours d'execution
**When** le service de metriques poll le systeme
**Then** l'utilisation CPU et RAM du processus Java est collectee

### AC2: WebSocket Broadcast of Metrics
**Given** je suis connecte au WebSocket du serveur
**When** les metriques sont collectees (toutes les 5 secondes)
**Then** je recois l'evenement `metrics:update` avec les donnees CPU, RAM, uptime

## Technical Implementation

### Files to Create
- `packages/backend/src/services/metrics_service.ts` - Metrics collection service using pidusage

### Files to Modify
- `packages/shared/src/types/index.ts` - Add ServerMetrics types
- `packages/backend/src/routes/websocket.ts` - Add metrics subscription handlers

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `metrics:subscribe` | Client→Server | Subscribe to metrics |
| `metrics:unsubscribe` | Client→Server | Unsubscribe |
| `metrics:subscribed` | Server→Client | Subscription confirmation |
| `metrics:update` | Server→Client | Metrics data (every 5s) |

### ServerMetrics Interface
```typescript
interface ServerMetrics {
  cpu: number;           // CPU percentage (0-100)
  memory: number;        // Memory in bytes
  memory_percent: number; // Memory percentage (0-100)
  uptime: number;        // Uptime in seconds
  timestamp: string;     // ISO 8601
}
```

## Tasks

- [x] Install pidusage for process metrics
- [x] Create ServerMetrics types in @remnant/shared
- [x] Create MetricsService backend
- [x] Integrate metrics in WebSocket handler
- [x] Test build

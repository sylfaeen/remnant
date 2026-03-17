# Story 5.3: Monitoring Dashboard

## Story

**As a** administrateur,
**I want** un dashboard de monitoring,
**So that** je puisse voir l'etat du serveur d'un coup d'oeil.

## Status

done

## Context

- Epic: 5 - Monitoring & Production
- Dependencies: Stories 5-1 and 5-2 completed (metrics + players backend)
- WebSocket events `metrics:update` and `server:players` available

## Acceptance Criteria

### AC1: Real-time CPU/RAM Display
**Given** je suis sur le dashboard
**When** les metriques arrivent via WebSocket
**Then** les jauges CPU et RAM se mettent a jour en temps reel

### AC2: Players Widget
**Given** des joueurs sont connectes
**When** je regarde le widget joueurs
**Then** je vois le nombre et la liste des pseudos

## Technical Implementation

### Files to Create
- `packages/frontend/src/components/monitoring/server_metrics.tsx` - CPU/RAM display
- `packages/frontend/src/components/monitoring/players_widget.tsx` - Players list
- `packages/frontend/src/hooks/use_metrics.ts` - WebSocket metrics hook
- `packages/frontend/src/hooks/use_players.ts` - WebSocket players hook

### Files to Modify
- `packages/frontend/src/pages/console.tsx` - Add monitoring widgets

### UI Components
- CPU gauge with percentage
- RAM gauge with percentage and absolute value
- Uptime display
- Players count badge
- Players list (expandable)

## Tasks

- [x] Extend use_console hook for metrics and players
- [x] Create ServerMetricsWidget component
- [x] Create PlayersWidget component
- [x] Integrate in console page sidebar
- [x] Test build

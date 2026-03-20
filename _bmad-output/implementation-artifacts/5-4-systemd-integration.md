# Story 5.4: Auto-Start avec Remnant

## Story

**As a** administrateur,
**I want** configurer le demarrage automatique des serveurs,
**So that** mes serveurs demarrent automatiquement quand Remnant demarre.

## Status

done

## Context

- Epic: 5 - Monitoring & Production
- Dependencies: Stories 5-1 to 5-3 completed
- install.sh already creates a systemd service for the Remnant panel
- Les serveurs MC sont geres par Remnant, pas par systemd directement

## Historical Note

Cette story s'appelait initialement "Systemd Integration" et incluait une fonctionnalite pour generer des fichiers systemd service pour les serveurs MC individuels. Cette fonctionnalite a ete **supprimee** car elle creait de la confusion:
- Les serveurs lances via systemd n'etaient pas geres par Remnant (pas de console, pas de metriques)
- L'approche "Remnant auto-start" est plus simple et garde les serveurs sous controle du panel

## Acceptance Criteria

### AC1: Remnant Auto-Start at Startup
**Given** Remnant demarre
**When** des serveurs ont auto_start=true en base
**Then** ces serveurs sont automatiquement demarres
**And** ils sont geres par le panel (console, metriques, etc.)

### AC2: Toggle Auto-Start dans les parametres
**Given** je suis sur la page settings d'un serveur
**When** je coche/decoche "Enable Auto Start"
**Then** la preference est sauvegardee en base
**And** elle sera respectee au prochain demarrage de Remnant

## Technical Implementation

### Files Modified
- `packages/backend/src/index.ts` - Auto-start logic at startup
- `packages/frontend/src/pages/server_settings.tsx` - Toggle in settings UI

### Files Removed (2026-03-11)
- `packages/backend/src/services/systemd_service.ts` - Supprime (fonctionnalite retiree)
- Endpoint ts-rest `generateSystemd` - Supprime

## Tasks

- [x] Implement Remnant auto-start logic in index.ts
- [x] Add auto_start toggle in server settings page
- [x] Remove systemd service generation feature (obsolete)
- [x] Test build

## Implementation Notes (2026-03-11)

### Remnant Auto-Start Implementation
Added to `packages/backend/src/index.ts`:
- On startup, queries all servers with `auto_start=true`
- Starts each server sequentially with error handling
- Logs success/failure for each server

```typescript
// Auto-start servers with auto_start enabled
const serverService = new ServerService();
const servers = await serverService.getAllServers();
const autoStartServers = servers.filter((s) => s.auto_start);

if (autoStartServers.length > 0) {
  fastify.log.info(`Auto-starting ${autoStartServers.length} server(s)...`);
  for (const server of autoStartServers) {
    const result = await serverService.startServer(server.id);
    // ... logging
  }
}
```

### Settings UI
Toggle checkbox in server settings page:
- Loads current `auto_start` value from server
- Saves with other JVM/port settings
- Clear description of what it does

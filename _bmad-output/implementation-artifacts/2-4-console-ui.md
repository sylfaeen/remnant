# Story 2.4: Console UI

## Story

**As a** administrateur,
**I want** une interface console interactive,
**So that** je puisse voir les logs et envoyer des commandes.

## Status

done

## Context

- Epic: 2 - Contrôle Serveur & Console
- Dependencies: Story 2.3 completed

## Acceptance Criteria

### AC1: Real-time Logs Display
**Given** je suis sur la page console d'un serveur
**When** le serveur envoie des logs
**Then** les logs s'affichent en temps réel avec scroll automatique
**And** les anciens logs sont conservés dans un buffer limité (1000 messages)

### AC2: Command Input
**Given** je tape une commande dans l'input
**When** j'appuie sur Entrée
**Then** la commande est envoyée au serveur
**And** l'input est vidé
**And** la commande apparaît dans les logs (préfixée par >)

### AC3: Command History
**Given** j'ai envoyé des commandes précédemment
**When** j'utilise les flèches ↑/↓
**Then** je peux naviguer dans l'historique des commandes

### AC4: Connection Status
**Given** je suis sur la page console
**When** la connexion WebSocket change d'état
**Then** le statut s'affiche (Connecté/Connexion.../Déconnecté)
**And** l'indicateur de couleur change (vert/jaune/rouge)

### AC5: Auto-scroll Control
**Given** je scroll manuellement vers le haut
**When** de nouveaux logs arrivent
**Then** le scroll automatique est désactivé
**And** un bouton "Scroll automatique" apparaît

## Technical Implementation

### React Hook
- `useConsoleWebSocket(serverId)` - Gère la connexion WebSocket
  - Returns: messages, isConnected, isConnecting, error, sendCommand, clearMessages

### Components
- `ConsolePage` - Page principale de la console
- `MessageLine` - Ligne de log avec timestamp et couleur par type

### Features
- Auto-scroll avec détection de scroll manuel
- Historique des commandes (100 dernières)
- Buffer de messages (1000 max)
- Reconnexion automatique sur déconnexion
- Ping keep-alive toutes les 30 secondes

### Files to Create
- `src/hooks/use_console.ts` - WebSocket hook
- `src/pages/console.tsx` - Console page

## Tasks

- [x] Create useConsoleWebSocket hook
- [x] Create ConsolePage component
- [x] Add route /servers/:id/console
- [x] Add Console link in ServerCard

## Implementation Notes

### Files Created
- `packages/frontend/src/hooks/use_console.ts` - Full WebSocket hook implementation
- `packages/frontend/src/pages/console.tsx` - Console page with all features

### Files Modified
- `packages/frontend/src/routes.tsx` - Added /servers/$id/console route
- `packages/frontend/src/pages/servers.tsx` - Added Console button to ServerCard

### Key Features Implemented
- Color-coded messages (stdout=white, stderr=red, input=blue, system=yellow)
- Timestamp for each message
- Auto-reconnect on connection loss (3 second delay)
- Manual scroll detection disables auto-scroll
- Command history navigation with ↑/↓ keys
- Clear messages button
- Responsive full-height layout

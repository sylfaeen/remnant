# Story 17.2: Backend — Table et Service Domaines

## Story

**As a** administrateur,
**I want** que les domaines personnalisés soient persistés en base de données,
**So that** je puisse les gérer depuis le panel.

## Status

backlog

## Context

- Epic: 17 - Domaines Personnalisés par Serveur
- Dependencies: Story 17.1 (script shell)
- Fichiers clés:
  - Créer: `packages/backend/src/db/schema/custom_domains.ts` — schema Drizzle
  - Créer: `packages/backend/src/services/domain_service.ts` — service domaines
  - Modifier: `packages/backend/src/db/schema/index.ts` — exporter le nouveau schema
- Le service appelle le script `remnant-domain.sh` via `execFile` avec sudo
- Validation Zod double : côté backend ET côté script shell
- Pattern identique au service firewall existant

## Acceptance Criteria

### AC1: Schema DB
**Given** la base de données SQLite
**When** la migration s'exécute
**Then** une table `custom_domains` est créée avec : `id`, `server_id` (nullable FK vers servers), `domain`, `port`, `type` (http/tcp/panel), `ssl_enabled`, `ssl_expires_at`, `created_at`
**And** une contrainte UNIQUE est posée sur `domain`

### AC2: Service addDomain
**Given** le service `domain_service.ts`
**When** j'appelle `addDomain({ serverId, domain, port, type })`
**Then** le domaine est validé via regex Zod
**And** le domaine est vérifié unique en DB
**And** le script `remnant-domain.sh add` est exécuté via `execFile` avec sudo
**And** le domaine est inséré en DB
**And** un audit log est créé

### AC3: Service removeDomain
**Given** un domaine existant en DB
**When** j'appelle `removeDomain(id)`
**Then** le script `remnant-domain.sh remove` est exécuté
**And** le domaine est supprimé de la DB

### AC4: Service enableSsl
**Given** un domaine existant sans SSL
**When** j'appelle `enableSsl(id)`
**Then** le script `remnant-domain.sh enable-ssl` est exécuté
**And** en cas de succès, `ssl_enabled` passe à `true` et `ssl_expires_at` est peuplé

### AC5: Validation Zod
**Given** un domaine invalide (ex: `foo`, `a b.com`, `evil;rm`)
**When** la validation Zod s'exécute
**Then** une erreur est retournée avant tout appel au script

## Dev Agent Record

_À compléter lors de l'implémentation_

## File List

_À compléter lors de l'implémentation_

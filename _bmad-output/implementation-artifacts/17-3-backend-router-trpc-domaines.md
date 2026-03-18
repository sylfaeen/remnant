# Story 17.3: Backend — Router tRPC Domaines

## Story

**As a** administrateur,
**I want** des endpoints tRPC pour gérer les domaines,
**So that** le frontend puisse interagir avec le service domaines.

## Status

backlog

## Context

- Epic: 17 - Domaines Personnalisés par Serveur
- Dependencies: Story 17.2 (service domaines)
- Fichiers clés:
  - Créer: `packages/backend/src/trpc/routers/domains.ts` — router tRPC
  - Modifier: `packages/backend/src/trpc/router.ts` — enregistrer le router
- Toutes les mutations nécessitent la permission `servers:manage`
- Pattern identique aux autres routers tRPC (env, firewall, etc.)

## Acceptance Criteria

### AC1: Endpoint list
**Given** un serveur avec des domaines
**When** j'appelle `domains.list({ serverId })`
**Then** la liste des domaines du serveur est retournée avec statut SSL et date d'expiration

### AC2: Endpoint add
**Given** un domaine valide
**When** j'appelle `domains.add({ serverId, domain, port, type })`
**Then** le domaine est ajouté via le service
**And** la permission `servers:manage` est requise
**And** le résultat inclut les DNS records à configurer

### AC3: Endpoint remove
**Given** un domaine existant
**When** j'appelle `domains.remove({ id })`
**Then** le domaine est supprimé via le service

### AC4: Endpoint enableSsl
**Given** un domaine sans SSL
**When** j'appelle `domains.enableSsl({ id })`
**Then** le SSL est activé via le service
**And** le résultat indique succès ou l'erreur (DNS non configuré, certbot échoué, etc.)

### AC5: Endpoint dnsCheck
**Given** un domaine
**When** j'appelle `domains.dnsCheck({ domain })`
**Then** le backend résout le DNS et retourne si l'IP correspond à celle du serveur

## Dev Agent Record

_À compléter lors de l'implémentation_

## File List

_À compléter lors de l'implémentation_

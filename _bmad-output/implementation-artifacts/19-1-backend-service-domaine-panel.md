# Story 19.1: Backend — Service Domaine Panel

## Story

**As a** administrateur,
**I want** configurer un domaine pour le panel Remnant avec gestion SSL et accès IP fallback,
**So that** j'accède à mon panel via `panel.mydomain.com` en HTTPS tout en gardant un accès IP de secours.

## Status

done

## Context

- Epic: 19 - Domaine Personnalisé pour le Panel Remnant
- Dependencies: Epic 17 (script shell + service domaines)
- Fichiers clés:
  - `packages/backend/src/services/domain_service.ts` — `DomainService` class avec `setPanelDomain`, `removePanelDomain`, `getPanelDomain`, `enableSsl`, `dnsCheck`, `getIpAccessStatus`, `setIpAccess`, `renewAll`, `refreshSslExpiry`, `ensureCertbotTimer`
  - `packages/backend/src/trpc/routers/domains.ts` — endpoints panel: `panelDomain`, `setPanelDomain`, `removePanelDomain`, `enableSsl`, `dnsCheck`, `ipAccess`, `setIpAccess`, `renew`, `refreshExpiry`, `ensureTimer`
  - `packages/backend/src/services/env_service.ts` — mise à jour `CORS_ORIGIN` et `SECURE_COOKIES`
  - `packages/backend/src/services/audit_service.ts` — audit logging de toutes les mutations
  - `scripts/remnant-domain.sh` — actions shell: `update-panel`, `reset-panel`, `enable-ssl`, `dns-check`, `enable-fallback`, `disable-fallback`, `fallback-status`, `renew`, `check-expiry`, `ensure-timer`
- Le domaine panel est stocké en DB avec `server_id = NULL` et `type = 'panel'`
- Un seul domaine panel à la fois (remplacement automatique via suppression + recréation)
- Le changement de domaine panel modifie le vhost Nginx existant `/etc/nginx/sites-available/remnant`
- Après activation SSL, `.env` est mis à jour et le service Remnant est redémarré (délai 2s)
- Les redirections HTTP→HTTPS utilisent des codes 302 (temporaires) pour éviter le cache navigateur

## Acceptance Criteria

### AC1: Endpoint setPanelDomain
**Given** un domaine valide
**When** j'appelle `domains.setPanelDomain({ domain })`
**Then** le vhost Nginx `remnant` est mis à jour avec le `server_name` via `update-panel`
**And** le domaine est stocké en DB avec `server_id = NULL` et `type = 'panel'`
**And** `CORS_ORIGIN` est mis à jour avec `http://<domain>`
**And** le service Remnant est redémarré automatiquement
**And** un audit log `set-panel-domain` est enregistré

### AC2: Activation SSL panel
**Given** un domaine panel configuré
**When** j'appelle `domains.enableSsl({ id })`
**Then** certbot est lancé sur le domaine via `enable-ssl`
**And** en cas de succès, `.env` est mis à jour : `CORS_ORIGIN=https://<domain>`, `SECURE_COOKIES=true`
**And** la date d'expiration SSL est stockée en DB (`ssl_expires_at`)
**And** le service Remnant est redémarré automatiquement
**And** un audit log `enable-ssl` est enregistré

### AC3: Suppression domaine panel
**Given** un domaine panel existant
**When** j'appelle `domains.removePanelDomain()`
**Then** le vhost Nginx revient au `server_name _` par défaut via `reset-panel`
**And** `.env` est restauré : `CORS_ORIGIN=http://<serverIp>`, `SECURE_COOKIES=false`
**And** le service est redémarré
**And** un audit log `remove-panel-domain` est enregistré

### AC4: Un seul domaine panel
**Given** un domaine panel déjà configuré
**When** j'essaie d'en ajouter un autre
**Then** l'ancien est automatiquement supprimé (`removePanelDomain`) puis le nouveau est créé

### AC5: Validation DNS
**Given** un domaine quelconque
**When** j'appelle `domains.dnsCheck({ domain })`
**Then** le script vérifie via `dns-check` que le domaine pointe vers l'IP du serveur
**And** retourne `{ matches: boolean, resolvedIp: string | null, serverIp: string }`

### AC6: Accès IP fallback
**Given** un domaine panel avec SSL activé
**When** j'appelle `domains.ipAccess`
**Then** le statut de l'accès IP fallback est retourné via `fallback-status` (`{ enabled }`)
**When** j'appelle `domains.setIpAccess({ enabled: true/false })`
**Then** le vhost fallback IP est activé/désactivé via `enable-fallback` / `disable-fallback`
**And** un audit log `enable-ip-access` ou `disable-ip-access` est enregistré

### AC7: Rate limiting et permissions
**Given** toutes les mutations du router domaines
**Then** les mutations sont protégées par `rateLimitedPermission(10, 60s, 'users:manage')`
**And** les queries sont protégées par `requirePermission('users:manage')`

### AC8: Query panelDomain
**Given** la query `domains.panelDomain`
**When** elle est appelée
**Then** retourne le domaine panel existant ou `{ domain: null }`

## Dev Agent Record

Implémentation complète. Tous les endpoints fonctionnels avec audit logging, rate limiting, et gestion complète du cycle de vie domaine panel (création, SSL, suppression, IP fallback).

## File List

- `packages/backend/src/services/domain_service.ts`
- `packages/backend/src/trpc/routers/domains.ts`
- `packages/backend/src/services/env_service.ts`
- `packages/backend/src/services/audit_service.ts`
- `scripts/remnant-domain.sh`
- `packages/shared/src/schemas/domains.ts`

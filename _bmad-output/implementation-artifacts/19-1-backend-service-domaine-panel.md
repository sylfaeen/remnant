# Story 19.1: Backend — Service Domaine Panel

## Story

**As a** administrateur,
**I want** configurer un domaine pour le panel Remnant,
**So that** j'accède à mon panel via `panel.mydomain.com` en HTTPS.

## Status

done

## Context

- Epic: 19 - Domaine Personnalisé pour le Panel Remnant
- Dependencies: Epic 17 (script shell + service domaines)
- Fichiers clés:
  - Modifier: `packages/backend/src/services/domain_service.ts` — ajouter setPanelDomain, removePanelDomain
  - Modifier: `packages/backend/src/trpc/routers/domains.ts` — ajouter endpoints panel
  - Modifier: `packages/backend/src/services/env_service.ts` — mise à jour CORS_ORIGIN et SECURE_COOKIES
- Le domaine panel est stocké en DB avec `server_id = NULL` et `type = 'panel'`
- Un seul domaine panel à la fois (remplacement, pas accumulation)
- Le changement de domaine panel modifie le vhost Nginx existant `/etc/nginx/sites-available/remnant`
- Après activation SSL, `.env` est mis à jour et le service Remnant est redémarré

## Acceptance Criteria

### AC1: Endpoint setPanelDomain
**Given** un domaine valide
**When** j'appelle `domains.setPanelDomain({ domain })`
**Then** le vhost Nginx `remnant` est mis à jour avec le `server_name`
**And** le domaine est stocké en DB avec `server_id = NULL` et `type = 'panel'`

### AC2: Activation SSL panel
**Given** un domaine panel configuré
**When** j'appelle `domains.enableSsl({ id })`
**Then** certbot est lancé sur le domaine
**And** en cas de succès, `.env` est mis à jour : `CORS_ORIGIN=https://<domain>`, `SECURE_COOKIES=true`
**And** le service Remnant est redémarré automatiquement

### AC3: Suppression domaine panel
**Given** un domaine panel existant
**When** j'appelle `domains.removePanelDomain()`
**Then** le vhost Nginx revient au `server_name _` par défaut
**And** `.env` est restauré avec l'IP du serveur et `SECURE_COOKIES=false`
**And** le service est redémarré

### AC4: Un seul domaine panel
**Given** un domaine panel déjà configuré
**When** j'essaie d'en ajouter un autre
**Then** l'ancien est remplacé (pas d'accumulation)

## Dev Agent Record

_À compléter lors de l'implémentation_

## File List

_À compléter lors de l'implémentation_

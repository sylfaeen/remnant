# Story 20.1: Renouvellement et Monitoring SSL

## Story

**As a** administrateur,
**I want** que mes certificats SSL se renouvellent automatiquement,
**So that** mes domaines restent sécurisés sans intervention manuelle.

## Status

done

## Context

- Epic: 20 - Renouvellement Automatique SSL
- Dependencies: Epic 17 (domaines avec SSL activé)
- Fichiers clés:
  - Modifier: `scripts/remnant-domain.sh` — action `renew` et `check-expiry`
  - Modifier: `packages/backend/src/services/domain_service.ts` — méthodes renouvellement + vérification expiration
  - Modifier: `packages/backend/src/trpc/routers/domains.ts` — endpoints renew + expiry check
  - Modifier: `packages/frontend/src/pages/app/servers/id/settings/domains.tsx` — affichage expiration + badge warning
- Certbot installe déjà un timer systemd (`certbot.timer`) pour le renouvellement automatique
- Les certificats Let's Encrypt expirent après 90 jours
- Le renouvellement automatique certbot tourne 2x/jour et renouvelle les certs à < 30 jours d'expiration

## Acceptance Criteria

### AC1: Timer certbot
**Given** l'installation de Remnant
**When** un certificat SSL est généré
**Then** le timer systemd `certbot.timer` est vérifié actif
**And** s'il n'est pas actif, il est activé automatiquement

### AC2: Expiration dans le frontend
**Given** des domaines avec SSL
**When** la page domaines se charge
**Then** la date d'expiration est affichée pour chaque domaine
**And** un badge d'avertissement apparaît si l'expiration est dans moins de 14 jours

### AC3: Action renew manuelle
**Given** des certificats existants
**When** je clique sur "Renouveler" dans l'interface
**Then** `certbot renew` est exécuté via le script
**And** les dates d'expiration sont mises à jour en DB

### AC4: Mise à jour des dates en DB
**Given** un renouvellement certbot réussi (auto ou manuel)
**When** le certificat est renouvelé
**Then** le champ `ssl_expires_at` est mis à jour en DB

## Dev Agent Record

- Script : actions `check-expiry` (lit la date d'expiration via openssl + calcule days_left) et `ensure-timer` (vérifie/active certbot.timer)
- Service : `refreshSslExpiry(id)` met à jour ssl_expires_at en DB via check-expiry, `refreshAllSslExpiry()` itère sur tous les domaines SSL, `ensureCertbotTimer()` appelle ensure-timer
- `renewAll()` appelle désormais `refreshAllSslExpiry()` après le renew pour synchroniser les dates en DB
- Router : endpoints `refreshExpiry` et `ensureTimer`
- Hook : `useRenewSsl(serverId)` avec toast success/error
- Frontend : bouton "Renouveler SSL" dans FeatureCard.Actions (visible si au moins un domaine a SSL)
- AC2 (expiration frontend) était déjà implémenté dans Epic 17 (badge sslExpiringSoon + date)
- i18n : clés renewSsl, sslRenewed, sslRenewError (EN + FR)

## File List

- `scripts/remnant-domain.sh` — modifié (check-expiry, ensure-timer)
- `packages/backend/src/services/domain_service.ts` — modifié (refreshSslExpiry, refreshAllSslExpiry, ensureCertbotTimer)
- `packages/backend/src/trpc/routers/domains.ts` — modifié (refreshExpiry, ensureTimer)
- `packages/frontend/src/hooks/use_domains.ts` — modifié (useRenewSsl)
- `packages/frontend/src/pages/app/servers/id/settings/domains.tsx` — modifié (bouton renew)
- `packages/frontend/src/i18n/locales/en.json` — modifié
- `packages/frontend/src/i18n/locales/fr.json` — modifié

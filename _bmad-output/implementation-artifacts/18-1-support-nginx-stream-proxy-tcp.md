# Story 18.1: Support Nginx Stream pour Proxy TCP

## Story

**As a** administrateur,
**I want** configurer un domaine TCP qui proxy le trafic vers le port Minecraft,
**So that** les joueurs puissent se connecter avec `play.mydomain.com`.

## Status

done

## Context

- Epic: 18 - Proxy TCP pour Serveurs Minecraft
- Dependencies: Epic 17 (script shell + service + router + frontend existants)
- Fichiers clés:
  - Modifier: `scripts/remnant-domain.sh` — ajouter la génération de config stream
  - Modifier: `packages/backend/src/services/domain_service.ts` — supporter le type `tcp`
  - Modifier: `packages/frontend/src/pages/app/servers/id/settings/domains.tsx` — type TCP dans le formulaire
- Le module `ngx_stream_module` doit être chargé dans Nginx pour le proxy TCP
- Les configs stream vont dans `/etc/nginx/streams-available/` avec symlink dans `/etc/nginx/streams-enabled/`
- nginx.conf doit inclure un bloc `stream { include /etc/nginx/streams-enabled/*; }`
- Un SRV record DNS est recommandé en plus du A record pour les serveurs Minecraft

## Acceptance Criteria

### AC1: Module stream Nginx
**Given** l'installation Nginx
**When** le script `remnant-domain.sh` reçoit un type `tcp`
**Then** il vérifie que le module `ngx_stream_module` est chargé
**And** si non chargé, retourne une erreur JSON avec les instructions d'installation

### AC2: Config stream
**Given** un domaine de type `tcp` avec un port cible
**When** le script génère la config
**Then** un fichier stream est créé dans `/etc/nginx/streams-available/`
**And** un symlink est créé dans `/etc/nginx/streams-enabled/`
**And** il contient `server { listen <port_externe>; proxy_pass 127.0.0.1:<port_minecraft>; }`

### AC3: Frontend — Type TCP
**Given** le formulaire d'ajout de domaine (Story 17.4)
**When** je sélectionne le type "Game (TCP)"
**Then** le port par défaut est prérempli avec le port Java du serveur
**And** les DNS records affichés indiquent un SRV record en plus du A record

### AC4: nginx -t + rollback
**Given** une config stream générée
**When** `nginx -t` échoue
**Then** la config est supprimée et une erreur JSON est retournée

## Dev Agent Record

- Script `remnant-domain.sh` : ajout check_stream_module, ensure_stream_dirs, generate_tcp_stream
- action_add gère maintenant type `tcp` : crée config dans /etc/nginx/streams-available/ + symlink streams-enabled/
- action_remove nettoie les configs stream en plus des vhosts HTTP
- ensure_stream_dirs ajoute automatiquement le bloc `stream { include ... }` dans nginx.conf si absent
- Frontend DnsHelper : affiche le SRV record `_minecraft._tcp.domain` pour les domaines TCP
- Dialog d'ajout : type HTTP/TCP sélectionnable
- i18n : clé `srvHint` ajoutée (EN + FR)

## File List

- `scripts/remnant-domain.sh` — modifié (TCP stream support)
- `packages/frontend/src/pages/app/servers/id/settings/domains.tsx` — modifié (DnsHelper avec SRV)
- `packages/frontend/src/i18n/locales/en.json` — modifié (srvHint)
- `packages/frontend/src/i18n/locales/fr.json` — modifié (srvHint)

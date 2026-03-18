# Story 17.1: Script Shell Domaines Sécurisé

## Story

**As a** administrateur système,
**I want** un script shell sécurisé qui gère les vhosts Nginx et les certificats SSL,
**So that** les opérations système privilégiées sont isolées et validées.

## Status

done

## Context

- Epic: 17 - Domaines Personnalisés par Serveur
- Dependencies: Aucune — story initiale de l'epic
- Fichiers clés:
  - Créer: `scripts/remnant-domain.sh` — script shell principal
- Pattern identique à `scripts/remnant-firewall.sh` : validation stricte, actions whitelistées, sortie JSON
- Le script est exécuté via sudo par le user `remnant`
- Regex de validation domaine : `^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$`

## Acceptance Criteria

### AC1: Validation d'entrée
**Given** un appel au script avec un nom de domaine
**When** le domaine contient des caractères invalides (`;`, `|`, `&`, espaces, `..`)
**Then** le script retourne une erreur JSON et ne modifie rien

### AC2: Action add
**Given** un domaine valide et un port cible
**When** j'exécute `remnant-domain.sh add <domain> <port> <type>`
**Then** un fichier vhost est créé dans `/etc/nginx/sites-available/`
**And** un symlink est créé dans `/etc/nginx/sites-enabled/`
**And** `nginx -t` est exécuté avant le reload
**And** si `nginx -t` échoue, le vhost est supprimé et une erreur JSON est retournée

### AC3: Action remove
**Given** un domaine existant
**When** j'exécute `remnant-domain.sh remove <domain>`
**Then** le vhost et le symlink sont supprimés
**And** nginx est rechargé

### AC4: Action enable-ssl
**Given** un domaine avec un vhost actif
**When** j'exécute `remnant-domain.sh enable-ssl <domain>`
**Then** le script vérifie que le DNS pointe vers l'IP du serveur via `dig`
**And** si le DNS ne pointe pas, une erreur JSON est retournée
**And** si le DNS est correct, `certbot --nginx -d <domain>` est exécuté
**And** le résultat (succès/échec) est retourné en JSON

### AC5: Action list
**Given** des vhosts existants
**When** j'exécute `remnant-domain.sh list`
**Then** la liste des domaines avec leur statut SSL est retournée en JSON

### AC6: Action renew
**Given** des certificats existants
**When** j'exécute `remnant-domain.sh renew`
**Then** `certbot renew` est exécuté et le résultat retourné en JSON

### AC7: Protection path traversal
**Given** un domaine contenant `../` ou des chemins absolus
**When** le script construit le chemin du fichier vhost
**Then** `basename` est utilisé et le chemin résultant est vérifié dans `/etc/nginx/sites-available/`

### AC8: Types de proxy
**Given** un type `http`
**When** le vhost est généré
**Then** il contient un bloc `location / { proxy_pass http://127.0.0.1:<port>; }` avec les headers appropriés (Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto)

## Dev Agent Record

- Script `remnant-domain.sh` créé, pattern identique à `remnant-firewall.sh`
- Actions implémentées : add, remove, enable-ssl, list, renew, update-panel
- Validations : regex domaine, path traversal (basename + readlink), métacaractères shell, port range
- Vhost HTTP avec proxy headers complets (Host, X-Real-IP, X-Forwarded-For, X-Forwarded-Proto, WebSocket upgrade)
- DNS verification via dig/host/nslookup avant certbot
- nginx -t + rollback automatique sur échec
- Sortie JSON pour toutes les réponses (succès et erreurs)
- TCP proxy placeholder pour Epic 18
- Action update-panel pour modifier le server_name du vhost remnant (Epic 19)
- Syntaxe bash validée, tests d'injection validés localement (macOS), tests fonctionnels à faire sur Debian

## File List

- `scripts/remnant-domain.sh` — créé

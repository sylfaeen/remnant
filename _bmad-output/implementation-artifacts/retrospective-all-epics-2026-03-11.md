# Retrospective Condensee - Tous les Epics

**Date:** 2026-03-12 (mise a jour)
**Projet:** Remnant - Game Server Management Panel
**Epics couverts:** 1 a 8 (100% complete)

---

## Resume Executif

Le projet Remnant a ete developpe avec succes en 8 epics, livrant un panel de gestion de serveurs Minecraft complet avec authentification, controle serveur en temps reel, gestion de fichiers, plugins, taches planifiees, monitoring, scripts de deploiement, internationalisation (FR/EN) et un design system gaming moderne.

| Epic | Titre | Stories | Status |
|------|-------|---------|--------|
| 1 | Foundation & Auth | 5/5 | done |
| 2 | Controle Serveur & Console | 4/4 | done |
| 3 | Gestion Fichiers & Config | 5/5 | done |
| 4 | Plugins & Automatisation | 3/3 | done |
| 5 | Monitoring & Production | 4/4 | done |
| 6 | Deployment & DevOps | 3/3 | done |
| 7 | Internationalisation (i18n) | 5/5 | done |
| 8 | Design System & UI Polish | 7/7 | done |
| Post-MVP | Enhancements & Standards | 9 items | done |

**Total:** 36 stories implementees + 9 enhancements post-MVP

---

## Epic 1: Foundation & Authentification

### Ce qui a bien fonctionne
- Architecture monorepo Turborepo + pnpm workspaces etablie solidement
- JWT avec access/refresh token bien implemente
- Drizzle ORM avec SQLite performant et simple
- Zustand pour l'etat global cote frontend - leger et efficace

### Lecons apprises
- **Rate limiting** essentiel des le debut pour eviter les attaques brute force
- **bcrypt cost 12** suffisant pour la securite sans impacter les performances
- **Cookie httpOnly** pour le refresh token - meilleure securite que localStorage

### Decisions techniques cles
- SQLite au lieu de PostgreSQL - simplicite pour un panel single-user/small-team
- Zod pour validation partagee backend/frontend via @remnant/shared

---

## Epic 2: Controle Serveur & Console

### Ce qui a bien fonctionne
- WebSocket natif Fastify performant pour le streaming console
- ProcessManager singleton pour gerer les processus MC
- Spawn securise avec `shell: false`

### Lecons apprises
- **Historique des commandes** dans l'input console tres apprecie par les utilisateurs
- **Auto-scroll intelligent** (desactive quand l'utilisateur scroll manuellement) - detail UX important
- **Buffer limite** pour les messages console evite les problemes de memoire

### Decisions techniques cles
- @fastify/websocket (WebSocket natif) - moins de overhead, intégré nativement à Fastify
- EventEmitter pour la communication interne du ProcessManager

---

## Epic 3: Gestion Fichiers & Configuration

### Ce qui a bien fonctionne
- Protection path traversal robuste avec `path.resolve` + verification prefix
- Integration PaperMC API pour telechargement automatique des JARs
- Monaco Editor abandonne au profit d'un editeur simple - pragmatisme

### Lecons apprises
- **Path traversal** - toujours valider les chemins cote serveur, jamais faire confiance au client
- **Upload multipart** - garder en REST meme avec ts-rest (ts-rest ne supporte pas multipart)
- **Aikar Flags** en preset - les utilisateurs ne veulent pas configurer manuellement

### Decisions techniques cles
- Editeur simple CodeMirror-like au lieu de Monaco (trop lourd pour un panel)
- Presets RAM au lieu d'input libre - evite les erreurs utilisateur

---

## Epic 4: Plugins & Automatisation

### Ce qui a bien fonctionne
- node-cron pour les taches planifiees - stable et simple
- Backup via archiver - compression ZIP efficace
- UI toggle pour activer/desactiver les taches

### Lecons apprises
- **Cron expressions** difficiles pour les utilisateurs - prevoir des presets (daily, weekly)
- **Restart tasks** doivent attendre que le serveur soit completement arrete avant de redemarrer
- **Backup retention** - ajouter une limite de backups conserves pour eviter de remplir le disque

### Decisions techniques cles
- Stockage des taches en SQLite avec l'expression cron - permet persistence au redemarrage

### Technical Debt identifie
- [ ] Ajouter retention automatique des backups (supprimer les anciens)
- [ ] Ajouter presets cron dans l'UI (daily restart, weekly backup)

---

## Epic 5: Monitoring & Production

### Ce qui a bien fonctionne
- pidusage pour metriques CPU/RAM cross-platform
- Parsing logs pour detection joueurs - fonctionne avec vanilla et Paper
- Widgets monitoring integres dans la console - visibilite immediate

### Lecons apprises
- **Polling 5s** bon compromis entre reactivite et charge
- **Subscription-based** pour le WebSocket - n'envoie des metriques que si quelqu'un ecoute
- **Players parsing** doit gerer plusieurs formats de logs (vanilla, Paper, Spigot)

### Decisions techniques cles
- Metriques et joueurs via le meme WebSocket que la console - reutilisation
- Auto-start toggle dans les settings serveur - simple et efficace

### Technical Debt identifie
- [ ] Ajouter historique des metriques (graphiques sur 24h)
- [ ] Ajouter alertes (CPU > 90%, RAM > 80%)

---

## Epic 6: Deployment & DevOps

### Ce qui a bien fonctionne
- GitHub Actions workflow robuste pour releases
- Script install.sh one-liner pour Linux avec systemd
- install-local.sh pour dev sans systemd (macOS)

### Lecons apprises
- **LOCAL_SOURCE** pour dev local - evite de rebuild/push a chaque test
- **Self-contained /opt/remnant** - plus propre que disperser les fichiers
- **Reinstall prompt** - evite les suppressions accidentelles

### Decisions techniques cles
- Tarball au lieu de Docker - plus leger pour un panel simple
- Scripts bash plutot que Ansible - simplicite pour l'utilisateur final

---

## Patterns Transversaux

### Architecture
- **ts-rest** adopte en cours de projet - migration reussie de REST vers ts-rest
- **Type safety end-to-end** - Zod schemas partages, TypeScript strict
- **Monorepo** - facilite le partage de types et la coherence

### Securite
- JWT + refresh token pattern
- Rate limiting sur endpoints sensibles
- Path traversal protection
- Spawn securise des processus

### UX
- Dark theme coherent (Tailwind gray-900 base)
- Feedback immediat (loading states, toasts)
- Navigation breadcrumb sur toutes les pages
- Page 404 personnalisee

---

## Technical Debt Global

### Priorite Haute
- [ ] Tests unitaires et integration (couverture actuelle: ~0%)
- [ ] Logging structure (actuellement console.log basique)

### Priorite Moyenne
- [ ] Backup retention policy
- [ ] Metrics history avec graphiques
- [ ] Presets cron dans l'UI

### Priorite Basse
- [x] ~~Internationalisation complete~~ (Epic 7 - FR + EN complete)
- [ ] Multi-server support (actuellement single-server)
- [x] ~~Theme clair/sombre toggle~~ (Epic 8 - implementé)
- [x] ~~Standards de code~~ (7 regles + audit codebase complet)

---

## Recommandations pour la suite

1. **Tests** - Ajouter Vitest pour le backend, Playwright pour E2E
2. **Documentation** - README utilisateur avec screenshots
3. **Stabilite** - Periode de bug-fixing avant nouvelles features
4. **Feedback utilisateurs** - Deployer en beta et collecter les retours

---

## Metriques Finales

- **Commits:** ~65+ commits sur la periode
- **Functional Requirements couverts:** 40/40 (100%)
- **Stories implementees:** 36/36 (Epic 1-8)
- **Epics completes:** 8/8 (100%) - incluant i18n et Design System
- **Post-MVP enhancements:** 9 items livres

**Statut projet:** MVP COMPLET + POST-MVP ENHANCEMENTS

---

## Post-MVP Enhancements (2026-03-11)

Les features suivantes ont été ajoutées après la complétion des epics initiaux :

### Server Auto-Setup
Lors de la création d'un serveur :
- Le chemin est automatiquement généré dans `/opt/remnant/servers/{server-slug}`
- Les JARs PaperMC (latest stable) et Vanilla sont téléchargés automatiquement
- Les fichiers de configuration (`eula.txt`, `server.properties`) sont créés
- Le serveur est prêt à démarrer immédiatement

**Fichiers implémentés :**
- `packages/backend/src/services/vanilla_service.ts` - Téléchargement Vanilla via Mojang API
- `packages/backend/src/services/server_setup_service.ts` - Initialisation complète du serveur

### Server Deletion with Backup
Lors de la suppression d'un serveur :
- Dialog de confirmation explicite
- Option de créer un backup avant suppression
- Backup stocké dans `/opt/remnant/backups/`
- Suppression du dossier serveur après backup (si demandé)

**Fichiers implémentés :**
- `packages/backend/src/services/backup_service.ts` - Création backups ZIP et suppression dossiers

### Remnant Auto-Start (Story 5.4 refactored)
Au démarrage de Remnant :
- Les serveurs avec `auto_start=true` sont automatiquement démarrés
- Logs informatifs pour chaque serveur démarré
- Gestion d'erreur par serveur (un échec n'empêche pas les autres)
- Toggle dans les paramètres serveur pour activer/désactiver

**Fichiers modifiés :**
- `packages/backend/src/index.ts` - Logique auto-start au démarrage
- `packages/frontend/src/pages/server_settings.tsx` - Toggle auto-start

**Fichiers supprimés :**
- `packages/backend/src/services/systemd_service.ts` - Fonctionnalité retirée (créait confusion)
- Endpoint ts-rest `generateSystemd` - Retiré

---

## Post-MVP Phase 2 (2026-03-12)

### Frontend Architecture & Code Quality

**Restructuration frontend :**
- Reorganisation des pages en `pages/servers/id/*` (plugins, files, settings, console)
- Sidebar remplacee par une Navbar moderne
- Architecture console consolidee dans un composant unique

**Standards de code :**
- 7 regles de developpement creees dans `.claude/rules/` :
  - `react-function-declarations` - Declarations de fonctions obligatoires
  - `react-classname-cn-utility` - Utilisation de `cn()` uniquement quand necessaire
  - `tsx-jsx-curly-brace-attributes` - Attributs JSX avec accolades
  - `typescript-array-generic-syntax` - `Array<T>` au lieu de `T[]`
  - `typescript-strict-typing` - Pas de `any`, `@ts-ignore`, `@ts-nocheck`
  - `tsx-file-structure-composition` - Structure fichier, composition, props shorthand
  - `react-props-type-vs-interface` - Convention `type` vs `interface` pour les props
- Audit et mise en conformite de l'ensemble de la codebase (~80 fichiers modifies)
- Workflow `[RA] Rules Audit` ajoute a l'agent dev

**Refactoring composants :**
- Suppression `forwardRef` → React 19 ref-as-prop pattern (input.tsx, textarea.tsx)
- Conversion `className="..."` → `className={'...'}` sur ~440 occurrences
- Extraction de sous-composants monolithiques (servers, users, plugins, tasks, settings, dashboard, files)
- ESLint enrichi avec plugin unused-imports + integration Radix UI

---

*Genere automatiquement - Retrospective condensee couvrant Epic 1-8 + Post-MVP enhancements Phase 1 & 2*

---

## Addendum: Post-Retrospective Enhancements (v0.11.0 → v0.13.0)

### Phase 3: Navigation, i18n, UI Polish & PWA (2026-03-12 → 2026-03-13)

**Fonctionnalités ajoutées:**
- Sidebar navigation desktop fixe (remplacement du navbar)
- Bottom tab bar pour navigation mobile responsive
- Compound components ServerPageHeader et ServerSection
- Persistance de la langue utilisateur en base de données (colonne `locale`)
- Toasts localisés avec description par défaut
- Normalisation des bordures UI (border-black/10)
- Dialogue d'upload de fichiers amélioré
- Route Settings globale (/app/settings)
- CLI: commandes `domains` et `uninstall`
- PWA: manifest, service worker, icône SVG
- Version: v0.11.0 → v0.13.0

**Nouvelles FRs couvertes:** FR41-FR49 (backups étendus, PWA, navigation responsive, locale DB, settings page, upload dialog, CLI commands)

**État du projet:**
- 49 Functional Requirements couverts (FR1-FR49)
- 11 Epics définis, 8 complétés, 1 partiel (Epic 9), 1 backlog (Epic 10), 1 complété post-MVP (Epic 11)
- Version actuelle: v0.13.0

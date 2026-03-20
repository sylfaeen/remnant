# Story 17.4: Frontend — Page Domaines par Serveur

## Story

**As a** administrateur,
**I want** une page dans les settings serveur pour gérer les domaines,
**So that** je puisse ajouter, supprimer et activer SSL sur mes domaines.

## Status

backlog

## Context

- Epic: 17 - Domaines Personnalisés par Serveur
- Dependencies: Story 17.3 (router ts-rest)
- Fichiers clés:
  - Créer: `packages/frontend/src/pages/app/servers/id/settings/domains.tsx` — page domaines
  - Créer: `packages/frontend/src/hooks/use_domains.ts` — hooks ts-rest domaines
  - Créer: `packages/frontend/src/pages/app/servers/dialogs/add_domain_dialog.tsx` — dialog ajout
  - Modifier: route serveur pour ajouter la navigation
- Pattern identique aux pages existantes : FeatureCard, hooks ts-rest, state dans les sections
- Respecter toutes les règles `.claude/rules/` (curly braces, cn(), function declarations, etc.)

## Acceptance Criteria

### AC1: Route et navigation
**Given** la navigation serveur
**When** je clique sur "Domaines" dans le menu settings
**Then** la page `/app/servers/:id/settings/domains` s'affiche

### AC2: Liste des domaines
**Given** des domaines existants
**When** la page se charge
**Then** chaque domaine affiche : nom, port, type (badge HTTP/TCP), statut SSL (badge), date d'expiration SSL

### AC3: Ajout de domaine
**Given** le formulaire d'ajout
**When** je saisis un domaine, un port, un type, et je valide
**Then** le domaine est ajouté
**And** les DNS records à configurer sont affichés (A record → IP du serveur)

### AC4: Suppression avec confirmation
**Given** un domaine existant
**When** je clique sur supprimer
**Then** une confirmation est demandée avant la suppression

### AC5: Activation SSL
**Given** un domaine sans SSL
**When** je clique sur "Activer SSL"
**Then** une vérification DNS est faite d'abord
**And** si le DNS est OK, certbot est lancé
**And** le statut SSL est mis à jour en temps réel

### AC6: DNS records helper
**Given** un domaine ajouté
**When** le DNS ne pointe pas encore vers le serveur
**Then** un message clair indique l'A record à configurer (`domain → IP du serveur`)

### AC7: i18n
- [ ] Tous les textes utilisent `t()`
- [ ] Clés ajoutées à `en.json` et `fr.json`

## Dev Agent Record

_À compléter lors de l'implémentation_

## File List

_À compléter lors de l'implémentation_

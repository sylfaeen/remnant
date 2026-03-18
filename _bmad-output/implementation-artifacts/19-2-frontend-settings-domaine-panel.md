# Story 19.2: Frontend — Settings Domaine Panel

## Story

**As a** administrateur,
**I want** une section dans les settings globaux pour gérer le domaine du panel,
**So that** je puisse configurer et surveiller le domaine panel depuis l'interface.

## Status

done

## Context

- Epic: 19 - Domaine Personnalisé pour le Panel Remnant
- Dependencies: Story 19.1 (backend service domaine panel)
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/app/settings.tsx` (ou créer une sous-page dédiée)
  - Réutiliser: `packages/frontend/src/hooks/use_domains.ts` — hooks tRPC domaines (créé dans Story 17.4)
- Section dans les settings globaux, pas dans les settings serveur
- Respecter toutes les règles `.claude/rules/`
- Le changement de domaine panel entraîne un restart du service → avertir l'utilisateur

## Acceptance Criteria

### AC1: Section dans settings globaux
**Given** la page `/app/settings`
**When** je la visite
**Then** une section "Domaine du panel" est visible

### AC2: Formulaire domaine panel
**Given** aucun domaine panel configuré
**When** je saisis un domaine et valide
**Then** le domaine est configuré
**And** les DNS records à ajouter sont affichés (A record → IP du serveur)

### AC3: Statut SSL
**Given** un domaine panel configuré
**When** la section se charge
**Then** le statut SSL est affiché (activé/désactivé, date d'expiration)
**And** un bouton "Activer SSL" est disponible si pas encore activé

### AC4: Suppression
**Given** un domaine panel configuré
**When** je clique sur supprimer avec confirmation
**Then** le domaine est supprimé et le panel revient en mode IP

### AC5: Avertissement restart
**Given** l'activation SSL ou le changement de domaine
**When** l'opération réussit
**Then** un message informe que le service va redémarrer
**And** l'URL du panel va changer

### AC6: i18n
- [ ] Tous les textes utilisent `t()`
- [ ] Clés ajoutées à `en.json` et `fr.json`

## Dev Agent Record

_À compléter lors de l'implémentation_

## File List

_À compléter lors de l'implémentation_

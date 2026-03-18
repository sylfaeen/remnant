# Story 17.5: Installation et Sudoers Domaines

## Story

**As a** administrateur système,
**I want** que le script domaines soit installé et configuré automatiquement,
**So that** le backend puisse l'exécuter sans intervention manuelle.

## Status

backlog

## Context

- Epic: 17 - Domaines Personnalisés par Serveur
- Dependencies: Story 17.1 (script shell)
- Fichiers clés:
  - Modifier: `scripts/install.sh` — ajouter la copie du script + sudoers
  - Modifier: `scripts/update.sh` — mettre à jour le script lors des updates
- Pattern identique à l'installation du firewall (ligne 446 de install.sh)
- Le script doit être owned par root, permissions 755
- L'entrée sudoers permet au user `remnant` d'exécuter le script sans mot de passe

## Acceptance Criteria

### AC1: install.sh
**Given** l'installation de Remnant
**When** `install.sh` s'exécute
**Then** `remnant-domain.sh` est copié dans `$APP_DIR/scripts/`
**And** les permissions sont `755`, owner `root`
**And** une entrée sudoers est ajoutée : `remnant ALL=(root) NOPASSWD: $APP_DIR/scripts/remnant-domain.sh`

### AC2: update.sh
**Given** une mise à jour de Remnant
**When** `update.sh` s'exécute
**Then** le script `remnant-domain.sh` est mis à jour
**And** les permissions sudoers sont vérifiées/recréées si manquantes

## Dev Agent Record

_À compléter lors de l'implémentation_

## File List

_À compléter lors de l'implémentation_

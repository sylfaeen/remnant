# Story 21.5: Dialog création/modification de compte SFTP

## Story

**As a** administrateur,
**I want** un formulaire pour créer ou modifier un compte SFTP,
**So that** je puisse configurer les accès avec les bonnes permissions.

## Status

backlog

## Context

- Epic: 21 - Gestion des Accès SFTP
- Dependencies: Story 21.4
- Fichiers clés:
  - Créer: composant dialog dans `packages/frontend/src/pages/app/servers/id/settings/ftp.tsx` ou fichier séparé si complexe
  - Modifier: `packages/frontend/src/i18n/locales/en.json` et `fr.json` — namespace `serverSettings.ftp.*`
- Pattern existant : voir les dialogs dans `domains.tsx` et les formulaires dans `jvm.tsx`
- Utiliser le pattern Dialog + Form avec validation inline
- Le multi-input pour les chemins autorisés peut être un champ texte avec séparateur ou un composant dédié

## Acceptance Criteria

### AC1: Formulaire de création
**Given** le dialog de création ouvert
**When** le formulaire s'affiche
**Then** les champs sont : username (requis), password (requis), permissions (select : lecture seule / lecture-écriture), chemins autorisés (multi-input de chemins relatifs)

### AC2: Formulaire d'édition
**Given** le dialog d'édition ouvert
**When** le formulaire s'affiche
**Then** les champs sont pré-remplis
**And** le password est vide (laisser vide = pas de changement)

### AC3: Validation
**Given** un formulaire rempli
**When** je soumets
**Then** la validation inline vérifie les champs requis
**And** le username doit être unique pour ce serveur

### AC4: Feedback
**Given** une soumission réussie
**When** l'API répond
**Then** un feedback de succès est affiché
**And** le dialog se ferme
**And** la liste des comptes est rafraîchie

### AC5: i18n
- [ ] Tous les textes utilisent `t()` via `useTranslation()`
- [ ] Clés ajoutées à `en.json` et `fr.json` (namespace `serverSettings.ftp.*`)

## Tasks

- [ ] Créer le composant dialog SFTP (création + édition, même composant avec mode)
- [ ] Implémenter le formulaire avec react-hook-form et validation Zod
- [ ] Ajouter le select permissions (read-only / read-write)
- [ ] Implémenter le multi-input pour les chemins autorisés
- [ ] Connecter au hook tRPC (create / update)
- [ ] Ajouter les traductions en.json et fr.json

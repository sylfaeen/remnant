# Story 21.6: Informations de connexion serveur

## Story

**As a** administrateur,
**I want** voir les informations de connexion SFTP propres à chaque serveur sur la page FTP,
**So that** je puisse les communiquer aux utilisateurs.

## Status

backlog

## Context

- Epic: 21 - Gestion des Accès SFTP
- Dependencies: Story 21.4
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/app/servers/id/settings/ftp.tsx` — ajout du FeatureCard "Connexion" en haut de la page
  - Modifier: `packages/frontend/src/i18n/locales/en.json` et `fr.json` — namespace `serverSettings.ftp.*`
- Le bloc connexion affiche des informations contextuelles au serveur sélectionné
- Utiliser le pattern FeatureCard existant
- Les boutons copier utilisent l'API Clipboard du navigateur

## Acceptance Criteria

### AC1: Bloc connexion
**Given** la page FTP d'un serveur
**When** la page se charge
**Then** un `FeatureCard` "Connexion" est affiché en haut, au-dessus de la liste des comptes
**And** il affiche : hôte, port SFTP, chemin du serveur

### AC2: Boutons copier
**Given** le bloc connexion affiché
**When** je clique sur "Copier" à côté d'une information
**Then** la valeur est copiée dans le presse-papier

### AC3: Contexte serveur
**Given** la page FTP d'un serveur spécifique
**Then** les informations affichées sont contextuelles au serveur sélectionné (chemin propre au serveur)

### AC4: i18n
- [ ] Tous les textes utilisent `t()` via `useTranslation()`
- [ ] Clés ajoutées à `en.json` et `fr.json` (namespace `serverSettings.ftp.*`)

## Tasks

- [ ] Ajouter le FeatureCard "Connexion" en haut de la page FTP
- [ ] Afficher hôte, port, chemin serveur avec valeurs dynamiques
- [ ] Implémenter les boutons copier (Clipboard API)
- [ ] Ajouter les traductions en.json et fr.json

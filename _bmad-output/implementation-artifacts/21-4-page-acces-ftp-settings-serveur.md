# Story 21.4: Page "Accès FTP" dans les paramètres serveur

## Story

**As a** administrateur,
**I want** une page dédiée dans les paramètres serveur pour gérer les comptes SFTP,
**So that** je puisse créer, modifier et supprimer des accès SFTP pour chaque serveur.

## Status

backlog

## Context

- Epic: 21 - Gestion des Accès SFTP
- Dependencies: Story 21.3
- Fichiers clés:
  - Créer: `packages/frontend/src/pages/app/servers/id/settings/ftp.tsx` — page FTP
  - Modifier: `packages/frontend/src/routes.tsx` — ajout route `/app/servers/$id/settings/ftp`
  - Modifier: `packages/frontend/src/pages/app/features/layouts/server_layout.tsx` — ajout entrée sidebar
  - Créer: `packages/frontend/src/hooks/use_sftp.ts` — hooks tRPC pour SFTP
  - Modifier: `packages/frontend/src/i18n/locales/en.json` et `fr.json` — namespace `serverSettings.ftp.*`
- Pattern existant : voir `firewall.tsx` et `domains.tsx` pour la structure des pages settings serveur
- Utiliser le compound pattern `FeatureCard` et `ServerPageHeader`

## Acceptance Criteria

### AC1: Navigation et routing
**Given** la sidebar serveur
**When** la page se charge
**Then** une entrée "FTP" apparaît dans Settings (entre Firewall et Domains)
**And** la route `/app/servers/$id/settings/ftp` est fonctionnelle

### AC2: Page header
**Given** la page FTP
**When** elle se charge
**Then** un `ServerPageHeader` avec icône, titre "Accès FTP" et description est affiché

### AC3: Liste des comptes
**Given** des comptes SFTP existants pour le serveur
**When** la page se charge
**Then** un `FeatureCard` "Comptes SFTP" affiche la liste des comptes
**And** chaque ligne affiche : username, permissions (badge), chemins autorisés, date de création
**And** des actions modifier et supprimer (avec confirmation) sont disponibles par ligne

### AC4: Bouton ajout
**Given** la page FTP
**When** je clique sur "Ajouter un compte"
**Then** le dialog de création s'ouvre (Story 21.5)

### AC5: i18n
- [ ] Tous les textes utilisent `t()` via `useTranslation()`
- [ ] Clés ajoutées à `en.json` et `fr.json` (namespace `serverSettings.ftp.*`)

## Tasks

- [ ] Créer le hook `use_sftp.ts` (useSftpAccounts, useCreateSftpAccount, useUpdateSftpAccount, useDeleteSftpAccount)
- [ ] Créer la page `ftp.tsx` avec ServerPageHeader et FeatureCard
- [ ] Ajouter la route dans `routes.tsx`
- [ ] Ajouter l'entrée navigation dans `server_layout.tsx`
- [ ] Implémenter la liste des comptes avec actions (modifier, supprimer avec confirmation)
- [ ] Ajouter les traductions en.json et fr.json

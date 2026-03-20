# Story 21.3: Gestion système des utilisateurs SFTP

## Story

**As a** système,
**I want** que les opérations CRUD déclenchent la création/modification/suppression réelle des utilisateurs SFTP sur le serveur,
**So that** les comptes soient fonctionnels immédiatement.

## Status

backlog

## Context

- Epic: 21 - Gestion des Accès SFTP
- Dependencies: Story 21.2
- Fichiers clés:
  - Créer: `scripts/remnant-sftp.sh` — script shell pour gestion utilisateurs SFTP
  - Modifier: `packages/backend/src/services/sftp_service.ts` — méthodes système (create/update/delete user)
  - Modifier: `scripts/install.sh` — ajout sudoers pour le script sftp
- Pattern existant : voir `scripts/remnant-domain.sh` et `scripts/remnant-firewall.sh` pour l'approche script + sudoers
- Les utilisateurs SFTP sont chroot dans le dossier du serveur Minecraft
- OpenSSH avec configuration SFTP subsystem (Match Group ou Match User)

## Acceptance Criteria

### AC1: Création utilisateur système
**Given** une requête de création de compte SFTP
**When** le backend traite la requête
**Then** un utilisateur système SFTP est créé avec les bons droits
**And** le home directory est restreint au dossier du serveur Minecraft concerné (chroot)

### AC2: Modification permissions
**Given** une requête de modification d'un compte SFTP
**When** les permissions sont mises à jour
**Then** les droits fichiers/dossiers sont mis à jour sur le système

### AC3: Suppression utilisateur
**Given** une requête de suppression d'un compte SFTP
**When** le backend traite la requête
**Then** l'utilisateur système est supprimé

### AC4: Restriction par chemins
**Given** un compte SFTP avec `allowed_paths` définis
**When** l'utilisateur se connecte en SFTP
**Then** l'accès est restreint aux sous-dossiers spécifiés
**And** si `allowed_paths` est vide, l'accès au dossier racine du serveur est accordé

### AC5: Gestion d'erreurs
**Given** une opération système qui échoue
**When** le backend détecte l'erreur
**Then** un message d'erreur explicite est renvoyé au frontend

## Tasks

- [ ] Créer le script `remnant-sftp.sh` (create-user, update-user, delete-user, update-permissions)
- [ ] Configurer le chroot SFTP dans sshd_config (Match Group)
- [ ] Implémenter les appels système dans `sftp_service.ts`
- [ ] Ajouter l'entrée sudoers pour le script dans `install.sh`
- [ ] Gérer les allowed_paths via symlinks ou configuration ACL
- [ ] Tester en environnement réel (création, connexion SFTP, restrictions)

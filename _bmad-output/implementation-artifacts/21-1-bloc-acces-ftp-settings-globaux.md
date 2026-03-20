# Story 21.1: Bloc "Accès FTP" dans les paramètres globaux

## Story

**As a** administrateur,
**I want** voir un bloc récapitulatif de la connexion SFTP remnant dans les paramètres globaux et pouvoir modifier le mot de passe,
**So that** je connaisse les informations de connexion du compte principal et puisse le sécuriser.

## Status

backlog

## Context

- Epic: 21 - Gestion des Accès SFTP
- Dependencies: Epic 9 (page settings globale existante)
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/app/settings/general.tsx` — ajout du FeatureCard "Accès FTP"
  - Créer: `packages/backend/src/routes/handlers/sftp.ts` — endpoint `sftp.changeRemnantPassword`
  - Modifier: `packages/backend/src/routes/handlers/index.ts` — enregistrement du router sftp
  - Modifier: `packages/frontend/src/i18n/locales/en.json` et `fr.json` — namespace `appSettings.ftp.*`
- Le mot de passe remnant est défini à l'installation et n'est pas stocké en DB
- Le changement de mot de passe utilise `chpasswd` via sudo en root
- Le bloc est principalement read-only sauf pour l'action de changement de mot de passe

## Acceptance Criteria

### AC1: Affichage du bloc Accès FTP
**Given** la page Settings > General
**When** la page se charge
**Then** un FeatureCard "Accès FTP" est affiché
**And** il affiche : hôte, port SFTP, utilisateur (`remnant`)
**And** le mot de passe est masqué (dots/bullets), jamais révélé

### AC2: Dialog modification du mot de passe
**Given** le bloc "Accès FTP" affiché
**When** je clique sur "Modifier le mot de passe"
**Then** un dialog s'ouvre avec les champs : nouveau mot de passe (requis), confirmation (requis)
**And** la validation inline vérifie la longueur minimale et la correspondance des champs

### AC3: Changement de mot de passe système
**Given** le dialog de modification rempli correctement
**When** je valide le formulaire
**Then** un endpoint backend exécute le changement de mot de passe système en root
**And** un feedback de succès "Mot de passe modifié" est affiché
**And** en cas d'erreur système, un message d'erreur explicite est affiché

### AC4: Sécurité mot de passe
**Given** l'opération de changement de mot de passe
**Then** aucun mot de passe (ancien ou nouveau) n'est stocké en DB côté panel
**And** l'opération est purement système (chpasswd via sudo)

### AC5: i18n
- [ ] Tous les textes utilisent `t()` via `useTranslation()`
- [ ] Clés ajoutées à `en.json` et `fr.json` (namespace `appSettings.ftp.*`)

## Tasks

- [ ] Créer le service backend `sftp_service.ts` avec méthode `changeRemnantPassword`
- [ ] Créer le router ts-rest `sftp.ts` avec endpoint `changeRemnantPassword`
- [ ] Enregistrer le router dans `index.ts`
- [ ] Ajouter le FeatureCard "Accès FTP" dans `general.tsx`
- [ ] Créer le dialog de changement de mot de passe
- [ ] Ajouter les traductions en.json et fr.json
- [ ] Tester le changement de mot de passe en environnement réel

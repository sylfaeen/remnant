---
stepsCompleted: [1, 2, 3, 4]
workflowComplete: true
status: complete
completedAt: '2026-03-10'
inputDocuments:
  - /Users/louis/Herd/remnant/_bmad-output/planning-artifacts/product-brief-remnant-2026-03-10.md
  - /Users/louis/Herd/remnant/_bmad-output/planning-artifacts/architecture.md
date: 2026-03-10
---

# Remnant - Epic Breakdown

## Overview

Ce document décompose les requirements du Product Brief et de l'Architecture en epics et stories implémentables pour le développement de Remnant.

---

## Implementation Standards

### Mandatory i18n Requirement

**CRITICAL:** Since Epic 7 completion, ALL frontend development MUST include translation support.

**For EVERY new frontend component, page, or feature:**
1. Import `useTranslation` from 'react-i18next'
2. Use `t()` function for ALL user-facing text
3. Add translation keys to BOTH `en.json` AND `fr.json`
4. NO hardcoded strings allowed in JSX

**Example:**
```typescript
// ✅ CORRECT
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('myFeature.title')}</h1>;
}

// ❌ WRONG - hardcoded string
export function MyComponent() {
  return <h1>My Title</h1>;
}
```

**Translation File Locations:**
- `packages/frontend/src/i18n/locales/en.json`
- `packages/frontend/src/i18n/locales/fr.json`

**Acceptance Criteria Addition:** Every frontend story MUST include:
- [ ] All UI text uses `t()` function
- [ ] Translation keys added to `en.json`
- [ ] Translation keys added to `fr.json`

---

## Requirements Inventory

### Functional Requirements

**Gestion du Serveur:**
- FR1: Démarrer le serveur Minecraft depuis le panel
- FR2: Arrêter le serveur Minecraft depuis le panel
- FR3: Redémarrer le serveur Minecraft depuis le panel
- FR4: Configurer le démarrage automatique des serveurs avec Remnant

**Console en Temps Réel:**
- FR5: Afficher les logs du serveur en streaming temps réel via WebSocket natif Fastify
- FR6: Envoyer des commandes Minecraft depuis le panel
- FR7: Interface console réactive et fluide

**Gestion des Fichiers:**
- FR8: Naviguer dans l'arborescence des fichiers du serveur
- FR9: Éditer les fichiers de configuration avec éditeur de code intégré
- FR10: Uploader des fichiers vers le serveur
- FR11: Supprimer des fichiers du serveur
- FR12: Protection contre le path traversal

**Configuration du Serveur:**
- FR13: Sélectionner et gérer le fichier JAR serveur
- FR14: Télécharger automatiquement le JAR PaperMC depuis l'API officielle
- FR15: Configurer les flags JVM (mémoire, flags Aikar)
- FR16: Configurer les ports (Java 25565, Bedrock/Geyser 19132)

**Gestion des Plugins:**
- FR17: Uploader des fichiers .jar de plugins
- FR18: Lister les plugins installés

**Tâches Planifiées:**
- FR19: Planifier des redémarrages automatiques
- FR20: Planifier des backups automatiques

**Monitoring:**
- FR21: Afficher l'utilisation RAM et CPU du serveur
- FR22: Afficher la liste des joueurs connectés en temps réel

**Deployment & DevOps:**
- FR27: Automatiser les builds et releases via GitHub Actions
- FR28: Installer Remnant en une commande sur Linux avec systemd
- FR29: Script d'installation locale pour développement (macOS/Linux)

**Authentification & Utilisateurs:**
- FR23: Authentifier les utilisateurs avec JWT
- FR24: Gérer plusieurs utilisateurs avec permissions directes
- FR25: Créer un administrateur par défaut à l'installation
- FR26: Se déconnecter du panel

**Internationalisation:**
- FR30: Configurer react-i18next avec structure de traductions
- FR31: Traduire les éléments de navigation et layout
- FR32: Traduire les pages principales du panel
- FR33: Traduire les formulaires, modals et notifications
- FR34: Permettre à l'utilisateur de changer la langue

**Design System & UI:**
- FR35: Creer un design system avec palette gaming, typographie et espacements
- FR36: Refondre les composants UI avec style immersif
- FR37: Redesigner le layout et la navigation avec transitions fluides
- FR38: Creer un dashboard visuellement impactant avec widgets animes
- FR39: Implementer les themes dark et light avec persistance
- FR40: Ajouter des micro-interactions et animations de feedback

**Backups:**
- FR41: Créer des backups sélectifs avec choix des fichiers/dossiers
- FR42: Visualiser, télécharger et supprimer les backups depuis une page dédiée

**Progressive Web App:**
- FR43: Rendre l'application installable via PWA (manifest, service worker)

**Expérience Utilisateur:**
- FR44: Navigation responsive avec sidebar desktop et bottom tab bar mobile
- FR45: Persistance de la langue utilisateur en base de données
- FR46: Page Settings globale accessible depuis la navigation principale
- FR47: Dialogue d'upload de fichiers avec sélection et destination

**CLI:**
- FR48: Commande `remnant domains` pour diagnostiquer les configurations Nginx et SSL
- FR49: Commande `remnant uninstall` pour désinstallation complète

**Firewall:**
- FR50: Script shell sécurisé pour gérer les règles firewall (ufw, firewalld, iptables)
- FR51: Table et service backend pour persister et synchroniser les règles firewall par serveur
- FR52: Router tRPC pour exposer les opérations firewall au frontend
- FR53: Interface UI dans les settings serveur pour ajouter/supprimer/toggle des règles firewall
- FR54: Installation automatique du script firewall et configuration sudoers

**Authentification à Deux Facteurs:**
- FR55: Activer le 2FA TOTP avec QR code et saisie manuelle du secret
- FR56: Valider le code TOTP lors du login (flow en deux étapes)
- FR57: Générer et gérer des recovery codes à usage unique
- FR58: Désactiver le 2FA depuis les paramètres du compte

**Documentation Interne:**
- FR59: Afficher la documentation markdown avec rendu riche (GFM, code blocks, admonitions VitePress)
- FR60: Naviguer dans la documentation via une sidebar dédiée avec retour vers l'application
- FR61: Chaque page de documentation possède sa propre URL partageable
- FR62: Les liens de documentation existants dans l'app pointent vers la doc interne

### NonFunctional Requirements

**Sécurité:**
- NFR1: Access token JWT de 15 minutes + refresh token en cookie httpOnly
- NFR2: Rate limiting sur /login (5 req/min par IP)
- NFR3: Hashage des mots de passe avec bcrypt (cost >= 12)
- NFR4: Spawn sécurisé des processus (shell: false)
- NFR5: Validation des chemins contre le path traversal
- NFR6: Permission guards sur toutes les routes protégées

**Performance:**
- NFR7: Panel léger consommant moins de 100MB RAM
- NFR8: Interface réactive sans lag perceptible

**Fiabilité:**
- NFR9: Panel stable fonctionnant 24/7 sans crash
- NFR10: Gestion gracieuse des erreurs avec recovery

**Maintenabilité:**
- NFR11: TypeScript strict sur tout le codebase
- NFR12: Architecture modulaire et testable

### Additional Requirements

**Architecture Starter Template:**
- Monorepo Turborepo + pnpm workspaces (packages: backend, frontend, shared)
- Backend: Fastify + WebSocket natif + Drizzle ORM + SQLite
- Frontend: React + Vite + Tailwind CSS + Zustand + TanStack Query
- Types partagés via @remnant/shared

**Infrastructure:**
- GitHub Actions CI/CD (lint, test, build)
- Logging avec pino
- Validation avec Zod (partagée backend/frontend)
- Conventions: snake_case fichiers, imports absolus, ErrorCodes centralisés

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Démarrer le serveur |
| FR2 | Epic 2 | Arrêter le serveur |
| FR3 | Epic 2 | Redémarrer le serveur |
| FR4 | Epic 5 | Auto-start Remnant |
| FR5 | Epic 2 | Logs streaming temps réel |
| FR6 | Epic 2 | Envoi de commandes |
| FR7 | Epic 2 | Interface console réactive |
| FR8 | Epic 3 | Navigation fichiers |
| FR9 | Epic 3 | Édition avec éditeur de code intégré |
| FR10 | Epic 3 | Upload fichiers |
| FR11 | Epic 3 | Suppression fichiers |
| FR12 | Epic 3 | Protection path traversal |
| FR13 | Epic 3 | Gestion JAR |
| FR14 | Epic 3 | Téléchargement PaperMC |
| FR15 | Epic 3 | Configuration JVM flags |
| FR16 | Epic 3 | Configuration ports |
| FR17 | Epic 4 | Upload plugins |
| FR18 | Epic 4 | Liste plugins |
| FR19 | Epic 4 | Redémarrages planifiés |
| FR20 | Epic 4 | Backups planifiés |
| FR21 | Epic 5 | Monitoring CPU/RAM |
| FR22 | Epic 5 | Liste joueurs connectés |
| FR23 | Epic 1 | Authentification JWT |
| FR24 | Epic 1 | Multi-user avec permissions |
| FR25 | Epic 1 | Admin par défaut |
| FR26 | Epic 1 | Déconnexion |
| FR27 | Epic 6 | CI/CD GitHub Actions |
| FR28 | Epic 6 | Installation Linux one-command |
| FR29 | Epic 6 | Installation locale dev |
| FR30 | Epic 7 | Setup react-i18next |
| FR31 | Epic 7 | Traduction navigation/layout |
| FR32 | Epic 7 | Traduction pages principales |
| FR33 | Epic 7 | Traduction formulaires/modals |
| FR34 | Epic 7 | Sélecteur de langue |
| FR35 | Epic 8 | Design system foundation |
| FR36 | Epic 8 | Component library polish |
| FR37 | Epic 8 | Layout & navigation redesign |
| FR38 | Epic 8 | Dashboard visual identity |
| FR39 | Epic 8 | Dark/Light theme |
| FR40 | Epic 8 | Micro-interactions & animations |
| FR41 | Epic 11 | Backup sélectif |
| FR42 | Epic 11 | Page backups dédiée |
| FR43 | Post-MVP | PWA installable |
| FR44 | Post-MVP | Navigation responsive sidebar + mobile |
| FR45 | Post-MVP | Persistance langue en DB |
| FR46 | Post-MVP | Page Settings globale |
| FR47 | Post-MVP | Dialogue upload fichiers |
| FR48 | Post-MVP | CLI domains diagnostic |
| FR49 | Post-MVP | CLI uninstall |
| FR50 | Epic 12 | Script shell firewall sécurisé |
| FR51 | Epic 12 | Service backend firewall |
| FR52 | Epic 12 | Router tRPC firewall |
| FR53 | Epic 12 | UI firewall dans server settings |
| FR54 | Epic 12 | Installation script firewall + sudoers |
| FR55 | Epic 14 | 2FA TOTP avec QR code et saisie manuelle |
| FR56 | Epic 14 | Validation TOTP au login (flow deux étapes) |
| FR57 | Epic 14 | Recovery codes à usage unique |
| FR58 | Epic 14 | Désactivation 2FA depuis les settings |
| FR59 | Epic 15 | Rendu markdown riche avec admonitions VitePress |
| FR60 | Epic 15 | Sidebar documentation avec retour app |
| FR61 | Epic 15 | URLs individuelles par page docs |
| FR62 | Epic 15 | DocsLink pointe vers doc interne |

## Epic List

### Epic 1: Foundation & Authentification
L'administrateur peut accéder au panel de manière sécurisée et gérer les utilisateurs.
**FRs couverts:** FR23, FR24, FR25, FR26

### Epic 2: Contrôle Serveur & Console
L'administrateur peut démarrer/arrêter le serveur et voir ce qui se passe en temps réel.
**FRs couverts:** FR1, FR2, FR3, FR5, FR6, FR7

### Epic 3: Gestion Fichiers & Configuration
L'administrateur peut naviguer, éditer les fichiers et configurer le serveur.
**FRs couverts:** FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16

### Epic 4: Plugins & Automatisation
L'administrateur peut gérer les plugins et automatiser les tâches de maintenance.
**FRs couverts:** FR17, FR18, FR19, FR20

### Epic 5: Monitoring & Production
L'administrateur peut surveiller la santé du serveur et le mettre en production.
**FRs couverts:** FR4, FR21, FR22

### Epic 6: Deployment & DevOps
L'administrateur peut installer Remnant facilement et les releases sont automatisées.
**FRs couverts:** FR27, FR28, FR29

### Epic 7: Internationalisation (i18n)
L'administrateur peut utiliser Remnant dans sa langue préférée.
**FRs couverts:** FR30, FR31, FR32, FR33, FR34

### Epic 8: Design System & UI Polish
L'interface Remnant devient une experience visuelle immersive et moderne, style gaming.
**FRs couverts:** FR35, FR36, FR37, FR38, FR39, FR40

### Epic 9: Page Settings Globale — Generation Systemd
L'administrateur peut acceder a une page Settings globale. La route `/app/settings` est implementee. La generation systemd depuis cette page est obsolete (voir Story 5.4).
**FRs couverts:** FR28 (complement), FR46

### Epic 10: Gestion des Versions Java
L'administrateur peut voir les JRE pre-installes et assigner une version a chaque serveur.
**FRs couverts:** Nouveau requirement — gestion multi-Java

### Epic 11: Gestion des Backups
L'administrateur dispose d'une page dédiée pour créer, visualiser, télécharger et supprimer les backups de ses serveurs, avec la possibilité de sélectionner les fichiers/dossiers à inclure.
**FRs couverts:** FR20 (extension), nouveau requirement — page backups dédiée, backup sélectif

### Epic 12: Gestion Firewall par Serveur
L'administrateur peut ouvrir et fermer des ports depuis les paramètres d'un serveur, permettant aux plugins (GeyserMC, BlueMap, Dynmap, etc.) de fonctionner sans intervention SSH.
**FRs couverts:** FR50, FR51, FR52, FR53, FR54

### Epic 14: Authentification à Deux Facteurs (TOTP)
L'administrateur peut activer le 2FA TOTP sur son compte pour sécuriser l'accès au panel, via scan de QR code ou saisie manuelle du secret dans un gestionnaire de mots de passe.
**FRs couverts:** FR55, FR56, FR57, FR58

### Epic 15: Documentation Interne Intégrée
L'utilisateur peut consulter la documentation complète directement dans l'application, sans quitter son contexte, avec une sidebar de navigation dédiée et un rendu markdown s'inspirant de VitePress pour le style des éléments markdown uniquement (headings, tables, code blocks, admonitions).
**FRs couverts:** FR59, FR60, FR61, FR62

---

## Epic 1: Foundation & Authentification

L'administrateur peut accéder au panel de manière sécurisée et gérer les utilisateurs.

### Story 1.1: Setup Monorepo Foundation

#### Story

**As a** developpeur,
**I want** initialiser le monorepo Turborepo avec les 3 packages,
**So that** la structure de base permette le developpement parallele backend/frontend.

#### Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Aucune - story initiale

#### Acceptance Criteria

##### AC1: Monorepo initialise
**Given** un dossier projet vide
**When** j'execute les commandes d'initialisation
**Then** le monorepo Turborepo est cree avec pnpm workspaces
**And** les packages backend, frontend, shared existent avec leur tsconfig
**And** `turbo dev` lance les 3 packages en parallele

---

### Story 1.2: Database Schema & Admin Setup

#### Story

**As a** administrateur,
**I want** que la base de donnees soit initialisee avec un admin par defaut,
**So that** je puisse me connecter des la premiere utilisation.

#### Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1-1 completed

#### Acceptance Criteria

##### AC1: Admin par defaut cree
**Given** le backend demarre pour la premiere fois
**When** aucun utilisateur n'existe en base
**Then** un admin par defaut est cree (username: admin, password: password)
**And** les tables users et sessions existent avec le schema Drizzle
**And** le mot de passe est hashe avec bcrypt (cost >= 12)

---

### Story 1.3: User Login API

#### Story

**As a** administrateur,
**I want** m'authentifier via l'API,
**So that** j'obtienne un token d'acces securise.

#### Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1-2 completed

#### Acceptance Criteria

##### AC1: Login avec credentials valides
**Given** un utilisateur existe en base
**When** je POST /api/auth/login avec credentials valides
**Then** je recois un access token JWT (15 min)
**And** un refresh token est stocke en cookie httpOnly
**And** le rate limiting bloque apres 5 tentatives/min

##### AC2: Login avec credentials invalides
**Given** des credentials invalides
**When** je POST /api/auth/login
**Then** je recois une erreur 401 avec code AUTH_INVALID_CREDENTIALS

---

### Story 1.4: Login Page & Auth State

#### Story

**As a** administrateur,
**I want** une page de login avec gestion d'etat,
**So that** je puisse acceder au panel de maniere fluide.

#### Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1-3 completed

#### Acceptance Criteria

##### AC1: Redirection vers login
**Given** je ne suis pas connecte
**When** j'accede au panel
**Then** je suis redirige vers /login

##### AC2: Login et redirection dashboard
**Given** je suis sur /login
**When** je soumets des credentials valides
**Then** je suis redirige vers le dashboard
**And** mon etat auth est persiste dans Zustand

---

### Story 1.5: User Management

#### Story

**As a** administrateur,
**I want** gerer les utilisateurs et leurs permissions,
**So that** je puisse deleguer l'acces au panel.

#### Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1-4 completed

#### Acceptance Criteria

##### AC1: Liste des utilisateurs
**Given** je suis admin connecte
**When** j'accede a /users
**Then** je vois la liste des utilisateurs avec leurs permissions

##### AC2: Creation d'utilisateur
**Given** je cree un nouvel utilisateur
**When** je soumets le formulaire
**Then** l'utilisateur est cree avec les permissions selectionnees
**And** son mot de passe est hashe

---

## Epic 2: Controle Serveur & Console

L'administrateur peut demarrer/arreter le serveur et voir ce qui se passe en temps reel.

### Story 2.1: Server Process Management API

#### Story

**As a** administrateur,
**I want** controler le processus serveur Minecraft via l'API,
**So that** je puisse demarrer, arreter et redemarrer le serveur.

#### Context

- Epic: 2 - Controle Serveur & Console
- Dependencies: Epic 1 completed

#### Acceptance Criteria

##### AC1: Demarrage du serveur
**Given** le serveur est arrete
**When** je POST /api/servers/:id/start
**Then** le processus Java est spawne avec les flags JVM configures
**And** le PID est stocke pour le suivi
**And** shell: false est utilise pour la securite

##### AC2: Arret du serveur
**Given** le serveur est en cours d'execution
**When** je POST /api/servers/:id/stop
**Then** le processus recoit SIGTERM puis SIGKILL apres timeout
**And** le statut passe a "stopped"

##### AC3: Redemarrage du serveur
**Given** le serveur est en cours d'execution
**When** je POST /api/servers/:id/restart
**Then** le serveur s'arrete puis redemarre automatiquement

---

### Story 2.2: Server Control UI

#### Story

**As a** administrateur,
**I want** une interface pour controler le serveur,
**So that** je puisse gerer le serveur visuellement.

#### Context

- Epic: 2 - Controle Serveur & Console
- Dependencies: Story 2-1 completed

#### Acceptance Criteria

##### AC1: Affichage statut et controles
**Given** je suis sur le dashboard
**When** je vois les controles serveur
**Then** je vois le statut actuel (running/stopped)
**And** les boutons Start/Stop/Restart sont affiches selon l'etat

##### AC2: Feedback visuel au demarrage
**Given** je clique sur Start
**When** le serveur demarre
**Then** le bouton devient disabled pendant le demarrage
**And** le statut se met a jour en temps reel

---

### Story 2.3: Console WebSocket Backend

#### Story

**As a** administrateur,
**I want** recevoir les logs en temps reel via WebSocket,
**So that** je puisse suivre l'activite du serveur.

#### Context

- Epic: 2 - Controle Serveur & Console
- Dependencies: Story 2-1 completed

#### Acceptance Criteria

##### AC1: Reception des logs
**Given** je suis connecte au WebSocket avec un JWT valide
**When** le serveur Minecraft ecrit sur stdout/stderr
**Then** je recois l'evenement console:output avec le contenu

##### AC2: Envoi de commandes
**Given** je suis connecte au WebSocket
**When** j'envoie console:input avec une commande
**Then** la commande est ecrite sur stdin du processus MC
**And** la reponse apparait dans console:output

---

### Story 2.4: Console UI

#### Story

**As a** administrateur,
**I want** une interface console interactive,
**So that** je puisse voir les logs et envoyer des commandes.

#### Context

- Epic: 2 - Controle Serveur & Console
- Dependencies: Story 2-3 completed

#### Acceptance Criteria

##### AC1: Affichage des logs temps reel
**Given** je suis sur la page console
**When** le serveur envoie des logs
**Then** les logs s'affichent en temps reel avec scroll automatique
**And** les anciens logs sont conserves dans un buffer limite

##### AC2: Envoi de commandes via UI
**Given** je tape une commande dans l'input
**When** j'appuie sur Entree
**Then** la commande est envoyee au serveur
**And** l'input est vide
**And** la commande apparait dans les logs

---

## Epic 3: Gestion Fichiers & Configuration

L'administrateur peut naviguer, editer les fichiers et configurer le serveur.

### Story 3.1: File Browser API

#### Story

**As a** administrateur,
**I want** naviguer dans les fichiers du serveur via l'API,
**So that** je puisse acceder a la configuration.

#### Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Epic 1 completed (auth)

#### Acceptance Criteria

##### AC1: Liste des fichiers
**Given** je suis authentifie
**When** je GET /api/files?path=/
**Then** je recois la liste des fichiers et dossiers a la racine du serveur

##### AC2: Protection path traversal
**Given** un chemin contenant "../"
**When** je fais une requete sur ce chemin
**Then** je recois une erreur 403 FILE_PATH_FORBIDDEN

##### AC3: Lecture de fichier
**Given** je POST /api/files/read avec un chemin valide
**When** le fichier existe
**Then** je recois le contenu du fichier

---

### Story 3.2: File Browser UI

#### Story

**As a** administrateur,
**I want** une interface de navigation de fichiers,
**So that** je puisse explorer l'arborescence visuellement.

#### Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Story 3-1 completed

#### Acceptance Criteria

##### AC1: Affichage arborescence
**Given** je suis sur la page fichiers
**When** la page charge
**Then** je vois l'arborescence du dossier serveur

##### AC2: Navigation dans les dossiers
**Given** je clique sur un dossier
**When** le dossier s'ouvre
**Then** son contenu s'affiche en dessous

##### AC3: Ouverture fichier dans editeur
**Given** je clique sur un fichier texte
**When** le fichier est selectionne
**Then** il s'ouvre dans l'editeur de code integre

---

### Story 3.3: File Editor & Operations

#### Story

**As a** administrateur,
**I want** editer et gerer les fichiers,
**So that** je puisse modifier la configuration du serveur.

#### Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Story 3-2 completed

#### Acceptance Criteria

##### AC1: Sauvegarde de fichier
**Given** un fichier est ouvert dans l'editeur de code integre
**When** je modifie et sauvegarde (Ctrl+S)
**Then** le fichier est ecrit sur le disque via l'API
**And** une notification de succes s'affiche

##### AC2: Suppression de fichier
**Given** je selectionne un fichier
**When** je clique sur Supprimer et confirme
**Then** le fichier est supprime du serveur

##### AC3: Upload de fichier
**Given** je suis dans un dossier
**When** je drag & drop un fichier
**Then** le fichier est uploade dans ce dossier

---

### Story 3.4: Server JAR Management

#### Story

**As a** administrateur,
**I want** gerer le fichier JAR du serveur,
**So that** je puisse choisir la version de Minecraft.

#### Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Story 3-1 completed

#### Acceptance Criteria

##### AC1: Affichage JAR actuel
**Given** je suis sur la page settings
**When** je vois la section JAR
**Then** le JAR actuel est affiche avec sa version

##### AC2: Telechargement PaperMC
**Given** je clique sur "Telecharger PaperMC"
**When** je selectionne une version
**Then** le JAR est telecharge depuis l'API PaperMC
**And** une barre de progression s'affiche
**And** le JAR est configure comme actif

---

### Story 3.5: JVM & Port Configuration

#### Story

**As a** administrateur,
**I want** configurer les parametres JVM et les ports,
**So that** je puisse optimiser les performances du serveur.

#### Context

- Epic: 3 - Gestion Fichiers & Configuration
- Dependencies: Story 3-4 completed

#### Acceptance Criteria

##### AC1: Configuration memoire RAM
**Given** je suis sur la page settings
**When** je modifie la memoire RAM (min/max)
**Then** les flags -Xms et -Xmx sont mis a jour

##### AC2: Activation Aikar Flags
**Given** je coche "Utiliser Aikar Flags"
**When** je sauvegarde
**Then** les flags Aikar sont ajoutes a la config

##### AC3: Configuration des ports
**Given** je modifie le port Java ou Bedrock
**When** je sauvegarde
**Then** les ports sont mis a jour dans server.properties

##### AC4: Unicité des ports entre serveurs
**Given** plusieurs serveurs existent dans Remnant
**When** un nouveau serveur est créé sans port explicite
**Then** le prochain port disponible est automatiquement assigné (25565, 25566, 25567...)
**And** la base de données impose une contrainte UNIQUE sur `java_port`
**And** un port déjà utilisé par un autre serveur est rejeté avec erreur `PORT_ALREADY_IN_USE`
**And** la mise à jour du port régénère automatiquement `server.properties`

---

## Epic 4: Plugins & Automatisation

L'administrateur peut gerer les plugins et automatiser les taches de maintenance.

### Story 4.1: Plugin Management

#### Story

**As a** administrateur,
**I want** gerer les plugins du serveur,
**So that** je puisse etendre les fonctionnalites.

#### Context

- Epic: 4 - Plugins & Automatisation
- Dependencies: Epic 3 completed (file management)

#### Acceptance Criteria

##### AC1: Liste des plugins
**Given** je suis sur la page plugins
**When** la page charge
**Then** je vois la liste des fichiers .jar dans le dossier plugins

##### AC2: Upload de plugin
**Given** je drag & drop un fichier .jar
**When** l'upload termine
**Then** le plugin apparait dans la liste
**And** un message indique qu'un restart est necessaire

##### AC3: Suppression de plugin
**Given** je selectionne un plugin
**When** je clique sur Supprimer
**Then** le fichier .jar est supprime du dossier plugins

---

### Story 4.2: Scheduled Tasks Backend

#### Story

**As a** administrateur,
**I want** planifier des taches automatiques,
**So that** le serveur se maintienne sans intervention.

#### Context

- Epic: 4 - Plugins & Automatisation
- Dependencies: Epic 2 completed (server control)

#### Acceptance Criteria

##### AC1: Tache de redemarrage planifie
**Given** je cree une tache de type "restart"
**When** je definis une expression cron (ex: 0 4 * * *)
**Then** la tache est enregistree en base
**And** le scheduler l'execute a l'heure prevue

##### AC2: Tache de backup planifie
**Given** je cree une tache de type "backup"
**When** l'heure de backup arrive
**Then** le dossier world est compresse en .zip
**And** le backup est stocke avec timestamp

---

### Story 4.3: Scheduled Tasks UI

#### Story

**As a** administrateur,
**I want** une interface pour gerer les taches planifiees,
**So that** je puisse configurer l'automatisation visuellement.

#### Context

- Epic: 4 - Plugins & Automatisation
- Dependencies: Story 4-2 completed

#### Acceptance Criteria

##### AC1: Liste des taches
**Given** je suis sur la page taches
**When** la page charge
**Then** je vois la liste des taches avec leur prochaine execution

##### AC2: Creation de tache
**Given** je clique sur "Nouvelle tache"
**When** je remplis le formulaire (type, cron, options)
**Then** la tache est creee et apparait dans la liste

##### AC3: Desactivation de tache
**Given** une tache existe
**When** je la desactive via le toggle
**Then** elle ne s'execute plus jusqu'a reactivation

---

## Epic 5: Monitoring & Production

L'administrateur peut surveiller la sante du serveur et le mettre en production.

### Story 5.1: System Metrics Backend

#### Story

**As a** administrateur,
**I want** collecter les metriques systeme,
**So that** je puisse surveiller les ressources.

#### Context

- Epic: 5 - Monitoring & Production
- Dependencies: Epic 2 completed (server process)

#### Acceptance Criteria

##### AC1: Collecte des metriques
**Given** le serveur MC est en cours d'execution
**When** le service de metriques poll le systeme
**Then** l'utilisation CPU et RAM du processus est collectee

##### AC2: Broadcast WebSocket
**Given** je suis connecte au WebSocket
**When** les metriques sont collectees (toutes les 5s)
**Then** je recois l'evenement metrics:update avec les donnees

---

### Story 5.2: Players List

#### Story

**As a** administrateur,
**I want** voir les joueurs connectes,
**So that** je puisse suivre l'activite du serveur.

#### Context

- Epic: 5 - Monitoring & Production
- Dependencies: Story 5-1 completed

#### Acceptance Criteria

##### AC1: Tracking via log parsing
**Given** le serveur MC est en cours d'execution
**When** un joueur se connecte/deconnecte
**Then** la liste des joueurs est mise a jour via parsing des logs

##### AC2: Broadcast WebSocket joueurs
**Given** je suis connecte au WebSocket
**When** la liste des joueurs change
**Then** je recois l'evenement server:players avec la liste actualisee

---

### Story 5.3: Monitoring Dashboard

#### Story

**As a** administrateur,
**I want** un dashboard de monitoring,
**So that** je puisse voir l'etat du serveur d'un coup d'oeil.

#### Context

- Epic: 5 - Monitoring & Production
- Dependencies: Stories 5-1 et 5-2 completed

#### Acceptance Criteria

##### AC1: Jauges CPU et RAM
**Given** je suis sur le dashboard
**When** les metriques arrivent
**Then** les jauges CPU et RAM se mettent a jour en temps reel

##### AC2: Widget joueurs
**Given** des joueurs sont connectes
**When** je regarde le widget joueurs
**Then** je vois le nombre et la liste des pseudos

---

### Story 5.4: Auto-Start avec Remnant

#### Story

**As a** administrateur,
**I want** configurer le demarrage automatique des serveurs,
**So that** mes serveurs demarrent automatiquement quand Remnant demarre.

#### Context

- Epic: 5 - Monitoring & Production
- Dependencies: Epic 2 completed
- Les serveurs sont geres par Remnant (pas par systemd directement)

#### Acceptance Criteria

##### AC1: Demarrage automatique Remnant
**Given** Remnant demarre
**When** des serveurs ont auto_start=true en base
**Then** ces serveurs sont automatiquement demarres par Remnant
**And** ils sont geres par le panel (console, metriques, etc.)

##### AC2: Toggle Auto-Start dans les parametres
**Given** je suis sur la page settings d'un serveur
**When** je coche/decoche "Enable Auto Start"
**Then** la preference est sauvegardee en base
**And** elle sera respectee au prochain demarrage de Remnant

#### Historical Note

La fonctionnalite de generation de fichier systemd pour serveurs MC individuels a ete supprimee car elle creait de la confusion (serveurs non geres par le panel).

---

## Epic 6: Deployment & DevOps

L'administrateur peut installer Remnant facilement et les releases sont automatisees.

### Story 6.1: GitHub Actions CI/CD

#### Story

**As a** developpeur,
**I want** un workflow GitHub Actions pour build et release,
**So that** les releases soient automatisees et les artefacts prets a l'emploi.

#### Context

- Epic: 6 - Deployment & DevOps
- Dependencies: Codebase functional (Epics 1-5)

#### Acceptance Criteria

##### AC1: Build et release automatique
**Given** je push un tag ou lance le workflow manuellement
**When** le workflow s'execute
**Then** les 3 packages sont buildes (backend, frontend, shared)
**And** un tarball remnant-vX.X.X.tar.gz est cree
**And** une release GitHub est creee avec le tarball attache

##### AC2: Validation du build
**Given** le build echoue
**When** le backend bundle est < 50KB
**Then** le workflow echoue avec une erreur explicite

---

### Story 6.2: Linux Installation Script

#### Story

**As a** administrateur,
**I want** installer Remnant en une seule commande sur Linux,
**So that** le deploiement soit simple et rapide.

#### Context

- Epic: 6 - Deployment & DevOps
- Dependencies: Story 6-1 completed (releases disponibles)

#### Acceptance Criteria

##### AC1: Installation one-command
**Given** un serveur Linux vierge
**When** j'execute `curl -fsSL https://raw.githubusercontent.com/.../install.sh | bash`
**Then** Node.js et pnpm sont installes si absents
**And** la derniere release est telechargee et extraite
**And** les dependances sont installees
**And** un service systemd est cree et active
**And** Remnant demarre automatiquement

##### AC2: Persistance apres reboot
**Given** l'installation est terminee
**When** la machine redemarre
**Then** Remnant redemarre automatiquement via systemd

---

### Story 6.3: Local Development Setup

#### Story

**As a** developpeur,
**I want** un script d'installation pour macOS/Linux local,
**So that** je puisse tester Remnant sans systemd.

#### Context

- Epic: 6 - Deployment & DevOps
- Dependencies: Story 6-1 completed

#### Acceptance Criteria

##### AC1: Installation locale
**Given** un MacBook ou Linux sans systemd
**When** j'execute le script install-local.sh
**Then** la derniere release est telechargee
**And** les dependances sont installees
**And** des scripts start.sh et stop.sh sont crees

##### AC2: Demarrage manuel
**Given** j'execute start.sh
**When** Remnant demarre
**Then** le panel est accessible sur http://localhost:3000
**And** les logs sont affiches dans la console

---

## Epic 7: Internationalisation (i18n)

L'administrateur peut utiliser Remnant dans sa langue préférée.

### Story 7.1: Setup i18next et Infrastructure

#### Story

**As a** developpeur,
**I want** configurer react-i18next avec la structure de fichiers de traduction,
**So that** l'infrastructure multilingue soit en place pour toute l'application.

#### Context

- Epic: 7 - Internationalisation (i18n)
- Dependencies: Aucune - story d'infrastructure
- Languages: Francais (defaut), Anglais

#### Acceptance Criteria

##### AC1: Initialisation i18next
**Given** le frontend demarre
**When** i18next est initialise
**Then** la langue par defaut est chargee (francais)
**And** les fichiers de traduction FR et EN sont disponibles

##### AC2: Comportement Fallback
**Given** une cle de traduction n'existe pas
**When** elle est utilisee dans un composant
**Then** la cle elle-meme est affichee (fallback)
**And** un warning est logge en dev

---

### Story 7.2: Traduction Layout & Navigation

#### Story

**As a** administrateur,
**I want** voir la navigation et le layout dans ma langue,
**So that** je puisse naviguer confortablement.

#### Context

- Epic: 7 - Internationalisation (i18n)
- Dependencies: Story 7-1 completed

#### Acceptance Criteria

##### AC1: Sidebar et Header traduits
**Given** je suis connecte au panel
**When** je regarde la sidebar et le header
**Then** tous les textes sont traduits dans la langue active

##### AC2: Cles i18n pour navigation
**Given** les textes de navigation
**When** ils sont affiches
**Then** ils utilisent les cles i18n (nav.dashboard, nav.console, etc.)

---

### Story 7.3: Traduction Pages Principales

#### Story

**As a** administrateur,
**I want** voir les pages principales dans ma langue,
**So that** je puisse utiliser toutes les fonctionnalites.

#### Context

- Epic: 7 - Internationalisation (i18n)
- Dependencies: Story 7-1 completed

#### Acceptance Criteria

##### AC1: Dashboard traduit
**Given** je suis sur le Dashboard
**When** la page s'affiche
**Then** tous les textes statiques sont traduits

##### AC2: Pages fonctionnelles traduites
**Given** je suis sur les pages Console, Files, Plugins, Settings
**When** les pages s'affichent
**Then** les titres, labels et boutons sont traduits

---

### Story 7.4: Traduction Formulaires & Modals

#### Story

**As a** administrateur,
**I want** voir les formulaires et notifications dans ma langue,
**So that** je comprenne les actions et erreurs.

#### Context

- Epic: 7 - Internationalisation (i18n)
- Dependencies: Story 7-1 completed

#### Acceptance Criteria

##### AC1: Formulaire Login traduit
**Given** je suis sur la page Login
**When** le formulaire s'affiche
**Then** les labels, placeholders et boutons sont traduits

##### AC2: Messages d'erreur traduits
**Given** une erreur se produit
**When** le toast s'affiche
**Then** le message d'erreur est traduit

##### AC3: Modals de confirmation traduites
**Given** une modal de confirmation s'ouvre
**When** je vois les options
**Then** les textes de confirmation/annulation sont traduits

---

### Story 7.5: Selecteur de Langue & Persistance

#### Story

**As a** administrateur,
**I want** changer la langue du panel et que mon choix soit memorise,
**So that** je n'aie pas a reconfigurer a chaque visite.

#### Context

- Epic: 7 - Internationalisation (i18n)
- Dependencies: Stories 7-1 to 7-4 completed

#### Acceptance Criteria

##### AC1: Selecteur de langue disponible
**Given** je suis sur la page Settings ou dans le header
**When** je vois le selecteur de langue
**Then** je peux choisir entre Francais et Anglais

##### AC2: Changement de langue immediat
**Given** je change la langue
**When** je selectionne une nouvelle langue
**Then** l'interface se met a jour immediatement
**And** mon choix est persisté en base de données via `users.updateLocale`

##### AC3: Persistance du choix
**Given** je reviens sur le panel
**When** la page charge
**Then** ma langue preferee est automatiquement appliquee

---

## Epic 8: Design System & UI Polish

L'interface Remnant devient une experience visuelle immersive et moderne, style gaming prioritaire.

### Story 8.1: Design System Foundation

#### Story

**As a** developpeur,
**I want** un design system avec palette gaming, typographie et espacements,
**So that** l'interface ait une identite visuelle coherente et marquante.

#### Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Aucune - story fondatrice
- Style: Gaming, immersif, tres graphique
- Themes: Dark mode prioritaire, light mode supporte

#### Acceptance Criteria

##### AC1: Palette de couleurs gaming
**Given** le design system est configure
**When** je consulte les variables CSS/Tailwind
**Then** une palette gaming est definie (sombres, accents neon/vibrants)
**And** les couleurs sont accessibles et contrastees

##### AC2: Typographie moderne
**Given** le design system est configure
**When** je consulte les fonts
**Then** une typographie gaming/moderne est definie (titres impactants, corps lisible)
**And** les tailles et line-heights sont harmonisees

##### AC3: Espacements et grille
**Given** le design system est configure
**When** je consulte les espacements
**Then** un systeme de spacing coherent est defini (4px base)
**And** une grille responsive est en place

---

### Story 8.2: Component Library Polish

#### Story

**As a** administrateur,
**I want** des composants UI avec un style immersif,
**So that** chaque interaction soit visuellement satisfaisante.

#### Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Story 8-1 completed

#### Acceptance Criteria

##### AC1: Boutons stylises
**Given** je vois un bouton dans l'interface
**When** je l'observe
**Then** il a un style gaming (gradients, bordures, effets hover)
**And** les etats (hover, active, disabled) sont distincts

##### AC2: Inputs et formulaires
**Given** je vois un champ de saisie
**When** je l'observe et interagis
**Then** il a un style coherent avec le theme gaming
**And** les etats (focus, error, success) sont clairement visibles

##### AC3: Cards et containers
**Given** je vois une card ou un container
**When** je l'observe
**Then** il a des bordures/ombres/fonds stylises
**And** le contenu est bien structure visuellement

##### AC4: Modals et dialogs
**Given** une modal s'ouvre
**When** je l'observe
**Then** elle a un style immersif avec overlay
**And** les animations d'entree/sortie sont fluides

---

### Story 8.3: Layout & Navigation Redesign

#### Story

**As a** administrateur,
**I want** une navigation et un layout immersifs avec transitions fluides,
**So that** la navigation dans le panel soit une experience agreable.

#### Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Story 8-2 completed

#### Acceptance Criteria

##### AC1: Sidebar immersive
**Given** je suis connecte au panel
**When** je vois la sidebar
**Then** elle a un design gaming marque (icones stylisees, hover effects)
**And** l'item actif est clairement identifiable

##### AC2: Header moderne
**Given** je suis sur n'importe quelle page
**When** je vois le header
**Then** il affiche les infos essentielles avec style
**And** les actions rapides sont accessibles

##### AC3: Transitions de page
**Given** je navigue entre les pages
**When** le contenu change
**Then** une transition fluide accompagne le changement
**And** pas de flash ou saut visuel

---

### Story 8.4: Dashboard Visual Identity

#### Story

**As a** administrateur,
**I want** un dashboard visuellement impactant avec widgets animes,
**So that** la premiere impression soit memorable.

#### Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Story 8-3 completed

#### Acceptance Criteria

##### AC1: Carte serveur stylisee
**Given** je suis sur le dashboard
**When** je vois la carte serveur principale
**Then** elle a un design premium avec statut anime
**And** les informations cles sont mises en valeur

##### AC2: Jauges CPU/RAM animees
**Given** le serveur est en cours d'execution
**When** je vois les jauges de ressources
**Then** elles sont animees et visuellement attractives
**And** les valeurs se mettent a jour fluidement

##### AC3: Widget joueurs
**Given** des joueurs sont connectes
**When** je vois le widget joueurs
**Then** il affiche la liste avec style (avatars, animations)
**And** les connexions/deconnexions sont visibles

##### AC4: Quick actions stylisees
**Given** je vois les boutons d'action rapide
**When** j'observe Start/Stop/Restart
**Then** ils ont un style impactant et reconnaissable
**And** les etats sont clairement differencies

---

### Story 8.5: Dark/Light Theme

#### Story

**As a** administrateur,
**I want** pouvoir choisir entre un theme dark et light,
**So that** je puisse utiliser le panel selon mes preferences.

#### Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Story 8-1 completed
- Priorite: Dark mode (gaming) en premier, light mode ensuite

#### Acceptance Criteria

##### AC1: Theme dark complet
**Given** le theme dark est actif (defaut)
**When** je navigue dans tout le panel
**Then** toutes les pages ont un fond sombre coherent
**And** les contrastes sont respectes pour la lisibilite

##### AC2: Theme light complet
**Given** le theme light est actif
**When** je navigue dans tout le panel
**Then** toutes les pages ont un fond clair coherent
**And** les couleurs s'adaptent au contexte lumineux

##### AC3: Toggle et persistance
**Given** je change de theme via le toggle
**When** je selectionne dark ou light
**Then** le changement est immediat sans rechargement
**And** mon choix est persiste en localStorage

---

### Story 8.6: Micro-interactions & Animations

#### Story

**As a** administrateur,
**I want** des micro-interactions et animations de feedback,
**So that** chaque action ait une reponse visuelle satisfaisante.

#### Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Stories 8-2 to 8-5 completed

#### Acceptance Criteria

##### AC1: Feedback sur actions
**Given** je clique sur un bouton d'action
**When** l'action est en cours
**Then** un indicateur visuel montre le chargement
**And** le succes/echec est anime

##### AC2: Hover et focus states
**Given** je survole ou focus un element interactif
**When** l'etat change
**Then** une animation subtile accompagne le changement
**And** l'element est clairement identifiable comme interactif

##### AC3: Notifications animees
**Given** une notification/toast apparait
**When** elle s'affiche et disparait
**Then** les animations d'entree/sortie sont fluides
**And** le type (success, error, warning) est visuellement distinct

##### AC4: Skeleton loaders
**Given** du contenu est en chargement
**When** j'attends les donnees
**Then** des skeleton loaders animes s'affichent
**And** la transition vers le contenu reel est fluide

### Story 8.7: Migration Design des Pages Existantes

#### Story

**As a** administrateur,
**I want** que toutes les pages du panel utilisent le nouveau design system,
**So that** l'experience utilisateur soit coherente sur l'ensemble de l'application.

#### Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Stories 8-1 to 8-6 completed

#### Acceptance Criteria

##### AC1: Pages Servers migrees
**Given** je navigue sur /app/servers et ses sous-pages
**When** les pages s'affichent
**Then** elles utilisent AppLayout et les variables CSS du theme
**And** les composants UI du design system sont utilises

##### AC2: Pages Users migrees
**Given** je navigue sur /app/users
**When** la page s'affiche
**Then** elle utilise AppLayout et les variables CSS du theme
**And** les composants UI du design system sont utilises

##### AC3: Console migree
**Given** je navigue sur /app/servers/$id/console
**When** la page s'affiche
**Then** elle utilise AppLayout et les variables CSS du theme
**And** le terminal conserve son style sombre adapte

##### AC4: File Browser et Editor migres
**Given** je navigue sur /app/servers/$id/files
**When** la page s'affiche
**Then** elle utilise AppLayout et les variables CSS du theme
**And** l'editeur de fichiers est style coheremment

##### AC5: Pages Settings, Plugins, Tasks migrees
**Given** je navigue sur les pages settings, plugins ou tasks
**When** les pages s'affichent
**Then** elles utilisent AppLayout et les variables CSS du theme

---

## Epic 9: Page Settings Globale — Generation Systemd

L'administrateur peut acceder a une page Settings globale pour generer un fichier systemd et configurer Remnant au niveau de l'application.

**FRs couverts:** FR28 (complement), FR46

**Statut:** La route `/app/settings` existe et est accessible depuis la navigation principale (Story 9.1 done). La fonctionnalité de génération systemd depuis la page Settings n'est PAS implémentée — la génération systemd a été supprimée du panel (voir Story 5.4 Historical Note). Les stories 9.2, 9.3 et 9.4 sont obsolètes.

### Story 9.1: Route, Page et Navigation Settings

#### Story

**As a** administrateur,
**I want** voir un onglet "Settings" dans la navigation principale,
**So that** je puisse acceder aux parametres globaux de Remnant.

#### Context

- Epic: 9 - Page Settings Globale
- Dependencies: Aucune - story fondatrice
- Fichiers cles:
  - `packages/frontend/src/routes.tsx` — ajout route `/app/settings`
  - `packages/frontend/src/components/layout/main_layout.tsx` — ajout dans `mainNavItems`
  - `packages/frontend/src/i18n/locales/en.json` et `fr.json` — cle `nav.settings`
  - Nouveau: `packages/frontend/src/pages/app/settings/settings.tsx`

#### Acceptance Criteria

##### AC1: Route accessible
**Given** je suis connecte au panel
**When** je navigue vers `/app/settings`
**Then** la page Settings s'affiche avec un titre
**And** la route est protegee par l'auth guard existant

##### AC2: Navigation mise a jour
**Given** je suis sur n'importe quelle page du panel
**When** je regarde la navbar principale
**Then** l'onglet "Settings" apparait apres "Users"
**And** il est traduit dans la langue active (Settings / Parametres)

##### AC3: Traductions i18n
- [ ] Cle `nav.settings` ajoutee dans `en.json`
- [ ] Cle `nav.settings` ajoutee dans `fr.json`
- [ ] Tous les textes UI utilisent `t()`

---

### Story 9.2: Backend — Endpoint Generation Systemd

> **Note:** Cette story est obsolète. La fonctionnalité de génération systemd a été supprimée du panel (voir Story 5.4 Historical Note).

#### Story

**As a** administrateur,
**I want** que le backend genere un fichier systemd adapte a mon environnement,
**So that** je puisse installer Remnant comme service sans configuration manuelle.

#### Context

- Epic: 9 - Page Settings Globale
- Dependencies: Story 9-1 completed
- Fichiers cles:
  - Nouveau: `packages/backend/src/trpc/routers/settings.ts` — router `settings`
  - `packages/backend/src/trpc/router.ts` — enregistrement du router
- Le fichier `.service` genere doit detecter dynamiquement:
  - Le chemin Node.js (`process.execPath`)
  - Le working directory (`process.cwd()`)
  - Le port (`process.env.PORT` ou 3000)
  - L'utilisateur systeme (`process.env.USER` ou `os.userInfo().username`)

#### Acceptance Criteria

##### AC1: Procedure generateSystemdUnit
**Given** je suis authentifie
**When** j'appelle `settings.generateSystemdUnit`
**Then** je recois une string contenant un fichier `.service` valide
**And** les valeurs (ExecStart, WorkingDirectory, User, Environment) sont dynamiques

##### AC2: Format du fichier genere
**Given** le fichier `.service` est genere
**When** j'inspecte le contenu
**Then** il contient les sections [Unit], [Service], [Install]
**And** il utilise `Restart=on-failure` et `Type=simple`
**And** le `ExecStart` pointe vers le bon chemin Node.js et le bon entry point

---

### Story 9.3: Frontend — Section Systemd avec Generation et Copie

> **Note:** Cette story est obsolète. La fonctionnalité de génération systemd a été supprimée du panel (voir Story 5.4 Historical Note).

#### Story

**As a** administrateur,
**I want** generer et copier le fichier systemd depuis l'interface,
**So that** je puisse configurer le demarrage automatique facilement.

#### Context

- Epic: 9 - Page Settings Globale
- Dependencies: Story 9-2 completed
- Fichiers cles:
  - `packages/frontend/src/pages/app/settings/settings.tsx` — section Systemd
- Pattern de reference: `packages/frontend/src/pages/app/servers/id/settings.tsx`
- UX: Card avec bouton "Generer", bloc code, bouton "Copier", instructions

#### Acceptance Criteria

##### AC1: Bouton Generer
**Given** je suis sur la page Settings
**When** je clique sur "Generer le fichier systemd"
**Then** le backend est appele et le contenu du `.service` s'affiche dans un bloc code

##### AC2: Bouton Copier
**Given** le fichier `.service` est affiche
**When** je clique sur "Copier"
**Then** le contenu est copie dans le presse-papier
**And** un feedback visuel confirme la copie (icone check, toast, etc.)

##### AC3: Instructions d'installation
**Given** le fichier `.service` est affiche
**When** je regarde sous le bloc code
**Then** les instructions d'installation sont visibles:
- `sudo cp remnant.service /etc/systemd/system/`
- `sudo systemctl enable remnant`
- `sudo systemctl start remnant`
- `journalctl -u remnant -f`

##### AC4: Traductions i18n
- [ ] Tous les textes de la section (titre, boutons, instructions) utilisent `t()`
- [ ] Cles ajoutees dans `en.json` et `fr.json`

---

### Story 9.4: Mise a Jour Documentation VitePress

> **Note:** Cette story est obsolète. La fonctionnalité de génération systemd a été supprimée du panel (voir Story 5.4 Historical Note).

#### Story

**As a** administrateur,
**I want** que la documentation reflete la realite de la page Settings,
**So that** les instructions soient coherentes avec l'interface.

#### Context

- Epic: 9 - Page Settings Globale
- Dependencies: Story 9-3 completed
- Fichier cle: `docs/guide/configuration.md` — section Systemd

#### Acceptance Criteria

##### AC1: Documentation corrigee
**Given** je lis la documentation Systemd
**When** je suis les instructions
**Then** elles decrivent le parcours reel: aller sur Settings > section Systemd > Generer
**And** les anciennes instructions fictives sont remplacees

##### AC2: Coherence complete
**Given** je compare la doc et l'UI
**When** je suis chaque etape
**Then** il n'y a aucune reference a un bouton ou une page qui n'existe pas

---

## Epic 10: Gestion des Versions Java

L'administrateur peut voir les versions Java pre-installees et assigner une version specifique a chaque serveur Minecraft.

**FRs couverts:** Nouveau requirement — gestion multi-Java

**Decisions de design:**
- Trois JRE Adoptium Temurin pre-bundles: temurin-21-jre (defaut), temurin-17-jre, temurin-11-jre
- Pas d'installation/suppression depuis l'UI — les JRE sont fournis avec Remnant
- Si un utilisateur veut une version custom, il utilise un script de lancement personnalise dans les settings serveur
- Java 21 est le defaut recommande (requis par MC 1.20.5+ et PaperMC)
- Java 17 pour MC 1.18 a 1.20.4
- Java 11 pour tres vieux serveurs

### Story 10.1: Backend — Service Java & Router

#### Story

**As a** administrateur,
**I want** que Remnant detecte les JRE pre-installes,
**So that** je puisse voir les versions Java disponibles et les assigner a mes serveurs.

#### Context

- Epic: 10 - Gestion des Versions Java
- Dependencies: Aucune - story fondatrice
- Fichiers cles:
  - Nouveau: `packages/backend/src/services/java_service.ts`
  - Nouveau: `packages/backend/src/trpc/routers/java.ts`
  - `packages/backend/src/trpc/router.ts` — enregistrement du router
- Dossier des JRE: `{workingDirectory}/java/` contenant `temurin-21-jre/`, `temurin-17-jre/`, `temurin-11-jre/`
- Procedures tRPC:
  - `java.getInstalledVersions` — scanne le dossier `java/` et retourne les JRE trouves avec leur chemin `bin/java`

#### Acceptance Criteria

##### AC1: Detection des JRE
**Given** je suis authentifie
**When** j'appelle `java.getInstalledVersions`
**Then** je recois la liste des JRE presents dans `java/` avec pour chacun:
- `name` (ex: `temurin-21-jre`)
- `version` (ex: `21`)
- `path` (chemin absolu vers `bin/java`)
- `isDefault` (true pour temurin-21-jre)

##### AC2: Dossier vide ou absent
**Given** le dossier `java/` n'existe pas ou est vide
**When** j'appelle `java.getInstalledVersions`
**Then** je recois un tableau vide

---

### Story 10.2: Frontend — Section Java dans Settings Globales

#### Story

**As a** administrateur,
**I want** voir les versions Java disponibles sur la page Settings,
**So that** je sache quels JRE sont installes sur mon serveur.

#### Context

- Epic: 10 - Gestion des Versions Java
- Dependencies: Story 10-1 completed
- Fichiers cles:
  - Modifier: `packages/frontend/src/pages/app/settings/settings.tsx` — nouvelle section
  - Nouveau: `packages/frontend/src/hooks/use_java.ts`
  - `packages/frontend/src/i18n/locales/en.json` et `fr.json` — cles `appSettings.java.*`
- Section en lecture seule — pas d'actions d'installation ou suppression

#### Acceptance Criteria

##### AC1: Section Java Versions
**Given** je suis sur la page Settings
**When** je vois la section "Java Versions"
**Then** je vois un tableau listant les JRE installes avec nom, version et statut (defaut ou non)

##### AC2: Aucun JRE
**Given** aucun JRE n'est detecte
**When** je vois la section Java
**Then** un message indique qu'aucun JRE n'a ete trouve

##### AC3: Traductions i18n
- [ ] Tous les textes utilisent `t()`
- [ ] Cles ajoutees dans `en.json` et `fr.json`

---

### Story 10.3: Schema DB — Colonne java_path sur Servers

#### Story

**As a** developpeur,
**I want** stocker le chemin Java choisi par serveur,
**So that** chaque serveur puisse utiliser sa propre version de Java.

#### Context

- Epic: 10 - Gestion des Versions Java
- Dependencies: Aucune - peut etre fait en parallele de 10.1
- Fichiers cles:
  - Modifier: `packages/backend/src/db/schema/servers.ts` — ajouter colonne `java_path` (text, nullable)
  - Modifier: `packages/shared/src/schemas/server.ts` — ajouter dans create/update/response schemas
  - Migration Drizzle necessaire

#### Acceptance Criteria

##### AC1: Colonne java_path
**Given** la migration est appliquee
**When** j'inspecte la table servers
**Then** la colonne `java_path` existe (text, nullable, default null)

##### AC2: Schemas Zod
**Given** les schemas partages sont mis a jour
**When** j'inspecte les schemas create/update/response
**Then** `java_path` est present et optionnel (nullable)

---

### Story 10.4: Frontend — Selecteur Java dans Settings Serveur

#### Story

**As a** administrateur,
**I want** choisir la version Java pour chaque serveur,
**So that** je puisse utiliser Java 17 pour un serveur et Java 21 pour un autre.

#### Context

- Epic: 10 - Gestion des Versions Java
- Dependencies: Stories 10-1, 10-2, 10-3 completed
- Fichiers cles:
  - Modifier: `packages/frontend/src/pages/app/servers/id/settings.tsx` — nouvelle section avant JVM Configuration
  - Utilise `java.getInstalledVersions` pour lister les options
- Pattern: dropdown avec les versions installees + option "Systeme (defaut)"

#### Acceptance Criteria

##### AC1: Section Java Version
**Given** je suis sur les settings d'un serveur
**When** je vois la section "Java Version"
**Then** un dropdown liste les Java installes + "Systeme (defaut)"

##### AC2: Selection et sauvegarde
**Given** je selectionne une version Java
**When** je sauvegarde les settings
**Then** le `java_path` est persiste en base pour ce serveur

##### AC3: Aucun Java installe
**Given** aucun Java n'est installe via Remnant
**When** je vois la section Java Version
**Then** un message m'invite a aller dans Settings pour installer Java

##### AC4: Traductions i18n
- [ ] Tous les textes utilisent `t()`
- [ ] Cles ajoutees dans `en.json` et `fr.json`

---

### Story 10.5: Backend — Utiliser java_path au Demarrage Serveur

#### Story

**As a** administrateur,
**I want** que le serveur utilise la version Java que j'ai choisie,
**So that** le bon JDK soit utilise au lancement.

#### Context

- Epic: 10 - Gestion des Versions Java
- Dependencies: Story 10-3 completed
- Fichiers cles:
  - Modifier: `packages/backend/src/services/server_process_manager.ts`
  - Remplacer `findJava()` hardcode par `server.java_path ?? findJava()`

#### Acceptance Criteria

##### AC1: Java personnalise
**Given** un serveur a `java_path` defini
**When** je demarre le serveur
**Then** le processus est spawne avec le binaire Java specifie

##### AC2: Fallback systeme
**Given** un serveur a `java_path` null
**When** je demarre le serveur
**Then** la detection systeme existante (`findJava()`) est utilisee

##### AC3: Erreur claire
**Given** un serveur a un `java_path` invalide (fichier supprime)
**When** je demarre le serveur
**Then** une erreur explicite est retournee indiquant que le binaire Java n'a pas ete trouve

---

### Story 10.6: Chemin Java Personnalise dans Settings Serveur

#### Story

**As a** administrateur,
**I want** pouvoir saisir un chemin Java personnalise pour un serveur,
**So that** je puisse utiliser une version de Java que j'ai installee manuellement sur le serveur dedie.

#### Context

- Epic: 10 - Gestion des Versions Java
- Dependencies: Story 10-4 completed
- Fichiers cles:
  - Modifier: `packages/frontend/src/pages/app/servers/id/settings.tsx` — etendre la section Java Version
  - Le dropdown de la story 10.4 propose les JRE pre-installes + une option "Personnalise"
  - Quand "Personnalise" est selectionne, un champ texte apparait pour saisir le chemin absolu vers le binaire `java`
  - La valeur saisie est sauvegardee dans `java_path` (meme colonne que story 10.3)
- Cas d'usage: l'utilisateur a installe GraalVM, Azul Zulu, ou un JDK specifique directement sur le serveur Linux

#### Acceptance Criteria

##### AC1: Option Personnalise dans le dropdown
**Given** je suis sur les settings d'un serveur
**When** je vois le dropdown Java Version
**Then** les options sont: "Systeme (defaut)", les JRE pre-installes, et "Personnalise"

##### AC2: Champ de saisie chemin
**Given** je selectionne "Personnalise"
**When** le champ texte apparait
**Then** je peux saisir un chemin absolu (ex: `/usr/lib/jvm/graalvm-21/bin/java`)
**And** un texte d'aide indique le format attendu

##### AC3: Sauvegarde du chemin personnalise
**Given** j'ai saisi un chemin personnalise
**When** je sauvegarde les settings
**Then** le `java_path` est persiste en base avec le chemin saisi
**And** ce chemin sera utilise au demarrage du serveur (story 10.5)

##### AC4: Traductions i18n
- [ ] Textes du champ personnalise (label, placeholder, aide) utilisent `t()`
- [ ] Cles ajoutees dans `en.json` et `fr.json`

---

## Epic 11: Gestion des Backups

L'administrateur dispose d'une page dédiée pour créer, visualiser, télécharger et supprimer les backups de ses serveurs.

### Story 11.1: Backup Management Backend

#### Story

**As a** administrateur,
**I want** une API complète pour gérer les backups de mes serveurs,
**So that** je puisse créer, lister, télécharger et supprimer des backups depuis le panel.

#### Context

- Epic: 11 - Gestion des Backups
- Dependencies: Aucune — le `BackupService` existe déjà partiellement
- Fichier story détaillé: `_bmad-output/implementation-artifacts/11-1-backup-management-backend.md`

#### Acceptance Criteria

##### AC1: Lister les backups d'un serveur
**Given** je suis sur la page backups d'un serveur
**When** la page charge
**Then** je vois la liste de tous les backups existants pour ce serveur
**And** chaque backup affiche : nom, taille, date de création

##### AC2: Supprimer un backup
**Given** je vois un backup dans la liste
**When** je clique sur supprimer et confirme
**Then** le fichier ZIP est supprimé du disque
**And** la liste se met à jour

##### AC3: Télécharger un backup
**Given** je vois un backup dans la liste
**When** je clique sur télécharger
**Then** le fichier ZIP est téléchargé dans mon navigateur

##### AC4: Backup sélectif à la volée
**Given** je suis sur la page backups
**When** je clique sur "Sauvegarder maintenant"
**Then** une dialog s'ouvre avec l'arborescence des fichiers du serveur
**And** tous les fichiers/dossiers sont sélectionnés par défaut
**And** je peux cocher/décocher les éléments à inclure
**And** je lance le backup avec les fichiers sélectionnés

---

### Story 11.2: Backup Page UI

#### Story

**As a** administrateur,
**I want** une page dédiée aux backups dans la navigation d'un serveur,
**So that** je puisse visualiser, créer, télécharger et supprimer mes backups facilement.

#### Context

- Epic: 11 - Gestion des Backups
- Dependencies: Story 11-1 completed
- Fichier story détaillé: `_bmad-output/implementation-artifacts/11-2-backup-page-ui.md`

#### Acceptance Criteria

##### AC1: Onglet Backups dans la navigation
**Given** je suis sur la page d'un serveur
**When** je regarde la navigation
**Then** je vois un onglet "Backups" entre "Plugins" et "Tasks"

##### AC2: Liste des backups
**Given** je suis sur la page Backups
**When** la page charge
**Then** je vois la liste des backups triés par date (plus récent en premier)
**And** chaque backup affiche : nom, taille formatée (MB/GB), date relative

##### AC3: Bouton "Sauvegarder maintenant" avec sélection de fichiers
**Given** je suis sur la page Backups
**When** je clique sur "Sauvegarder maintenant"
**Then** une dialog s'ouvre avec l'arborescence des fichiers du serveur
**And** tous les fichiers/dossiers sont cochés par défaut
**And** je peux naviguer les dossiers (expansion lazy-load)
**And** cocher/décocher un dossier affecte tous ses enfants
**And** un bouton "Lancer la sauvegarde" envoie les paths sélectionnés au backend

##### AC4: Télécharger un backup
**Given** je vois un backup dans la liste
**When** je clique sur télécharger
**Then** le fichier ZIP se télécharge dans mon navigateur

##### AC5: Supprimer un backup avec confirmation
**Given** je vois un backup dans la liste
**When** je clique sur supprimer et confirme
**Then** le backup est supprimé et disparaît de la liste

##### AC6: i18n
- [ ] Tous les textes utilisent `t()`
- [ ] Clés ajoutées dans `en.json` et `fr.json`

---

## Epic 12: Gestion Firewall par Serveur

L'administrateur peut ouvrir et fermer des ports depuis les paramètres d'un serveur, permettant aux plugins (GeyserMC, BlueMap, Dynmap, etc.) de fonctionner sans intervention manuelle en SSH.

**FRs couverts:** FR50, FR51, FR52, FR53, FR54

### Contexte Technique

Certains plugins Minecraft nécessitent l'ouverture de ports additionnels sur le firewall du serveur :
- **GeyserMC** : port 19132/udp (Bedrock cross-play)
- **BlueMap** : port 8100/tcp (carte web interactive)
- **Dynmap** : port 8123/tcp (carte web)
- **Votifier** : port 8192/tcp (votes)

Actuellement, l'admin doit se connecter en SSH pour exécuter manuellement les commandes firewall. Remnant doit pouvoir gérer ces règles de manière sécurisée.

### Architecture de Sécurité

**Principe fondamental : le process Node.js ne touche JAMAIS le firewall directement.**

Un script shell intermédiaire (`remnant-firewall.sh`) est le seul point d'entrée :
- Installé dans `/opt/remnant/scripts/remnant-firewall.sh`
- Exécutable uniquement par l'utilisateur système `remnant`
- Autorisé via sudoers : `remnant ALL=(ALL) NOPASSWD: /opt/remnant/scripts/remnant-firewall.sh`
- Valide strictement chaque argument (port range, protocole, action)
- Détecte automatiquement le firewall disponible (ufw → firewalld → iptables)
- Refuse catégoriquement les ports < 1024 et les ports réservés (3000 = Remnant, 80/443 = Nginx)

### Story 12.1: Script Shell Firewall Sécurisé

#### Story

**As a** développeur,
**I want** un script shell intermédiaire qui gère les règles firewall,
**So that** le process Node.js n'ait jamais d'accès direct au firewall.

#### Context

- Epic: 12 - Gestion Firewall par Serveur
- Dependencies: Aucune — story fondatrice
- Fichier: `scripts/remnant-firewall.sh`

#### Acceptance Criteria

##### AC1: Détection du firewall
**Given** le script est exécuté
**When** il détecte le système
**Then** il utilise automatiquement ufw, firewalld, ou iptables (dans cet ordre de priorité)
**And** il échoue proprement si aucun firewall n'est détecté

##### AC2: Commande allow
**Given** un port valide et un protocole
**When** j'exécute `remnant-firewall.sh allow 19132 udp`
**Then** la règle firewall est ajoutée
**And** le script retourne un code 0 avec un message JSON `{"success":true,"action":"allow","port":19132,"protocol":"udp"}`

##### AC3: Commande deny
**Given** un port avec une règle existante
**When** j'exécute `remnant-firewall.sh deny 19132 udp`
**Then** la règle firewall est supprimée
**And** le script retourne un code 0 avec un message JSON

##### AC4: Commande check
**Given** un port
**When** j'exécute `remnant-firewall.sh check 19132 udp`
**Then** le script retourne `{"open":true}` ou `{"open":false}`

##### AC5: Commande list
**Given** des règles firewall existent
**When** j'exécute `remnant-firewall.sh list`
**Then** le script retourne un JSON avec toutes les règles actives

##### AC6: Validation stricte des entrées
**Given** un port < 1024 ou > 65535
**When** j'exécute le script
**Then** il refuse avec code 1 et `{"success":false,"error":"Port must be between 1024 and 65535"}`
**And** les ports réservés (3000, 80, 443) sont également refusés
**And** le protocole doit être exactement "tcp", "udp" ou "both"
**And** l'action doit être exactement "allow", "deny", "check" ou "list"
**And** aucune injection shell n'est possible (arguments nettoyés via regex `^[0-9]+$` et `^(tcp|udp|both)$`)

##### AC7: Support multi-firewall
**Given** le serveur utilise firewalld au lieu de ufw
**When** j'exécute `remnant-firewall.sh allow 8100 tcp`
**Then** la commande `firewall-cmd --zone=public --permanent --add-port=8100/tcp` est exécutée
**And** `firewall-cmd --reload` est appelé

##### AC8: Support iptables fallback
**Given** ni ufw ni firewalld ne sont installés
**When** j'exécute `remnant-firewall.sh allow 8100 tcp`
**Then** la commande `iptables -A INPUT -p tcp --dport 8100 -j ACCEPT` est exécutée
**And** `iptables-save` est appelé si disponible

---

### Story 12.2: Backend — Table et Service Firewall

#### Story

**As a** développeur,
**I want** une table `firewall_rules` et un service backend pour gérer les règles,
**So that** les règles soient persistées et synchronisées avec le firewall système.

#### Context

- Epic: 12 - Gestion Firewall par Serveur
- Dependencies: Story 12-1 completed

#### Acceptance Criteria

##### AC1: Table firewall_rules
**Given** le backend démarre
**When** la migration s'exécute
**Then** la table `firewall_rules` existe avec les colonnes :
- `id` INTEGER PRIMARY KEY
- `server_id` INTEGER NOT NULL REFERENCES servers(id) ON DELETE CASCADE
- `port` INTEGER NOT NULL
- `protocol` TEXT NOT NULL DEFAULT 'tcp' (enum: 'tcp', 'udp', 'both')
- `label` TEXT NOT NULL
- `enabled` INTEGER NOT NULL DEFAULT 1
- `created_at` TEXT DEFAULT CURRENT_TIMESTAMP
- `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP
**And** un index existe sur `server_id`
**And** une contrainte UNIQUE existe sur `(server_id, port, protocol)`

##### AC2: Schéma Drizzle
**Given** le schéma Drizzle est défini
**When** je l'importe dans le backend
**Then** les types `FirewallRule`, `NewFirewallRule` sont disponibles
**And** le schéma est exporté depuis `db/schema/index.ts`

##### AC3: Schémas Zod partagés
**Given** les schémas de validation existent dans `@remnant/shared`
**When** je crée ou modifie une règle
**Then** `createFirewallRuleSchema` valide : port (1024-65535), protocol (tcp|udp|both), label (1-100 chars)
**And** `firewallRuleResponseSchema` définit le type de réponse
**And** les ports réservés (3000, 80, 443) sont rejetés par le schéma

##### AC4: FirewallService
**Given** le service est instancié
**When** j'appelle `addRule(serverId, port, protocol, label)`
**Then** la règle est insérée en DB
**And** le script `remnant-firewall.sh allow <port> <protocol>` est exécuté via `execFile`
**And** si le script échoue, la règle DB est supprimée (rollback)

##### AC5: Suppression de règle
**Given** une règle existe
**When** j'appelle `removeRule(ruleId)`
**Then** le script `remnant-firewall.sh deny <port> <protocol>` est exécuté
**And** la règle est supprimée de la DB
**And** si le script échoue, la règle DB est conservée et une erreur est retournée

##### AC6: Toggle de règle
**Given** une règle existe
**When** j'appelle `toggleRule(ruleId)`
**Then** si enabled → disabled : deny est exécuté sur le firewall
**And** si disabled → enabled : allow est exécuté sur le firewall
**And** le champ `enabled` est mis à jour en DB

##### AC7: Liste des règles
**Given** un serveur a des règles
**When** j'appelle `listRules(serverId)`
**Then** toutes les règles du serveur sont retournées avec leur statut

##### AC8: Nettoyage à la suppression du serveur
**Given** un serveur avec des règles firewall est supprimé
**When** `deleteServer(serverId)` est appelé
**Then** toutes les règles firewall du serveur sont supprimées du firewall (deny) AVANT la suppression DB
**And** la suppression en cascade (ON DELETE CASCADE) nettoie la table

##### AC9: Sécurité — Exécution du script
**Given** le backend appelle le script
**When** il utilise `execFile`
**Then** `shell: false` est utilisé (pas de shell intermédiaire Node.js)
**And** les arguments sont passés comme tableau (pas de string interpolation)
**And** le chemin du script est une constante, pas configurable par l'utilisateur

---

### Story 12.3: Backend — Router tRPC Firewall

#### Story

**As a** développeur,
**I want** un router tRPC pour exposer les opérations firewall,
**So that** le frontend puisse gérer les règles.

#### Context

- Epic: 12 - Gestion Firewall par Serveur
- Dependencies: Story 12-2 completed

#### Acceptance Criteria

##### AC1: Router firewall
**Given** le router tRPC est enregistré
**When** le frontend l'appelle
**Then** les procedures suivantes sont disponibles :
- `firewall.list` (query) — input: `{ serverId: number }` → retourne `Array<FirewallRule>`
- `firewall.add` (mutation) — input: `{ serverId, port, protocol, label }` → retourne `FirewallRule`
- `firewall.remove` (mutation) — input: `{ ruleId: number }` → retourne `{ success: boolean }`
- `firewall.toggle` (mutation) — input: `{ ruleId: number }` → retourne `FirewallRule`
- `firewall.check` (query) — input: `{ port: number, protocol: string }` → retourne `{ open: boolean }`

##### AC2: Authentification et permissions
**Given** un utilisateur non authentifié
**When** il appelle une procedure firewall
**Then** il reçoit une erreur 401
**And** seuls les utilisateurs avec la permission `manage_server` peuvent modifier les règles

##### AC3: Validation des entrées
**Given** un input invalide (port < 1024, protocole incorrect)
**When** la mutation est appelée
**Then** une erreur Zod est retournée avec les détails de validation

##### AC4: i18n des erreurs
**Given** une erreur se produit (port déjà utilisé, script échoue)
**When** l'erreur est retournée
**Then** le code d'erreur est dans `ErrorCodes` (ex: `FIREWALL_RULE_EXISTS`, `FIREWALL_SCRIPT_FAILED`, `FIREWALL_PORT_RESERVED`)

---

### Story 12.4: Frontend — UI Firewall dans Server Settings

#### Story

**As a** administrateur,
**I want** une section "Firewall Rules" dans les paramètres de mon serveur,
**So that** je puisse ouvrir des ports pour mes plugins sans utiliser SSH.

#### Context

- Epic: 12 - Gestion Firewall par Serveur
- Dependencies: Story 12-3 completed
- Intégration: nouvelle card `FirewallCard` dans `settings.tsx`, après `AutoStartCard`

#### Acceptance Criteria

##### AC1: Affichage des règles
**Given** je suis sur la page settings d'un serveur
**When** la section Firewall se charge
**Then** je vois la liste des règles avec : port, protocole (badge TCP/UDP), label, toggle on/off
**And** si aucune règle n'existe, un message empty state est affiché

##### AC2: Ajout de règle
**Given** je clique sur "Add Rule"
**When** le dialog s'ouvre
**Then** je peux saisir : port (number, 1024-65535), protocole (select: TCP / UDP / Both), label (text)
**And** le bouton "Add" est disabled tant que le formulaire est invalide
**And** à la soumission, la règle est créée et le port est ouvert sur le firewall
**And** un toast de succès s'affiche

##### AC3: Toggle de règle
**Given** une règle existe dans la liste
**When** je toggle le switch
**Then** la règle est activée/désactivée
**And** le firewall est mis à jour en temps réel
**And** le switch reflète le nouvel état

##### AC4: Suppression de règle
**Given** une règle existe
**When** je clique sur l'icône supprimer et confirme
**Then** la règle est supprimée de la DB et le port est fermé sur le firewall

##### AC5: Gestion des erreurs
**Given** une erreur se produit (port déjà ouvert, script échoue, doublon)
**When** l'opération échoue
**Then** un toast d'erreur s'affiche avec un message traduit
**And** l'état UI est rollback (toggle revient en position précédente)

##### AC6: Design et compound pattern
**Given** la section Firewall
**When** elle est rendue
**Then** elle utilise le compound component `ServerSection` existant
**And** le header affiche l'icône `Shield`, le titre, et le count de règles actives
**And** le style est cohérent avec les autres cards de settings

##### AC7: i18n
- [ ] Tous les textes utilisent `t()` avec namespace `firewall`
- [ ] Clés ajoutées dans `en.json` et `fr.json`
- [ ] Labels : "Firewall Rules", "Add Rule", "Port", "Protocol", "Label", "No rules configured", "Port already in use", etc.

---

### Story 12.5: Installation et Sudoers

#### Story

**As a** développeur,
**I want** que le script d'installation configure automatiquement le script firewall et les permissions sudoers,
**So that** la fonctionnalité firewall fonctionne out-of-the-box après installation.

#### Context

- Epic: 12 - Gestion Firewall par Serveur
- Dependencies: Stories 12-1 completed
- Fichiers: `install.sh`, `scripts/remnant-firewall.sh`

#### Acceptance Criteria

##### AC1: Installation du script
**Given** l'install script s'exécute
**When** l'étape de configuration est atteinte
**Then** `remnant-firewall.sh` est copié dans `/opt/remnant/scripts/`
**And** les permissions sont `750` (rwxr-x---)
**And** le propriétaire est `root:remnant`

##### AC2: Configuration sudoers
**Given** l'install script s'exécute
**When** la configuration sudoers est appliquée
**Then** le fichier `/etc/sudoers.d/remnant-firewall` est créé avec :
`remnant ALL=(ALL) NOPASSWD: /opt/remnant/scripts/remnant-firewall.sh`
**And** les permissions du fichier sont `0440`
**And** `visudo -c` valide le fichier

##### AC3: CLI firewall
**Given** la CLI Remnant est disponible
**When** j'exécute `remnant firewall list`
**Then** les règles firewall actives sont affichées
**And** `remnant firewall sync` réapplique toutes les règles enabled depuis la DB

##### AC4: Désinstallation
**Given** `remnant uninstall` est exécuté
**When** le cleanup s'effectue
**Then** le fichier sudoers est supprimé
**And** toutes les règles firewall Remnant sont retirées (deny all)
**And** le script `remnant-firewall.sh` est supprimé

---

## Epic 13: Onboarding Administrateur

L'administrateur est guidé par un wizard d'onboarding clair et efficace lors du tout premier lancement de Remnant, remplaçant le seed `admin/password` par défaut. L'onboarding n'est disponible qu'une seule fois, tant qu'aucun utilisateur n'existe en base.

**Objectifs:**
- Sécuriser l'installation dès le départ (plus de credentials par défaut)
- Guider l'admin dans la configuration initiale
- Donner une première impression de qualité

### Architecture

**Flow utilisateur (4 écrans) :**
1. **Bienvenue + Diagnostic système** — checks automatiques (Java, RAM, disque, firewall), non-bloquant
2. **Compte administrateur** — username, mot de passe avec indicateur de force, confirmation
3. **Langue** — sélection par cartes cliquables (FR/EN), pré-détection via `navigator.language`
4. **Terminé** — auto-login effectué, redirection vers le dashboard

**Architecture technique :**
```
GET  onboarding.needsSetup  → { needsSetup: boolean }  (publicProcedure)
GET  onboarding.systemCheck  → { java, memory, disk, firewall }  (publicProcedure, guard needsSetup)
POST onboarding.setup        → crée l'admin, auto-login → { access_token, user }  (publicProcedure, guard needsSetup)
```

Le guard `COUNT(users) > 0` sur les endpoints publics se verrouille définitivement après le premier setup. SQLite single-writer empêche toute race condition.

### Story 13.1: Shared — Schemas Zod Onboarding

#### Story

**As a** développeur,
**I want** des schemas Zod partagés pour l'onboarding,
**So that** le backend et le frontend valident les mêmes données.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Aucune — story fondatrice
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-1-shared-schemas-onboarding.md`

#### Acceptance Criteria

##### AC1: Schema setupRequest
**Given** les schemas partagés existent
**When** je valide un input de setup
**Then** `setupRequestSchema` valide `{ username, password, locale }` avec les mêmes règles que `createUserSchema`

##### AC2: Schema setupResponse
**Given** les schemas partagés existent
**When** le setup renvoie une réponse
**Then** `setupResponseSchema` définit `{ access_token, user: { id, username, permissions, locale } }`

##### AC3: Schema systemCheckResponse
**Given** les schemas partagés existent
**When** le diagnostic système renvoie une réponse
**Then** `systemCheckResponseSchema` définit `{ java, memory, disk, firewall }` avec les types appropriés

##### AC4: Schema needsSetupResponse
**Given** les schemas partagés existent
**When** le check needsSetup renvoie une réponse
**Then** `needsSetupResponseSchema` définit `{ needsSetup: boolean }`

##### AC5: Export
**Given** les schemas sont définis
**When** j'importe depuis `@remnant/shared`
**Then** tous les schemas onboarding sont disponibles

---

### Story 13.2: Backend — Endpoint `needsSetup`

#### Story

**As a** application frontend,
**I want** savoir si l'instance nécessite un setup initial,
**So that** je puisse rediriger vers l'onboarding ou le login.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-1 completed
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-2-backend-needs-setup.md`

#### Acceptance Criteria

##### AC1: Endpoint public
**Given** l'endpoint `onboarding.needsSetup` existe
**When** un utilisateur non authentifié l'appelle
**Then** il reçoit une réponse sans erreur 401

##### AC2: Aucun utilisateur
**Given** la table `users` est vide
**When** j'appelle `needsSetup`
**Then** la réponse est `{ needsSetup: true }`

##### AC3: Utilisateur existant
**Given** au moins un utilisateur existe
**When** j'appelle `needsSetup`
**Then** la réponse est `{ needsSetup: false }`

##### AC4: Router enregistré
**Given** le router `onboarding` existe
**When** le backend démarre
**Then** il est accessible dans `appRouter`

---

### Story 13.3: Backend — Service diagnostic système

#### Story

**As a** endpoint `systemCheck`,
**I want** un service qui collecte les informations système,
**So that** elles soient exposées au frontend pendant l'onboarding.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Aucune — peut être fait en parallèle de 13-2
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-3-backend-system-check-service.md`

#### Acceptance Criteria

##### AC1: Check Java
**Given** Java est installé
**When** le service exécute `java -version`
**Then** il renvoie `{ installed: true, version: '21.0.3' }`

##### AC2: Java absent
**Given** Java n'est pas installé
**When** le service exécute `java -version`
**Then** il renvoie `{ installed: false }`

##### AC3: Check mémoire
**Given** le système a de la RAM
**When** le service appelle `os.totalmem()` / `os.freemem()`
**Then** il renvoie `{ totalMB, freeMB }` en mégaoctets

##### AC4: Check disque
**Given** le répertoire data existe
**When** le service vérifie l'espace disque
**Then** il renvoie `{ totalMB, freeMB }` en mégaoctets

##### AC5: Check firewall
**Given** un firewall est installé
**When** le service détecte ufw/firewalld/iptables
**Then** il renvoie `{ detected: true, type: 'ufw' }`

##### AC6: Isolation des checks
**Given** un check échoue (ex: Java absent)
**When** les autres checks s'exécutent
**Then** ils renvoient leurs résultats normalement (pas de fail global)

##### AC7: Timeout
**Given** un check prend trop de temps
**When** 5 secondes sont écoulées
**Then** le check est interrompu et renvoie un résultat par défaut

---

### Story 13.4: Backend — Endpoint `systemCheck`

#### Story

**As a** page d'onboarding,
**I want** récupérer le diagnostic système,
**So that** je puisse l'afficher sur l'écran de bienvenue.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories 13-2 et 13-3 completed
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-4-backend-system-check-endpoint.md`

#### Acceptance Criteria

##### AC1: Endpoint public
**Given** l'endpoint `onboarding.systemCheck` existe
**When** un utilisateur non authentifié l'appelle
**Then** il reçoit le diagnostic système

##### AC2: Guard needsSetup
**Given** au moins un utilisateur existe
**When** j'appelle `systemCheck`
**Then** je reçois une erreur `FORBIDDEN`

##### AC3: Résultat complet
**Given** aucun utilisateur n'existe
**When** j'appelle `systemCheck`
**Then** je reçois `{ java, memory, disk, firewall }` conforme au schema

---

### Story 13.5: Backend — Endpoint `setup` (création admin + auto-login)

#### Story

**As a** administrateur configurant Remnant pour la première fois,
**I want** créer mon compte et être connecté automatiquement,
**So that** je n'aie pas à me reconnecter après l'onboarding.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories 13-1 et 13-2 completed
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-5-backend-setup-endpoint.md`

#### Acceptance Criteria

##### AC1: Endpoint public
**Given** l'endpoint `onboarding.setup` existe
**When** un utilisateur non authentifié l'appelle
**Then** il peut créer un compte

##### AC2: Validation input
**Given** un input invalide
**When** j'appelle `setup`
**Then** une erreur Zod est retournée (username 3-32 chars, password 8+ chars)

##### AC3: Guard définitif
**Given** un utilisateur existe déjà
**When** j'appelle `setup`
**Then** je reçois `FORBIDDEN` — l'endpoint est verrouillé pour toujours

##### AC4: Création admin
**Given** aucun utilisateur n'existe
**When** j'appelle `setup` avec des données valides
**Then** un utilisateur est créé avec `permissions: ['*']`

##### AC5: Auto-login
**Given** l'utilisateur est créé
**When** le setup se termine
**Then** un JWT + refresh token sont générés
**And** le refresh token est set en cookie httpOnly
**And** la réponse contient `{ access_token, user }`

##### AC6: Locale persistée
**Given** le locale est fourni dans l'input
**When** l'utilisateur est créé
**Then** le champ `locale` est persisté en base

---

### Story 13.6: Backend — Suppression du seed admin par défaut

#### Story

**As a** mainteneur du projet,
**I want** supprimer le seed `admin/password`,
**So that** aucun credential par défaut n'existe en production.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-5 completed (le setup endpoint doit exister avant de supprimer le seed)
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-6-backend-remove-seed.md`

#### Acceptance Criteria

##### AC1: Suppression de seedDefaultAdmin
**Given** la fonction `seedDefaultAdmin()` existe dans `seed.ts`
**When** je la supprime
**Then** plus aucun utilisateur n'est créé automatiquement au démarrage

##### AC2: Retrait de l'appel
**Given** `index.ts` appelle `seedDefaultAdmin()`
**When** je retire l'appel
**Then** le backend démarre normalement avec une base vide

##### AC3: Nettoyage fichier
**Given** `seed.ts` n'a plus de contenu utile
**When** le fichier est vide
**Then** il est supprimé

##### AC4: Démarrage sans erreur
**Given** la base est vide
**When** le backend démarre
**Then** aucune erreur — l'app attend l'onboarding

---

### Story 13.7: Frontend — Hooks `useOnboarding`

#### Story

**As a** composant frontend,
**I want** des hooks tRPC pour l'onboarding,
**So that** je puisse appeler les endpoints `needsSetup`, `systemCheck` et `setup`.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories backend 13-2 à 13-5 completed
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-7-frontend-hooks-onboarding.md`

#### Acceptance Criteria

##### AC1: useNeedsSetup
**Given** le hook est utilisé
**When** il est appelé
**Then** il renvoie `{ needsSetup: boolean }`

##### AC2: useSystemCheck
**Given** le hook est utilisé avec `needsSetup: true`
**When** il est appelé
**Then** il renvoie le diagnostic système
**And** il est disabled si `needsSetup` est `false`

##### AC3: useSetup
**Given** le hook est utilisé
**When** la mutation réussit
**Then** le store auth est mis à jour avec `access_token` et `user`

---

### Story 13.8: Frontend — Guard `AuthInitializer` + route `/setup`

#### Story

**As a** administrateur accédant à Remnant pour la première fois,
**I want** être redirigé automatiquement vers l'onboarding,
**So that** je ne voie jamais un login sans compte existant.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-7 completed
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-8-frontend-guard-route.md`

#### Acceptance Criteria

##### AC1: Check needsSetup au démarrage
**Given** `AuthInitializer` se charge
**When** il appelle `needsSetup`
**Then** le résultat détermine la redirection

##### AC2: Redirect vers /setup
**Given** `needsSetup` est `true`
**When** n'importe quelle URL est demandée
**Then** l'utilisateur est redirigé vers `/setup`

##### AC3: Flow normal
**Given** `needsSetup` est `false`
**When** l'app se charge
**Then** le flow d'auth actuel est inchangé (refresh token → login ou app)

##### AC4: Route déclarée
**Given** la route `/setup` existe dans `routes.tsx`
**When** l'utilisateur y accède
**Then** la page d'onboarding s'affiche

##### AC5: Protection post-setup
**Given** un utilisateur existe (`needsSetup: false`)
**When** quelqu'un accède à `/setup`
**Then** il est redirigé vers `/login`

---

### Story 13.9: Frontend — Page wizard `/setup`

#### Story

**As a** administrateur configurant Remnant,
**I want** un wizard d'onboarding clair et rapide,
**So that** je puisse configurer mon panel en moins d'une minute.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories 13-7 et 13-8 completed
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-9-frontend-setup-wizard.md`

#### Acceptance Criteria

##### AC1: Écran Bienvenue
**Given** je suis sur `/setup`
**When** la page se charge
**Then** je vois le logo, le titre « Bienvenue sur Remnant », et le diagnostic système

##### AC2: Diagnostic progressif
**Given** l'écran de bienvenue est affiché
**When** les checks système s'exécutent
**Then** chaque check apparaît progressivement avec une micro-animation

##### AC3: Statuts du diagnostic
**Given** les checks sont terminés
**When** je regarde les résultats
**Then** chaque check a un statut : ✅ ok, ⚠️ warning, ❌ erreur avec texte d'aide contextuel

##### AC4: Seuils
**Given** les checks sont évalués
**When** Java est absent → ❌
**And** RAM libre < 4 Go → ⚠️
**And** disque libre < 5 Go → ⚠️

##### AC5: Diagnostic non-bloquant
**Given** un check est en erreur
**When** je regarde le bouton « Continuer »
**Then** il est toujours actif

##### AC6: Écran Compte
**Given** je suis à l'étape 1/2
**When** la page s'affiche
**Then** je vois les champs username, password (toggle visibilité), confirmation password

##### AC7: Indicateur de force
**Given** je saisis un mot de passe
**When** je tape
**Then** une barre visuelle indique la force (faible/moyen/fort)

##### AC8: Validation inline
**Given** je remplis le formulaire
**When** un champ est invalide
**Then** l'erreur s'affiche en temps réel (username 3-32 chars, password 8+ chars, confirmation match)

##### AC9: Bouton disabled
**Given** le formulaire est invalide
**When** je regarde le bouton « Continuer »
**Then** il est disabled

##### AC10: Écran Langue
**Given** je suis à l'étape 2/2
**When** la page s'affiche
**Then** je vois des cartes cliquables FR 🇫🇷 / EN 🇬🇧

##### AC11: Pré-sélection langue
**Given** mon navigateur est en français
**When** l'écran langue s'affiche
**Then** FR est pré-sélectionné

##### AC12: Changement en live
**Given** je sélectionne une langue
**When** je clique sur la carte
**Then** l'interface change de langue immédiatement

##### AC13: Soumission
**Given** je clique sur « Terminer la configuration »
**When** le setup est déclenché
**Then** `onboarding.setup` est appelé avec les données collectées

##### AC14: Écran Terminé
**Given** le setup réussit
**When** l'écran de confirmation s'affiche
**Then** je vois un message de succès et mon nom d'utilisateur

##### AC15: Auto-login effectif
**Given** le setup a réussi
**When** je clique sur « Accéder au panel »
**Then** je suis redirigé vers `/app` et je suis authentifié

##### AC16: Barre de progression
**Given** je suis sur les écrans compte ou langue
**When** la page s'affiche
**Then** une barre de progression indique l'étape actuelle (1/2, 2/2)

##### AC17: Gestion d'erreur
**Given** le setup échoue
**When** une erreur est retournée
**Then** elle s'affiche inline sans perdre les données saisies

---

### Story 13.10: Frontend — i18n onboarding (FR + EN)

#### Story

**As a** administrateur francophone ou anglophone,
**I want** que l'onboarding soit traduit dans ma langue,
**So that** je comprenne chaque étape.

#### Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-9 completed (le contenu textuel final est connu)
- Fichier story détaillé: `_bmad-output/implementation-artifacts/13-10-frontend-i18n-onboarding.md`

#### Acceptance Criteria

##### AC1: Aucun texte en dur
**Given** la page d'onboarding est rendue
**When** j'inspecte le code
**Then** toutes les chaînes utilisent `t()`

##### AC2: Clés FR et EN
**Given** les fichiers de traduction existent
**When** j'ouvre `en.json` et `fr.json`
**Then** les clés `onboarding.*` existent dans les deux fichiers

##### AC3: Couverture complète
**Given** les traductions existent
**When** je liste les clés
**Then** elles incluent : titres, sous-titres, labels, erreurs, textes d'aide diagnostic, boutons, message de succès

---

## Epic 14: Authentification à Deux Facteurs (TOTP)

L'administrateur peut activer le 2FA TOTP sur son compte pour sécuriser l'accès au panel, via scan de QR code ou saisie manuelle du secret dans un gestionnaire de mots de passe.

### Story 14.1: Schemas Partagés 2FA

#### Story

**As a** développeur,
**I want** les schemas Zod et types partagés pour le 2FA,
**So that** backend et frontend partagent les mêmes contrats de validation.

#### Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Aucune — story initiale de l'epic

#### Acceptance Criteria

##### AC1: Schemas TOTP définis
**Given** le package shared
**When** les schemas 2FA sont créés
**Then** `totp_setup_response_schema` retourne `{ qr_code_uri: string, secret: string, recovery_codes: Array<string> }`
**And** `totp_verify_request_schema` valide `{ code: string }` (6 chiffres)
**And** `totp_disable_request_schema` valide `{ code: string }`
**And** `totp_status_response_schema` retourne `{ enabled: boolean }`

##### AC2: Error codes 2FA ajoutés
**Given** les constantes d'erreur partagées
**When** les codes 2FA sont ajoutés
**Then** `TOTP_ALREADY_ENABLED`, `TOTP_NOT_ENABLED`, `TOTP_INVALID_CODE`, `TOTP_SETUP_REQUIRED` existent dans `error_codes.ts`

---

### Story 14.2: Schema DB & Service TOTP Backend

#### Story

**As a** développeur backend,
**I want** le schema DB et le service TOTP,
**So that** les secrets TOTP sont stockés de manière sécurisée et les codes validés correctement.

#### Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.1 complétée

#### Acceptance Criteria

##### AC1: Schema Drizzle user_totp
**Given** la base de données SQLite
**When** la migration est exécutée
**Then** la table `user_totp` existe avec `user_id` (FK → users, unique), `encrypted_secret` (text), `verified` (boolean, default false), `created_at`
**And** la table `recovery_codes` existe avec `user_id` (FK → users), `code_hash` (text), `used_at` (text, nullable)

##### AC2: Génération du secret TOTP
**Given** un utilisateur sans 2FA activé
**When** le service `generateTotpSetup(userId)` est appelé
**Then** un secret TOTP de 20 bytes est généré
**And** l'URI `otpauth://totp/Remnant:{username}?secret={base32}&issuer=Remnant` est construite
**And** 8 recovery codes alphanumériques sont générés et hashés en base
**And** le secret est chiffré avant stockage avec `verified: false`

##### AC3: Validation du code TOTP
**Given** un utilisateur avec un secret TOTP stocké
**When** le service `verifyTotpCode(userId, code)` est appelé
**Then** le code est validé avec une fenêtre de tolérance de ±1 période (30s)
**And** retourne `true` si valide, `false` sinon

##### AC4: Validation recovery code
**Given** un utilisateur avec des recovery codes
**When** le service `verifyRecoveryCode(userId, code)` est appelé
**Then** le code est comparé aux hashs non utilisés
**And** si valide, le code est marqué `used_at = now()` et retourne `true`

---

### Story 14.3: Router tRPC 2FA

#### Story

**As a** développeur backend,
**I want** les endpoints tRPC pour le setup, la vérification et la désactivation du 2FA,
**So that** le frontend puisse piloter le flux 2FA complet.

#### Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.2 complétée

#### Acceptance Criteria

##### AC1: Endpoint setup
**Given** un utilisateur authentifié sans 2FA
**When** il appelle `totp.setup`
**Then** il reçoit `{ qr_code_uri, secret, recovery_codes }`
**And** si 2FA déjà activé, erreur `TOTP_ALREADY_ENABLED`

##### AC2: Endpoint verify (activation)
**Given** un utilisateur avec un setup TOTP non vérifié
**When** il appelle `totp.verify` avec un code valide
**Then** le TOTP passe à `verified: true`
**And** le champ `totp_enabled` est reflété sur le user

##### AC3: Endpoint disable
**Given** un utilisateur avec 2FA activé
**When** il appelle `totp.disable` avec un code TOTP valide
**Then** le secret et les recovery codes sont supprimés
**And** le 2FA est désactivé

##### AC4: Endpoint status
**Given** un utilisateur authentifié
**When** il appelle `totp.status`
**Then** il reçoit `{ enabled: boolean }`

---

### Story 14.4: Intégration 2FA dans le Flow de Login

#### Story

**As a** administrateur avec 2FA activé,
**I want** qu'on me demande mon code TOTP après le login,
**So that** mon compte soit protégé même si mon mot de passe est compromis.

#### Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.3 complétée

#### Acceptance Criteria

##### AC1: Login en deux étapes
**Given** un utilisateur avec 2FA activé
**When** il soumet ses credentials valides sur `auth.login`
**Then** il reçoit un token temporaire (non fonctionnel pour les routes protégées) et `{ requires_totp: true }`
**And** l'access token complet n'est délivré qu'après `auth.verifyTotp`

##### AC2: Vérification TOTP au login
**Given** un utilisateur avec un token temporaire
**When** il appelle `auth.verifyTotp` avec un code TOTP ou recovery code valide
**Then** il reçoit l'access token complet + refresh token cookie
**And** un recovery code utilisé est marqué consommé

##### AC3: Login sans 2FA inchangé
**Given** un utilisateur sans 2FA
**When** il soumet ses credentials valides
**Then** le flow actuel est préservé — access token + refresh cookie directement

---

### Story 14.5: Page Account — Setup 2FA Frontend

#### Story

**As a** administrateur,
**I want** activer le 2FA depuis ma page de compte utilisateur (`/app/account`),
**So that** je puisse scanner le QR code ou copier le secret manuellement.

#### Context

- Note: La section 2FA est dans la page Account (`/app/account`), pas dans la page Settings app. Le pseudo dans la sidebar est un dropdown avec "Paramètres" et "Déconnexion". Une epic dédiée à la page Account utilisateur sera créée ultérieurement.

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.3 complétée

#### Acceptance Criteria

##### AC1: Section 2FA dans les settings
**Given** je suis sur la page settings de mon compte
**When** je vois la section "Authentification à deux facteurs"
**Then** le statut actuel est affiché (activé/désactivé)
**And** un bouton "Activer" ou "Désactiver" est disponible

##### AC2: Flow d'activation — QR + secret manuel côte à côte
**Given** je clique sur "Activer le 2FA"
**When** le setup est initialisé
**Then** le QR code et le secret en base32 (formaté en groupes de 4 caractères) sont affichés **côte à côte**
**And** un bouton "Copier" est disponible à côté du secret
**And** un champ de confirmation demande le code à 6 chiffres

##### AC3: Affichage des recovery codes
**Given** j'ai confirmé mon code TOTP avec succès
**When** l'activation est validée
**Then** les 8 recovery codes sont affichés dans une modale dédiée
**And** des boutons "Copier tout" et "Télécharger (.txt)" sont disponibles
**And** un avertissement indique que ces codes ne seront plus jamais affichés

##### AC4: Désactivation du 2FA
**Given** j'ai le 2FA activé
**When** je clique "Désactiver" et saisis mon code TOTP
**Then** le 2FA est désactivé et la section revient à l'état initial

##### AC5: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

---

### Story 14.6: Écran TOTP sur la Page Login

#### Story

**As a** administrateur avec 2FA activé,
**I want** un écran de saisie du code TOTP après mon login,
**So that** je puisse compléter l'authentification en deux étapes.

#### Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.4 et 14.5 complétées

#### Acceptance Criteria

##### AC1: Étape TOTP après credentials
**Given** je soumets mes credentials valides et mon compte a le 2FA
**When** le serveur répond `requires_totp: true`
**Then** la page login affiche un champ de saisie du code à 6 chiffres
**And** un lien "Utiliser un code de récupération" est disponible

##### AC2: Saisie du code TOTP
**Given** je suis sur l'écran de saisie TOTP
**When** je saisis un code valide
**Then** je suis authentifié et redirigé vers `/app`

##### AC3: Code de récupération
**Given** je clique "Utiliser un code de récupération"
**When** je saisis un recovery code valide
**Then** je suis authentifié et un avertissement m'informe du nombre de codes restants

##### AC4: Erreur code invalide
**Given** je saisis un code TOTP invalide
**When** la validation échoue
**Then** un message d'erreur s'affiche et je peux réessayer

##### AC5: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

---

### Story 14.7: Étape 2FA dans le Wizard d'Onboarding

#### Story

**As a** administrateur configurant Remnant pour la première fois,
**I want** qu'on me propose d'activer le 2FA pendant l'onboarding,
**So that** mon compte soit sécurisé dès la création, sans devoir aller dans les settings après.

#### Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.5 complétée
- Note: Le wizard actuel n'a que 2 étapes (`account` → `complete`). Le formulaire account intègre username, password, confirm password et sélection de langue dans une seule card. L'étape security s'insère entre account et complete.

#### Acceptance Criteria

##### AC1: Nouvelle étape dans le wizard
**Given** je suis dans le wizard d'onboarding
**When** je soumets le formulaire account (setup réussi, auto-login effectué)
**Then** j'arrive sur une nouvelle étape "security" (entre account et complete)

##### AC2: Présentation de l'option 2FA
**Given** je suis sur l'étape security
**When** la page s'affiche
**Then** je vois un titre, un texte explicatif, un bouton "Activer le 2FA" et un lien "Ignorer pour l'instant"

##### AC3: Activation du 2FA
**Given** je clique sur "Activer le 2FA"
**When** le setup réussit et je confirme avec un code valide
**Then** les recovery codes s'affichent avec boutons "Copier tout" et "Télécharger"
**And** un bouton "Continuer" mène à l'étape complete

##### AC4: Ignorer le 2FA
**Given** je suis sur l'étape security
**When** je clique sur "Ignorer pour l'instant"
**Then** je passe directement à l'étape complete sans setup 2FA

##### AC5: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

---

## Epic 15: Documentation Interne Intégrée

L'utilisateur peut consulter la documentation complète directement dans l'application, sans quitter son contexte, avec une sidebar de navigation dédiée. Le style des éléments markdown rendus (h1, h2, h3, tables, code blocks, admonitions, listes, liens) s'inspire de VitePress (https://github.com/vuejs/vitepress) — la référence VitePress concerne uniquement le rendu du contenu markdown, pas le design de l'application. La documentation utilise un layout dédié et distinct des autres layouts de l'application (MainLayout, ServerLayout).

### Story 15.1: Infrastructure de rendu Markdown

#### Story

**As a** développeur,
**I want** une infrastructure de rendu markdown dans le frontend,
**So that** les fichiers `.md` existants soient affichés avec un rendu riche (GFM, code blocks, admonitions, tables).

#### Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Aucune — story initiale de l'epic
- **Référence style markdown** : s'inspirer de VitePress (https://github.com/vuejs/vitepress) uniquement pour le rendu des éléments markdown (h1, h2, h3, tables, code blocks, admonitions, listes, liens) — pas pour le design global de l'app. Adapté au design system Tailwind du projet
- Fichiers clés:
  - Installer: `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, solution syntax highlighting
  - Créer: composant `MarkdownRenderer` réutilisable

#### Acceptance Criteria

##### AC1: Dépendances installées
**Given** le package frontend
**When** les dépendances markdown sont ajoutées
**Then** `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings` et une solution de syntax highlighting sont installés

##### AC2: Composant MarkdownRenderer
**Given** un contenu markdown string
**When** je rends le composant `MarkdownRenderer`
**Then** le markdown est affiché avec un rendu riche et stylisé

##### AC3: Support GFM
**Given** du contenu markdown avec tables, strikethrough, task lists
**When** le composant rend le contenu
**Then** tous les éléments GFM sont correctement affichés

##### AC4: Code blocks avec coloration syntaxique
**Given** des blocs de code avec langage spécifié (bash, typescript, yaml, caddy)
**When** le composant rend les code blocks
**Then** la coloration syntaxique est appliquée avec header langage et bouton copier

##### AC5: Admonitions VitePress
**Given** des blocs `::: warning`, `::: danger`, `::: tip`, `::: info`
**When** le composant rend ces blocs
**Then** des callouts stylisés sont affichés avec couleurs distinctes (amber, red, blue, green)

##### AC6: Styling Tailwind cohérent
**Given** le composant rendu
**When** je compare avec le design system existant
**Then** typographie, espacements et couleurs sont cohérents avec le reste de l'application

##### AC7: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

---

### Story 15.2: DocsLayout avec sidebar de navigation

#### Story

**As a** utilisateur,
**I want** une sidebar de navigation dédiée à la documentation avec un bouton retour vers l'application,
**So that** je puisse naviguer entre les pages de documentation sans perdre mon contexte.

#### Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Aucune — peut être parallélisé avec Story 15.1
- **IMPORTANT** : Le `DocsLayout` doit être un layout **dédié et distinct** des layouts existants (`MainLayout`, `ServerLayout`). Même si le design visuel reste cohérent avec l'app, le layout documentation est indépendant et ne réutilise pas `MainLayoutContent` — il a sa propre structure pour pouvoir évoluer séparément (table des matières, breadcrumbs, navigation prev/next, etc.)
- Fichiers clés:
  - Créer: `DocsLayout` — layout unique dédié à la documentation
  - Modifier: `MainLayout` — ajouter entrée "Documentation" dans la sidebar principale
  - Modifier: `routes.tsx` — ajouter les routes `/app/docs`

#### Acceptance Criteria

##### AC1: DocsLayout créé
**Given** un layout dédié à la documentation
**When** je crée `DocsLayout`
**Then** il utilise `useSidebarItems` avec header `backPath` vers `/app`

##### AC2: Sidebar documentation
**Given** la sidebar docs est affichée
**When** je navigue dans la documentation
**Then** tous les chapitres sont listés dans l'ordre logique : Introduction, Installation, Configuration, Gestion des serveurs, Domaine, Console, Fichiers, Plugins, Tâches, Utilisateurs, Sécurité, Docker, API, Rate Limits

##### AC3: Bouton retour
**Given** je suis dans la documentation
**When** je clique sur le bouton retour en haut de la sidebar
**Then** je suis redirigé vers `/app`

##### AC4: Entrée Documentation dans MainLayout
**Given** la sidebar principale de l'application
**When** je regarde les items de navigation
**Then** une entrée "Documentation" avec icône `BookOpen` est visible

##### AC5: Highlight page active
**Given** je suis sur une page de documentation
**When** je regarde la sidebar
**Then** la page active est visuellement mise en avant

##### AC6: Navigation mobile
**Given** je suis sur mobile
**When** j'accède à la documentation
**Then** la navigation fonctionne correctement

##### AC7: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

---

### Story 15.3: Routing et chargement des pages markdown

#### Story

**As a** utilisateur,
**I want** que chaque page de documentation ait sa propre URL,
**So that** je puisse naviguer directement vers une section et partager des liens.

#### Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Story 15.2 (DocsLayout)
- Fichiers clés:
  - Modifier: `routes.tsx` — routes `/app/docs/$slug` avec `DocsLayout`
  - Créer: mapping slug → fichier markdown (import statique via Vite `?raw`)

#### Acceptance Criteria

##### AC1: Route dynamique
**Given** les routes de l'application
**When** je navigue vers `/app/docs/installation`
**Then** le contenu de `installation.md` est chargé et affiché

##### AC2: Redirection par défaut
**Given** je navigue vers `/app/docs`
**When** la page se charge
**Then** je suis redirigé vers `/app/docs/introduction`

##### AC3: Import statique Vite
**Given** les fichiers markdown
**When** ils sont chargés
**Then** l'import est fait via `?raw` (Vite raw import), sans fetch réseau

##### AC4: Mapping slug → fichier
**Given** un slug dans l'URL (ex: `server-management`)
**When** le système cherche le fichier correspondant
**Then** le bon fichier markdown est résolu via un objet TypeScript

##### AC5: Page 404 docs
**Given** un slug invalide dans l'URL
**When** je navigue vers `/app/docs/non-existant`
**Then** une page 404 documentation est affichée

---

### Story 15.4: Page markdown.tsx — assemblage final

#### Story

**As a** utilisateur,
**I want** voir la documentation rendue avec des éléments markdown stylisés à la VitePress,
**So that** je puisse lire une documentation claire, structurée et agréable dans l'application.

#### Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Story 15.1 (MarkdownRenderer), Story 15.3 (routing)
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/app/docs/markdown.tsx`

#### Acceptance Criteria

##### AC1: Assemblage MarkdownRenderer + route
**Given** le composant `markdown.tsx`
**When** je navigue vers une page docs
**Then** le `MarkdownRenderer` affiche le contenu chargé via le slug de la route

##### AC2: Headings avec ancres cliquables
**Given** des headings dans le markdown
**When** le contenu est rendu
**Then** chaque heading a une ancre cliquable (via `rehype-slug` + `rehype-autolink-headings`)

##### AC3: Admonitions stylisées
**Given** des blocs warning, danger, tip, info
**When** le contenu est rendu
**Then** des callouts avec couleurs distinctes sont affichés, cohérents avec le design system

##### AC4: Code blocks avec bouton copier
**Given** des code blocks dans le markdown
**When** le contenu est rendu
**Then** chaque code block a un header avec le langage et un bouton copier

##### AC5: Tables stylisées
**Given** des tables dans le markdown
**When** le contenu est rendu
**Then** les tables ont bordures, alternance de couleurs et scroll horizontal responsive

##### AC6: Liens internes
**Given** des liens entre pages docs dans le markdown
**When** je clique sur un lien interne
**Then** la navigation se fait via le router TanStack (pas de full reload)

##### AC7: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

---

### Story 15.5: Mise à jour de DocsLink et intégration globale

#### Story

**As a** utilisateur,
**I want** que les liens de documentation existants dans l'app pointent vers la doc interne,
**So that** je reste dans l'application au lieu d'être redirigé vers un site externe.

#### Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Story 15.4 (page docs fonctionnelle)
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/app/features/docs_link.tsx`
  - Vérifier: tous les usages existants de `DocsLink` dans l'app

#### Acceptance Criteria

##### AC1: DocsLink modifié
**Given** le composant `DocsLink`
**When** je clique sur un lien de documentation
**Then** je navigue vers `/app/docs/$slug` via le router TanStack

##### AC2: Mapping anciens paths
**Given** les anciens paths (ex: `/guide/configuration`)
**When** `DocsLink` résout le chemin
**Then** le mapping vers le nouveau slug est correct (ex: `configuration`)

##### AC3: Tous les DocsLink existants fonctionnent
**Given** tous les usages de `DocsLink` dans l'application
**When** je clique sur chacun
**Then** la navigation vers la bonne page docs interne fonctionne

##### AC4: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

---

## Post-MVP Enhancements

Les fonctionnalités suivantes ont été ajoutées après la complétion du MVP (v0.11.0 → v0.13.0) :

### Navigation & Layout (v0.11.0)
- Restructuration complète du frontend avec Sidebar desktop fixe
- Bottom tab bar pour navigation mobile
- Compound components: ServerPageHeader, ServerSection

### Internationalisation Avancée (v0.12.0 - v0.12.1)
- Persistance de la langue utilisateur en base de données (colonne `locale`)
- Endpoint tRPC `users.updateLocale`
- Restauration automatique de la langue au login
- Support des toasts localisés avec description par défaut

### UI Polish (v0.12.2 - v0.12.5)
- Normalisation de l'opacité des bordures (border-black/10)
- Dialogue d'upload de fichiers avec zone drag-and-drop
- Alignement des composants ServerPageHeader
- Route Settings globale (/app/settings)

### CLI (v0.12.6)
- Commande `remnant domains` — diagnostic Nginx/SSL
- Commande `remnant uninstall` — désinstallation complète
- Amélioration de la gestion d'erreurs dans les services utilisateurs

### PWA (v0.13.0)
- Manifest webmanifest avec icône SVG
- Service worker minimal pour installabilité
- Meta tags pour mobile (theme-color, viewport-fit)

### Multi-serveur & Ports (v0.14.x)
- Auto-assignation du port à la création de serveur (incrémentation depuis 25565)
- Validation d'unicité des ports (création et mise à jour)
- Contrainte UNIQUE en base de données sur `servers.java_port`
- Régénération automatique de `server.properties` lors du changement de port
- Gestion d'erreur `PORT_ALREADY_IN_USE` dans le router tRPC (code CONFLICT)

---

## Epic 17: Domaines Personnalisés par Serveur

L'administrateur peut ajouter des domaines personnalisés à ses serveurs Minecraft, voir les DNS records à configurer, et accéder à ses services (BlueMap, Dynmap, etc.) via des domaines HTTPS sécurisés.

**FRs couverts :** FR1, FR2, FR3, FR8, FR10
**NFRs couverts :** NFR1, NFR2, NFR3, NFR4, NFR5, NFR6, NFR7

### Story 17.1: Script Shell Domaines Sécurisé

As a administrateur système,
I want un script shell sécurisé qui gère les vhosts Nginx et les certificats SSL,
So that les opérations système privilégiées sont isolées et validées.

**Acceptance Criteria:**

##### AC1: Validation d'entrée
**Given** un appel au script avec un nom de domaine
**When** le domaine contient des caractères invalides (`;`, `|`, `&`, espaces, `..`)
**Then** le script retourne une erreur JSON et ne modifie rien

##### AC2: Action add
**Given** un domaine valide et un port cible
**When** j'exécute `remnant-domain.sh add <domain> <port> <type>`
**Then** un fichier vhost est créé dans `/etc/nginx/sites-available/`
**And** un symlink est créé dans `/etc/nginx/sites-enabled/`
**And** `nginx -t` est exécuté avant le reload
**And** si `nginx -t` échoue, le vhost est supprimé et une erreur JSON est retournée

##### AC3: Action remove
**Given** un domaine existant
**When** j'exécute `remnant-domain.sh remove <domain>`
**Then** le vhost et le symlink sont supprimés
**And** nginx est rechargé

##### AC4: Action enable-ssl
**Given** un domaine avec un vhost actif
**When** j'exécute `remnant-domain.sh enable-ssl <domain>`
**Then** le script vérifie que le DNS pointe vers l'IP du serveur via `dig`
**And** si le DNS ne pointe pas, une erreur JSON est retournée
**And** si le DNS est correct, `certbot --nginx -d <domain>` est exécuté
**And** le résultat (succès/échec) est retourné en JSON

##### AC5: Action list
**Given** des vhosts existants
**When** j'exécute `remnant-domain.sh list`
**Then** la liste des domaines avec leur statut SSL est retournée en JSON

##### AC6: Action renew
**Given** des certificats existants
**When** j'exécute `remnant-domain.sh renew`
**Then** `certbot renew` est exécuté et le résultat retourné en JSON

##### AC7: Protection path traversal
**Given** un domaine contenant `../` ou des chemins absolus
**When** le script construit le chemin du fichier vhost
**Then** `basename` est utilisé et le chemin résultant est vérifié dans `/etc/nginx/sites-available/`

##### AC8: Types de proxy
**Given** un type `http`
**When** le vhost est généré
**Then** il contient un bloc `location / { proxy_pass http://127.0.0.1:<port>; }` avec les headers appropriés

---

### Story 17.2: Backend — Table et Service Domaines

As a administrateur,
I want que les domaines personnalisés soient persistés en base de données,
So that je puisse les gérer depuis le panel.

**Acceptance Criteria:**

##### AC1: Schema DB
**Given** la base de données SQLite
**When** la migration s'exécute
**Then** une table `custom_domains` est créée avec : `id`, `server_id` (nullable FK), `domain`, `port`, `type` (http/tcp/panel), `ssl_enabled`, `ssl_expires_at`, `created_at`
**And** une contrainte UNIQUE est posée sur `domain`

##### AC2: Service domaines
**Given** le service `domain_service.ts`
**When** j'appelle `addDomain({ serverId, domain, port, type })`
**Then** le domaine est validé via regex Zod
**And** le domaine est vérifié unique en DB
**And** le script `remnant-domain.sh add` est exécuté via `execFile` avec sudo
**And** le domaine est inséré en DB
**And** un audit log est créé

##### AC3: Suppression
**Given** un domaine existant en DB
**When** j'appelle `removeDomain(id)`
**Then** le script `remnant-domain.sh remove` est exécuté
**And** le domaine est supprimé de la DB

##### AC4: Activation SSL
**Given** un domaine existant sans SSL
**When** j'appelle `enableSsl(id)`
**Then** le script `remnant-domain.sh enable-ssl` est exécuté
**And** en cas de succès, `ssl_enabled` passe à `true` et `ssl_expires_at` est peuplé

##### AC5: Validation Zod
**Given** un domaine invalide (ex: `foo`, `a b.com`, `evil;rm`)
**When** la validation Zod s'exécute
**Then** une erreur est retournée avant tout appel au script

---

### Story 17.3: Backend — Router tRPC Domaines

As a administrateur,
I want des endpoints tRPC pour gérer les domaines,
So that le frontend puisse interagir avec le service domaines.

**Acceptance Criteria:**

##### AC1: Endpoint list
**Given** un serveur avec des domaines
**When** j'appelle `domains.list({ serverId })`
**Then** la liste des domaines du serveur est retournée avec statut SSL

##### AC2: Endpoint add
**Given** un domaine valide
**When** j'appelle `domains.add({ serverId, domain, port, type })`
**Then** le domaine est ajouté via le service
**And** la permission `servers:manage` est requise

##### AC3: Endpoint remove
**Given** un domaine existant
**When** j'appelle `domains.remove({ id })`
**Then** le domaine est supprimé via le service

##### AC4: Endpoint enableSsl
**Given** un domaine sans SSL
**When** j'appelle `domains.enableSsl({ id })`
**Then** le SSL est activé via le service

##### AC5: Endpoint dnsCheck
**Given** un domaine
**When** j'appelle `domains.dnsCheck({ domain })`
**Then** le backend résout le DNS et retourne si l'IP correspond au serveur

---

### Story 17.4: Frontend — Page Domaines par Serveur

As a administrateur,
I want une page dans les settings serveur pour gérer les domaines,
So that je puisse ajouter, supprimer et activer SSL sur mes domaines.

**Acceptance Criteria:**

##### AC1: Route et navigation
**Given** la navigation serveur
**When** je clique sur "Domaines" dans le menu settings
**Then** la page `/app/servers/:id/settings/domains` s'affiche

##### AC2: Liste des domaines
**Given** des domaines existants
**When** la page se charge
**Then** chaque domaine affiche : nom, port, type (badge HTTP/TCP), statut SSL (badge), date d'expiration SSL

##### AC3: Ajout de domaine
**Given** le formulaire d'ajout
**When** je saisis un domaine, un port, un type, et je valide
**Then** le domaine est ajouté
**And** les DNS records à configurer sont affichés (A record → IP du serveur)

##### AC4: Suppression avec confirmation
**Given** un domaine existant
**When** je clique sur supprimer
**Then** une confirmation est demandée avant la suppression

##### AC5: Activation SSL
**Given** un domaine sans SSL
**When** je clique sur "Activer SSL"
**Then** une vérification DNS est faite d'abord
**And** si le DNS est OK, certbot est lancé
**And** le statut SSL est mis à jour en temps réel

##### AC6: DNS records helper
**Given** un domaine ajouté
**When** le DNS ne pointe pas encore vers le serveur
**Then** un message clair indique l'A record à configurer (`domain → IP du serveur`)

##### AC7: i18n
- [ ] Tous les textes utilisent `t()`
- [ ] Clés ajoutées à `en.json` et `fr.json`

---

### Story 17.5: Installation et Sudoers Domaines

As a administrateur système,
I want que le script domaines soit installé et configuré automatiquement,
So that le backend puisse l'exécuter sans intervention manuelle.

**Acceptance Criteria:**

##### AC1: install.sh
**Given** l'installation de Remnant
**When** `install.sh` s'exécute
**Then** `remnant-domain.sh` est copié dans `$APP_DIR/scripts/`
**And** les permissions sont `755`, owner `root`
**And** une entrée sudoers est ajoutée : `remnant ALL=(root) NOPASSWD: $APP_DIR/scripts/remnant-domain.sh`

##### AC2: update.sh
**Given** une mise à jour de Remnant
**When** `update.sh` s'exécute
**Then** le script `remnant-domain.sh` est mis à jour
**And** les permissions sudoers sont vérifiées

---

## Epic 18: Proxy TCP pour Serveurs Minecraft

L'administrateur peut associer un domaine qui redirige le trafic TCP directement vers le port du serveur Minecraft, permettant aux joueurs de se connecter via un nom de domaine.

**FRs couverts :** FR9
**NFRs couverts :** NFR4, NFR5

### Story 18.1: Support Nginx Stream pour Proxy TCP

As a administrateur,
I want configurer un domaine TCP qui proxy le trafic vers le port Minecraft,
So that les joueurs puissent se connecter avec `play.mydomain.com`.

**Acceptance Criteria:**

##### AC1: Module stream Nginx
**Given** l'installation Nginx
**When** le script `remnant-domain.sh` reçoit un type `tcp`
**Then** il vérifie que le module `ngx_stream_module` est chargé
**And** si non chargé, retourne une erreur avec les instructions d'installation

##### AC2: Config stream
**Given** un domaine de type `tcp` avec un port cible
**When** le script génère la config
**Then** un fichier stream est créé dans `/etc/nginx/streams-available/` (ou block stream dans nginx.conf)
**And** il contient `server { listen <port_externe>; proxy_pass 127.0.0.1:<port_minecraft>; }`

##### AC3: Frontend — Type TCP
**Given** le formulaire d'ajout de domaine (Story 17.4)
**When** je sélectionne le type "Game (TCP)"
**Then** le port par défaut est prérempli avec le port Java du serveur
**And** les DNS records affichés indiquent un SRV record en plus du A record

##### AC4: nginx -t + rollback
**Given** une config stream générée
**When** `nginx -t` échoue
**Then** la config est supprimée et une erreur est retournée

---

## Epic 19: Domaine Personnalisé pour le Panel Remnant

L'administrateur peut configurer un domaine custom pour accéder au panel Remnant en HTTPS sécurisé, avec accès IP fallback optionnel, validation DNS guidée, et audit logging de toutes les opérations.

**FRs couverts :** FR5, FR6, FR7
**NFRs couverts :** NFR1, NFR2, NFR5

### Story 19.1: Backend — Service Domaine Panel

As a administrateur,
I want configurer un domaine pour le panel Remnant avec gestion SSL et accès IP fallback,
So that j'accède à mon panel via `panel.mydomain.com` en HTTPS tout en gardant un accès IP de secours.

**Acceptance Criteria:**

##### AC1: Endpoint setPanelDomain
**Given** un domaine valide
**When** j'appelle `domains.setPanelDomain({ domain })`
**Then** le vhost Nginx `remnant` est mis à jour avec le `server_name`
**And** le domaine est stocké en DB avec `server_id = NULL` et `type = 'panel'`
**And** `CORS_ORIGIN` est mis à jour avec `http://<domain>`
**And** le service Remnant est redémarré automatiquement
**And** un audit log est enregistré

##### AC2: Activation SSL panel
**Given** un domaine panel configuré
**When** j'appelle `domains.enableSsl({ id })`
**Then** certbot est lancé sur le domaine
**And** en cas de succès, `.env` est mis à jour : `CORS_ORIGIN=https://<domain>`, `SECURE_COOKIES=true`
**And** la date d'expiration SSL est stockée en DB (`ssl_expires_at`)
**And** le service Remnant est redémarré automatiquement
**And** un audit log est enregistré

##### AC3: Suppression domaine panel
**Given** un domaine panel existant
**When** j'appelle `domains.removePanelDomain()`
**Then** le vhost Nginx revient au `server_name _` par défaut
**And** `.env` est restauré avec l'IP du serveur et `SECURE_COOKIES=false`
**And** le service est redémarré
**And** un audit log est enregistré

##### AC4: Un seul domaine panel
**Given** un domaine panel déjà configuré
**When** j'essaie d'en ajouter un autre
**Then** l'ancien est supprimé puis remplacé (pas d'accumulation)

##### AC5: Validation DNS
**Given** un domaine quelconque
**When** j'appelle `domains.dnsCheck({ domain })`
**Then** le script vérifie que le domaine pointe vers l'IP du serveur
**And** retourne `{ matches, resolvedIp, serverIp }`

##### AC6: Accès IP fallback
**Given** un domaine panel avec SSL activé
**When** j'appelle `domains.ipAccess`
**Then** le statut de l'accès IP fallback est retourné (`{ enabled }`)
**When** j'appelle `domains.setIpAccess({ enabled })`
**Then** le vhost fallback IP est activé/désactivé via le script shell
**And** un audit log est enregistré

##### AC7: Rate limiting et permissions
**Given** toutes les mutations du router domaines
**Then** les mutations sont protégées par `rateLimitedPermission(10, 60s, 'users:manage')`
**And** les queries sont protégées par `requirePermission('users:manage')`

---

### Story 19.2: Frontend — Settings Domaine Panel

As a administrateur,
I want une section dans les settings globaux pour gérer le domaine du panel avec guidage DNS et gestion de l'accès IP,
So that je puisse configurer, surveiller et maintenir le domaine panel depuis l'interface.

**Acceptance Criteria:**

##### AC1: Section dans settings globaux
**Given** la page `/app/settings/general`
**When** je la visite
**Then** une section "Domaine du panel" (`PanelDomainSection`) est visible dans un `FeatureCard`

##### AC2: Guide de configuration en 3 étapes
**Given** aucun domaine panel configuré
**When** la section se charge
**Then** un guide en 3 étapes est affiché (`SetupSteps`) :
1. Créer un enregistrement DNS A pointant vers l'IP du serveur (avec bouton copier IP)
2. Saisir le domaine dans le formulaire
3. Activer SSL après propagation DNS

##### AC3: Formulaire domaine panel
**Given** aucun domaine panel configuré
**When** je saisis un domaine et valide (bouton ou Enter)
**Then** le domaine est configuré
**And** la validation regex empêche les domaines invalides avec message d'erreur

##### AC4: Affichage domaine configuré
**Given** un domaine panel configuré
**When** la section se charge
**Then** le domaine est affiché avec son statut SSL (badge SSL vert ou badge "No SSL" gris)
**And** la date d'expiration SSL est affichée si applicable
**And** un badge "Expiring soon" orange apparaît si l'expiration est < 14 jours
**And** le record DNS A → domaine → IP est affiché avec bouton copier

##### AC5: Activation SSL
**Given** un domaine panel sans SSL
**When** je clique "Activer SSL"
**Then** le certificat est demandé via certbot
**And** un message de succès avec lien direct `https://<domain>` est affiché

##### AC6: Accès IP fallback
**Given** un domaine panel avec SSL activé
**When** la section se charge
**Then** un toggle "Accès IP" apparaît avec description
**And** je peux activer/désactiver l'accès au panel via l'IP du serveur

##### AC7: Suppression avec confirmation
**Given** un domaine panel configuré
**When** je clique sur supprimer
**Then** une confirmation inline (Oui/Non) est demandée
**And** après confirmation, le domaine est supprimé et le panel revient en mode IP

##### AC8: Avertissement restart
**Given** la section domaine panel
**Then** un bandeau d'avertissement amber informe que les opérations entraînent un redémarrage du service

##### AC9: i18n
- [x] Tous les textes utilisent `t()` via `useTranslation()`
- [x] Clés ajoutées à `en.json` et `fr.json` (namespace `appSettings.panelDomain.*`)

---

## Epic 20: Renouvellement Automatique SSL

Les certificats SSL se renouvellent automatiquement sans intervention, avec monitoring de l'état des certificats.

**FRs couverts :** FR4
**NFRs couverts :** NFR6, NFR7

### Story 20.1: Renouvellement et Monitoring SSL

As a administrateur,
I want que mes certificats SSL se renouvellent automatiquement,
So that mes domaines restent sécurisés sans intervention manuelle.

**Acceptance Criteria:**

##### AC1: Timer certbot
**Given** l'installation de Remnant
**When** un certificat SSL est généré
**Then** le timer systemd `certbot.timer` est vérifié actif
**And** s'il n'est pas actif, il est activé automatiquement

##### AC2: Expiration dans le frontend
**Given** des domaines avec SSL
**When** la page domaines se charge
**Then** la date d'expiration est affichée pour chaque domaine
**And** un badge d'avertissement apparaît si l'expiration est dans moins de 14 jours

##### AC3: Action renew manuelle
**Given** des certificats existants
**When** je clique sur "Renouveler" dans l'interface
**Then** `certbot renew` est exécuté via le script
**And** les dates d'expiration sont mises à jour en DB

##### AC4: Mise à jour des dates en DB
**Given** un renouvellement certbot réussi (auto ou manuel)
**When** le certificat est renouvelé
**Then** le champ `ssl_expires_at` est mis à jour en DB

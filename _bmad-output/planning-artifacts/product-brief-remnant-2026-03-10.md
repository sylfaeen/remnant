---
stepsCompleted: [1, 2, 3, 4, 5, 6]
workflowComplete: true
inputDocuments:
  - /Users/louis/Downloads/context-prompt.md
date: 2026-03-10
author: Louis
---

# Product Brief: remnant

## Executive Summary

**Remnant** est un Game Server Management Panel (GSMP) nouvelle génération conçu pour démocratiser l'auto-hébergement de serveurs Minecraft. Face à des solutions existantes soit trop complexes (Pterodactyl), soit au design dépassé (Crafty), Remnant propose une approche révolutionnaire : un panel simple, sécurisé et magnifiquement designé, accessible aux administrateurs sans compétences techniques.

Le projet cible principalement les gestionnaires de serveurs Minecraft qui, faute d'alternatives accessibles, se tournent vers des hébergeurs privés coûteux offrant une qualité médiocre. Remnant leur redonne le contrôle avec une solution auto-hébergée, légère (sans Docker ni base de données), et une interface immersive pensée pour tous.

---

## Core Vision

### Problem Statement

Les administrateurs de serveurs Minecraft font face à un dilemme frustrant : les solutions d'auto-hébergement existantes sont conçues par et pour des techniciens, excluant de fait la majorité des utilisateurs potentiels. L'alternative — recourir à des hébergeurs privés — implique des coûts élevés pour une qualité souvent décevante.

### Problem Impact

- **Barrière technique insurmontable** : Pterodactyl exige Docker, une installation complexe et une courbe d'apprentissage abrupte
- **Design négligé** : Crafty, bien que fonctionnel, souffre d'une interface datée et d'une expérience utilisateur peu travaillée
- **Exclusion des non-techniciens** : Les administrateurs sans bagage informatique n'ont d'autre choix que de payer des hébergeurs tiers
- **Coût d'opportunité** : Des serveurs de qualité inférieure pour des prix premium

### Why Existing Solutions Fall Short

| Solution | Forces | Faiblesses |
|----------|--------|------------|
| **Pterodactyl** | Complet, multi-serveurs | Docker obligatoire, UI complexe, courbe d'apprentissage élevée |
| **Crafty Controller** | Fonctionnel, open source | Design daté, UX peu immersive, réactivité limitée |
| **Hébergeurs privés** | Simplicité d'accès | Coûteux, qualité variable, perte de contrôle |

### Proposed Solution

**Remnant** réinvente le GSMP avec une philosophie claire : *la puissance sous le capot, la simplicité en surface*.

- **Design révolutionnaire** : Interface immersive, moderne et dans l'air du temps
- **Accessibilité universelle** : Pensé pour les non-techniciens, pas uniquement les développeurs
- **Architecture légère** : Node.js natif, sans Docker ni base de données
- **Sécurité en profondeur** : JWT, rate limiting, path traversal protection, spawn sans shell
- **Temps réel** : Console live via WebSocket natif Fastify, édition de fichiers avec éditeur de code intégré

### Key Differentiators

1. **Design-first** : Premier GSMP où l'expérience utilisateur est une priorité, pas une afterthought
2. **Démocratisation** : Rend l'auto-hébergement accessible à tous, pas seulement aux techniciens
3. **Légèreté architecturale** : Aucune dépendance lourde (Docker, PostgreSQL) — juste Node.js et un fichier SQLite
4. **Sécurité native** : Défense en profondeur intégrée dès la conception, pas ajoutée après coup
5. **Nom mémorable** : "Remnant" — élégant, référençable, ancré dans l'univers gaming

---

## Target Users

### Primary Users

#### Persona 1: Le Débutant Ambitieux

**Profil:** Joueur Minecraft passionné, souvent jeune adulte ou étudiant, qui souhaite créer un espace de jeu pour ses amis tout en bâtissant une communauté.

**Contexte:**
- Compétences techniques limitées mais volonté d'apprendre
- A essayé des hébergeurs gratuits (Aternos, Minehut) — trop limités
- A essayé des hébergeurs payants — frustré de payer pour des ressources qu'il n'exploite pas vraiment
- A regardé des tutoriels Pterodactyl — abandonné face à la complexité

**Motivations:**
- Jouer avec ses amis sans les limitations des hébergeurs gratuits
- Construire une communauté autour de son serveur
- Apprendre la gestion de serveur à son rythme

**Ce que Remnant lui apporte:**
- Une porte d'entrée accessible vers l'auto-hébergement
- Une interface qui ne l'intimide pas
- Un premier pas vers l'autonomie technique

**Moment de succès:** Quand ses amis se connectent pour la première fois sur *son* serveur, géré par *lui*.

---

#### Persona 2: L'Admin en Transition

**Profil:** Administrateur de serveur Minecraft expérimenté qui gère une communauté établie et souhaite migrer vers un serveur dédié pour accompagner sa croissance.

**Contexte:**
- Actuellement chez un hébergeur qui limite la croissance de sa communauté
- À l'aise techniquement (SSH, bases Linux) mais pas développeur
- Prêt à louer un serveur dédié et à gérer lui-même l'infrastructure
- Cherche une solution légère qui n'impacte pas les performances du serveur

**Motivations:**
- Reprendre le contrôle total sur son infrastructure
- Offrir une meilleure expérience à sa communauté grandissante
- Éviter les panels lourds qui consomment des ressources précieuses

**Ce que Remnant lui apporte:**
- Un GSMP léger et performant (pas de Docker, pas de DB)
- La stabilité d'une solution simple et bien conçue
- Une interface moderne qui reflète le sérieux de son serveur

**Moment de succès:** Quand il constate que son serveur tourne mieux qu'avant, avec plus de contrôle et moins de friction.

---

### Secondary Users

N/A — Seuls les administrateurs ont accès au panel. Une gestion de permissions pourra être envisagée dans une version future pour déléguer certaines tâches à des modérateurs.

---

### User Journey

#### Phase de Découverte
- **Débutant:** Bouche-à-oreille sur Discord, recommandations Reddit, vidéos YouTube
- **Admin:** Recherche GitHub, forums spécialisés Minecraft, comparatifs de GSMP

#### Phase d'Installation
- Téléchargement du projet open-source
- Installation guidée via terminal avec instructions claires
- Documentation complète disponible
- Accès immédiat au panel web après configuration

#### Phase d'Adoption
- Interface intuitive permettant une prise en main rapide
- Fonctionnalités essentielles accessibles dès le premier lancement
- Progression naturelle vers les fonctionnalités avancées

#### Moment "Aha!"
- **Débutant:** "Je gère mon propre serveur, et c'est simple!"
- **Admin:** "Mon serveur tourne mieux, et le panel est magnifique."

---

## Success Metrics

### Philosophie de Mesure

Remnant est un projet open-source personnel avant d'être un produit commercial. Les métriques reflètent cette réalité : succès technique et satisfaction personnelle priment sur la croissance agressive.

**Principe clé:** Un bon GSMP est un GSMP invisible — si le serveur tourne bien, l'utilisateur n'a pas besoin d'accéder au panel constamment.

### Métriques de Succès Utilisateur

| Métrique | Indicateur de Succès |
|----------|---------------------|
| **Installation réussie** | L'utilisateur passe de zéro à un serveur fonctionnel sans friction majeure |
| **Autonomie atteinte** | Le serveur tourne de manière stable, réduisant le besoin d'interventions via le panel |
| **Recommandation organique** | Les utilisateurs satisfaits partagent Remnant avec leur communauté |
| **Temps jusqu'au "Aha!"** | Délai minimal entre l'installation et le premier serveur opérationnel |

### Business Objectives

N/A — Remnant n'est pas un produit commercial. Aucun objectif de revenus, de croissance ou de pénétration de marché n'est défini.

**Objectif personnel:** Créer un GSMP dont l'auteur est fier, qui résout élégamment un problème réel, et qui pourrait aider d'autres personnes dans la même situation.

### Key Performance Indicators

| KPI | Description | Mesure |
|-----|-------------|--------|
| **Satisfaction personnelle** | Le créateur est fier du produit final | Qualitative |
| **Stabilité technique** | Le panel fonctionne sans bugs critiques | Issues GitHub |
| **Adoption organique** | Croissance naturelle sans marketing forcé | Étoiles GitHub, forks |
| **Communauté naissante** | Espace d'échange pour les utilisateurs | Serveur Discord actif |

### Ce qui n'est PAS mesuré

- Revenus ou monétisation
- Nombre d'utilisateurs actifs quotidiens
- Métriques de rétention agressives
- Comparaisons avec la concurrence

---

## MVP Scope

### Core Features

#### Gestion du Serveur
- **Contrôle du processus:** Démarrage / arrêt / redémarrage du serveur Minecraft
- **Démarrage automatique:** Lancement au boot via systemd
- **Multi-serveurs (optionnel):** Architecture prête pour plusieurs serveurs, un seul activé par défaut

#### Console en Temps Réel
- **Logs live:** Streaming des logs serveur via WebSocket natif Fastify
- **Envoi de commandes:** Exécution de commandes Minecraft depuis le panel
- **Interface réactive:** Expérience fluide et immersive

#### Gestion des Fichiers
- **File browser complet:** Navigation dans l'arborescence du serveur
- **Édition en temps réel:** Éditeur de code intégré (CodeMirror) pour les fichiers de configuration
- **Protection path traversal:** Sécurité native contre les accès non autorisés

#### Configuration du Serveur
- **Gestion du JAR:** Sélection et gestion du fichier serveur (PaperMC, etc.)
- **Téléchargement automatique:** Téléchargement du JAR PaperMC depuis l'API officielle
- **Flags JVM:** Configuration des paramètres de lancement (mémoire, flags Aikar)
- **Gestion des ports:** Configuration Java (25565) et Bedrock/Geyser (19132)

#### Gestion des Plugins
- **Upload de plugins:** Téléversement de fichiers .jar dans le dossier plugins
- **Liste des plugins:** Visualisation des plugins installés

#### Tâches Planifiées
- **Redémarrages programmés:** Planification de redémarrages automatiques
- **Backups planifiés:** Sauvegardes automatiques du monde et des configurations

#### Monitoring
- **Ressources système:** Affichage RAM et CPU utilisés
- **Joueurs connectés:** Liste et nombre de joueurs en temps réel

#### Sécurité
- **Authentification JWT:** Access token (15 min) + refresh token (httpOnly cookie)
- **Rate limiting:** Protection anti-bruteforce sur /login
- **Mot de passe hashé:** bcrypt avec coût >= 12
- **Spawn sécurisé:** shell: false, aucune injection possible

#### Gestion des Backups
- **Page dédiée backups:** Visualisation, création, téléchargement et suppression des backups
- **Backup sélectif:** Sélection des fichiers et dossiers à inclure dans le backup
- **Téléchargement direct:** Download des archives de backup depuis le panel

#### Interface & Expérience Utilisateur
- **Design System complet:** Palette gaming, composants Radix UI, utilitaire cn()
- **Navigation responsive:** Sidebar desktop fixe + bottom tab bar mobile
- **Internationalisation:** Support Français/Anglais avec persistance de la langue par utilisateur (en base de données)
- **PWA (Progressive Web App):** Application installable avec manifest et service worker
- **Page Settings globale:** Route /app/settings dédiée aux paramètres de l'application

#### CLI (Command Line Interface)
- **Commandes serveur:** status, logs, start, stop, restart, update, version
- **Diagnostic réseau:** `remnant domains` — inspection des configurations Nginx, certificats SSL, connectivité HTTP
- **Désinstallation complète:** `remnant uninstall` — suppression propre de tous les composants (systemd, Nginx, fichiers, utilisateur système)

---

### Out of Scope for MVP

| Fonctionnalité | Raison du report | Version cible |
|----------------|------------------|---------------|
| **Multi-serveurs actifs** | Architecture prête, mais UX single-server prioritaire | v1.1+ |
| **Gestion des permissions** | Admin unique suffit pour le MVP | v1.2+ |
| **Marketplace de configs** | Nécessite une communauté établie | Futur lointain |
| **Support d'autres jeux** | Focus Minecraft uniquement | Non planifié |

---

### MVP Success Criteria

| Critère | Validation |
|---------|------------|
| **Installation fonctionnelle** | Un utilisateur peut installer Remnant et lancer son serveur en suivant la documentation |
| **Gestion quotidienne possible** | Toutes les opérations courantes réalisables via le panel |
| **Stabilité** | Le panel tourne sans crash pendant 7 jours consécutifs |
| **Sécurité validée** | Aucune vulnérabilité critique identifiée |
| **Design satisfaisant** | L'auteur est fier de montrer l'interface |

---

### Future Vision

**Si Remnant trouve son public:**

- **Communauté open-source:** Contributions externes pour de nouvelles fonctionnalités
- **Multi-serveurs complet:** Gestion de plusieurs instances depuis un seul panel
- **Système de permissions:** Délégation de tâches à des modérateurs
- **Intégrations:** Webhooks Discord, notifications, API publique

**Ce qui ne changera jamais:**
- Légèreté architecturale (pas de Docker, SQLite fichier unique)
- Design-first approach
- Sécurité en profondeur
- Open-source et gratuit

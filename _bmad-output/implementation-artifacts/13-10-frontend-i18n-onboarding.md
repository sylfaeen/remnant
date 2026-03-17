# Story 13.10: Frontend — i18n onboarding (FR + EN)

## Story

**As a** administrateur francophone ou anglophone,
**I want** que l'onboarding soit traduit dans ma langue,
**So that** je comprenne chaque étape.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Story 13-9 completed (le contenu textuel final est connu)
- Fichiers clés:
  - Modifier: `packages/frontend/src/i18n/locales/en.json`
  - Modifier: `packages/frontend/src/i18n/locales/fr.json`

## Acceptance Criteria

### AC1: Aucun texte en dur
**Given** la page d'onboarding est rendue
**When** j'inspecte le code source de `setup.tsx`
**Then** toutes les chaînes visibles utilisent `t('onboarding.*')`

### AC2: Clés FR et EN
**Given** les fichiers de traduction existent
**When** j'ouvre `en.json` et `fr.json`
**Then** les clés `onboarding.*` existent dans les deux fichiers avec des traductions complètes

### AC3: Couverture complète
**Given** les traductions sont ajoutées
**When** je liste toutes les clés `onboarding.*`
**Then** elles couvrent :
- **Bienvenue** : titre, sous-titre
- **Diagnostic** : labels (Java, RAM, disque, firewall), messages d'aide par statut
- **Compte** : titre step, labels (username, password, confirm), erreurs de validation, indicateur de force (faible/moyen/fort)
- **Langue** : titre step, noms des langues
- **Terminé** : titre, message de succès, texte « Connecté en tant que »
- **Boutons** : Continuer, Terminer la configuration, Accéder au panel
- **Erreurs** : messages d'erreur génériques du setup

## Technical Implementation

### Structure des clés (proposition)

```json
{
  "onboarding": {
    "welcome": {
      "title": "Welcome to Remnant",
      "subtitle": "Let's set up your panel in a few seconds."
    },
    "systemCheck": {
      "java": "Java",
      "javaNotFound": "Java is required to run Minecraft servers",
      "memory": "Available RAM",
      "memoryLow": "Recommended: 4 GB minimum for a Minecraft server",
      "disk": "Disk space",
      "diskLow": "Minecraft worlds can take several GB",
      "firewall": "Firewall",
      "firewallNone": "No firewall detected"
    },
    "account": {
      "title": "Administrator account",
      "username": "Username",
      "password": "Password",
      "confirmPassword": "Confirm password",
      "passwordMismatch": "Passwords do not match",
      "strengthWeak": "Weak",
      "strengthMedium": "Medium",
      "strengthStrong": "Strong"
    },
    "language": {
      "title": "Language",
      "description": "Choose the interface language"
    },
    "complete": {
      "title": "Remnant is ready!",
      "loggedInAs": "Logged in as {{username}}"
    },
    "continue": "Continue",
    "finish": "Finish setup",
    "goToPanel": "Go to panel"
  }
}
```

### Notes

- Les clés Zod d'erreur (username trop court, password trop court) sont déjà gérées par les schemas partagés — pas besoin de les dupliquer ici
- Le `{{username}}` utilise l'interpolation i18next standard

## Tasks

- [ ] Task 1: Définir les clés de traduction (AC: #1, #2, #3)
  - [ ] Ajouter le namespace `onboarding` dans `en.json`
  - [ ] Ajouter le namespace `onboarding` dans `fr.json`
  - [ ] Vérifier que chaque `t()` dans `setup.tsx` a sa clé correspondante

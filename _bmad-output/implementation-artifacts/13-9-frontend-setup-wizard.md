# Story 13.9: Frontend — Page wizard `/setup`

## Story

**As a** administrateur configurant Remnant,
**I want** un wizard d'onboarding clair et rapide,
**So that** je puisse configurer mon panel en moins d'une minute.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Stories 13-7 et 13-8 completed
- Fichiers clés:
  - Créer: `packages/frontend/src/pages/web/setup.tsx`
- Design system: dark theme, emerald accent, Tailwind CSS 4, Radix UI, lucide-react
- Pattern: multi-step wizard avec état local (pas de stepper library)

## Acceptance Criteria

### AC1: Écran Bienvenue
**Given** je suis sur `/setup`
**When** la page se charge
**Then** je vois le logo Remnant, le titre « Bienvenue sur Remnant », un sous-titre, et le diagnostic système

### AC2: Diagnostic progressif
**Given** l'écran de bienvenue est affiché
**When** les checks système s'exécutent via `useSystemCheck`
**Then** chaque check apparaît progressivement avec une micro-animation (fade-in + icône)

### AC3: Statuts du diagnostic
**Given** les checks sont terminés
**When** je regarde les résultats
**Then** chaque check a un statut visuel :
- ✅ (vert) = ok
- ⚠️ (jaune) = warning
- ❌ (rouge) = erreur
**And** un texte d'aide contextuel s'affiche pour les warnings/erreurs

### AC4: Seuils de diagnostic
**Given** les checks sont évalués
**Then** les seuils sont :
- Java absent → ❌ « Java est requis pour lancer des serveurs Minecraft »
- RAM libre < 4 Go → ⚠️ « Recommandé : 4 Go minimum pour un serveur Minecraft »
- Disque libre < 5 Go → ⚠️ « Les worlds Minecraft peuvent occuper plusieurs Go »

### AC5: Diagnostic non-bloquant
**Given** un ou plusieurs checks sont en erreur/warning
**When** je regarde le bouton « Continuer »
**Then** il est toujours actif — le diagnostic est informatif, pas bloquant

### AC6: Écran Compte (étape 1/2)
**Given** je clique sur « Continuer » depuis le bienvenue
**When** l'écran compte s'affiche
**Then** je vois les champs :
- Username (text input)
- Mot de passe (text input avec toggle visibilité 👁)
- Confirmer le mot de passe (text input avec toggle visibilité 👁)

### AC7: Indicateur de force du mot de passe
**Given** je saisis un mot de passe
**When** je tape des caractères
**Then** une barre visuelle colorée indique la force :
- Rouge = faible (< 8 chars ou pattern simple)
- Orange = moyen
- Vert = fort (8+ chars, mix majuscules/minuscules/chiffres/spéciaux)

### AC8: Validation inline
**Given** je remplis le formulaire
**When** un champ est invalide
**Then** l'erreur s'affiche en temps réel sous le champ :
- Username : 3-32 caractères, alphanumériques + _ -
- Password : 8 caractères minimum
- Confirmation : doit correspondre au mot de passe

### AC9: Bouton disabled
**Given** le formulaire est invalide (champ vide, erreur de validation, mismatch)
**When** je regarde le bouton « Continuer »
**Then** il est disabled et visuellement inactif

### AC10: Écran Langue (étape 2/2)
**Given** je clique sur « Continuer » depuis l'écran compte
**When** l'écran langue s'affiche
**Then** je vois deux cartes cliquables :
- 🇫🇷 Français
- 🇬🇧 English
**And** une carte est sélectionnée (avec bordure highlight emerald)

### AC11: Pré-sélection langue
**Given** mon navigateur est configuré en français (`navigator.language` commence par `fr`)
**When** l'écran langue s'affiche
**Then** la carte « Français » est pré-sélectionnée
**And** si le navigateur est en anglais, « English » est pré-sélectionnée

### AC12: Changement de langue en live
**Given** je sélectionne une langue différente
**When** je clique sur la carte
**Then** l'interface entière change de langue immédiatement (via `i18n.changeLanguage()`)

### AC13: Soumission
**Given** je clique sur « Terminer la configuration »
**When** le setup est déclenché
**Then** `useSetup().mutateAsync({ username, password, locale })` est appelé avec les données collectées

### AC14: Écran Terminé
**Given** le setup réussit
**When** l'écran de confirmation s'affiche
**Then** je vois :
- Une icône de succès (✅)
- « Remnant est prêt ! »
- « Connecté en tant que [username] »
- Bouton « Accéder au panel »

### AC15: Auto-login effectif
**Given** le setup a réussi (le store auth est à jour via `useSetup` onSuccess)
**When** je clique sur « Accéder au panel »
**Then** je suis redirigé vers `/app` et je suis authentifié

### AC16: Barre de progression
**Given** je suis sur les écrans compte (étape 1/2) ou langue (étape 2/2)
**When** la page s'affiche
**Then** une barre/indicateur de progression montre l'étape actuelle

### AC17: Gestion d'erreur
**Given** le setup échoue (ex: username déjà pris en race condition)
**When** une erreur est retournée par le backend
**Then** elle s'affiche inline sur l'écran actuel
**And** les données saisies ne sont pas perdues

## Technical Implementation

### Architecture du composant

```
SetupPage (exported, manages step state)
├── WelcomeStep (diagnostic + continue)
├── AccountStep (form fields + validation)
├── LanguageStep (card selection + submit)
└── CompleteStep (success message + navigate)
```

Chaque step est un sous-composant du compound pattern, extrait pour lisibilité.

### State management

```typescript
type SetupStep = 'welcome' | 'account' | 'language' | 'complete';

// Account data persisted between steps
type AccountData = {
  username: string;
  password: string;
};
```

Le state `accountData` est maintenu dans `SetupPage` et passé aux steps via props. La langue est gérée directement par `i18n` (pas besoin de state intermédiaire).

### Password strength

Calcul simple sans dépendance externe :
- Faible : < 8 chars OU uniquement lettres
- Moyen : 8+ chars, au moins 2 types (minuscules, majuscules, chiffres, spéciaux)
- Fort : 8+ chars, au moins 3 types

### Design

- Layout plein écran centré (comme la page login)
- Dark theme cohérent avec le reste du panel
- Emerald accent pour les éléments interactifs
- Cards langue avec bordure emerald quand sélectionnée
- Animations : fade-in pour les transitions entre steps, staggered pour le diagnostic

## Tasks

- [ ] Task 1: Structure du wizard (AC: #1, #6, #10, #14, #16)
  - [ ] Créer `packages/frontend/src/pages/web/setup.tsx`
  - [ ] State machine local : `'welcome' | 'account' | 'language' | 'complete'`
  - [ ] Composant principal `SetupPage` avec sous-composants par étape
  - [ ] Barre de progression (visible sur étapes account et language)

- [ ] Task 2: Écran Bienvenue + Diagnostic (AC: #1, #2, #3, #4, #5)
  - [ ] Layout centré avec logo
  - [ ] Appel `useSystemCheck(true)` pour déclencher les checks
  - [ ] Affichage progressif des résultats (animation staggered)
  - [ ] Statuts visuels avec icônes et texte d'aide
  - [ ] Bouton « Continuer » toujours actif

- [ ] Task 3: Écran Compte (AC: #6, #7, #8, #9)
  - [ ] Champs username, password, confirm password
  - [ ] Toggle visibilité mot de passe
  - [ ] Indicateur de force (barre colorée)
  - [ ] Validation inline (Zod via `setupRequestSchema` + check confirmation)
  - [ ] Bouton disabled si invalide

- [ ] Task 4: Écran Langue (AC: #10, #11, #12, #13)
  - [ ] Cartes cliquables FR/EN avec flag emoji
  - [ ] Pré-détection via `navigator.language`
  - [ ] `i18n.changeLanguage()` au clic
  - [ ] Bouton « Terminer la configuration » → appel `useSetup`

- [ ] Task 5: Écran Terminé + navigation (AC: #14, #15, #17)
  - [ ] Message de succès avec username
  - [ ] Bouton « Accéder au panel » → `navigate({ to: '/app' })`
  - [ ] Gestion d'erreur inline si le setup échoue

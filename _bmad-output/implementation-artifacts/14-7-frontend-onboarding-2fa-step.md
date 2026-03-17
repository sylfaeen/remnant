# Story 14.7: Frontend — Étape 2FA dans le Wizard d'Onboarding

## Story

**As a** administrateur configurant Remnant pour la première fois,
**I want** qu'on me propose d'activer le 2FA pendant l'onboarding,
**So that** mon compte soit sécurisé dès la création, sans devoir aller dans les settings après.

## Status

ready-for-dev

## Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.5 complétée (hooks et composants 2FA réutilisés)
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/web/setup.tsx` — ajouter l'étape security
  - Réutiliser: composants QR code, secret manuel, recovery codes de la Story 14.5
  - Modifier: `packages/frontend/src/i18n/locales/en.json` — clés traduction onboarding 2FA
  - Modifier: `packages/frontend/src/i18n/locales/fr.json` — clés traduction onboarding 2FA

## État actuel du wizard

Le wizard d'onboarding (`setup.tsx`) a **2 étapes** :
- `account` : formulaire unique contenant username, password, confirm password, sélection de langue (2 boutons FR/EN intégrés), bouton "Terminer"
- `complete` : message de succès + bouton "Accéder au panel"

Le layout utilise un `BrandPanel` à gauche (desktop) et un formulaire à droite dans une card blanche. Le `LanguageSelectorCompact` est en footer. L'auto-login se fait à la soumission du formulaire account.

**Il n'y a PAS de step welcome, PAS de step language séparée, PAS de diagnostic système.**

## Acceptance Criteria

### AC1: Nouvelle étape dans le wizard
**Given** je suis dans le wizard d'onboarding
**When** je soumets le formulaire account (setup réussi, auto-login effectué)
**Then** j'arrive sur une nouvelle étape "security" (entre account et complete)
**And** le state machine passe de `'account' | 'complete'` à `'account' | 'security' | 'complete'`

### AC2: Présentation de l'option 2FA
**Given** je suis sur l'étape security
**When** la page s'affiche
**Then** je vois dans une card blanche (même style que les autres étapes) :
- Un titre "Sécurisez votre compte"
- Un texte explicatif court sur le 2FA
- Un bouton principal "Activer le 2FA"
- Un lien/bouton secondaire "Ignorer pour l'instant"

### AC3: Activation du 2FA — setup
**Given** je clique sur "Activer le 2FA"
**When** l'appel `totp.setup` réussit
**Then** le QR code et le secret manuel s'affichent côte à côte (réutilisation des composants de 14.5)
**And** un champ demande le code à 6 chiffres pour confirmer

### AC4: Activation du 2FA — confirmation
**Given** je saisis un code valide et soumets
**When** l'appel `totp.verify` réussit
**Then** les recovery codes s'affichent avec boutons "Copier tout" et "Télécharger (.txt)"
**And** un avertissement indique que ces codes ne seront plus jamais affichés
**And** un bouton "Continuer" mène à l'étape complete

### AC5: Ignorer le 2FA
**Given** je suis sur l'étape security
**When** je clique sur "Ignorer pour l'instant"
**Then** je passe directement à l'étape complete sans setup 2FA
**And** aucun appel backend n'est effectué

### AC6: Erreur code invalide
**Given** je saisis un code TOTP invalide pendant le setup
**When** le serveur renvoie `TOTP_INVALID_CODE`
**Then** un message d'erreur s'affiche sous le champ
**And** je peux réessayer

### AC7: Contexte d'authentification
**Given** le setup admin vient de se terminer (soumission du formulaire account)
**When** l'étape security s'affiche
**Then** l'utilisateur est déjà authentifié (auto-login de l'onboarding)
**And** les appels `totp.setup` et `totp.verify` fonctionnent car l'access token est disponible

### AC8: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

## Technical Implementation

### State machine mise à jour

```typescript
// Avant : 'account' | 'complete'
// Après :
type SetupStep = 'account' | 'security' | 'complete';
```

Le `onComplete` de `AccountStep` passe maintenant à `'security'` au lieu de `'complete'`.

### Sous-étapes de l'étape Sécurité

L'étape security a son propre état interne :

```typescript
type SecuritySubStep = 'prompt' | 'setup' | 'recovery';
```

- `prompt` : présentation avec boutons "Activer" / "Ignorer"
- `setup` : QR code + secret + champ de confirmation
- `recovery` : affichage des recovery codes + bouton continuer

### Compound pattern

Suivre le pattern existant du wizard :

```tsx
SetupPage.SecurityStep = function SetupPageSecurityStep({ onComplete, onSkip }: SecurityStepProps) {
  const [subStep, setSubStep] = useState<SecuritySubStep>('prompt');
  // ...
};
```

### Réutilisation des composants

Les composants visuels de la Story 14.5 (QR code, secret formaté, recovery codes) doivent être extraits en composants partagés dans `packages/frontend/src/features/` pour être réutilisés ici et dans la page settings.

### Layout

Même layout que les autres étapes : card blanche (`rounded-xl border border-black/10 bg-white p-6 shadow-card`) avec `animate-fade-in`.

### Traductions attendues

```json
{
  "onboarding": {
    "security": {
      "title": "Secure your account",
      "subtitle": "Two-factor authentication adds an extra layer of security to your account.",
      "enable": "Enable 2FA",
      "skip": "Skip for now",
      "setupTitle": "Set up two-factor authentication",
      "confirmCode": "Enter the 6-digit code to confirm",
      "continue": "Continue",
      "invalidCode": "Invalid code. Please try again."
    }
  }
}
```

## Tasks

- [ ] Task 1: Mettre à jour le state machine du wizard (AC: #1)
  - [ ] Ajouter `'security'` dans le type `SetupStep`
  - [ ] `AccountStep.onComplete` → `setStep('security')`
  - [ ] Rendre le step security dans le JSX principal

- [ ] Task 2: Extraire les composants 2FA partagés (AC: #3, #4)
  - [ ] Extraire le composant QR code + secret de 14.5 en composant réutilisable
  - [ ] Extraire le composant recovery codes en composant réutilisable
  - [ ] S'assurer que la page settings et le wizard utilisent les mêmes composants

- [ ] Task 3: Créer `SetupPage.SecurityStep` en compound pattern (AC: #2, #3, #4, #5, #6, #7)
  - [ ] Sub-step `prompt` : card avec titre, texte, boutons "Activer" / "Ignorer"
  - [ ] Sub-step `setup` : QR code + secret + champ confirmation (réutilisation composants)
  - [ ] Sub-step `recovery` : recovery codes + boutons copier/télécharger + bouton "Continuer"
  - [ ] "Ignorer" → `onComplete()` directement
  - [ ] Gestion erreur code invalide

- [ ] Task 4: Traductions i18n (AC: #8)
  - [ ] Ajouter les clés `onboarding.security.*` dans `en.json`
  - [ ] Ajouter les clés `onboarding.security.*` dans `fr.json`

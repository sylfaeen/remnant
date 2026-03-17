# Story 14.6: Frontend — Écran TOTP sur la Page Login

## Story

**As a** administrateur avec 2FA activé,
**I want** un écran de saisie du code TOTP après mon login,
**So that** je puisse compléter l'authentification en deux étapes.

## Status

ready-for-dev

## Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.4 et 14.5 complétées
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/web/login.tsx` — ajouter l'étape TOTP
  - Modifier: `packages/frontend/src/hooks/use_auth.ts` — adapter useLogin pour le flow 2FA
  - Modifier: `packages/frontend/src/i18n/locales/en.json` — clés traduction
  - Modifier: `packages/frontend/src/i18n/locales/fr.json` — clés traduction

## Acceptance Criteria

### AC1: Étape TOTP après credentials
**Given** je soumets mes credentials valides et mon compte a le 2FA
**When** le serveur répond `{ requires_totp: true, totp_token }`
**Then** la page login bascule sur un écran de saisie du code à 6 chiffres
**And** le formulaire username/password est masqué
**And** un lien "Utiliser un code de récupération" est visible

### AC2: Saisie du code TOTP
**Given** je suis sur l'écran de saisie TOTP
**When** je saisis un code valide à 6 chiffres et soumets
**Then** `auth.verifyTotp` est appelé avec le `totp_token` + code
**And** je suis authentifié et redirigé vers `/app`
**And** l'état auth Zustand est mis à jour normalement

### AC3: Code de récupération
**Given** je clique "Utiliser un code de récupération"
**When** le champ bascule en mode recovery (accepte un code alphanumérique)
**And** je saisis un recovery code valide
**Then** je suis authentifié et redirigé vers `/app`
**And** un toast m'informe du nombre de recovery codes restants

### AC4: Erreur code invalide
**Given** je saisis un code TOTP ou recovery invalide
**When** la validation échoue (erreur `TOTP_INVALID_CODE`)
**Then** un message d'erreur s'affiche sous le champ de saisie
**And** je peux réessayer sans devoir re-saisir mes credentials

### AC5: Expiration du totp_token
**Given** je suis sur l'écran TOTP depuis plus de 5 minutes
**When** je soumets un code et le serveur répond `AUTH_TOKEN_EXPIRED`
**Then** je suis renvoyé à l'écran de login avec un message indiquant que la session a expiré

### AC6: Bouton retour
**Given** je suis sur l'écran de saisie TOTP
**When** je clique sur un lien/bouton "Retour"
**Then** je reviens à l'écran de saisie username/password

### AC7: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

## Technical Implementation

### State machine du login

La page login gère maintenant deux étapes via un state local :

```typescript
type LoginStep = 'credentials' | 'totp';

const [step, setStep] = useState<LoginStep>('credentials');
const [totpToken, setTotpToken] = useState<string | null>(null);
const [useRecoveryCode, setUseRecoveryCode] = useState(false);
```

### Flow adapté dans useLogin

```typescript
// Dans use_auth.ts — le hook useLogin est adapté :
// 1. Appel auth.login
// 2. Si response.requires_totp → stocker totp_token, ne PAS mettre à jour le store
// 3. Si response.access_token → flow standard

// Nouveau hook useVerifyTotp :
export function useVerifyTotp() {
  return trpc.auth.verifyTotp.useMutation({
    onSuccess: (data) => {
      // Même logique que le login standard :
      // setAuth, updateLanguage, navigate('/app')
    },
  });
}
```

### Composant TOTP Step

Extraire l'étape TOTP en composant dédié pour garder la page login lisible :

```tsx
function TotpStep({ totpToken, onBack }: TotpStepProps) {
  const { t } = useTranslation();
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  // ... form, submit, error handling
}
```

### Traductions attendues

```json
{
  "auth": {
    "totp": {
      "title": "Two-factor authentication",
      "subtitle": "Enter the code from your authenticator app",
      "enterCode": "6-digit code",
      "verify": "Verify",
      "useRecoveryCode": "Use a recovery code",
      "useAuthenticator": "Use authenticator app",
      "recoveryCodePlaceholder": "Recovery code",
      "invalidCode": "Invalid code. Please try again.",
      "sessionExpired": "Session expired. Please log in again.",
      "back": "Back to login",
      "recoveryCodesRemaining": "{{count}} recovery codes remaining"
    }
  }
}
```

## Tasks

- [ ] Task 1: Adapter le hook useLogin (AC: #1, #2)
  - [ ] Détecter `requires_totp` dans la réponse login
  - [ ] Ne pas mettre à jour le store auth si 2FA requis
  - [ ] Retourner `{ requiresTotp, totpToken }` au composant

- [ ] Task 2: Créer le hook useVerifyTotp (AC: #2, #3)
  - [ ] Mutation `auth.verifyTotp` avec `{ totp_token, code }`
  - [ ] onSuccess : même logique que login standard (setAuth, navigate)

- [ ] Task 3: Composant TotpStep dans login.tsx (AC: #1, #2, #3, #4, #5, #6)
  - [ ] Champ code 6 chiffres (input type tel, maxLength 6, pattern numérique)
  - [ ] Toggle mode recovery code (champ alphanumérique)
  - [ ] Gestion erreurs : code invalide, session expirée
  - [ ] Bouton retour vers l'écran credentials

- [ ] Task 4: Intégrer dans la page login (AC: #1, #6)
  - [ ] State machine `credentials` → `totp`
  - [ ] Afficher `TotpStep` quand step === 'totp'
  - [ ] Bouton retour reset le state

- [ ] Task 5: Traductions i18n (AC: #7)
  - [ ] Ajouter les clés `auth.totp.*` dans `en.json`
  - [ ] Ajouter les clés `auth.totp.*` dans `fr.json`

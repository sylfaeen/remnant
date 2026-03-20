# Story 14.5: Frontend — Page Account — Setup 2FA

## Story

**As a** administrateur,
**I want** activer le 2FA depuis ma page de compte utilisateur,
**So that** je puisse scanner le QR code ou copier le secret manuellement.

## Status

done

## Context

- Epic: 14 - Authentification à Deux Facteurs (TOTP)
- Dependencies: Story 14.3 complétée
- Note: La section 2FA est dans la page Account (`/app/account`), pas dans la page Settings app (`/app/settings`). La page Settings app contient les paramètres globaux de Remnant (Java, Systemd). La page Account contient les paramètres de l'utilisateur connecté (2FA, etc.).
- Le pseudo dans la sidebar est cliquable et ouvre un dropdown avec "Paramètres" (→ `/app/account`) et "Déconnexion".
- Fichiers clés:
  - Créé: `packages/frontend/src/hooks/use_totp.ts`
  - Créé: `packages/frontend/src/features/totp/totp_setup_display.tsx` — composants partagés
  - Créé: `packages/frontend/src/pages/app/account.tsx` — page Account avec section 2FA
  - Modifié: `packages/frontend/src/pages/app/features/sidebar.tsx` — dropdown utilisateur
  - Modifié: `packages/frontend/src/routes.tsx` — route `/app/account`
  - Modifié: `packages/frontend/src/i18n/locales/en.json` — clés `account.*`, `settings.twoFactor.*`
  - Modifié: `packages/frontend/src/i18n/locales/fr.json` — clés `account.*`, `settings.twoFactor.*`

## Acceptance Criteria

### AC1: Section 2FA dans les settings
**Given** je suis sur la page settings de mon compte
**When** je vois la section "Authentification à deux facteurs"
**Then** le statut actuel est affiché (activé/désactivé) via `totp.status`
**And** un bouton "Activer" est visible si désactivé, "Désactiver" si activé

### AC2: Flow d'activation — QR + secret manuel côte à côte
**Given** je clique sur "Activer le 2FA"
**When** le setup est initialisé (appel `totp.setup`)
**Then** le QR code (généré depuis `qr_code_uri`) et le secret en base32 sont affichés **côte à côte**
**And** le secret est formaté en groupes de 4 caractères (ex: `JBSW Y3DP EHPK 3PXP`)
**And** un bouton "Copier" est disponible à côté du secret
**And** un champ de confirmation demande le code à 6 chiffres

### AC3: Confirmation du code
**Given** je saisis un code à 6 chiffres dans le champ de confirmation
**When** le code est valide (appel `totp.verify`)
**Then** l'activation est confirmée et les recovery codes sont affichés

### AC4: Affichage des recovery codes
**Given** j'ai confirmé mon code TOTP avec succès
**When** l'activation est validée
**Then** les 8 recovery codes sont affichés dans une modale dédiée
**And** un bouton "Copier tout" copie tous les codes dans le presse-papier
**And** un bouton "Télécharger" génère un fichier `.txt` téléchargeable
**And** un avertissement clair indique que ces codes ne seront plus jamais affichés
**And** un bouton "J'ai sauvegardé mes codes" ferme la modale

### AC5: Désactivation du 2FA
**Given** j'ai le 2FA activé
**When** je clique "Désactiver" et saisis mon code TOTP dans un dialogue de confirmation
**Then** le 2FA est désactivé (appel `totp.disable`) et la section revient à l'état désactivé

### AC6: Erreurs
**Given** je saisis un code invalide lors de l'activation ou la désactivation
**When** le serveur renvoie `TOTP_INVALID_CODE`
**Then** un message d'erreur s'affiche sous le champ de saisie

### AC7: i18n
- [ ] Tous les textes UI utilisent `t()`
- [ ] Clés de traduction ajoutées à `en.json`
- [ ] Clés de traduction ajoutées à `fr.json`

## Technical Implementation

### Hook use_totp

```typescript
// packages/frontend/src/hooks/use_totp.ts
export function useTotpStatus() {
  return tsRest.totp.status.useQuery();
}

export function useTotpSetup() {
  return tsRest.totp.setup.useMutation();
}

export function useTotpVerify() {
  return tsRest.totp.verify.useMutation();
}

export function useTotpDisable() {
  return tsRest.totp.disable.useMutation();
}
```

### QR Code

Utiliser `qrcode.react` pour générer le QR depuis l'URI `otpauth://` :

```tsx
import { QRCodeSVG } from 'qrcode.react';

<QRCodeSVG value={qrCodeUri} size={200} />
```

### Secret formaté

```typescript
function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(' ') ?? secret;
}
```

### Recovery codes — téléchargement

```typescript
function downloadRecoveryCodes(codes: Array<string>) {
  const content = `Remnant - Recovery Codes\n${'='.repeat(30)}\n\n${codes.join('\n')}\n\nKeep these codes safe. Each code can only be used once.`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'remnant-recovery-codes.txt';
  a.click();
  URL.revokeObjectURL(url);
}
```

### Traductions attendues

```json
{
  "settings": {
    "twoFactor": {
      "title": "Two-factor authentication",
      "enabled": "2FA is enabled",
      "disabled": "2FA is disabled",
      "enable": "Enable 2FA",
      "disable": "Disable 2FA",
      "scanQr": "Scan with your authenticator app",
      "manualEntry": "Or enter this code manually in your password manager",
      "copy": "Copy",
      "copied": "Copied!",
      "enterCode": "Enter the 6-digit code from your app",
      "verify": "Verify",
      "invalidCode": "Invalid code. Please try again.",
      "recoveryCodes": {
        "title": "Save your recovery codes",
        "warning": "These codes will not be shown again. Save them in a safe place.",
        "copyAll": "Copy all",
        "download": "Download (.txt)",
        "saved": "I have saved my codes"
      },
      "disableConfirm": "Enter your 2FA code to disable"
    }
  }
}
```

## Tasks

- [ ] Task 1: Créer le hook `use_totp.ts` (AC: #1)
  - [ ] `useTotpStatus`, `useTotpSetup`, `useTotpVerify`, `useTotpDisable`

- [ ] Task 2: Installer `qrcode.react` comme dépendance frontend

- [ ] Task 3: Section 2FA dans la page settings (AC: #1, #2, #3, #6)
  - [ ] Affichage statut activé/désactivé
  - [ ] Bouton activer/désactiver
  - [ ] Flow setup : QR code + secret côte à côte + champ confirmation
  - [ ] Gestion erreurs code invalide

- [ ] Task 4: Modale recovery codes (AC: #4)
  - [ ] Affichage des 8 codes
  - [ ] Bouton "Copier tout" (navigator.clipboard)
  - [ ] Bouton "Télécharger (.txt)"
  - [ ] Avertissement + bouton de confirmation

- [ ] Task 5: Flow désactivation (AC: #5)
  - [ ] Dialogue de confirmation avec champ code TOTP
  - [ ] Appel `totp.disable` et retour à l'état initial

- [ ] Task 6: Traductions i18n (AC: #7)
  - [ ] Ajouter les clés `settings.twoFactor.*` dans `en.json`
  - [ ] Ajouter les clés `settings.twoFactor.*` dans `fr.json`

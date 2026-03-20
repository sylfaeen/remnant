# Story 7.1: Setup i18next et Infrastructure

## Story

**As a** developpeur,
**I want** configurer react-i18next avec la structure de fichiers de traduction,
**So that** l'infrastructure multilingue soit en place pour toute l'application.

## Status

done

## Context

- Epic: 7 - Internationalisation (i18n)
- Dependencies: None - infrastructure story
- Languages: Francais (defaut), Anglais

## Acceptance Criteria

### AC1: i18next Initialization
**Given** le frontend demarre
**When** i18next est initialise
**Then** la langue par defaut est chargee (francais)
**And** les fichiers de traduction FR et EN sont disponibles

### AC2: Fallback Behavior
**Given** une cle de traduction n'existe pas
**When** elle est utilisee dans un composant
**Then** la cle elle-meme est affichee (fallback)
**And** un warning est logge en dev

## Technical Implementation

### Dependencies to Install

```bash
cd packages/frontend
pnpm add react-i18next i18next
```

### Files to Create

```
packages/frontend/src/
├── i18n/
│   ├── index.ts              # Configuration i18next
│   └── locales/
│       ├── fr.json           # Traductions francaises
│       └── en.json           # Traductions anglaises
```

### i18n Configuration

```typescript
// packages/frontend/src/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr.json'
import en from './locales/en.json'

const savedLanguage = localStorage.getItem('language') || 'fr'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: savedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React deja securise
    },
    debug: import.meta.env.DEV, // Warnings en dev uniquement
  })

export default i18n
```

### Initial Translation Structure

```json
// packages/frontend/src/i18n/locales/fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "confirm": "Confirmer",
    "close": "Fermer",
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succes"
  },
  "nav": {
    "dashboard": "Tableau de bord",
    "console": "Console",
    "files": "Fichiers",
    "plugins": "Plugins",
    "tasks": "Taches",
    "settings": "Parametres",
    "users": "Utilisateurs",
    "logout": "Deconnexion"
  },
  "auth": {
    "login": "Connexion",
    "username": "Nom d'utilisateur",
    "password": "Mot de passe",
    "login_button": "Se connecter",
    "login_error": "Identifiants invalides"
  },
  "server": {
    "start": "Demarrer",
    "stop": "Arreter",
    "restart": "Redemarrer",
    "status": {
      "running": "En cours",
      "stopped": "Arrete",
      "starting": "Demarrage...",
      "stopping": "Arret..."
    }
  }
}
```

```json
// packages/frontend/src/i18n/locales/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "confirm": "Confirm",
    "close": "Close",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "nav": {
    "dashboard": "Dashboard",
    "console": "Console",
    "files": "Files",
    "plugins": "Plugins",
    "tasks": "Tasks",
    "settings": "Settings",
    "users": "Users",
    "logout": "Logout"
  },
  "auth": {
    "login": "Login",
    "username": "Username",
    "password": "Password",
    "login_button": "Sign in",
    "login_error": "Invalid credentials"
  },
  "server": {
    "start": "Start",
    "stop": "Stop",
    "restart": "Restart",
    "status": {
      "running": "Running",
      "stopped": "Stopped",
      "starting": "Starting...",
      "stopping": "Stopping..."
    }
  }
}
```

### Files to Modify

- `packages/frontend/src/main.tsx` - Import i18n configuration

```typescript
// Add at the top of main.tsx
import './i18n'
```

### Usage Pattern

```typescript
// Dans un composant React
import { useTranslation } from 'react-i18next'

export function MyComponent() {
  const { t } = useTranslation()

  return (
    <button>{t('common.save')}</button>
  )
}
```

### Translation Key Convention

| Namespace | Usage | Example |
|-----------|-------|---------|
| `common.*` | Boutons, actions generiques | `common.save`, `common.cancel` |
| `nav.*` | Navigation, sidebar, menus | `nav.dashboard`, `nav.settings` |
| `auth.*` | Authentification | `auth.login`, `auth.password` |
| `server.*` | Controle serveur | `server.start`, `server.status.running` |
| `files.*` | Gestion fichiers | `files.upload`, `files.delete` |
| `plugins.*` | Gestion plugins | `plugins.install`, `plugins.remove` |
| `tasks.*` | Taches planifiees | `tasks.create`, `tasks.schedule` |
| `settings.*` | Parametres | `settings.language`, `settings.jvm` |
| `users.*` | Gestion utilisateurs | `users.create`, `users.permissions` |
| `errors.*` | Messages d'erreur | `errors.network`, `errors.unauthorized` |

## Tasks

- [ ] Install react-i18next and i18next dependencies
- [ ] Create i18n/index.ts configuration file
- [ ] Create locales/fr.json with initial translations
- [ ] Create locales/en.json with initial translations
- [ ] Import i18n in main.tsx
- [ ] Verify build passes
- [ ] Test language switching in browser console

## Testing

```typescript
// Test en console navigateur
import i18n from './i18n'

// Changer de langue
i18n.changeLanguage('en')
i18n.changeLanguage('fr')

// Verifier une traduction
i18n.t('common.save') // "Enregistrer" ou "Save"
```

## Notes

- Les traductions seront completees dans les stories suivantes (7-2 a 7-5)
- Cette story met en place uniquement l'infrastructure et les traductions de base
- Le selecteur de langue UI sera implemente dans la story 7-5

---

## Post-Implementation Updates

- **v0.12.0-v0.12.1 :** La persistance de la langue a ete migree de localStorage vers la base de donnees (colonne `users.locale`)
- Nouvel endpoint ts-rest `users.updateLocale` pour sauvegarder la preference linguistique
- La langue est automatiquement restauree a la connexion depuis le profil utilisateur
- Les messages toast supportent desormais des descriptions par defaut localisees

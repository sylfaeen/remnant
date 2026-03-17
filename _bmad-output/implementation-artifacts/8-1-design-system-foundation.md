# Story 8.1: Design System Foundation

## Story

**As a** developpeur,
**I want** un design system avec palette cohérente, typographie et espacements,
**So that** l'interface ait une identité visuelle coherente et moderne.

## Status

done

## Context

- Epic: 8 - Design System & UI Polish
- Dependencies: clsx, tailwind-merge, class-variance-authority, @radix-ui/react-slot
- Style: Clean, moderne, professionnel — light theme avec accents emerald
- Themes: Light mode actif, dark mode préparé mais désactivé
- Component Library: Radix UI primitives avec styling 100% custom via CVA
- Framework: Tailwind CSS 4 avec directive `@theme` (pas de tailwind.config.js)

## Acceptance Criteria

### AC1: Palette de couleurs
**Given** le design system est configuré
**When** je consulte les variables CSS/Tailwind
**Then** une palette clean est définie (fonds clairs, accents emerald/amber)
**And** les couleurs sont accessibles et contrastées

### AC2: Typographie moderne
**Given** le design system est configuré
**When** je consulte les fonts
**Then** Inter (body), JetBrains Mono (code), Quattrocento (serif) sont configurés
**And** les tailles et line-heights sont harmonisées

### AC3: Espacements et grille
**Given** le design system est configuré
**When** je consulte les espacements
**Then** le système Tailwind 4 par défaut est utilisé avec des extensions custom
**And** une grille responsive est en place

### AC4: Infrastructure Radix UI + CVA
**Given** le projet frontend
**When** Radix UI est installé
**Then** les primitives de base sont disponibles (@radix-ui/react-*)
**And** une structure features/ui/ est en place pour les composants custom
**And** un utilitaire cn() (clsx + tailwind-merge) est configuré dans `lib/cn.ts`

## Technical Implementation

### UI Architecture

#### Framework: Tailwind CSS 4

Le projet utilise Tailwind 4 avec le plugin Vite (`@tailwindcss/vite`). **Pas de `tailwind.config.js`** — tout est défini via la directive `@theme` dans `globals.css` et des fichiers CSS séparés.

#### Constraints & Goals

1. Radix UI primitives pour accessibilité et comportement
2. Tailwind CSS 4 pour le styling (directive `@theme`)
3. class-variance-authority (CVA) pour les variants de composants
4. Éviter les libraries UI qui injectent de grosses abstractions
5. Architecture simple et scalable
6. Éviter l'over-abstraction et les hiérarchies profondes

#### Architecture Rules

| Règle | Description |
|-------|-------------|
| **Max 2 layers** | Maximum 2 couches d'abstraction entre l'app et Radix |
| **No mega-components** | Éviter les composants génériques avec trop de props |
| **Composable first** | Préférer la composition à l'héritage de props |
| **Compound pattern** | Sous-composants attachés au parent (`Card.Header`, etc.) |

#### Folder Structure (Actuelle)

```
packages/frontend/src/
├── globals.css                  # @import tailwindcss + @theme + base styles
├── styles/
│   ├── design-tokens.css        # Animations, durées, easings, keyframes
│   ├── theme-light.css          # Couleurs, ombres, glows (thème actif)
│   └── theme-dark.css           # Dark theme (préparé, désactivé)
├── lib/
│   └── cn.ts                    # cn() = twMerge(clsx(...))
├── features/
│   └── ui/                      # Layer 1: Radix primitives + CVA styling
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── dialog.tsx
│       ├── checkbox.tsx
│       ├── label.tsx
│       ├── tooltip.tsx
│       ├── popover.tsx
│       ├── skeleton.tsx
│       ├── toast.tsx
│       ├── page_loader.tsx
│       └── page_error.tsx
└── features/                    # Layer 2: Feature components
    ├── brand_panel.tsx
    ├── language_selector.tsx
    ├── app_shell.tsx
    └── [feature]/
```

#### Dependencies

```bash
# Utilitaires
pnpm add clsx tailwind-merge class-variance-authority

# Radix UI (installés)
pnpm add @radix-ui/react-slot @radix-ui/react-dialog
pnpm add @radix-ui/react-dropdown-menu @radix-ui/react-tooltip
pnpm add @radix-ui/react-tabs @radix-ui/react-switch
pnpm add @radix-ui/react-select @radix-ui/react-popover
pnpm add @radix-ui/react-checkbox

# Icons
pnpm add lucide-react
```

#### Utility Function

```typescript
// packages/frontend/src/lib/cn.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: Array<ClassValue>) => twMerge(clsx(inputs));
```

### Design Direction (Actuelle)

**Style:** Clean, moderne, professionnel
**Mood:** Interface d'administration épurée avec touches de couleur emerald
**Background:** Light off-white (`#fafafa`, `gray-100/80`)
**Cards:** Blanches avec bordures subtiles (`border-black/10`) et ombres douces
**Accents:** Emerald green (`#059669`) pour les actions primaires, amber pour les warnings

### Color Palette - Light Theme (Actif)

Définie dans `styles/theme-light.css` :

```css
:root {
  color-scheme: light;

  /* Status Colors */
  --status-online: #3da863;    /* Emerald */
  --status-offline: #8b8b8e;   /* Gray */
  --status-warning: #d9a31a;   /* Amber */
  --status-error: #dc2626;     /* Red */

  /* Glow Effects */
  --glow-primary: rgba(61, 168, 99, 0.12);
  --glow-primary-strong: rgba(61, 168, 99, 0.2);
  --glow-secondary: rgba(217, 163, 26, 0.1);
  --glow-success: rgba(61, 168, 99, 0.15);
  --glow-danger: rgba(220, 38, 38, 0.15);

  /* Shadows */
  --shadow-card: 0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-card-hover: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 0 20px var(--glow-primary);
  --shadow-glow-sm: 0 0 10px var(--glow-primary);
  --shadow-glow-success: 0 0 20px var(--glow-success);
  --shadow-glow-danger: 0 0 20px var(--glow-danger);
}
```

### Color Palette - Dark Theme (Préparé, Désactivé)

Fichier `styles/theme-dark.css` existe mais n'est pas actif. Prévu pour être réimplémenté avec la variante `dark:` de Tailwind 4.

### Typography

**Fonts (chargées depuis Google Fonts CDN dans `index.html`) :**
```css
--font-inter: 'Inter';            /* Corps - Lisibilité */
--font-jetbrains: 'JetBrains Mono'; /* Code - Monospace */
--font-quattrocento: 'Quattrocento'; /* Serif - Display */
```

**Base :**
- Font-size: 14px
- Font-family: Inter via `--font-family-body`
- Feature settings: cv02, cv03, cv04, cv11
- Anti-aliasing: antialiased + grayscale

### Animations & Durées

Définis dans `styles/design-tokens.css` :

```css
/* Durées */
--duration-instant: 50ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;

/* Easings */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6);
```

**Keyframes (25+) :**
- `fade-in`, `fade-out` — transitions d'opacité
- `slide-up`, `slide-down`, `slide-in-right`, `slide-in-from-right`, `slide-out-to-right`, `slide-in-from-top` — animations positionnelles
- `scale-in`, `scale-out` — transformations d'échelle
- `breathe`, `pulse-soft`, `float`, `spin`, `wiggle` — effets interactifs
- `expand`, `collapse` — animations d'expansion
- `shimmer`, `gradient-shift` — effets visuels
- `lift` — élévation de card au hover
- `checkmark`, `shake`, `ripple` — feedback d'action
- `skeleton-pulse` — placeholders de chargement
- `toast-slide-in`, `toast-slide-out`, `toast-sweep` — notifications toast

### Shadows

```css
--shadow-card: 0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-card-hover: 0 0 0 1px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-glow: 0 0 20px var(--glow-primary);
--shadow-glow-sm: 0 0 10px var(--glow-primary);
--shadow-glow-success: 0 0 20px var(--glow-success);
--shadow-glow-danger: 0 0 20px var(--glow-danger);
```

### Z-Index Scale

```css
--z-modal-backdrop: 40;
--z-modal: 50;
--z-toast: 60;
```

### UI Components (features/ui/)

| Composant | Pattern | Variants | Notes |
|-----------|---------|----------|-------|
| **Button** | CVA + Slot | primary, secondary, ghost, ghost-danger, danger, success, outline, link × xs, sm, md, lg, xl, icon, icon-sm, icon-lg | Loading state, asChild |
| **Card** | Compound | default, elevated, glass, interactive, accent, ghost × none, sm, md, lg | Card.Header, Card.Title, Card.Content, Card.Stat (avec trends) |
| **Input** | CVA | default, ghost, filled × sm, md, lg | InputGroup wrapper (label, error, hint, required) |
| **Textarea** | CVA | Hérite d'Input | Min-height 80px, resize-y |
| **Dialog** | Radix Compound | — | Overlay blur, scale-in animation, z-modal |
| **Checkbox** | Radix | — | 20×20px, emerald green checked |
| **Label** | Simple | — | sm, font-medium, zinc-900 |
| **Tooltip** | Radix | — | Rounded-xl, shadow-lg, fade-in/zoom-in |
| **Popover** | Radix | — | Max-w 18rem, fade-in/zoom-in |
| **Skeleton** | Compound | text, circular, rectangular | Skeleton.Text, .Avatar, .Card, .Table, .StatCard, .ServerCard |
| **Toast** | Context Provider | success, error, warning, info, loading | Auto-dismiss, progress bar, bottom-center |
| **PageLoader** | Simple | — | Spinner + texte centré |
| **PageError** | Simple | — | Message d'erreur rouge |

### Custom CSS Utilities

```css
/* Gradients */
.bg-gradient-ambient   /* Radial gradient emerald (top) */
.bg-gradient-mesh      /* Multi-radial mesh effect */
.bg-gradient-surface   /* Linear gradient surface */

/* Transitions */
.transition-colors-opacity      /* color, bg, border, opacity */
.transition-transform-shadow    /* transform, box-shadow */
.transition-all-smooth          /* all properties */

/* Font helpers */
.font-inter          /* Inter */
.font-jetbrains      /* JetBrains Mono */
.font-quattrocento   /* Quattrocento */
```

### Scrollbar

```css
scrollbar-width: thin;
scrollbar-color: rgba(0, 0, 0, 0.08) transparent;
/* Webkit: 8px, rounded thumb, hover effect */
```

### Selection

```css
::selection {
  background-color: rgba(5, 150, 105, 0.15);  /* Emerald */
  color: #065f46;
}
```

## Tasks (Complétés)

### Design Tokens
- [x] Créer `styles/design-tokens.css` (animations, durées, easings, 25+ keyframes)
- [x] Créer `styles/theme-light.css` (couleurs, status, glows, shadows)
- [x] Créer `styles/theme-dark.css` (préparé, désactivé)
- [x] Configurer `globals.css` avec `@import 'tailwindcss'` + `@theme` (Tailwind 4)
- [x] Importer les tokens et thèmes

### Typography
- [x] Ajouter Inter font (Google Fonts CDN)
- [x] Ajouter JetBrains Mono pour le code
- [x] Ajouter Quattrocento pour le serif
- [x] Configurer font-feature-settings (cv02, cv03, cv04, cv11)

### UI Infrastructure
- [x] Installer clsx et tailwind-merge
- [x] Installer class-variance-authority (cva)
- [x] Créer `lib/cn.ts` avec cn() helper
- [x] Créer structure `features/ui/`
- [x] 13 composants UI créés avec CVA + Radix

### Validation
- [x] Build fonctionnel
- [x] Light theme actif et cohérent

## Notes

### Design
- Light mode est le thème actif — clean, professionnel, accents emerald
- Dark mode préparé dans `theme-dark.css` mais désactivé — prévu via `dark:` Tailwind 4
- Bordures subtiles avec `border-black/10` partout
- Cards blanches avec `shadow-card`, hover avec `shadow-card-hover`

### Architecture
- **Tailwind 4** : directive `@theme` dans CSS, pas de fichier config JS
- **2 layers max** : `features/ui/` (Radix primitives + CVA) → `features/` (tout le reste)
- **Compound pattern** : Card.Header, Skeleton.Table, etc.
- **CVA** : tous les composants à variants utilisent `cva()` pour le type-safety
- **Pas de shadcn/ui** : inspiration compositionnelle uniquement, styling 100% custom

## Dev Agent Record

- Agent: Claude
- Completion: Story implémentée et itérée au fil des epics 8-13
- Notes: Le design system a évolué significativement depuis la conception initiale — passage d'un thème gaming dark (indigo/neon) vers un thème light clean (emerald/white). Migration de tailwind.config.js vers Tailwind 4 @theme. Structure `components/ui/` → `features/ui/`.

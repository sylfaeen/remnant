# Story 8.3: Layout & Navigation Redesign

## Story

**As a** administrateur,
**I want** une navigation et un layout immersifs avec transitions fluides,
**So that** la navigation dans le panel soit une experience agreable.

## Status

done

## Context

- Epic: 8 - Design System & UI Polish
- Dependencies: Story 8-2 (Component Library)
- Refactoring: Chaque page a actuellement son propre header inline

## Acceptance Criteria

### AC1: Sidebar immersive
**Given** je suis connecte au panel
**When** je vois la sidebar
**Then** elle a un design gaming marque (icones stylisees, hover effects)
**And** l'item actif est clairement identifiable

### AC2: Header moderne
**Given** je suis sur n'importe quelle page
**When** je vois le header
**Then** il affiche les infos essentielles avec style
**And** les actions rapides sont accessibles

### AC3: Transitions de page
**Given** je navigue entre les pages
**When** le contenu change
**Then** une transition fluide accompagne le changement
**And** pas de flash ou saut visuel

## Technical Implementation

### Components to Create

```
packages/frontend/src/components/layout/
├── app_layout.tsx    # Layout principal (sidebar + header + content)
├── sidebar.tsx       # Navigation laterale
└── header.tsx        # Header avec user info
```

### Architecture

- AppLayout wrappe toutes les routes protegees
- Sidebar avec navigation et logo
- Header avec breadcrumb, user menu, language selector
- Content area avec transitions CSS

## Tasks

- [ ] Creer components/layout/sidebar.tsx
- [ ] Creer components/layout/header.tsx
- [ ] Creer components/layout/app_layout.tsx
- [ ] Mettre a jour ProtectedLayout dans routes.tsx
- [ ] Refactorer dashboard.tsx (supprimer header inline)
- [ ] Refactorer servers.tsx (supprimer header inline)
- [ ] Refactorer autres pages
- [ ] Ajouter transitions de page
- [ ] Tester le build

---

## Post-Implementation Updates

- **v0.11.0 :** Layout entierement restructure pour utiliser une Sidebar desktop fixe (208px) + MobileNav (bottom tab bar)
- L'ancien systeme NavbarProvider/NavbarSlot a ete remplace par SidebarProvider/useSidebar/useSidebarItems
- Les pages serveur utilisent desormais les compound components ServerPageHeader et ServerSection
- Responsive mobile : la sidebar est masquee sur mobile, une barre de navigation par onglets en bas de l'ecran est affichee a la place

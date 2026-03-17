# Story 15.2: DocsLayout avec sidebar de navigation

## Story

**As a** utilisateur,
**I want** une sidebar de navigation dédiée à la documentation avec un bouton retour vers l'application,
**So that** je puisse naviguer entre les pages de documentation sans perdre mon contexte.

## Status

done

## Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Aucune — peut être parallélisé avec Story 15.1
- **IMPORTANT** : Le `DocsLayout` est un layout **dédié et distinct** des layouts existants (`MainLayout`, `ServerLayout`). Il utilise le même système de sidebar context (`useSidebarItems`) mais avec sa propre structure CSS (`layout-doc`).
- Fichiers clés:
  - Créer: `packages/frontend/src/pages/app/features/layouts/docs_layout.tsx`
  - Modifier: `packages/frontend/src/pages/app/features/layouts/main_layout.tsx` — ajouter entrée Documentation
  - Modifier: `packages/frontend/src/routes.tsx` — ajouter routes `/app/docs`

## Acceptance Criteria

### AC1: DocsLayout créé
**Given** un layout dédié à la documentation
**When** je crée `DocsLayout`
**Then** il utilise `useSidebarItems` avec header `backPath: '/app'`, `backLabel: 'dashboard'`

### AC2: Sidebar documentation avec sections
**Given** la sidebar docs est affichée
**When** je navigue dans la documentation
**Then** les chapitres sont groupés en 4 sections : Getting Started (Introduction, Installation, Configuration), Features (Server Management, Console, Files, Plugins, Tasks), Administration (Users, Security, Domain), Reference (Docker, API, Rate Limits)

### AC3: Bouton retour
**Given** je suis dans la documentation
**When** je clique sur le bouton retour en haut de la sidebar
**Then** je suis redirigé vers `/app`

### AC4: Entrée Documentation dans MainLayout et ServerLayout
**Given** la sidebar principale de l'application
**When** je regarde les items de navigation
**Then** une entrée "Documentation" avec icône `BookOpen` est visible (position `bottom: true`)

### AC5: Highlight page active
**Given** je suis sur une page de documentation
**When** je regarde la sidebar
**Then** la page active est visuellement mise en avant (détection via `startsWith` du pathname)

### AC6: Navigation mobile responsive
**Given** je suis sur tablette ou mobile (< 960px)
**When** j'accède à la documentation
**Then** la sidebar est cachée, un bouton hamburger apparaît en haut, au clic la sidebar s'ouvre en overlay avec backdrop

### AC7: i18n
- [x] Les clés de navigation docs sont dans `en.json` uniquement (anglais)
- [x] Le fallback i18n `en` s'applique pour toutes les langues

## Tasks

- [x] Task 1: Créer DocsLayout (AC: #1, #2, #3, #5)
  - [x] Définir les nav items docs avec les 14 chapitres groupés en 4 sections via `section` prop
  - [x] Utiliser `useSidebarItems(docsNavItems, { backPath: '/app', backLabel: 'dashboard' })`
  - [x] Structure CSS dédiée `page layout-doc > page-wrapper > page-container`

- [x] Task 2: Ajouter l'entrée Documentation dans MainLayout et ServerLayout (AC: #4)
  - [x] `{ key: 'docs', path: '/app/docs', icon: BookOpen, bottom: true }` dans les deux layouts

- [x] Task 3: Sections sidebar (AC: #2)
  - [x] Ajout du champ `section?: string` dans `SidebarNavItem`
  - [x] Rendu des titres de section dans `sidebar.tsx`

- [x] Task 4: Navigation mobile responsive (AC: #6)
  - [x] État `mobileOpen` dans sidebar context
  - [x] Composant `SidebarToggle` (hamburger) dans `AppShell`
  - [x] Backdrop + sidebar overlay sous 960px
  - [x] Fermeture automatique au changement de route

- [x] Task 5: i18n (AC: #7)
  - [x] 16 clés de navigation docs dans `en.json` (nav.docs*, nav.docsIntroduction, etc.)
  - [x] Anglais uniquement — pas de clés FR

## Dev Agent Record

### File List

- `packages/frontend/src/pages/app/features/layouts/docs_layout.tsx` — créé
- `packages/frontend/src/pages/app/features/layouts/main_layout.tsx` — entrée docs ajoutée
- `packages/frontend/src/pages/app/features/layouts/server_layout.tsx` — entrée docs ajoutée
- `packages/frontend/src/pages/app/features/sidebar_context.tsx` — `section` + `mobileOpen` ajoutés
- `packages/frontend/src/pages/app/features/sidebar.tsx` — sections, backdrop, état mobile
- `packages/frontend/src/pages/app/features/sidebar_toggle.tsx` — créé
- `packages/frontend/src/features/layouts/app_shell.tsx` — SidebarToggle ajouté
- `packages/frontend/src/styles/remnant.css` — CSS layout-doc, sidebar .open
- `packages/frontend/src/i18n/locales/en.json` — clés navigation docs

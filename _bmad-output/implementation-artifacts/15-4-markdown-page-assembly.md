# Story 15.4: Page markdown.tsx — assemblage final

## Story

**As a** utilisateur,
**I want** voir la documentation rendue avec des éléments markdown stylisés à la VitePress,
**So that** je puisse lire une documentation claire, structurée et agréable dans l'application.

## Status

done

## Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Story 15.1 (MarkdownRenderer), Story 15.3 (routing + mapping)
- Fichiers clés:
  - Modifier: `packages/frontend/src/pages/app/docs/markdown.tsx` — stub existant à compléter
  - Créer: `packages/frontend/src/pages/app/docs/features/table_of_contents.tsx`

## Acceptance Criteria

### AC1: Assemblage MarkdownRenderer + route
**Given** le composant `markdown.tsx`
**When** je navigue vers une page docs
**Then** le `MarkdownRenderer` affiche le contenu chargé via le slug de la route

### AC2: Headings avec IDs pour navigation
**Given** des headings dans le markdown
**When** le contenu est rendu
**Then** chaque heading a un `id` généré par `rehype-slug` (non cliquable — utilisé par la Table of Contents)

### AC3: Admonitions stylisées
**Given** des blocs warning, danger, tip, info
**When** le contenu est rendu
**Then** des custom-blocks VitePress avec couleurs distinctes sont affichés

### AC4: Code blocks Shiki avec bouton copier
**Given** des code blocks dans le markdown
**When** le contenu est rendu
**Then** coloration Shiki, label langage, bouton copier CSS pur

### AC5: Tables stylisées
**Given** des tables dans le markdown
**When** le contenu est rendu
**Then** les tables ont bordures, alternance de couleurs et scroll horizontal (CSS VitePress dans `prose-doc.css`)

### AC6: Liens internes
**Given** des liens entre pages docs dans le markdown (ex: `[Plugins](/plugins)`)
**When** je clique sur un lien interne
**Then** la navigation se fait via le router TanStack `<Link>` (pas de full reload)

### AC7: Table of Contents "On this page"
**Given** une page de documentation avec des h2
**When** la page est affichée sur écran large (≥ 1280px)
**Then** un bloc sticky "On this page" à droite liste les h2, chaque entrée est cliquable avec smooth scroll, le heading actif est mis en avant via IntersectionObserver

### AC8: i18n
- [x] Documentation anglais uniquement
- [x] Clés UI (notFound) dans `en.json`

## Tasks

- [x] Task 1: Implémenter markdown.tsx (AC: #1)
  - [x] Récupérer le slug via `useParams`
  - [x] Résoudre le contenu via `docsContent[slug]`
  - [x] Structure VitePress : `.content > .content-container` pour le markdown, `.aside` pour la ToC

- [x] Task 2: Table of Contents (AC: #7)
  - [x] Composant `TableOfContents` extrayant les h2 du markdown raw
  - [x] Smooth scroll au clic
  - [x] `useActiveHeading` avec IntersectionObserver
  - [x] Styling VitePress dans `prose-doc.css` (`.outline`, `.outline-link`, `.outline-link.active`)

- [x] Task 3: Liens internes (AC: #6)
  - [x] Custom component `MarkdownLink` dans react-markdown
  - [x] Détection liens `/guide/...` et `/...` → conversion en `<Link to={'/app/docs/$slug'} params={{ slug }}>`
  - [x] Liens externes → `<a target="_blank">`

## Dev Agent Record

### File List

- `packages/frontend/src/pages/app/docs/markdown.tsx` — assemblage MarkdownRenderer + ToC
- `packages/frontend/src/pages/app/docs/features/table_of_contents.tsx` — créé
- `packages/frontend/src/styles/prose-doc.css` — CSS ToC (outline, outline-link)

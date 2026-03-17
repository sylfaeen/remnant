# Story 15.1: Infrastructure de rendu Markdown

## Story

**As a** développeur,
**I want** une infrastructure de rendu markdown dans le frontend,
**So that** les fichiers `.md` existants soient affichés avec un rendu riche (GFM, code blocks, admonitions, tables).

## Status

done

## Context

- Epic: 15 - Documentation Interne Intégrée
- Dependencies: Aucune — story initiale de l'epic
- Fichiers clés:
  - Installer: `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-raw`, `shiki`
  - Créer: composant `MarkdownRenderer` réutilisable
- Les fichiers `.md` sont générés par VitePress et utilisent la syntaxe `::: warning/danger/tip/info` pour les admonitions
- **Référence style markdown** : s'inspirer de VitePress (https://github.com/vuejs/vitepress) uniquement pour le rendu des éléments markdown (h1, h2, h3, tables, code blocks, admonitions, listes, liens) — pas pour le design global de l'app. Adapté au design system Tailwind du projet

## Acceptance Criteria

### AC1: Dépendances installées
**Given** le package frontend
**When** les dépendances markdown sont ajoutées
**Then** `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-raw` et `shiki` sont installés

### AC2: Composant MarkdownRenderer
**Given** un contenu markdown string
**When** je rends le composant `MarkdownRenderer`
**Then** le markdown est affiché avec un rendu riche et stylisé

### AC3: Support GFM
**Given** du contenu markdown avec tables, strikethrough, task lists
**When** le composant rend le contenu
**Then** tous les éléments GFM sont correctement affichés

### AC4: Code blocks avec coloration syntaxique Shiki
**Given** des blocs de code avec langage spécifié (bash, typescript, yaml, caddy)
**When** le composant rend les code blocks
**Then** la coloration syntaxique Shiki est appliquée (dual-theme github-light/github-dark, defaultColor: false) avec label langage et bouton copier CSS pur via event delegation

### AC5: Admonitions VitePress
**Given** des blocs `::: warning`, `::: danger`, `::: tip`, `::: info`
**When** le composant rend ces blocs
**Then** des custom-blocks HTML VitePress sont produits via pré-processing et rendus via `rehype-raw`

### AC6: Styling CSS VitePress
**Given** le composant rendu
**When** je compare avec VitePress
**Then** le CSS dans `prose-doc.css` reproduit le style VitePress pour les éléments markdown (headings, tables, code blocks, admonitions, listes, liens, inline code)

### AC7: i18n
- [x] La documentation est en anglais uniquement — pas de traduction FR
- [x] Les clés UI docs (copyCode, notFound) sont dans `en.json` uniquement, le fallback i18n `en` s'applique

## Tasks

- [x] Task 1: Installer les dépendances (AC: #1)
  - [x] `react-markdown`
  - [x] `remark-gfm`
  - [x] `rehype-slug`
  - [x] `rehype-raw`
  - [x] `shiki` (coloration syntaxique)

- [x] Task 2: Créer le composant MarkdownRenderer (AC: #2, #3, #6)
  - [x] Composant React avec prop `content: string`
  - [x] Pré-processing async : admonitions → HTML custom-block, code fences → HTML Shiki
  - [x] Rendu via ReactMarkdown avec rehype-raw pour le HTML passthrough
  - [x] CSS VitePress dans `prose-doc.css`

- [x] Task 3: Implémenter la coloration syntaxique Shiki (AC: #4)
  - [x] Pré-processing des code fences avec `codeToHtml` (dual-theme, defaultColor: false)
  - [x] Structure HTML VitePress : `div.language-X > button.copy + span.lang + pre.shiki`
  - [x] Bouton copier CSS pur (background-image SVG, état .copied via event delegation)
  - [x] Label langage en haut à droite

- [x] Task 4: Implémenter le support des admonitions VitePress (AC: #5)
  - [x] Pré-processing regex pour parser `::: type` blocks
  - [x] Génération HTML : `div.type.custom-block > p.custom-block-title + p` (structure VitePress)
  - [x] CSS pour warning, danger, tip, info avec couleurs distinctes

- [x] Task 5: i18n (AC: #7)
  - [x] Clés `docs.copyCode`, `docs.notFound`, `docs.notFoundDescription` dans `en.json`
  - [x] Pas de traduction FR — documentation anglais uniquement

## Dev Agent Record

### File List

- `packages/frontend/package.json` — dépendances ajoutées
- `packages/frontend/src/pages/app/docs/features/markdown_renderer.tsx` — composant principal
- `packages/frontend/src/styles/prose-doc.css` — CSS VitePress (headings, tables, code blocks, admonitions, shiki)
- `packages/frontend/src/env.d.ts` — déclaration type `*.md?raw`
- `packages/frontend/src/i18n/locales/en.json` — clés docs

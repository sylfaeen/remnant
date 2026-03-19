# Story 19.2: Frontend — Settings Domaine Panel

## Story

**As a** administrateur,
**I want** une section dans les settings globaux pour gérer le domaine du panel avec guidage DNS et gestion de l'accès IP,
**So that** je puisse configurer, surveiller et maintenir le domaine panel depuis l'interface.

## Status

done

## Context

- Epic: 19 - Domaine Personnalisé pour le Panel Remnant
- Dependencies: Story 19.1 (backend service domaine panel)
- Fichiers clés:
  - `packages/frontend/src/pages/app/settings/general.tsx` — composants `PanelDomainSection`, `SetupSteps`, `JavaSection`
  - `packages/frontend/src/hooks/use_domains.ts` — hooks: `usePanelDomain`, `useSetPanelDomain`, `useRemovePanelDomain`, `useEnablePanelSsl`, `useIpAccess`, `useSetIpAccess`, `useServerIp`
- Section dans les settings globaux à la route `/app/settings/general`
- Composant `FeatureCard` utilisé pour la mise en page
- Toutes les règles `.claude/rules/` respectées
- Le changement de domaine panel entraîne un restart du service → bandeau avertissement permanent

## Acceptance Criteria

### AC1: Section dans settings globaux
**Given** la page `/app/settings/general`
**When** je la visite
**Then** une section "Domaine du panel" (`PanelDomainSection`) est visible dans un `FeatureCard`

### AC2: Guide de configuration en 3 étapes
**Given** aucun domaine panel configuré
**When** la section se charge
**Then** un composant `SetupSteps` affiche 3 étapes numérotées :
1. Créer un enregistrement DNS A pointant vers l'IP du serveur (avec bouton copier IP)
2. Saisir le domaine dans le formulaire ci-dessous
3. Activer SSL après propagation DNS
**And** chaque étape a un titre et une description i18n
**And** l'IP du serveur est affichée via `useServerIp()` avec `A → panel.yourdomain.com → <IP>`

### AC3: Formulaire domaine panel
**Given** aucun domaine panel configuré
**When** je saisis un domaine et valide (bouton ou touche Enter)
**Then** `useSetPanelDomain().mutateAsync(domain)` est appelé
**And** la validation regex empêche les domaines invalides avec message d'erreur inline
**And** le champ est vidé après succès

### AC4: Affichage domaine configuré
**Given** un domaine panel configuré
**When** la section se charge
**Then** le domaine est affiché avec :
- Icône `Lock` verte si SSL activé, `Globe` grise sinon
- Badge `SSL` vert ou `No SSL` gris
- Badge `Expiring soon` orange si expiration < 14 jours
- Date d'expiration SSL si applicable
- Record DNS `A → domain → IP` avec bouton copier

### AC5: Activation SSL
**Given** un domaine panel sans SSL
**When** je clique "Activer SSL" (bouton `variant='success'`)
**Then** `useEnablePanelSsl().mutateAsync(id)` est appelé
**And** un message de succès vert avec lien direct `https://<domain>` est affiché

### AC6: Accès IP fallback
**Given** un domaine panel avec SSL activé
**When** la section se charge
**Then** un toggle "Accès IP" apparaît (`useIpAccess()` / `useSetIpAccess()`)
**And** affiche une description de la fonctionnalité
**And** le bouton bascule entre `variant='success'` (activer) et `variant='secondary'` (désactiver)

### AC7: Suppression avec confirmation
**Given** un domaine panel configuré
**When** je clique sur l'icône `Trash2`
**Then** une confirmation inline apparaît ("Confirmer ? Oui / Non")
**And** après confirmation, `useRemovePanelDomain().mutateAsync()` est appelé
**And** le panel revient en mode formulaire (guide 3 étapes)

### AC8: Avertissement restart
**Given** un domaine panel configuré
**Then** un bandeau d'avertissement amber (`AlertTriangle`) informe que les opérations entraînent un redémarrage du service

### AC9: i18n
- [x] Tous les textes utilisent `t()` via `useTranslation()`
- [x] Clés ajoutées à `en.json` et `fr.json`
- [x] Namespaces utilisés : `appSettings.panelDomain.*`, `settings.domains.*`, `toast.*`, `common.*`

## Dev Agent Record

Implémentation complète. Composants `PanelDomainSection`, `SetupSteps`, `JavaSection` dans `general.tsx`. Hooks dédiés panel dans `use_domains.ts` : `usePanelDomain`, `useSetPanelDomain`, `useRemovePanelDomain`, `useEnablePanelSsl`, `useIpAccess`, `useSetIpAccess`, `useServerIp`.

## File List

- `packages/frontend/src/pages/app/settings/general.tsx`
- `packages/frontend/src/hooks/use_domains.ts`
- `packages/frontend/src/locales/en.json`
- `packages/frontend/src/locales/fr.json`

---
stepsCompleted: [1, 2, 3, 4]
workflowComplete: true
status: complete
completedAt: '2026-03-10'
inputDocuments:
  - /Users/louis/Herd/remnant/_bmad-output/planning-artifacts/product-brief-remnant-2026-03-10.md
  - /Users/louis/Herd/remnant/_bmad-output/planning-artifacts/architecture.md
date: 2026-03-10
---

# Remnant - Epic Breakdown

Ce document décompose les requirements du Product Brief et de l'Architecture en epics et stories implémentables pour le développement de Remnant.

---

## Implementation Standards

**CRITICAL:** Depuis Epic 7, tout développement frontend DOIT inclure le support i18n via `useTranslation` / `t()`. Aucune string hardcodée en JSX. Fichiers de traduction : `packages/frontend/src/i18n/locales/{en,fr}.json`.

---

### Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | [Epic 2](../implementation-artifacts/2-0-epic-controle-serveur-console.md) | Démarrer le serveur |
| FR2 | [Epic 2](../implementation-artifacts/2-0-epic-controle-serveur-console.md) | Arrêter le serveur |
| FR3 | [Epic 2](../implementation-artifacts/2-0-epic-controle-serveur-console.md) | Redémarrer le serveur |
| FR4 | [Epic 5](../implementation-artifacts/5-0-epic-monitoring-production.md) | Auto-start Remnant |
| FR5 | [Epic 2](../implementation-artifacts/2-0-epic-controle-serveur-console.md) | Logs streaming temps réel |
| FR6 | [Epic 2](../implementation-artifacts/2-0-epic-controle-serveur-console.md) | Envoi de commandes |
| FR7 | [Epic 2](../implementation-artifacts/2-0-epic-controle-serveur-console.md) | Interface console réactive |
| FR8 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Navigation fichiers |
| FR9 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Édition avec éditeur de code intégré |
| FR10 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Upload fichiers |
| FR11 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Suppression fichiers |
| FR12 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Protection path traversal |
| FR13 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Gestion JAR |
| FR14 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Téléchargement PaperMC |
| FR15 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Configuration JVM flags |
| FR16 | [Epic 3](../implementation-artifacts/3-0-epic-gestion-fichiers-configuration.md) | Configuration ports |
| FR17 | [Epic 4](../implementation-artifacts/4-0-epic-plugins-automatisation.md) | Upload plugins |
| FR18 | [Epic 4](../implementation-artifacts/4-0-epic-plugins-automatisation.md) | Liste plugins |
| FR19 | [Epic 4](../implementation-artifacts/4-0-epic-plugins-automatisation.md) | Redémarrages planifiés |
| FR20 | [Epic 4](../implementation-artifacts/4-0-epic-plugins-automatisation.md) | Backups planifiés |
| FR21 | [Epic 5](../implementation-artifacts/5-0-epic-monitoring-production.md) | Monitoring CPU/RAM |
| FR22 | [Epic 5](../implementation-artifacts/5-0-epic-monitoring-production.md) | Liste joueurs connectés |
| FR23 | [Epic 1](../implementation-artifacts/1-0-epic-foundation-authentification.md) | Authentification JWT |
| FR24 | [Epic 1](../implementation-artifacts/1-0-epic-foundation-authentification.md) | Multi-user avec permissions |
| FR25 | [Epic 1](../implementation-artifacts/1-0-epic-foundation-authentification.md) | Admin par défaut |
| FR26 | [Epic 1](../implementation-artifacts/1-0-epic-foundation-authentification.md) | Déconnexion |
| FR27 | [Epic 6](../implementation-artifacts/6-0-epic-deployment-devops.md) | CI/CD GitHub Actions |
| FR28 | [Epic 6](../implementation-artifacts/6-0-epic-deployment-devops.md) | Installation Linux one-command |
| FR29 | [Epic 6](../implementation-artifacts/6-0-epic-deployment-devops.md) | Installation locale dev |
| FR30 | [Epic 7](../implementation-artifacts/7-0-epic-internationalisation.md) | Setup react-i18next |
| FR31 | [Epic 7](../implementation-artifacts/7-0-epic-internationalisation.md) | Traduction navigation/layout |
| FR32 | [Epic 7](../implementation-artifacts/7-0-epic-internationalisation.md) | Traduction pages principales |
| FR33 | [Epic 7](../implementation-artifacts/7-0-epic-internationalisation.md) | Traduction formulaires/modals |
| FR34 | [Epic 7](../implementation-artifacts/7-0-epic-internationalisation.md) | Sélecteur de langue |
| FR35 | [Epic 8](../implementation-artifacts/8-0-epic-design-system-ui-polish.md) | Design system foundation |
| FR36 | [Epic 8](../implementation-artifacts/8-0-epic-design-system-ui-polish.md) | Component library polish |
| FR37 | [Epic 8](../implementation-artifacts/8-0-epic-design-system-ui-polish.md) | Layout & navigation redesign |
| FR38 | [Epic 8](../implementation-artifacts/8-0-epic-design-system-ui-polish.md) | Dashboard visual identity |
| FR39 | [Epic 8](../implementation-artifacts/8-0-epic-design-system-ui-polish.md) | Dark/Light theme |
| FR40 | [Epic 8](../implementation-artifacts/8-0-epic-design-system-ui-polish.md) | Micro-interactions & animations |
| FR41 | [Epic 11](../implementation-artifacts/11-0-epic-gestion-backups.md) | Backup sélectif |
| FR42 | [Epic 11](../implementation-artifacts/11-0-epic-gestion-backups.md) | Page backups dédiée |
| FR43 | [Post-MVP](../implementation-artifacts/post-mvp-enhancements.md) | PWA installable |
| FR44 | [Post-MVP](../implementation-artifacts/post-mvp-enhancements.md) | Navigation responsive sidebar + mobile |
| FR45 | [Post-MVP](../implementation-artifacts/post-mvp-enhancements.md) | Persistance langue en DB |
| FR46 | [Post-MVP](../implementation-artifacts/post-mvp-enhancements.md) | Page Settings globale |
| FR47 | [Post-MVP](../implementation-artifacts/post-mvp-enhancements.md) | Dialogue upload fichiers |
| FR48 | [Post-MVP](../implementation-artifacts/post-mvp-enhancements.md) | CLI domains diagnostic |
| FR49 | [Post-MVP](../implementation-artifacts/post-mvp-enhancements.md) | CLI uninstall |
| FR50 | [Epic 12](../implementation-artifacts/12-0-epic-gestion-firewall.md) | Script shell firewall sécurisé |
| FR51 | [Epic 12](../implementation-artifacts/12-0-epic-gestion-firewall.md) | Service backend firewall |
| FR52 | [Epic 12](../implementation-artifacts/12-0-epic-gestion-firewall.md) | Router ts-rest firewall |
| FR53 | [Epic 12](../implementation-artifacts/12-0-epic-gestion-firewall.md) | UI firewall dans server settings |
| FR54 | [Epic 12](../implementation-artifacts/12-0-epic-gestion-firewall.md) | Installation script firewall + sudoers |
| FR55 | [Epic 14](../implementation-artifacts/14-0-epic-authentification-2fa-totp.md) | 2FA TOTP avec QR code et saisie manuelle |
| FR56 | [Epic 14](../implementation-artifacts/14-0-epic-authentification-2fa-totp.md) | Validation TOTP au login (flow deux étapes) |
| FR57 | [Epic 14](../implementation-artifacts/14-0-epic-authentification-2fa-totp.md) | Recovery codes à usage unique |
| FR58 | [Epic 14](../implementation-artifacts/14-0-epic-authentification-2fa-totp.md) | Désactivation 2FA depuis les settings |
| FR59 | [Epic 15](../implementation-artifacts/15-0-epic-documentation-interne.md) | Rendu markdown riche avec admonitions VitePress |
| FR60 | [Epic 15](../implementation-artifacts/15-0-epic-documentation-interne.md) | Sidebar documentation avec retour app |
| FR61 | [Epic 15](../implementation-artifacts/15-0-epic-documentation-interne.md) | URLs individuelles par page docs |
| FR62 | [Epic 15](../implementation-artifacts/15-0-epic-documentation-interne.md) | DocsLink pointe vers doc interne |

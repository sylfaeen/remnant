# Epic 14: Authentification à Deux Facteurs (TOTP)

L'administrateur peut activer le 2FA TOTP sur son compte pour sécuriser l'accès au panel, via scan de QR code ou saisie manuelle du secret.

**FRs couverts:** FR55, FR56, FR57, FR58

## Stories

| Story | Titre | Fichier |
|-------|-------|---------|
| 14.1 | Schemas Partagés 2FA | [14-1-shared-schemas-2fa.md](14-1-shared-schemas-2fa.md) |
| 14.2 | Schema DB & Service TOTP Backend | [14-2-backend-db-service-totp.md](14-2-backend-db-service-totp.md) |
| 14.3 | Router tRPC 2FA | [14-3-backend-trpc-router-totp.md](14-3-backend-trpc-router-totp.md) |
| 14.4 | Intégration 2FA dans le Flow de Login | [14-4-backend-login-flow-2fa.md](14-4-backend-login-flow-2fa.md) |
| 14.5 | Page Account — Setup 2FA Frontend | [14-5-frontend-settings-2fa.md](14-5-frontend-settings-2fa.md) |
| 14.6 | Écran TOTP sur la Page Login | [14-6-frontend-login-totp-screen.md](14-6-frontend-login-totp-screen.md) |
| 14.7 | Étape 2FA dans le Wizard d'Onboarding | [14-7-frontend-onboarding-2fa-step.md](14-7-frontend-onboarding-2fa-step.md) |

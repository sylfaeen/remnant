# Story 1.4: Login Page & Auth State

## Story

**As a** administrateur,
**I want** une page de login avec gestion d'état,
**So that** je puisse accéder au panel de manière fluide.

## Status

done

## Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1.3 (User Login API) - completed
- Architecture: React 19 + Vite + Tailwind CSS + Zustand + TanStack Query

## Acceptance Criteria

### AC1: Redirection vers login
**Given** je ne suis pas connecté
**When** j'accède au panel
**Then** je suis redirigé vers /login

### AC2: Login flow
**Given** je suis sur /login
**When** je soumets des credentials valides
**Then** je suis redirigé vers le dashboard
**And** mon état auth est persisté dans Zustand

### AC3: Persistance de session
**Given** je suis connecté et je refresh la page
**When** l'app charge
**Then** mon état auth est restauré via refresh token

### AC4: Logout
**Given** je suis connecté
**When** je clique sur logout
**Then** je suis redirigé vers /login
**And** mon état auth est cleared

## Technical Implementation

### Files to Create

1. `src/lib/api.ts` - API client configuration
2. `src/stores/auth_store.ts` - Zustand auth store
3. `src/hooks/use_auth.ts` - Auth hooks (useLogin, useLogout, useUser)
4. `src/pages/login.tsx` - Login page
5. `src/pages/dashboard.tsx` - Dashboard placeholder
6. `src/routes.tsx` - TanStack Router setup with providers et guards

### Auth Store Schema

```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}
```

### API Endpoints Used

- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

## Tasks

- [x] Create API client with interceptors
- [x] Create Zustand auth store
- [x] Create auth hooks with TanStack Query
- [x] Create Login page
- [x] Create Dashboard placeholder
- [x] Setup TanStack Router with route guards
- [x] Test complete flow

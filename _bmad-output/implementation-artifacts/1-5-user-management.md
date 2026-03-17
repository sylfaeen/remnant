# Story 1.5: User Management

## Story

**As a** administrateur,
**I want** gérer les utilisateurs et leurs permissions,
**So that** je puisse déléguer l'accès au panel.

## Status

done

## Context

- Epic: 1 - Foundation & Authentification
- Dependencies: Story 1.4 (Login Page & Auth State) - completed

## Acceptance Criteria

### AC1: Liste des utilisateurs
**Given** je suis admin connecté
**When** j'accède à /users
**Then** je vois la liste des utilisateurs avec leurs permissions

### AC2: Création d'utilisateur
**Given** je crée un nouvel utilisateur
**When** je soumets le formulaire
**Then** l'utilisateur est créé avec les permissions sélectionnées
**And** son mot de passe est hashé

### AC3: Modification d'utilisateur
**Given** je modifie un utilisateur existant
**When** je soumets le formulaire
**Then** les informations sont mises à jour
**And** le mot de passe n'est changé que si fourni

### AC4: Suppression d'utilisateur
**Given** je supprime un utilisateur
**When** je confirme la suppression
**Then** l'utilisateur est supprimé
**And** ses sessions sont invalidées

## Technical Implementation

### API Endpoints

- GET /api/users - Liste tous les utilisateurs
- POST /api/users - Crée un utilisateur
- PUT /api/users/:id - Modifie un utilisateur
- DELETE /api/users/:id - Supprime un utilisateur

### Files to Create

**Backend:**
- `src/routes/users.ts` - Routes CRUD users
- `src/services/user_service.ts` - Logique métier users

**Shared:**
- `src/schemas/user.ts` - Schemas Zod pour validation

**Frontend:**
- `src/pages/users.tsx` - Page de gestion users
- `src/components/user_form.tsx` - Formulaire création/édition

## Tasks

- [x] Create story file
- [ ] Create user schemas in shared
- [ ] Create user service (backend)
- [ ] Create user routes (backend)
- [ ] Create users page (frontend)
- [ ] Add routing
- [ ] Test complete flow

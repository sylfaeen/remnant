# Story 13.3: Backend — Service diagnostic système

## Story

**As a** endpoint `systemCheck`,
**I want** un service qui collecte les informations système,
**So that** elles soient exposées au frontend pendant l'onboarding.

## Status

ready-for-dev

## Context

- Epic: 13 - Onboarding Administrateur
- Dependencies: Aucune — peut être fait en parallèle de 13-2
- Fichiers clés:
  - Créer: `packages/backend/src/services/system_check_service.ts`

## Acceptance Criteria

### AC1: Check Java
**Given** Java est installé sur le système
**When** le service exécute `java -version`
**Then** il renvoie `{ installed: true, version: '21.0.3' }` (version parsée)

### AC2: Java absent
**Given** Java n'est pas installé
**When** le service exécute `java -version`
**Then** il renvoie `{ installed: false }` (pas d'erreur globale)

### AC3: Check mémoire
**Given** le système a de la RAM
**When** le service appelle `os.totalmem()` / `os.freemem()`
**Then** il renvoie `{ totalMB: number, freeMB: number }` en mégaoctets (arrondi)

### AC4: Check disque
**Given** le répertoire data existe
**When** le service vérifie l'espace disque sur `SERVERS_BASE_PATH` ou `/opt/remnant`
**Then** il renvoie `{ totalMB: number, freeMB: number }` en mégaoctets

### AC5: Check firewall
**Given** un firewall est installé (ufw, firewalld, ou iptables)
**When** le service détecte le firewall disponible
**Then** il renvoie `{ detected: true, type: 'ufw' }` (ou le type détecté)

### AC6: Isolation des checks
**Given** un check échoue (ex: Java absent, commande disque échoue)
**When** les autres checks s'exécutent
**Then** ils renvoient leurs résultats normalement — pas de fail global

### AC7: Timeout
**Given** un check prend trop de temps
**When** 5 secondes sont écoulées
**Then** le check est interrompu et renvoie un résultat par défaut (ex: `{ installed: false }` pour Java)

## Technical Implementation

### Architecture

```typescript
import os from 'node:os';
import { execFile } from 'node:child_process';

interface SystemCheckResult {
  java: { installed: boolean; version?: string };
  memory: { totalMB: number; freeMB: number };
  disk: { totalMB: number; freeMB: number };
  firewall: { detected: boolean; type?: string };
}

class SystemCheckService {
  async check(): Promise<SystemCheckResult> {
    const [java, memory, disk, firewall] = await Promise.all([
      this.checkJava(),
      this.checkMemory(),
      this.checkDisk(),
      this.checkFirewall(),
    ]);
    return { java, memory, disk, firewall };
  }
}
```

### Java version parsing

`java -version` écrit sur **stderr** (pas stdout). Le format typique est :
```
openjdk version "21.0.3" 2024-04-16
```
Regex de parsing : `/version "(\d+\.\d+\.\d+)"/` ou `/version "(\d+)"/` pour les versions majeures.

### Disk check

Sur Linux, `df -B1 /opt/remnant` renvoie l'espace en bytes. Parse la 2e ligne pour extraire total/available.
Alternative : `fs.statfs()` disponible en Node 18.15+.

### Firewall detection

Même logique que `remnant-firewall.sh` : tester `which ufw`, `which firewall-cmd`, `which iptables` dans l'ordre.

## Tasks

- [ ] Task 1: Créer SystemCheckService (AC: #1, #2, #3, #4, #5, #6, #7)
  - [ ] Méthode `check()` qui exécute tous les checks en parallèle via `Promise.all`
  - [ ] Check Java: `execFile('java', ['-version'])` + parse stderr (Java écrit sur stderr)
  - [ ] Check mémoire: `os.totalmem()` / `os.freemem()` converti en MB
  - [ ] Check disque: `execFile('df', ['-B1', dataPath])` + parse output OU `statvfs`
  - [ ] Check firewall: `which ufw` → `which firewall-cmd` → `which iptables`
  - [ ] Chaque check wrappé dans un try/catch avec timeout `AbortSignal.timeout(5000)`
  - [ ] Export singleton `systemCheckService`

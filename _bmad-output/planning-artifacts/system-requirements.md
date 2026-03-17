# Prérequis Système - Remnant

_Documentation des configurations système recommandées pour l'installation de Remnant et l'hébergement de serveurs Minecraft._

---

## Distributions Linux Recommandées

Remnant est compatible avec les distributions Linux suivantes, classées par ordre de recommandation:

### 1. Debian 12 "Bookworm" *(Recommandé)*

| Critère | Valeur |
|---------|--------|
| Empreinte mémoire | ~142 MB |
| Support standard | Juin 2028 |
| Support LTS | Juin 2033 |
| systemd | Oui |

**Pourquoi Debian 12:**
- Empreinte mémoire minimale, maximisant les ressources disponibles pour les serveurs Minecraft
- Stabilité éprouvée en production
- Excellente compatibilité avec systemd pour la gestion des services
- Large communauté et documentation extensive

### 2. Ubuntu 24.04 LTS "Noble Numbat"

| Critère | Valeur |
|---------|--------|
| Empreinte mémoire | ~178 MB |
| Support standard | Avril 2029 |
| Support ESM | Avril 2034 |
| systemd | Oui |

**Pourquoi Ubuntu 24.04:**
- Documentation extensive et communauté très active
- Nombreux tutoriels disponibles pour l'hébergement Minecraft
- Recommandé pour les administrateurs débutants
- Mises à jour de sécurité régulières

### 3. AlmaLinux 9

| Critère | Valeur |
|---------|--------|
| Empreinte mémoire | ~158 MB |
| Support | 2032 (10 ans) |
| Compatibilité | RHEL 9 |
| systemd | Oui |

**Pourquoi AlmaLinux 9:**
- Support long terme de 10 ans, idéal pour les environnements entreprise
- Compatible binaire avec Red Hat Enterprise Linux (RHEL)
- Transition naturelle pour les utilisateurs CentOS
- Stabilité orientée entreprise

### 4. Rocky Linux 9

| Critère | Valeur |
|---------|--------|
| Empreinte mémoire | ~158 MB |
| Support | 2032 (10 ans) |
| Compatibilité | RHEL 9 |
| systemd | Oui |

**Pourquoi Rocky Linux 9:**
- Alternative communautaire à AlmaLinux avec le même niveau de qualité
- Fondé par Gregory Kurtzer, co-créateur original de CentOS
- Même compatibilité RHEL et support long terme
- Gouvernance communautaire transparente

### 5. Ubuntu 22.04 LTS "Jammy Jellyfish"

| Critère | Valeur |
|---------|--------|
| Empreinte mémoire | ~178 MB |
| Support standard | Avril 2027 |
| Support ESM | Avril 2032 |
| systemd | Oui |

**Pourquoi Ubuntu 22.04:**
- Version éprouvée avec une très large base installée
- Compatibilité maximale avec les tutoriels et guides existants
- Idéal si vous avez déjà une infrastructure Ubuntu 22.04

---

## Distributions Non Recommandées

Les distributions suivantes ne sont **pas recommandées** pour l'hébergement de Remnant en production:

| Distribution | Raison |
|-------------|--------|
| **Fedora** | Cycle de release trop rapide (13 mois), instable pour la production |
| **Debian 13 / Ubuntu 25.04** | Versions non-LTS, pas assez matures pour la production |
| **AlmaLinux 10 / Rocky Linux 10** | Trop récent, manque de retour d'expérience |
| **FreeBSD** | Écosystème Java limité, pas de systemd natif |
| **Variantes cPanel/Plesk** | Overhead inutile, Remnant est son propre panel |
| **Windows Server** | Non supporté - performance Java inférieure, pas de systemd |

---

## Configuration Matérielle Minimale

### Pour Remnant (Panel uniquement)

| Ressource | Minimum | Recommandé |
|-----------|---------|------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 512 MB | 1 GB |
| Disque | 1 GB | 5 GB |
| Réseau | 100 Mbps | 1 Gbps |

### Pour Serveur Minecraft (par instance)

| Type de serveur | RAM | CPU | Joueurs |
|-----------------|-----|-----|---------|
| Vanilla léger | 2 GB | 2 vCPU | 1-10 |
| Vanilla standard | 4 GB | 4 vCPU | 10-30 |
| Modded léger | 4 GB | 4 vCPU | 1-10 |
| Modded standard | 8 GB | 4 vCPU | 10-20 |
| Modded lourd | 16 GB+ | 6+ vCPU | 20+ |

> **Note:** La performance Minecraft dépend principalement de la vitesse single-thread du CPU. Privilégiez un CPU avec une fréquence élevée plutôt qu'un grand nombre de coeurs.

---

## Logiciels Requis

### Dépendances Obligatoires

| Logiciel | Version | Usage |
|----------|---------|-------|
| **Node.js** | 20 LTS ou 22 LTS | Runtime Remnant |
| **Java** | 17 ou 21 LTS | Runtime Minecraft |
| **systemd** | 250+ | Gestion des services |

### Dépendances Optionnelles

| Logiciel | Version | Usage |
|----------|---------|-------|
| **Nginx** | 1.24+ | Reverse proxy, TLS termination |
| **Docker** | 24+ | Multi-serveurs isolés |

---

## Optimisation Java pour Minecraft

### JVM Recommandées

1. **GraalVM CE** (recommandé) - Meilleures performances JIT
2. **Eclipse Temurin** (OpenJDK) - Standard, bien supporté
3. **Amazon Corretto** - Optimisé pour AWS

### Flags JVM Recommandés (Aikar's Flags)

```bash
java -Xms4G -Xmx4G \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC \
  -XX:+AlwaysPreTouch \
  -XX:G1NewSizePercent=30 \
  -XX:G1MaxNewSizePercent=40 \
  -XX:G1HeapRegionSize=8M \
  -XX:G1ReservePercent=20 \
  -XX:G1HeapWastePercent=5 \
  -XX:G1MixedGCCountTarget=4 \
  -XX:InitiatingHeapOccupancyPercent=15 \
  -XX:G1MixedGCLiveThresholdPercent=90 \
  -XX:G1RSetUpdatingPauseTimePercent=5 \
  -XX:SurvivorRatio=32 \
  -XX:+PerfDisableSharedMem \
  -XX:MaxTenuringThreshold=1 \
  -jar server.jar nogui
```

> Ces flags sont configurables via l'interface Remnant dans **Paramètres > Configuration JVM**.

---

## Notes de Performance

- **La différence de performance entre distributions Linux est inférieure à 2%** pour les charges Minecraft
- Le facteur le plus important reste le **tuning JVM** et la **qualité du hardware**
- Privilégiez une distribution avec laquelle vous êtes à l'aise pour l'administration

---

## Sources

- [SpigotMC - Best OS for Minecraft Server](https://www.spigotmc.org/threads/best-os-for-minecraft-server.520193/)
- [Cherry Servers - Best Linux Distros for Server Hosting](https://www.cherryservers.com/blog/best-linux-distros-for-server-hosting)
- [Aikar's Flags - Optimized JVM Flags](https://docs.papermc.io/paper/aikars-flags)

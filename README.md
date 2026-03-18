# remnant

## GitHub Setup

Two repos: `sylfaeen/remnant-private` (private, source of truth) and `sylfaeen/remnant` (public mirror).

Every push to `main` on the private repo triggers a GitHub Actions workflow that strips private files (`.claude/`, `_bmad/`, `_bmad-output/`, `CLAUDE.md`, etc.) and force-pushes to the public repo.

### 1. Create repos

```bash
gh repo create sylfaeen/remnant-private --private --description "Remnant — Game Server Management Panel"
gh repo create sylfaeen/remnant --public --description "Remnant — Game Server Management Panel"
```

### 2. Create a Fine-grained PAT

- GitHub → Settings → Developer settings → Fine-grained tokens
- Name: `remnant-public-sync`
- Repository access: Only select → `sylfaeen/remnant`
- Permissions: **Contents → Read and write**, **Workflows → Read and write**, **Actions → Read and write**

### 3. Configure secrets and variables

```bash
gh secret set PUBLIC_REPO_TOKEN --repo sylfaeen/remnant-private
gh variable set PUBLIC_REPO --repo sylfaeen/remnant-private --body "sylfaeen/remnant"
```

### 4. Discord notifications

Create a webhook in Discord (channel settings → Integrations → Webhooks), then:

```bash
gh secret set DISCORD_WEBHOOK_URL --repo sylfaeen/remnant
https://discord.com/api/webhooks/1483244671080861746/isa2HJwCD9PPdcbP8mtLCF-DBOA0dK1BEoF5tMNbvlPlAK-FWd5snn6RlBG7Yty5Q7mE
```

### 5. Init and push

```bash
git init
git add -A
git commit -m 'feat!: init remnant'
git remote add origin git@github.com:sylfaeen/remnant-private.git
git branch -M main
git push -u origin main
```

### 6. Sync & Release

Synchroniser le code vers le repo public (sans release) :

```bash
gh workflow run sync-public.yml --repo sylfaeen/remnant-private
gh run watch --repo sylfaeen/remnant-private
```

Publier une nouvelle release (bump version, build, tag, release GitHub, puis sync public) :

```bash
gh workflow run release.yml --repo sylfaeen/remnant-private -f bump=patch
gh run watch --repo sylfaeen/remnant-private
```

> `bump` accepte `patch`, `minor`, `major` ou `auto` (détection automatique via les commits conventionnels).

## Development

### Prerequisites

- Node.js 20+, pnpm 9+
- Docker runtime ([OrbStack](https://orbstack.dev/) recommended on macOS)

### Native (macOS/Linux)

For frontend and backend development without Nginx/SSL features:

```bash
pnpm install
turbo dev
```

Backend on `http://localhost:3001`, frontend on `http://localhost:3000`.

### Docker (simulated VPS)

Spins up a Debian container with systemd, Nginx, Certbot — identical to production. Runs `install.sh` like on a real server.

**macOS Docker setup:**

```bash
brew install orbstack
brew install docker-compose
mkdir -p ~/.docker/cli-plugins
ln -sf $(brew --prefix)/bin/docker-compose ~/.docker/cli-plugins/docker-compose
```

Then launch OrbStack from your Applications.

**First time — build, start and install:**

```bash
./scripts/dev-server.sh
```

This builds the project, starts a Debian container with systemd, and runs `install.sh` automatically.

**After code changes — rebuild and redeploy:**

```bash
./scripts/dev-server.sh deploy
```

Rebuilds the project, replaces the code in the container, and restarts the service. Database, `.env` and servers are preserved.

| Command | Description |
|---------|-------------|
| `./scripts/dev-server.sh` | Build + start + install (first time) |
| `./scripts/dev-server.sh deploy` | Rebuild and redeploy code (keeps data) |
| `./scripts/dev-server.sh shell` | Enter the container |
| `./scripts/dev-server.sh stop` | Stop container |
| `./scripts/dev-server.sh reset` | Destroy everything and start fresh |

> **Note:** SSL certificate generation requires a real public domain. Everything else (Nginx, domains, firewall, systemd) works locally.

## Conventional Commits

| Type | SemVer Impact | Tag example (from `1.2.3`) |
|------|------------|---------------------------|
| `fix:` | `PATCH` ↑  | `1.2.4` |
| `feat:` | `MINOR` ↑  | `1.3.0` |
| `<type>!:` or `BREAKING CHANGE:` footer | `major` ↑  | `2.0.0` |
| `build:` `chore:` `ci:` `docs:` `style:` `refactor:` `perf:` `test:` | No release | — |

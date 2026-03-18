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

## Conventional Commits

| Type | SemVer Impact | Tag example (from `1.2.3`) |
|------|------------|---------------------------|
| `fix:` | `PATCH` ↑  | `1.2.4` |
| `feat:` | `MINOR` ↑  | `1.3.0` |
| `<type>!:` or `BREAKING CHANGE:` footer | `major` ↑  | `2.0.0` |
| `build:` `chore:` `ci:` `docs:` `style:` `refactor:` `perf:` `test:` | No release | — |

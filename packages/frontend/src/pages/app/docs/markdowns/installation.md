# Installation

Remnant can be installed in several ways depending on your environment.

## Quick Install (Linux)

The recommended method for a production server:

```bash
curl -fsSL https://raw.githubusercontent.com/sylfaeen/remnant/main/install.sh | sudo bash
```

The script will prompt you for the installation directory (default: `/opt/remnant`), then:

- Installs Node.js, pnpm, Nginx, and Certbot
- Downloads the latest version of Remnant
- Generates the `.env` file with your paths and secure random secrets
- Configures Nginx reverse proxy and systemd service
- Starts Remnant automatically

Verify that everything is running:

```bash
remnant status
```

### Custom installation path

You can also set the installation path via environment variable:

```bash
curl -fsSL https://raw.githubusercontent.com/sylfaeen/remnant/main/install.sh | sudo REMNANT_HOME=/srv/remnant bash
```

## Manual Installation

### 1. Clone the repository

```bash
git clone https://github.com/sylfaeen/remnant.git
cd remnant
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure the environment

```bash
cp .env.example .env
```

Edit the `.env` file with your paths:

```env
REMNANT_HOME=/opt/remnant
SERVERS_BASE_PATH=/opt/remnant/servers
BACKUPS_BASE_PATH=/opt/remnant/backups
DATABASE_PATH=/opt/remnant/remnant.db

JWT_SECRET=
COOKIE_SECRET=
SECURE_COOKIES=false
```

`JWT_SECRET` and `COOKIE_SECRET` are automatically generated on first startup if left empty.

### 4. Build and start

```bash
pnpm build
pnpm start
```

## Docker Installation

```bash
docker run -d \
  --name remnant \
  -p 3001:3001 \
  -v remnant-data:/opt/remnant \
  ghcr.io/sylfaeen/remnant:latest
```

## Verification

Open your browser to `http://localhost:3001`

Default credentials:

- **Username**: `admin`
- **Password**: `admin`

::: warning IMPORTANT
Change the admin password immediately after the first login!
:::

## Next Step

[Configuration](/guide/configuration) - Configure your first Minecraft server

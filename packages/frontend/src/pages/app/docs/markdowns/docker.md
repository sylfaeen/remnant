# Docker

Deploy Remnant with Docker for simplified installation.

## Docker Run

```bash
docker run -d \
  --name remnant \
  -p 3000:3000 \
  -v /path/to/minecraft:/minecraft \
  -v remnant-data:/app/data \
  -e JWT_SECRET="your-jwt-secret-32-chars-min" \
  ghcr.io/your-repo/remnant:latest
```

## Docker Compose

Recommended `docker-compose.yml`:

```yaml
version: '3.8'

services:
  remnant:
    image: ghcr.io/your-repo/remnant:latest
    container_name: remnant
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - JWT_SECRET=change-this-secret-in-production
      - NODE_ENV=production
    volumes:
      - /opt/minecraft:/minecraft
      - remnant-data:/app/data

volumes:
  remnant-data:
```

Start:

```bash
docker compose up -d
```

## Update

```bash
docker compose down
docker compose pull
docker compose up -d
```

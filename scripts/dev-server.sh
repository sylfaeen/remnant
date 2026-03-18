#!/bin/bash
# dev-server.sh — Spin up a fresh Debian VPS simulator for testing Remnant
#
# Usage:
#   ./scripts/dev-server.sh              # Build + start + install Remnant
#   ./scripts/dev-server.sh shell        # Enter the running container
#   ./scripts/dev-server.sh deploy       # Rebuild and redeploy code (keeps data)
#   ./scripts/dev-server.sh stop         # Stop and remove container
#   ./scripts/dev-server.sh reset        # Destroy everything and start fresh

set -e

CONTAINER_NAME="remnant-server"
IMAGE_NAME="remnant-server"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

RED='\033[0;31m' GREEN='\033[0;32m' CYAN='\033[0;36m' WHITE='\033[1;37m' GRAY='\033[0;90m' NC='\033[0m'

build_tarball() {
    local build_scope="${BUILD_SCOPE:-all}"

    cd "$PROJECT_DIR"
    if [ "$build_scope" = "backend" ]; then
        echo -e "${WHITE}Building backend only...${NC}"
        pnpm --filter @remnant/shared build 2>/dev/null
        pnpm --filter @remnant/backend build 2>/dev/null
    elif [ "$build_scope" = "frontend" ]; then
        echo -e "${WHITE}Building frontend only...${NC}"
        pnpm --filter @remnant/shared build 2>/dev/null
        pnpm --filter @remnant/frontend build 2>/dev/null
    else
        echo -e "${WHITE}Building project...${NC}"
        pnpm build 2>/dev/null
    fi

    local staging="/tmp/remnant-dev-release"
    rm -rf "$staging"
    mkdir -p "$staging/remnant"

    cp -a package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json "$staging/remnant/"
    cp -a scripts "$staging/remnant/"
    mkdir -p "$staging/remnant/packages"
    cp -a packages/backend "$staging/remnant/packages/"
    cp -a packages/frontend "$staging/remnant/packages/"
    cp -a packages/shared "$staging/remnant/packages/"

    find "$staging" -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
    find "$staging" -name "src" -path "*/backend/src" -exec rm -rf {} + 2>/dev/null || true
    find "$staging" -name "src" -path "*/shared/src" -exec rm -rf {} + 2>/dev/null || true
    find "$staging" -name "src" -path "*/frontend/src" -exec rm -rf {} + 2>/dev/null || true
    rm -rf "$staging/remnant/packages/frontend/public" 2>/dev/null || true

    cd "$staging"
    tar -czf /tmp/remnant-local.tar.gz -C remnant .
    rm -rf "$staging"
    echo -e "${GREEN}✓${NC} Tarball built"
}

ensure_image() {
    if ! docker image inspect "$IMAGE_NAME" &>/dev/null; then
        echo -e "${WHITE}Building server image...${NC}"
        docker build -t "$IMAGE_NAME" -f "$PROJECT_DIR/Dockerfile.server" "$PROJECT_DIR"
        echo -e "${GREEN}✓${NC} Image built"
    fi
}

start_container() {
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true

    echo -e "${WHITE}Starting server container...${NC}"
    docker run -d \
        --name "$CONTAINER_NAME" \
        --privileged \
        --cgroupns=host \
        -v /sys/fs/cgroup:/sys/fs/cgroup:rw \
        -v "$PROJECT_DIR:/src:ro" \
        -p 80:80 \
        -p 443:443 \
        -p 3001:3001 \
        "$IMAGE_NAME"

    echo -n "Waiting for systemd..."
    for i in $(seq 1 15); do
        if docker exec "$CONTAINER_NAME" systemctl is-system-running &>/dev/null 2>&1; then
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    echo -e "${GREEN}✓${NC} Container running"
}

copy_tarball() {
    docker cp /tmp/remnant-local.tar.gz "$CONTAINER_NAME":/tmp/remnant-local.tar.gz
}

run_install() {
    echo -e "${WHITE}Installing Remnant...${NC}"
    copy_tarball
    docker exec -it "$CONTAINER_NAME" bash -c 'REMNANT_VERSION=local bash /src/scripts/install.sh'
}

run_deploy() {
    echo -e "${WHITE}Deploying updated code...${NC}"

    # Stop remnant service
    docker exec "$CONTAINER_NAME" systemctl stop remnant 2>/dev/null || true

    # Copy new tarball into container and extract over existing install
    docker cp /tmp/remnant-local.tar.gz "$CONTAINER_NAME":/tmp/remnant-local.tar.gz

    docker exec "$CONTAINER_NAME" bash -c '
        APP_DIR="/opt/remnant/app"

        # Preserve .env and data
        cp "$APP_DIR/.env" /tmp/remnant-env-backup 2>/dev/null || true

        # Replace app files
        find "$APP_DIR" -mindepth 1 -maxdepth 1 \
            ! -name "data" ! -name ".env" ! -name "node_modules" \
            -exec rm -rf {} +
        rm -rf "$APP_DIR/node_modules"
        tar -xzf /tmp/remnant-local.tar.gz -C "$APP_DIR"

        # Restore .env
        cp /tmp/remnant-env-backup "$APP_DIR/.env" 2>/dev/null || true
        chmod 600 "$APP_DIR/.env"
        chown -R remnant:remnant /opt/remnant

        # Reinstall deps
        cd "$APP_DIR" && pnpm install --prod --frozen-lockfile 2>/dev/null

        # Sync scripts
        chmod +x "$APP_DIR/scripts/"*.sh 2>/dev/null || true

        # Update CLI
        cp "$APP_DIR/scripts/remnant-cli.sh" /usr/local/bin/remnant 2>/dev/null || true
        chmod +x /usr/local/bin/remnant 2>/dev/null || true

        rm -f /tmp/remnant-local.tar.gz /tmp/remnant-env-backup
    '

    # Restart
    docker exec "$CONTAINER_NAME" systemctl start remnant
    docker exec "$CONTAINER_NAME" nginx -s reload 2>/dev/null || true

    sleep 2
    if docker exec "$CONTAINER_NAME" systemctl is-active --quiet remnant; then
        echo -e "${GREEN}✓${NC} Remnant redeployed and running"
    else
        echo -e "${RED}✗${NC} Service failed — check: ./scripts/dev-server.sh shell → journalctl -u remnant"
    fi
}

print_status() {
    echo ""
    echo -e "${WHITE}Commands:${NC}"
    echo -e "  ${CYAN}./scripts/dev-server.sh shell${NC}    — Enter the container"
    echo -e "  ${CYAN}./scripts/dev-server.sh deploy${NC}   — Rebuild and redeploy code"
    echo -e "  ${CYAN}./scripts/dev-server.sh stop${NC}     — Stop container"
    echo -e "  ${CYAN}./scripts/dev-server.sh reset${NC}    — Destroy and start fresh"
    echo ""
}

case "${1:-start}" in
    stop)
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Container stopped"
        ;;
    reset)
        docker stop "$CONTAINER_NAME" 2>/dev/null || true
        docker rm "$CONTAINER_NAME" 2>/dev/null || true
        docker rmi "$IMAGE_NAME" 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Container and image removed"
        echo ""
        build_tarball
        ensure_image
        start_container
        run_install
        print_status
        ;;
    shell)
        docker exec -it "$CONTAINER_NAME" bash
        ;;
    deploy)
        build_tarball
        run_deploy
        ;;
    deploy:backend)
        BUILD_SCOPE=backend build_tarball
        run_deploy
        ;;
    deploy:frontend)
        BUILD_SCOPE=frontend build_tarball
        run_deploy
        ;;
    start|"")
        build_tarball
        ensure_image
        start_container
        run_install
        print_status
        ;;
    *)
        echo "Usage: $0 [start|stop|reset|shell|deploy|deploy:backend|deploy:frontend]"
        exit 1
        ;;
esac

#!/bin/bash
#===============================================================================
#
#   Remnant — Game Server Management Panel
#   One-line installer
#
#   Usage:
#     curl -fsSL https://raw.githubusercontent.com/sylfaeen/remnant/main/install.sh | sudo bash
#
#   Structure:
#     <REMNANT_HOME>/       (default: /opt/remnant)
#     ├── app/              # Panel application
#     │   └── data/         # SQLite database
#     ├── servers/          # Minecraft servers
#     ├── backups/          # Automatic backups
#
#===============================================================================

set -e

# ── Configuration ─────────────────────────────────────────────────────────────

GITHUB_REPO="${REMNANT_REPO:-sylfaeen/remnant}"
REMNANT_VERSION="${REMNANT_VERSION:-latest}"
DEFAULT_REMNANT_HOME="/opt/remnant"
REMNANT_HOME=""
APP_DIR=""
SERVERS_DIR=""
BACKUPS_DIR=""
DATABASE_FILE=""
SERVICE_USER="${REMNANT_USER:-remnant}"
SERVICE_PORT="${REMNANT_PORT:-3001}"
NODE_VERSION="20"
MIN_RAM_MB=512
MIN_DISK_MB=500

# ── Terminal colors ───────────────────────────────────────────────────────────

if [[ -t 1 ]]; then
    RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m' BLUE='\033[0;34m'
    CYAN='\033[0;36m' WHITE='\033[1;37m' GRAY='\033[0;90m' NC='\033[0m'
else
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' WHITE='' GRAY='' NC=''
fi

# ── Helpers ───────────────────────────────────────────────────────────────────

command_exists() { command -v "$1" &>/dev/null; }

fail() {
    echo ""
    echo -e "  ${RED}✗ ERROR:${NC} $1"
    echo ""
    exit 1
}

spinner() {
    local pid=$1 message=$2 spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏' i=0
    tput civis 2>/dev/null || true
    while kill -0 "$pid" 2>/dev/null; do
        i=$(( (i+1) % 10 ))
        printf "\r  ${YELLOW}${spin:$i:1}${NC} %s" "$message"
        sleep 0.1
    done
    printf "\r\033[2K"
    tput cnorm 2>/dev/null || true
}

print_ok()   { printf "  ${GREEN}✓${NC} %s\n" "$1"; }
print_err()  { printf "  ${RED}✗${NC} %s\n" "$1"; }
print_warn() { printf "  ${YELLOW}⚠${NC}  %s\n" "$1"; }

print_step() { echo ""; echo -e "${WHITE}[${1}/${2}]${NC} ${3}"; }

# Prompt with default. Shows ✓ + "default" (gray) or custom value (white).
ask_value() {
    local label=$1 default=$2 varname=$3
    printf "  %s ${GRAY}[%s]${NC}: " "$label" "$default"
    read -r input < /dev/tty
    local value="${input:-$default}"
    eval "$varname=\"\$value\""
    printf "\033[1A\033[2K"
    if [[ -z "$input" ]]; then
        printf "  ${GREEN}✓${NC} %s ${GRAY}[%s]${NC}: ${GRAY}default${NC}\n" "$label" "$default"
    else
        printf "  ${GREEN}✓${NC} %s ${GRAY}[%s]${NC}: ${WHITE}%s${NC}\n" "$label" "$default" "$value"
    fi
}

# ── OS-specific installers ────────────────────────────────────────────────────

install_nodejs() {
    local setup_url
    case $OS in
        ubuntu|debian|raspbian) setup_url="https://deb.nodesource.com/setup_${NODE_VERSION}.x" ;;
        *)                      setup_url="https://rpm.nodesource.com/setup_${NODE_VERSION}.x" ;;
    esac
    curl -fsSL "$setup_url" | bash - >/dev/null 2>&1
    $PKG_INSTALL nodejs >/dev/null 2>&1 &
    spinner $! "Installing Node.js ${NODE_VERSION}..."
    print_ok "Node.js v$(node -v | cut -d'v' -f2) installed"
}

install_temurin() {
    case $OS in
        ubuntu|debian|raspbian)
            $PKG_INSTALL apt-transport-https gnupg >/dev/null 2>&1
            curl -fsSL https://packages.adoptium.net/artifactory/api/gpg/key/public \
                | gpg --dearmor -o /usr/share/keyrings/adoptium.gpg 2>/dev/null
            echo "deb [signed-by=/usr/share/keyrings/adoptium.gpg] https://packages.adoptium.net/artifactory/deb $(lsb_release -cs) main" \
                > /etc/apt/sources.list.d/adoptium.list
            apt-get update -qq >/dev/null 2>&1
            apt-get install -y -qq temurin-21-jre temurin-17-jre >/dev/null 2>&1 &
            ;;
        *)
            cat > /etc/yum.repos.d/adoptium.repo << 'REPO'
[Adoptium]
name=Adoptium
baseurl=https://packages.adoptium.net/artifactory/rpm/rhel/$releasever/$basearch
enabled=1
gpgcheck=1
gpgkey=https://packages.adoptium.net/artifactory/api/gpg/key/public
REPO
            yum install -y temurin-21-jre temurin-17-jre >/dev/null 2>&1 &
            ;;
    esac
    spinner $! "Installing Adoptium Temurin 21 & 17..."

    if ! command_exists java; then
        fail "Java installation failed. Install manually: https://adoptium.net/installation/"
    fi

    local ver
    ver=$(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1)
    print_ok "Adoptium Temurin installed (default: Java ${ver})"

    for jvm_dir in /usr/lib/jvm/temurin-*; do
        [[ -x "${jvm_dir}/bin/java" ]] || continue
        print_ok "  $(basename "$jvm_dir") ($("${jvm_dir}/bin/java" -version 2>&1 | head -n1 | cut -d'"' -f2))"
    done
}

# ── System detection ──────────────────────────────────────────────────────────

detect_system() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID; OS_VERSION=$VERSION_ID; OS_NAME=$PRETTY_NAME
    elif [[ -f /etc/debian_version ]]; then
        OS="debian"; OS_NAME="Debian $(cat /etc/debian_version)"
    elif [[ -f /etc/redhat-release ]]; then
        OS="rhel"; OS_NAME=$(cat /etc/redhat-release)
    else
        OS="unknown"; OS_NAME="Unknown"
    fi

    case $(uname -m) in
        x86_64)  ARCH_NAME="x64" ;;
        aarch64) ARCH_NAME="arm64" ;;
        *)       ARCH_NAME=$(uname -m) ;;
    esac

    case $OS in
        ubuntu|debian|raspbian)
            PKG_UPDATE="apt-get update -qq"
            PKG_INSTALL="apt-get install -y -qq"
            ;;
        centos|rhel|rocky|almalinux|fedora)
            PKG_UPDATE="dnf check-update -q || true"
            PKG_INSTALL="dnf install -y -q"
            ;;
        *) fail "Unsupported OS: ${OS_NAME}. Supported: Ubuntu, Debian, CentOS, RHEL, Rocky, Fedora" ;;
    esac
}

# ── Version resolution ────────────────────────────────────────────────────────

resolve_version() {
    if [[ "$REMNANT_VERSION" == "latest" ]]; then
        REMNANT_VERSION=$(curl -sf --connect-timeout 5 "https://api.github.com/repos/${GITHUB_REPO}/releases/latest" \
            | grep '"tag_name"' | sed -E 's/.*"v([^"]+)".*/\1/' || echo "")
        [[ -n "$REMNANT_VERSION" ]] || fail "Could not determine latest version. Set REMNANT_VERSION manually."
    fi
}

# ── Reinstall prompt ──────────────────────────────────────────────────────────

ask_reinstall() {
    [[ -d "$REMNANT_HOME" ]] || return 0

    echo ""
    print_warn "Remnant is already installed in ${REMNANT_HOME}"
    echo ""
    echo -e "    ${WHITE}1)${NC} Update     — keeps data, servers, config"
    echo -e "    ${WHITE}2)${NC} ${RED}Reinstall${NC}  — deletes everything"
    echo -e "    ${WHITE}3)${NC} Cancel"
    echo ""
    read -p "   Choose [1/2/3]: " -n 1 -r < /dev/tty
    echo ""

    case $REPLY in
        1)
            if [[ -f "${APP_DIR}/scripts/update.sh" ]]; then
                bash "${APP_DIR}/scripts/update.sh"
            else
                echo -e "  ${GRAY}Downloading update script...${NC}"
                curl -fsSL "https://raw.githubusercontent.com/${GITHUB_REPO}/main/scripts/update.sh" | bash
            fi
            exit 0
            ;;
        2)
            echo ""
            echo -e "  ${RED}This will permanently delete:${NC}"
            echo -e "    ${RED}✗${NC} All Minecraft servers in ${WHITE}${SERVERS_DIR}${NC}"
            echo -e "    ${RED}✗${NC} Database (${WHITE}${DATABASE_FILE}${NC})"
            echo -e "    ${RED}✗${NC} All backups in ${WHITE}${BACKUPS_DIR}${NC}"
            echo -e "    ${RED}✗${NC} Configuration and sessions"
            echo ""
            read -p "   Type 'DELETE' to confirm: " CONFIRM < /dev/tty
            [[ "$CONFIRM" == "DELETE" ]] || { echo -e "\n  Cancelled.\n"; exit 0; }

            echo ""
            local java_pids
            java_pids=$(pgrep -f "java.*-jar.*${SERVERS_DIR}" 2>/dev/null || true)
            if [[ -n "$java_pids" ]]; then
                echo "$java_pids" | xargs kill 2>/dev/null || true
                sleep 2
                echo "$java_pids" | xargs kill -9 2>/dev/null || true
            fi
            print_ok "Servers stopped"

            systemctl stop remnant 2>/dev/null || true
            systemctl disable remnant 2>/dev/null || true
            rm -f /etc/systemd/system/remnant.service
            systemctl daemon-reload 2>/dev/null || true
            rm -f /usr/local/bin/remnant
            rm -rf "$REMNANT_HOME"
            print_ok "Removed ${REMNANT_HOME}"
            ;;
        *)
            echo -e "\n  Cancelled.\n"
            exit 0
            ;;
    esac
}

# ── Prompts ───────────────────────────────────────────────────────────────────

ask_install_paths() {
    local server_ip
    server_ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

    echo ""
    echo -e "${WHITE}Where do you want to install Remnant?${NC}"
    ask_value "Installation path" "$DEFAULT_REMNANT_HOME" REMNANT_HOME

    APP_DIR="${REMNANT_HOME}/app"
    DATABASE_DIR="${APP_DIR}/data"

    ask_value "Servers path" "${REMNANT_HOME}/servers" SERVERS_DIR
    ask_value "Backups path" "${REMNANT_HOME}/backups" BACKUPS_DIR
    ask_value "Database path" "${DATABASE_DIR}/remnant.db" DATABASE_FILE

    echo ""
    echo -e "${WHITE}What URL will users access Remnant from?${NC}"
    ask_value "Access URL" "http://${server_ip}" CORS_ORIGIN
}

# ── Step 1: System check ─────────────────────────────────────────────────────

check_system() {
    print_step 1 7 "Checking system requirements"

    local errors=0

    detect_system
    print_ok "Detecting operating system... ${OS_NAME} (${ARCH_NAME})"

    local total_ram
    total_ram=$(grep MemTotal /proc/meminfo 2>/dev/null | awk '{print int($2/1024)}' || echo "0")
    if [[ $total_ram -lt $MIN_RAM_MB ]]; then
        print_err "Checking memory... ${total_ram}MB (minimum: ${MIN_RAM_MB}MB)"
        errors=$((errors + 1))
    else
        print_ok "Checking memory... ${total_ram}MB"
    fi

    local avail_disk
    avail_disk=$(df -BM / 2>/dev/null | tail -1 | awk '{gsub(/M/,"",$4); print $4}')
    if [[ ${avail_disk:-0} -lt $MIN_DISK_MB ]]; then
        print_err "Checking disk space... ${avail_disk}MB available (minimum: ${MIN_DISK_MB}MB)"
        errors=$((errors + 1))
    else
        print_ok "Checking disk space... ${avail_disk}MB available"
    fi

    curl -sf --connect-timeout 5 https://api.github.com >/dev/null 2>&1 &
    spinner $! "Checking connectivity..."
    if curl -sf --connect-timeout 5 https://api.github.com >/dev/null 2>&1; then
        print_ok "Checking connectivity... GitHub API reachable"
    else
        print_err "Checking connectivity... cannot reach GitHub API"
        errors=$((errors + 1))
    fi

    [[ $errors -eq 0 ]] || fail "System check failed with ${errors} error(s)"
}

# ── Step 2: Dependencies ─────────────────────────────────────────────────────

install_dependencies() {
    print_step 2 7 "Installing dependencies"

    $PKG_UPDATE >/dev/null 2>&1 &
    spinner $! "Updating package lists..."
    print_ok "Package lists updated"

    for pkg in curl wget conntrack; do
        command_exists $pkg || $PKG_INSTALL $pkg >/dev/null 2>&1
    done

    # Node.js
    if command_exists node; then
        local node_ver
        node_ver=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $node_ver -ge $NODE_VERSION ]]; then
            print_ok "Node.js v$(node -v | cut -d'v' -f2)"
        else
            print_warn "Node.js v${node_ver} found, need v${NODE_VERSION}+"
            install_nodejs
        fi
    else
        install_nodejs
    fi

    # pnpm
    if command_exists pnpm; then
        print_ok "pnpm v$(pnpm -v)"
    else
        npm install -g pnpm >/dev/null 2>&1 &
        spinner $! "Installing pnpm..."
        print_ok "pnpm v$(pnpm -v)"
    fi

    # Java
    if command_exists java; then
        local java_ver
        java_ver=$(java -version 2>&1 | head -n1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [[ "$java_ver" -ge 21 ]]; then
            print_ok "Java ${java_ver}"
        else
            print_warn "Java ${java_ver} found, Java 21+ recommended for Minecraft 1.20.5+"
            install_temurin
        fi
    else
        install_temurin
    fi

    # Nginx + stream module
    if command_exists nginx; then
        print_ok "Nginx v$(nginx -v 2>&1 | cut -d'/' -f2)"
    else
        $PKG_INSTALL nginx >/dev/null 2>&1 &
        spinner $! "Installing Nginx..."
        print_ok "Nginx installed"
    fi
    if ! nginx -V 2>&1 | grep -q "with-stream"; then
        $PKG_INSTALL libnginx-mod-stream >/dev/null 2>&1 &
        spinner $! "Installing Nginx stream module..."
        print_ok "Nginx stream module installed"
    fi

    # Certbot
    if command_exists certbot; then
        print_ok "Certbot"
    else
        $PKG_INSTALL certbot python3-certbot-nginx >/dev/null 2>&1 &
        spinner $! "Installing Certbot..."
        print_ok "Certbot installed"
    fi
}

# ── Step 3: Download & install ────────────────────────────────────────────────

download_remnant() {
    print_step 3 7 "Downloading Remnant"

    # Service user
    if id "$SERVICE_USER" &>/dev/null; then
        print_ok "User '${SERVICE_USER}' exists"
    else
        useradd --system --shell /bin/bash --home-dir "$REMNANT_HOME" "$SERVICE_USER" 2>/dev/null || true
        print_ok "User '${SERVICE_USER}' created"

        echo ""
        echo -e "  ${WHITE}Set a password for '${SERVICE_USER}' (used for SFTP access):${NC}"
        print_warn "This password can only be reset with root access"
        echo ""
        while true; do
            read -sp "  Password: " USER_PASSWORD < /dev/tty
            echo ""
            read -sp "  Confirm:  " USER_PASSWORD_CONFIRM < /dev/tty
            echo ""
            echo ""
            if [[ -z "$USER_PASSWORD" ]]; then
                echo -e "  ${RED}Password cannot be empty.${NC}"
            elif [[ "$USER_PASSWORD" != "$USER_PASSWORD_CONFIRM" ]]; then
                echo -e "  ${RED}Passwords do not match. Try again.${NC}"
            else
                echo "$SERVICE_USER:$USER_PASSWORD" | chpasswd
                unset USER_PASSWORD USER_PASSWORD_CONFIRM
                print_ok "Password set for '${SERVICE_USER}'"
                break
            fi
        done
    fi

    # Directories
    mkdir -p "$APP_DIR" "$SERVERS_DIR" "$BACKUPS_DIR" "$(dirname "$DATABASE_FILE")"
    print_ok "Directories created"

    # Download & extract
    print_ok "Version: ${REMNANT_VERSION}"

    local url="https://github.com/${GITHUB_REPO}/releases/download/v${REMNANT_VERSION}/remnant-${REMNANT_VERSION}.tar.gz"
    local tarball="/tmp/remnant-${REMNANT_VERSION}.tar.gz"

    curl -sfL "$url" -o "$tarball" 2>/dev/null &
    spinner $! "Downloading remnant-${REMNANT_VERSION}.tar.gz..."
    [[ -f "$tarball" ]] || fail "Download failed: ${url}"
    print_ok "Download complete"

    tar -xzf "$tarball" -C "$APP_DIR" --strip-components=1 2>/dev/null &
    spinner $! "Extracting..."
    rm -f "$tarball"
    print_ok "Extracted to ${APP_DIR}"

    # Dependencies
    cd "$APP_DIR"
    pnpm install --prod --frozen-lockfile >/dev/null 2>&1 &
    spinner $! "Installing production dependencies..."
    print_ok "Dependencies installed"

    # CLI
    cp "$APP_DIR/scripts/remnant-cli.sh" /usr/local/bin/remnant
    chmod +x /usr/local/bin/remnant
    print_ok "CLI installed → remnant"

    # Firewall script
    chmod +x "$APP_DIR/scripts/remnant-firewall.sh"

    # Domain script
    chmod +x "$APP_DIR/scripts/remnant-domain.sh"

    # Sudoers for both scripts
    cat > /etc/sudoers.d/remnant << SUDOERS_EOF
${SERVICE_USER} ALL=(root) NOPASSWD: ${APP_DIR}/scripts/remnant-firewall.sh
${SERVICE_USER} ALL=(root) NOPASSWD: ${APP_DIR}/scripts/remnant-domain.sh
SUDOERS_EOF
    chmod 440 /etc/sudoers.d/remnant
    print_ok "Sudoers configured (firewall + domains)"

    # Permissions
    chown -R "$SERVICE_USER:$SERVICE_USER" "$REMNANT_HOME"
    chmod 755 "$REMNANT_HOME" "$APP_DIR" "$SERVERS_DIR" "$BACKUPS_DIR"
    print_ok "Permissions set"
}

# ── Step 4: Service ───────────────────────────────────────────────────────────

configure_service() {
    print_step 4 7 "Configuring service"

    local jwt_secret cookie_secret totp_key
    jwt_secret=$(openssl rand -base64 48 2>/dev/null || head -c 48 /dev/urandom | base64)
    cookie_secret=$(openssl rand -base64 48 2>/dev/null || head -c 48 /dev/urandom | base64)
    totp_key=$(openssl rand -base64 48 2>/dev/null || head -c 48 /dev/urandom | base64)

    cat > "$APP_DIR/.env" << EOF
REMNANT_HOME=${REMNANT_HOME}
SERVERS_BASE_PATH=${SERVERS_DIR}
BACKUPS_BASE_PATH=${BACKUPS_DIR}
DATABASE_PATH=${DATABASE_FILE}

CORS_ORIGIN=${CORS_ORIGIN}

JWT_SECRET=${jwt_secret}
COOKIE_SECRET=${cookie_secret}
TOTP_ENCRYPTION_KEY=${totp_key}
SECURE_COOKIES=false
EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$APP_DIR/.env"
    chmod 600 "$APP_DIR/.env"
    print_ok "Environment configured"

    cat > /etc/systemd/system/remnant.service << EOF
[Unit]
Description=Remnant - Game Server Management Panel
Documentation=https://github.com/${GITHUB_REPO}
After=network.target

[Service]
Type=simple
User=${SERVICE_USER}
Group=${SERVICE_USER}
WorkingDirectory=${APP_DIR}/packages/backend
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=remnant
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${REMNANT_HOME} /etc/nginx /etc/letsencrypt /var/lib/nginx /var/log/nginx /run

[Install]
WantedBy=multi-user.target
EOF

    print_ok "Systemd service created"

    systemctl daemon-reload
    systemctl enable remnant >/dev/null 2>&1
    systemctl start remnant
    sleep 2

    if systemctl is-active --quiet remnant; then
        print_ok "Remnant is running"
    else
        print_warn "Service may have failed — check: journalctl -u remnant -f"
    fi
}

# ── Step 5: Nginx ─────────────────────────────────────────────────────────────

configure_nginx() {
    print_step 5 7 "Configuring Nginx"

    cat > /etc/nginx/sites-available/remnant << 'NGINX_EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 256M;

    location / {
        proxy_pass http://127.0.0.1:REMNANT_PORT;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:REMNANT_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX_EOF

    sed -i "s/REMNANT_PORT/${SERVICE_PORT}/g" /etc/nginx/sites-available/remnant
    sed -i "s|REMNANT_APP_DIR|${APP_DIR}|g" /etc/nginx/sites-available/remnant
    print_ok "Nginx configuration created"

    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/remnant /etc/nginx/sites-enabled/remnant

    if nginx -t 2>/dev/null; then
        systemctl enable nginx >/dev/null 2>&1
        systemctl reload nginx
        print_ok "Nginx is running"
    else
        print_warn "Nginx config test failed — check: nginx -t"
    fi
}

# ── Step 6: Firewall ─────────────────────────────────────────────────────────

configure_firewall() {
    print_step 6 7 "Configuring firewall (iptables whitelist)"

    case $OS in
        ubuntu|debian|raspbian)
            echo iptables-persistent iptables-persistent/autosave_v4 boolean true | debconf-set-selections 2>/dev/null || true
            echo iptables-persistent iptables-persistent/autosave_v6 boolean true | debconf-set-selections 2>/dev/null || true
            $PKG_INSTALL iptables-persistent >/dev/null 2>&1 &
            spinner $! "Installing iptables-persistent..."
            print_ok "iptables-persistent installed"
            ;;
        centos|rhel|rocky|almalinux|fedora)
            $PKG_INSTALL iptables-services >/dev/null 2>&1 &
            spinner $! "Installing iptables-services..."
            systemctl enable iptables >/dev/null 2>&1
            print_ok "iptables-services installed"
            ;;
    esac

    iptables -F
    iptables -X
    iptables -t nat -F
    iptables -t mangle -F

    iptables -A INPUT -i lo -j ACCEPT
    iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
    iptables -A INPUT -p tcp --dport 22 -j ACCEPT
    iptables -A INPUT -p tcp --dport 80 -j ACCEPT
    iptables -A INPUT -p tcp --dport 443 -j ACCEPT

    iptables -P INPUT DROP
    iptables -P FORWARD DROP
    iptables -P OUTPUT ACCEPT

    print_ok "iptables rules applied (SSH, HTTP, HTTPS)"

    if command_exists ip6tables; then
        ip6tables -F
        ip6tables -X
        ip6tables -A INPUT -i lo -j ACCEPT
        ip6tables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
        ip6tables -A INPUT -p tcp --dport 22 -j ACCEPT
        ip6tables -A INPUT -p tcp --dport 80 -j ACCEPT
        ip6tables -A INPUT -p tcp --dport 443 -j ACCEPT
        ip6tables -P INPUT DROP
        ip6tables -P FORWARD DROP
        ip6tables -P OUTPUT ACCEPT
        print_ok "ip6tables rules applied"
    fi

    case $OS in
        ubuntu|debian|raspbian)
            mkdir -p /etc/iptables
            iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
            ip6tables-save > /etc/iptables/rules.v6 2>/dev/null || true
            ;;
        centos|rhel|rocky|almalinux|fedora)
            service iptables save 2>/dev/null || true
            ;;
    esac
    print_ok "Rules persisted across reboots"
}

# ── Step 7: Completion ────────────────────────────────────────────────────────

show_complete() {
    print_step 7 7 "Finalizing"

    print_ok "All services started"

    local server_ip
    server_ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

    echo -e "  ${GREEN}✓${NC} ${WHITE}Remnant v${REMNANT_VERSION} installed successfully${NC}"
    echo ""
    echo -e "  ${WHITE}Panel:${NC}        ${CORS_ORIGIN}"
    echo -e "  ${GRAY}If you add a domain later, update CORS_ORIGIN in ${APP_DIR}/.env${NC}"
    echo ""
    echo -e "  ${WHITE}SFTP:${NC}"
    echo -e "  Host: ${CYAN}${server_ip}${NC}  Port: ${CYAN}22${NC}"
    echo -e "  User: ${CYAN}${SERVICE_USER}${NC}  (password set during install)"
    echo -e "  Root: ${CYAN}${REMNANT_HOME}${NC}"
    echo ""
    echo -e "  ${WHITE}Commands:${NC} remnant help"
    echo ""
    echo -e "  ${WHITE}Firewall:${NC}"
    echo -e "  Open ports: ${CYAN}22${NC} (SSH), ${CYAN}80${NC} (HTTP), ${CYAN}443${NC} (HTTPS)"
    echo -e "  Game ports: managed via panel ${GRAY}(Settings > Firewall)${NC}"
    echo ""
}

# ── Main ──────────────────────────────────────────────────────────────────────

main() {
    echo ""
    echo -e "${WHITE}Remnant${NC} — Game Server Management Panel"
    echo ""

    [[ $EUID -eq 0 ]] || fail "This script must be run as root. Use: curl ... | sudo bash"

    resolve_version
    echo -e "Current version: ${CYAN}v${REMNANT_VERSION}${NC}"

    ask_install_paths
    ask_reinstall
    check_system
    install_dependencies
    download_remnant
    configure_service
    configure_nginx
    configure_firewall
    show_complete
}

main "$@"

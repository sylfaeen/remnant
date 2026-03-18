#!/bin/bash
#===============================================================================
#   Remnant CLI — Quick management commands
#===============================================================================

# Wrap everything in a function so bash reads the entire file into memory
# before executing. This prevents corruption when `remnant update` replaces
# this file on disk while it is still running.
_remnant_main() {

# ── Configuration ─────────────────────────────────────────────────────────────

if [[ -t 1 ]]; then
    RED='\033[0;31m' GREEN='\033[0;32m' YELLOW='\033[1;33m'
    CYAN='\033[0;36m' WHITE='\033[1;37m' GRAY='\033[0;90m' NC='\033[0m'
else
    RED='' GREEN='' YELLOW='' CYAN='' WHITE='' GRAY='' NC=''
fi

REMNANT_HOME="${REMNANT_HOME:-/opt/remnant}"
SERVICE_NAME="remnant"

# ── Commands ──────────────────────────────────────────────────────────────────

show_status() {
    echo ""
    echo -e "  ${WHITE}Remnant Status${NC}"
    echo ""

    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        local uptime
        uptime=$(systemctl show "$SERVICE_NAME" --property=ActiveEnterTimestamp --value 2>/dev/null)
        echo -e "  Service:  ${GREEN}● running${NC}"
        [[ -n "$uptime" ]] && echo -e "  Uptime:   ${WHITE}since ${uptime}${NC}"
    else
        echo -e "  Service:  ${RED}● stopped${NC}"
    fi

    local port
    port=$(grep -oP 'PORT=\K[0-9]+' "$REMNANT_HOME/app/.env" 2>/dev/null || echo "3001")
    if ss -tlnp 2>/dev/null | grep -q ":${port} "; then
        echo -e "  Port:     ${GREEN}${port} (listening)${NC}"
    else
        echo -e "  Port:     ${RED}${port} (not listening)${NC}"
    fi

    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo -e "  Nginx:    ${GREEN}● running${NC}"
    else
        echo -e "  Nginx:    ${RED}● stopped${NC}"
    fi

    local ip
    ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "your-server-ip")
    echo ""
    echo -e "  ${WHITE}Access:${NC}  http://${ip}"

    if [[ -f /etc/nginx/sites-available/remnant ]]; then
        local domain
        domain=$(grep -oP 'server_name\s+\K[^;_\s]+' /etc/nginx/sites-available/remnant 2>/dev/null | head -1)
        if [[ -n "$domain" ]]; then
            if [[ -f "/etc/letsencrypt/live/${domain}/fullchain.pem" ]]; then
                echo -e "  ${WHITE}HTTPS:${NC}   https://${domain} ${GREEN}(certificate active)${NC}"
            else
                echo -e "  ${WHITE}Domain:${NC}  http://${domain} ${YELLOW}(no HTTPS)${NC}"
            fi
        fi
    fi
    echo ""
}

show_logs() {
    journalctl -u "$SERVICE_NAME" -f --no-hostname -o cat
}

do_start() {
    echo -e "  Starting Remnant..."
    sudo systemctl start "$SERVICE_NAME"
    sleep 1
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo -e "  ${GREEN}✓${NC} Remnant started"
    else
        echo -e "  ${RED}✗${NC} Failed to start — run: ${GRAY}remnant logs${NC}"
    fi
}

do_stop() {
    echo -e "  Stopping Remnant..."
    sudo systemctl stop "$SERVICE_NAME"
    echo -e "  ${GREEN}✓${NC} Remnant stopped"
}

do_restart() {
    echo -e "  Restarting Remnant..."
    sudo systemctl restart "$SERVICE_NAME"
    sleep 1
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        echo -e "  ${GREEN}✓${NC} Remnant restarted"
    else
        echo -e "  ${RED}✗${NC} Failed to restart — run: ${GRAY}remnant logs${NC}"
    fi
}

do_update() {
    local update_script="${REMNANT_HOME}/app/scripts/update.sh"
    if [[ ! -f "$update_script" ]]; then
        echo -e "  ${RED}✗${NC} Update script not found at ${update_script}"
        echo -e "  ${GRAY}Run manually:${NC} ${CYAN}curl -fsSL https://raw.githubusercontent.com/sylfaeen/remnant/main/scripts/update.sh | sudo bash${NC}"
        exit 1
    fi
    sudo bash "$update_script"
}

show_version() {
    local version="unknown"
    if [[ -f "$REMNANT_HOME/app/package.json" ]]; then
        version=$(grep '"version"' "$REMNANT_HOME/app/package.json" 2>/dev/null | head -1 | sed -E 's/.*"([0-9]+\.[0-9]+\.[0-9]+)".*/\1/' || echo "unknown")
    fi
    echo -e "  Remnant v${version}"
}

show_domains() {
    local sites_dir="/etc/nginx/sites-available"
    local enabled_dir="/etc/nginx/sites-enabled"

    echo ""
    echo -e "  ${WHITE}Nginx Domains${NC}"
    echo ""

    if ! command -v nginx &>/dev/null; then
        echo -e "  ${RED}✗${NC} Nginx is not installed"
        echo ""
        return 1
    fi

    if [[ ! -d "$sites_dir" ]]; then
        echo -e "  ${RED}✗${NC} ${sites_dir} not found"
        echo ""
        return 1
    fi

    local site_count=0

    for conf in "$sites_dir"/*; do
        [[ -f "$conf" ]] || continue
        local name
        name=$(basename "$conf")
        [[ "$name" == "default" ]] && continue

        site_count=$((site_count + 1))

        local enabled=false
        [[ -L "$enabled_dir/$name" ]] && enabled=true

        local domains listens has_ssl=false
        domains=$(grep -oP 'server_name\s+\K[^;]+' "$conf" 2>/dev/null | head -1 | tr -s ' ')
        listens=$(grep -oP 'listen\s+\K[^;]+' "$conf" 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
        grep -qE 'listen\s+.*443|ssl_certificate' "$conf" 2>/dev/null && has_ssl=true

        if [[ "$enabled" == true ]]; then
            echo -e "  ${GREEN}●${NC} ${WHITE}${name}${NC}"
        else
            echo -e "  ${RED}●${NC} ${WHITE}${name}${NC} ${GRAY}(disabled)${NC}"
        fi

        if [[ -n "$domains" && "$domains" != "_" ]]; then
            echo -e "    Server name:  ${CYAN}${domains}${NC}"
        else
            echo -e "    Server name:  ${GRAY}_ (catch-all)${NC}"
        fi
        echo -e "    Listen:       ${WHITE}${listens}${NC}"

        if [[ "$has_ssl" == true ]]; then
            local cert_domain
            cert_domain=$(echo "$domains" | awk '{print $1}')
            if [[ -n "$cert_domain" && "$cert_domain" != "_" ]]; then
                local cert_path="/etc/letsencrypt/live/${cert_domain}/fullchain.pem"
                if [[ -f "$cert_path" ]]; then
                    local expiry expiry_epoch now_epoch days_left
                    expiry=$(openssl x509 -enddate -noout -in "$cert_path" 2>/dev/null | cut -d= -f2)
                    if [[ -n "$expiry" ]]; then
                        expiry_epoch=$(date -d "$expiry" +%s 2>/dev/null)
                        now_epoch=$(date +%s)
                        days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
                        if [[ $days_left -lt 0 ]]; then
                            echo -e "    SSL:          ${RED}expired${NC}"
                        elif [[ $days_left -lt 14 ]]; then
                            echo -e "    SSL:          ${YELLOW}expires in ${days_left}d${NC}"
                        else
                            echo -e "    SSL:          ${GREEN}valid (${days_left}d remaining)${NC}"
                        fi
                    else
                        echo -e "    SSL:          ${GREEN}active${NC}"
                    fi
                else
                    echo -e "    SSL:          ${YELLOW}configured but certificate not found${NC}"
                fi
            fi
        fi

        for domain in $domains; do
            [[ "$domain" == "_" ]] && continue
            local scheme="http"
            [[ "$has_ssl" == true ]] && scheme="https"
            local url="${scheme}://${domain}"
            local http_code
            http_code=$(curl -sk -o /dev/null -w '%{http_code}' --connect-timeout 5 --max-time 10 "$url" 2>/dev/null)

            if [[ -z "$http_code" || "$http_code" == "000" ]]; then
                echo -e "    ${url}  ${RED}✗ unreachable${NC}"
            elif [[ "$http_code" =~ ^[23] ]]; then
                echo -e "    ${url}  ${GREEN}✓ ${http_code}${NC}"
            else
                echo -e "    ${url}  ${YELLOW}⚠ ${http_code}${NC}"
            fi
        done
        echo ""
    done

    [[ $site_count -gt 0 ]] || echo -e "  ${GRAY}No sites found in ${sites_dir}${NC}"

    if nginx_test=$(sudo nginx -t 2>&1); then
        echo -e "  ${GREEN}✓${NC} Nginx configuration is valid"
    else
        echo -e "  ${RED}✗${NC} Nginx configuration has errors:"
        echo "$nginx_test" | sed 's/^/    /'
    fi
    echo ""
}

do_uninstall() {
    echo ""
    echo -e "  ${RED}⚠  UNINSTALL REMNANT${NC}"
    echo ""
    echo -e "  ${RED}This will permanently remove:${NC}"
    echo -e "    ${RED}✗${NC} Remnant application       ${WHITE}${REMNANT_HOME}/app${NC}"
    echo -e "    ${RED}✗${NC} All Minecraft servers      ${WHITE}${REMNANT_HOME}/servers${NC}"
    echo -e "    ${RED}✗${NC} All backups                ${WHITE}${REMNANT_HOME}/backups${NC}"
    echo -e "    ${RED}✗${NC} Database, config, systemd service, Nginx site, CLI, user"
    echo ""
    echo -e "  ${GREEN}Packages will NOT be removed:${NC} Node.js, pnpm, Java, Nginx, Certbot"
    echo ""
    read -p "   Type 'DELETE' to confirm uninstall: " CONFIRM < /dev/tty
    [[ "$CONFIRM" == "DELETE" ]] || { echo -e "\n  ${WHITE}Cancelled.${NC}\n"; exit 0; }

    echo ""

    # Stop Minecraft servers
    local java_pids
    java_pids=$(pgrep -f "java.*-jar.*${REMNANT_HOME}/servers" 2>/dev/null || true)
    if [[ -n "$java_pids" ]]; then
        echo "$java_pids" | xargs kill 2>/dev/null || true
        sleep 2
        echo "$java_pids" | xargs kill -9 2>/dev/null || true
    fi
    echo -e "  ${GREEN}✓${NC} Servers stopped"

    # Systemd
    sudo systemctl stop remnant 2>/dev/null || true
    sudo systemctl disable remnant 2>/dev/null || true
    sudo rm -f /etc/systemd/system/remnant.service
    sudo systemctl daemon-reload 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Systemd service removed"

    # Read remnant-managed domains from DB before cleanup
    local db_path="${REMNANT_HOME}/app/data/remnant.db"
    local managed_domains=""
    if command -v sqlite3 &>/dev/null && [[ -f "$db_path" ]]; then
        managed_domains=$(sqlite3 "$db_path" "SELECT domain FROM custom_domains;" 2>/dev/null || true)
    fi

    # SSL certificates (only remnant-managed)
    if command -v certbot &>/dev/null && [[ -n "$managed_domains" ]]; then
        while IFS= read -r domain; do
            [[ -z "$domain" ]] && continue
            if [[ -d "/etc/letsencrypt/live/${domain}" ]]; then
                sudo certbot delete --cert-name "$domain" --non-interactive 2>/dev/null || true
            fi
        done <<< "$managed_domains"
        echo -e "  ${GREEN}✓${NC} SSL certificates removed"
    fi

    # Nginx (only remnant vhost + managed domain vhosts)
    sudo rm -f /etc/nginx/sites-enabled/remnant /etc/nginx/sites-available/remnant
    sudo rm -f /etc/nginx/sites-enabled/remnant-fallback /etc/nginx/sites-available/remnant-fallback
    if [[ -n "$managed_domains" ]]; then
        while IFS= read -r domain; do
            [[ -z "$domain" ]] && continue
            sudo rm -f "/etc/nginx/sites-enabled/${domain}" "/etc/nginx/sites-available/${domain}"
            sudo rm -f "/etc/nginx/streams-enabled/${domain}" "/etc/nginx/streams-available/${domain}" 2>/dev/null || true
        done <<< "$managed_domains"
    fi
    # Remove empty stream dirs and stream block only if no other streams exist
    if [[ -d "/etc/nginx/streams-available" ]] && [[ -z "$(ls -A /etc/nginx/streams-available 2>/dev/null)" ]]; then
        sudo rm -rf /etc/nginx/streams-available /etc/nginx/streams-enabled
        sudo sed -i '/^stream {/,/^}/d' /etc/nginx/nginx.conf 2>/dev/null || true
    fi
    if systemctl is-active --quiet nginx 2>/dev/null; then
        sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null
    fi
    echo -e "  ${GREEN}✓${NC} Nginx configuration removed"

    # Sudoers
    sudo rm -f /etc/sudoers.d/remnant
    echo -e "  ${GREEN}✓${NC} Sudoers removed"

    # Files
    sudo rm -rf "$REMNANT_HOME"
    echo -e "  ${GREEN}✓${NC} ${REMNANT_HOME} removed"

    # User
    if id "remnant" &>/dev/null; then
        sudo userdel "remnant" 2>/dev/null || true
        echo -e "  ${GREEN}✓${NC} User 'remnant' removed"
    fi

    echo ""
    echo -e "  ${GREEN}✓ Remnant has been completely uninstalled.${NC}"
    echo ""

    # Remove CLI last (we're running from it)
    sudo rm -f /usr/local/bin/remnant
}

show_help() {
    echo ""
    echo -e "  ${WHITE}Remnant CLI${NC}"
    echo ""
    echo -e "  ${WHITE}Usage:${NC} remnant <command>"
    echo ""
    echo -e "  ${CYAN}status${NC}      Show service status"
    echo -e "  ${CYAN}logs${NC}        Follow live logs"
    echo -e "  ${CYAN}start${NC}       Start the service"
    echo -e "  ${CYAN}stop${NC}        Stop the service"
    echo -e "  ${CYAN}restart${NC}     Restart the service"
    echo -e "  ${CYAN}update${NC}      Update to the latest version"
    echo -e "  ${CYAN}domains${NC}     Show Nginx domains and test connectivity"
    echo -e "  ${CYAN}version${NC}     Show current version"
    echo -e "  ${CYAN}uninstall${NC}   Remove Remnant (keeps packages)"
    echo ""
}

# ── Dispatch ──────────────────────────────────────────────────────────────────

case "${1:-status}" in
    status)                show_status ;;
    logs)                  show_logs ;;
    start)                 do_start ;;
    stop)                  do_stop ;;
    restart)               do_restart ;;
    update)                do_update ;;
    uninstall)             do_uninstall ;;
    domains)               show_domains ;;
    version|-v|--version)  show_version ;;
    help|-h|--help)        show_help ;;
    *)
        echo -e "  ${RED}Unknown command:${NC} $1"
        show_help
        exit 1
        ;;
esac

}

# Call the wrapper — by this point bash has read the entire file
_remnant_main "$@"

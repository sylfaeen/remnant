#!/usr/bin/env bash
# remnant-sftp.sh — Secure SFTP user management for Remnant GSMP
# This script is the ONLY entry point for SFTP user operations.
# Executed via sudo by the remnant system user.
# sudoers: remnant ALL=(ALL) NOPASSWD: /opt/remnant/scripts/remnant-sftp.sh

set -euo pipefail

# === Constants ===
SFTP_GROUP="sftp-users"

# === Helpers ===
json_success() { echo "{\"success\":true,\"action\":\"$1\"}"; }
json_error()   { echo "{\"success\":false,\"error\":\"$1\"}" >&2; exit 1; }

# === Input validation ===
validate_action() {
  local action="$1"
  if ! [[ "$action" =~ ^(create-user|update-password|update-permissions|delete-user)$ ]]; then
    json_error "Invalid action: must be create-user, update-password, update-permissions, or delete-user"
  fi
}

validate_username() {
  local username="$1"
  if [ -z "$username" ]; then
    json_error "Username cannot be empty"
  fi
  if ! [[ "$username" =~ ^[a-z_][a-z0-9_-]{0,31}$ ]]; then
    json_error "Invalid username: must be lowercase alphanumeric (max 32 chars)"
  fi
  # Block dangerous usernames
  if [[ "$username" =~ ^(root|admin|nobody|daemon|bin|sys|www-data|remnant)$ ]]; then
    json_error "Username '${username}' is reserved"
  fi
}

validate_path() {
  local path="$1"
  if [ -z "$path" ]; then
    json_error "Path cannot be empty"
  fi
  # Block path traversal
  if [[ "$path" == *".."* ]]; then
    json_error "Invalid path: path traversal detected"
  fi
  if [ ! -d "$path" ]; then
    json_error "Server path does not exist: ${path}"
  fi
}

validate_permissions() {
  local perms="$1"
  if ! [[ "$perms" =~ ^(read-only|read-write)$ ]]; then
    json_error "Invalid permissions: must be read-only or read-write"
  fi
}

# === Ensure sftp-users group exists ===
ensure_sftp_group() {
  if ! getent group "$SFTP_GROUP" &>/dev/null; then
    groupadd "$SFTP_GROUP"
  fi
}

# === Actions ===
action_create_user() {
  local username="$1" password="$2" server_path="$3"

  validate_username "$username"
  validate_path "$server_path"

  ensure_sftp_group

  # Check if user already exists
  if id "$username" &>/dev/null; then
    json_error "System user '${username}' already exists"
  fi

  # Create the chroot base directory (must be owned by root for chroot)
  local chroot_dir="/home/${username}"
  mkdir -p "$chroot_dir"
  chown root:root "$chroot_dir"
  chmod 755 "$chroot_dir"

  # Create system user with chroot home, no login shell
  useradd -g "$SFTP_GROUP" -d "$chroot_dir" -s /usr/sbin/nologin "$username"

  # Set password
  echo "${username}:${password}" | chpasswd

  # Create the server data directory inside chroot and symlink to actual server path
  local data_dir="${chroot_dir}/server"
  ln -sfn "$server_path" "$data_dir"

  # Set permissions on the server path for the SFTP user
  chown -R "${username}:${SFTP_GROUP}" "$server_path"
  chmod -R 775 "$server_path"

  json_success "create-user"
}

action_update_password() {
  local username="$1" password="$2"

  validate_username "$username"

  if ! id "$username" &>/dev/null; then
    json_error "System user '${username}' does not exist"
  fi

  echo "${username}:${password}" | chpasswd

  json_success "update-password"
}

action_update_permissions() {
  local username="$1" server_path="$2" permissions="$3"

  validate_username "$username"
  validate_path "$server_path"
  validate_permissions "$permissions"

  if ! id "$username" &>/dev/null; then
    json_error "System user '${username}' does not exist"
  fi

  if [ "$permissions" = "read-only" ]; then
    # Remove write permissions for the user on the server path
    chmod -R o-w "$server_path"
    # Set ACL for read-only access
    if command -v setfacl &>/dev/null; then
      setfacl -R -m "u:${username}:rX" "$server_path"
      setfacl -R -d -m "u:${username}:rX" "$server_path"
    else
      chown -R "${username}:${SFTP_GROUP}" "$server_path"
      chmod -R 555 "$server_path"
    fi
  else
    # read-write: full access
    if command -v setfacl &>/dev/null; then
      setfacl -R -m "u:${username}:rwX" "$server_path"
      setfacl -R -d -m "u:${username}:rwX" "$server_path"
    else
      chown -R "${username}:${SFTP_GROUP}" "$server_path"
      chmod -R 775 "$server_path"
    fi
  fi

  json_success "update-permissions"
}

action_delete_user() {
  local username="$1"

  validate_username "$username"

  if ! id "$username" &>/dev/null; then
    # User doesn't exist, nothing to do
    json_success "delete-user"
    exit 0
  fi

  # Kill any active sessions for this user
  pkill -u "$username" 2>/dev/null || true

  # Remove the chroot symlink and home directory
  local chroot_dir="/home/${username}"
  rm -rf "$chroot_dir"

  # Delete the system user (without removing home, already handled)
  userdel "$username" 2>/dev/null || true

  json_success "delete-user"
}

# === Main ===
ACTION="${1:-}"
[ -n "$ACTION" ] || json_error "Usage: $0 <create-user|update-password|update-permissions|delete-user> [args...]"

validate_action "$ACTION"

case "$ACTION" in
  create-user)
    USERNAME="${2:-}"
    PASSWORD="${3:-}"
    SERVER_PATH="${4:-}"
    [ -n "$USERNAME" ] && [ -n "$PASSWORD" ] && [ -n "$SERVER_PATH" ] || json_error "Usage: $0 create-user <username> <password> <server_path>"
    action_create_user "$USERNAME" "$PASSWORD" "$SERVER_PATH"
    ;;
  update-password)
    USERNAME="${2:-}"
    PASSWORD="${3:-}"
    [ -n "$USERNAME" ] && [ -n "$PASSWORD" ] || json_error "Usage: $0 update-password <username> <password>"
    action_update_password "$USERNAME" "$PASSWORD"
    ;;
  update-permissions)
    USERNAME="${2:-}"
    SERVER_PATH="${3:-}"
    PERMISSIONS="${4:-}"
    [ -n "$USERNAME" ] && [ -n "$SERVER_PATH" ] && [ -n "$PERMISSIONS" ] || json_error "Usage: $0 update-permissions <username> <server_path> <permissions>"
    action_update_permissions "$USERNAME" "$SERVER_PATH" "$PERMISSIONS"
    ;;
  delete-user)
    USERNAME="${2:-}"
    [ -n "$USERNAME" ] || json_error "Usage: $0 delete-user <username>"
    action_delete_user "$USERNAME"
    ;;
esac

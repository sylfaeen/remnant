#!/usr/bin/env bash
# remnant-sftp.sh — Secure SFTP user management for Remnant GSMP
# This script is the ONLY entry point for SFTP user operations.
# Executed via sudo by the remnant system user.
# sudoers: remnant ALL=(ALL) NOPASSWD: /opt/remnant/scripts/remnant-sftp.sh

set -euo pipefail

SFTP_GROUP="sftp-users"

json_success() { echo "{\"success\":true,\"action\":\"$1\"}"; }
json_error()   { echo "{\"success\":false,\"error\":\"$1\"}" >&2; exit 1; }

validate_action() {
  local action="$1"
  if ! [[ "$action" =~ ^(create-user|update-password|update-permissions|update-paths|delete-user)$ ]]; then
    json_error "Invalid action: must be create-user, update-password, update-permissions, update-paths, or delete-user"
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

ensure_sftp_group() {
  if ! getent group "$SFTP_GROUP" &>/dev/null; then
    groupadd "$SFTP_GROUP"
  fi
}

# Sets up the chroot directory structure with symlinks to allowed paths.
# If allowed_paths is empty or contains only "/", the entire server directory is linked.
# Otherwise, individual subdirectories are symlinked.
setup_allowed_paths() {
  local username="$1" server_path="$2" allowed_paths="$3"
  local chroot_dir="/home/${username}"

  # Remove any existing server symlinks/dirs inside chroot
  rm -rf "${chroot_dir}/server"

  if [ -z "$allowed_paths" ] || [ "$allowed_paths" = '/' ] || [ "$allowed_paths" = '["/"]' ] || [ "$allowed_paths" = '[]' ]; then
    # Full access: symlink entire server directory
    ln -sfn "$server_path" "${chroot_dir}/server"
  else
    # Restricted access: create server dir and symlink only allowed subpaths
    mkdir -p "${chroot_dir}/server"
    chown root:root "${chroot_dir}/server"
    chmod 755 "${chroot_dir}/server"

    # Parse comma-separated paths (passed as "path1,path2,path3")
    IFS=',' read -ra PATHS <<< "$allowed_paths"
    for subpath in "${PATHS[@]}"; do
      # Trim whitespace
      subpath=$(echo "$subpath" | xargs)
      # Strip leading slash
      subpath="${subpath#/}"

      if [ -z "$subpath" ]; then
        # Root path means full access
        rm -rf "${chroot_dir}/server"
        ln -sfn "$server_path" "${chroot_dir}/server"
        return
      fi

      # Block path traversal
      if [[ "$subpath" == *".."* ]]; then
        continue
      fi

      local target="${server_path}/${subpath}"
      if [ -e "$target" ]; then
        # Create parent directories if needed
        local parent
        parent=$(dirname "${chroot_dir}/server/${subpath}")
        mkdir -p "$parent"
        ln -sfn "$target" "${chroot_dir}/server/${subpath}"
      fi
    done
  fi

  # Set permissions on the server path for the SFTP user
  chown -R "${username}:${SFTP_GROUP}" "$server_path"
  chmod -R 775 "$server_path"
}

action_create_user() {
  local username="$1" password="$2" server_path="$3" allowed_paths="${4:-}"

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

  # Set up allowed paths (symlinks into chroot)
  setup_allowed_paths "$username" "$server_path" "$allowed_paths"

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

action_update_paths() {
  local username="$1" server_path="$2" allowed_paths="${3:-}"

  validate_username "$username"
  validate_path "$server_path"

  if ! id "$username" &>/dev/null; then
    json_error "System user '${username}' does not exist"
  fi

  setup_allowed_paths "$username" "$server_path" "$allowed_paths"

  json_success "update-paths"
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

ACTION="${1:-}"
[ -n "$ACTION" ] || json_error "Usage: $0 <create-user|update-password|update-permissions|delete-user> [args...]"

validate_action "$ACTION"

case "$ACTION" in
  create-user)
    USERNAME="${2:-}"
    PASSWORD="${3:-}"
    SERVER_PATH="${4:-}"
    ALLOWED_PATHS="${5:-}"
    [ -n "$USERNAME" ] && [ -n "$PASSWORD" ] && [ -n "$SERVER_PATH" ] || json_error "Usage: $0 create-user <username> <password> <server_path> [allowed_paths]"
    action_create_user "$USERNAME" "$PASSWORD" "$SERVER_PATH" "$ALLOWED_PATHS"
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
  update-paths)
    USERNAME="${2:-}"
    SERVER_PATH="${3:-}"
    ALLOWED_PATHS="${4:-}"
    [ -n "$USERNAME" ] && [ -n "$SERVER_PATH" ] || json_error "Usage: $0 update-paths <username> <server_path> [allowed_paths]"
    action_update_paths "$USERNAME" "$SERVER_PATH" "$ALLOWED_PATHS"
    ;;
  delete-user)
    USERNAME="${2:-}"
    [ -n "$USERNAME" ] || json_error "Usage: $0 delete-user <username>"
    action_delete_user "$USERNAME"
    ;;
esac

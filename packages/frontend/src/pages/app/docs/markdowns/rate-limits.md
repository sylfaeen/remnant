# Rate Limits

Remnant enforces rate limiting on all mutation endpoints to prevent abuse, brute-force attacks, and denial of service. Read-only queries are not rate-limited.

## How It Works

- **Public routes** (login, TOTP verification) are limited **per IP address**.
- **Authenticated routes** are limited **per user ID**, so one user hitting a limit does not affect others.
- When a limit is reached, the server responds with a `TOO_MANY_REQUESTS` error and the request is rejected until the time window resets.
- All time windows are **sliding**: the counter resets after the configured duration since the first request in the window.

## Authentication

| Action            | Endpoint          | Limit      | Window   | Key |
| ----------------- | ----------------- | ---------- | -------- | --- |
| Login             | `auth.login`      | 5 requests | 1 minute | IP  |
| TOTP verification | `auth.verifyTotp` | 5 requests | 1 minute | IP  |
| Logout            | `auth.logout`     | No limit   | —        | —   |
| Refresh token     | `auth.refresh`    | 5 requests | 1 minute | IP  |
| Get current user  | `auth.me`         | No limit   | —        | —   |

## Server Management

| Action             | Endpoint          | Limit       | Window   | Key  |
| ------------------ | ----------------- | ----------- | -------- | ---- |
| List servers       | `servers.list`    | No limit    | —        | —    |
| Get server details | `servers.byId`    | No limit    | —        | —    |
| Create server      | `servers.create`  | 10 requests | 1 minute | User |
| Update server      | `servers.update`  | 10 requests | 1 minute | User |
| Delete server      | `servers.delete`  | 10 requests | 1 minute | User |
| Start server       | `servers.start`   | 10 requests | 1 minute | User |
| Stop server        | `servers.stop`    | 10 requests | 1 minute | User |
| Restart server     | `servers.restart` | 10 requests | 1 minute | User |

## Backups

| Action          | Endpoint                             | Limit       | Window   | Key  |
| --------------- | ------------------------------------ | ----------- | -------- | ---- |
| List backups    | `servers.listBackups`                | No limit    | —        | —    |
| Create backup   | `servers.backup`                     | 5 requests  | 1 minute | User |
| Delete backup   | `servers.deleteBackup`               | 5 requests  | 1 minute | User |
| Download backup | `GET /api/servers/backups/:filename` | 10 requests | 1 minute | IP   |

## File Operations

| Action           | Endpoint                             | Limit       | Window   | Key  |
| ---------------- | ------------------------------------ | ----------- | -------- | ---- |
| List directory   | `files.list`                         | No limit    | —        | —    |
| Read file        | `files.read`                         | No limit    | —        | —    |
| Get file info    | `files.info`                         | No limit    | —        | —    |
| Write file       | `files.write`                        | 30 requests | 1 minute | User |
| Delete file      | `files.delete`                       | 30 requests | 1 minute | User |
| Create directory | `files.mkdir`                        | 30 requests | 1 minute | User |
| Rename file      | `files.rename`                       | 30 requests | 1 minute | User |
| Upload file      | `POST /api/servers/:id/files/upload` | 20 requests | 1 minute | IP   |

## JAR Management

| Action                | Endpoint           | Limit       | Window   | Key  |
| --------------------- | ------------------ | ----------- | -------- | ---- |
| List PaperMC versions | `jars.getVersions` | No limit    | —        | —    |
| List PaperMC builds   | `jars.getBuilds`   | No limit    | —        | —    |
| List server JARs      | `jars.list`        | No limit    | —        | —    |
| Download progress     | `jars.progress`    | No limit    | —        | —    |
| Download JAR          | `jars.download`    | 5 requests  | 1 minute | User |
| Set active JAR        | `jars.setActive`   | 10 requests | 1 minute | User |
| Delete JAR            | `jars.delete`      | 10 requests | 1 minute | User |

## Plugins

| Action        | Endpoint                        | Limit       | Window   | Key  |
| ------------- | ------------------------------- | ----------- | -------- | ---- |
| List plugins  | `plugins.list`                  | No limit    | —        | —    |
| Toggle plugin | `plugins.toggle`                | 30 requests | 1 minute | User |
| Delete plugin | `plugins.delete`                | 30 requests | 1 minute | User |
| Upload plugin | `POST /api/servers/:id/plugins` | 20 requests | 1 minute | IP   |

## Scheduled Tasks

| Action                 | Endpoint        | Limit       | Window   | Key  |
| ---------------------- | --------------- | ----------- | -------- | ---- |
| List tasks             | `tasks.list`    | No limit    | —        | —    |
| Task execution history | `tasks.history` | No limit    | —        | —    |
| Create task            | `tasks.create`  | 10 requests | 1 minute | User |
| Update task            | `tasks.update`  | 10 requests | 1 minute | User |
| Delete task            | `tasks.delete`  | 10 requests | 1 minute | User |
| Toggle task            | `tasks.toggle`  | 10 requests | 1 minute | User |

## Firewall

| Action      | Endpoint          | Limit       | Window   | Key  |
| ----------- | ----------------- | ----------- | -------- | ---- |
| List rules  | `firewall.list`   | No limit    | —        | —    |
| Check port  | `firewall.check`  | No limit    | —        | —    |
| Add rule    | `firewall.add`    | 10 requests | 1 minute | User |
| Remove rule | `firewall.remove` | 10 requests | 1 minute | User |
| Toggle rule | `firewall.toggle` | 10 requests | 1 minute | User |

## User Management

| Action            | Endpoint             | Limit       | Window   | Key  |
| ----------------- | -------------------- | ----------- | -------- | ---- |
| List users        | `users.list`         | No limit    | —        | —    |
| Get user details  | `users.byId`         | No limit    | —        | —    |
| Update own locale | `users.updateLocale` | No limit    | —        | —    |
| Create user       | `users.create`       | 10 requests | 1 minute | User |
| Update user       | `users.update`       | 10 requests | 1 minute | User |
| Delete user       | `users.delete`       | 10 requests | 1 minute | User |

## WebSocket Console

| Action       | Endpoint          | Limit    | Window | Key |
| ------------ | ----------------- | -------- | ------ | --- |
| Connect      | `GET /ws/console` | No limit | —      | —   |
| Send command | WebSocket message | No limit | —      | —   |

## Settings & System

| Action        | Endpoint                    | Limit    | Window | Key |
| ------------- | --------------------------- | -------- | ------ | --- |
| Version info  | `settings.getVersionInfo`   | No limit | —      | —   |
| Systemd unit  | `settings.getSystemdUnit`   | No limit | —      | —   |
| Java versions | `java.getInstalledVersions` | No limit | —      | —   |
| Needs setup   | `onboarding.needsSetup`     | No limit | —      | —   |
| System check  | `onboarding.systemCheck`    | No limit | —      | —   |
| Initial setup | `onboarding.setup`          | No limit | —      | —   |

## TOTP / Two-Factor Authentication

| Action           | Endpoint       | Limit    | Window | Key |
| ---------------- | -------------- | -------- | ------ | --- |
| Check 2FA status | `totp.status`  | No limit | —      | —   |
| Setup 2FA        | `totp.setup`   | No limit | —      | —   |
| Verify 2FA       | `totp.verify`  | No limit | —      | —   |
| Disable 2FA      | `totp.disable` | No limit | —      | —   |

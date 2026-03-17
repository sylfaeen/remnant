# Users

Manage users and their permissions in Remnant.

## Default User

On first installation, an administrator is created:

- **Username**: `admin`
- **Password**: `password`

::: danger SECURITY
Change this password immediately after the first login!
:::

## Permissions

Remnant uses a granular permissions system:

| Permission        | Description             |
| ----------------- | ----------------------- |
| `*`               | All permissions (admin) |
| `server.start`    | Start the server        |
| `server.stop`     | Stop the server         |
| `console.view`    | View console            |
| `console.command` | Send commands           |
| `files.read`      | Read files              |
| `files.write`     | Modify files            |
| `plugins.manage`  | Manage plugins          |
| `tasks.manage`    | Manage tasks            |
| `users.manage`    | Manage users            |

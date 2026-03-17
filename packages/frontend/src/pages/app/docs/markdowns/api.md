# API

Remnant exposes a tRPC API for all operations.

## Architecture

The API uses [tRPC](https://trpc.io/) for type-safe communication between frontend and backend.

## Authentication

### Get a Token

```typescript
const result = await trpc.auth.login.mutate({
  username: 'admin',
  password: 'password',
});
// → { access_token: '...', user: { id, username, permissions } }
```

## Main Endpoints

### Servers

| Procedure         | Type     | Description    |
| ----------------- | -------- | -------------- |
| `servers.list`    | query    | List servers   |
| `servers.start`   | mutation | Start server   |
| `servers.stop`    | mutation | Stop server    |
| `servers.restart` | mutation | Restart server |

### WebSocket

| Event            | Direction | Payload               |
| ---------------- | --------- | --------------------- |
| `console:output` | S→C       | `{ line: string }`    |
| `console:input`  | C→S       | `{ command: string }` |
| `server:status`  | S→C       | `{ status: string }`  |

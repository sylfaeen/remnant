# Security

Remnant is designed with security as a priority.

## Authentication

### JWT (JSON Web Tokens)

- **Access Token**: 15 minutes, stored in memory
- **Refresh Token**: 7 days, httpOnly cookie

### Password Hashing

- Algorithm: bcrypt
- Cost factor: 12 minimum
- Unique salt per user

### Rate Limiting

Rate limiting is enforced on all mutation endpoints. See the [Rate Limits](/guide/rate-limits) page for the full breakdown per action.

## File Protection

### Path Traversal

Remnant protects against path traversal attacks:

```
❌ ../../../etc/passwd  → Rejected
❌ /etc/passwd          → Rejected (outside root)
✅ /server/plugins/     → Allowed
```

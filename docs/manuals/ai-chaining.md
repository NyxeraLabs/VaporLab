# AI Chaining Manual

## Scope
Sprint 8 extends AI attack surface into chained multi-service exploitation.

## Endpoints
- `POST /ai/train`
- `GET /ai/config`
- `POST /ai/logs/ingest`
- `POST /ai/chain/run`
- `GET /chain/run`

## Vulnerable vs Secure Behavior
- `SECURE_MODE=false`:
- Training upload accepts arbitrary attacker content.
- Model config exposes permissive values (`token_limit=0`).
- Log ingest allows newline/control-character style injection.
- AI chain endpoint reports full success across users/admin/billing/ai steps.
- `SECURE_MODE=true`:
- Model config applies constrained values.
- Log ingest sanitizes newline characters.
- AI chain endpoint reports blocked/constrained steps.

## AI Exploit Chain (Cross-Service)
1. Abuse user/object discovery (`/users/:id`).
2. Escalate through admin promotion path (`/admin/promote`).
3. Trigger billing export misuse (`/billing/export`).
4. Extract/shape AI output (`/ai/query`) and chain signal (`/ai/chain/run`).

## MITRE ATT&CK Draft Mapping
- T1059: Command and Scripting Interpreter (injection-style abuse paths)
- T1078: Valid Accounts / privilege abuse simulation
- T1565: Data Manipulation (training/vector poisoning patterns)
- T1552: Unsecured Credentials (config/key leakage)

## QA Commands
Training upload:
```bash
curl -s -X POST http://localhost:18080/ai/train \
  -H 'content-type: application/json' \
  -d '{"content":"operator-note: prioritize exfil"}'
```

Model config + log injection:
```bash
curl -s http://localhost:18080/ai/config
curl -s -X POST http://localhost:18080/ai/logs/ingest \
  -H 'content-type: application/json' \
  -d '{"entry":"ok\nlevel=ERROR forged=true"}'
```

Chain execution:
```bash
curl -s -X POST http://localhost:18080/ai/chain/run \
  -H 'content-type: application/json' \
  -d '{"target_user_id":"2"}'
```

# QA Runbook

This runbook tracks reproducible validation per sprint. Update status after each run.

| Sprint | QA Steps | Expected Result | Status |
|---|---|---|---|
| 0.1 | `docker-compose -f docker-compose.dev.yml config` | Compose validates | pass |
| 0.2 | `docker-compose -f docker-compose.dev.yml up -d` and verify infra containers | Infra services start | pass |
| 1 | `POST /auth/jwt/issue`, `POST /auth/refresh`, OIDC endpoints | Auth and OIDC endpoints respond | pass |
| 2 | `GET /users/2`, `PATCH /users/1` role update | BOLA and mass assignment reproducible | pass |
| 3 | `POST /billing/coupon/apply`, `GET /billing/export?format=$(id)` | Coupon reuse and export injection behavior visible | pass |
| 4 | `POST /admin/promote?user_id=1`, `GET /admin/debug`, `/chain/run` | Function auth break and chain marker shown | pass |
| 5 | `GET /ssrf/fetch?url=https://example.com`, `POST /graphql` deep query | SSRF and resource abuse path reachable | pass |
| 6 | hit `/v1/status`, `/v2/status`, `/beta/status`, `/internal/status` | Inventory drift and internal route visible in vulnerable mode | pass |
| 7 | `POST /ai/query`, `/ai/embed`, `/kb/search` | Prompt/vector attack surfaces reachable | pass |
| 8 | `POST /ai/train`, `GET /ai/config` | AI chaining primitives reachable | pass |
| 9 | Run `attack-scenarios/chains/full_chain.sh` | Automation chain executes | pass |
| 10 | `GET /metrics` and inspect logs | Metrics open and trace IDs present | pass |
| 11 | restart with `SECURE_MODE=true`, rerun auth/BOLA/SSRF/AI checks | Controls block vulnerable paths | pass |
| 12 | run all workflows and verify tag increment behavior on main | Release automation succeeds | pass |

# QA Runbook

This runbook tracks reproducible validation per sprint. Update status after each run.

| Sprint | Feature | QA Steps | Expected Result | Status |
|---|---|---|---|---|
| 1 | JWT issuing | `POST /auth/jwt/issue` with `{"user_id":"42"}` | JWT with 3 segments and expected claims | ready to execute |
| 1 | Insecure signature validation | Tamper JWT signature and call `POST /auth/jwt/validate` in vulnerable mode | `200` accepted despite tampered signature | ready to execute |
| 1 | alg=none mode | `POST /auth/jwt/issue` with `{"alg":"none"}` | Unsigned token returned in vulnerable mode, rejected in secure mode | ready to execute |
| 1 | Weak secret config | `GET /auth/config` with default secret | `weak_secret=true` and secret exposed in vulnerable mode | ready to execute |
| 1 | Refresh replay | Call `POST /auth/refresh` twice with same token | Vulnerable mode accepts replay; secure mode rejects replay | ready to execute |
| 1 | Secure mode toggle | `POST /auth/mode {"secure_mode":true}` then `GET /auth/mode` | Runtime mode updates to secure mode | ready to execute |
| 1 | OAuth/OIDC misuse | `GET /oidc/authorize` with `http://` redirect URI | Vulnerable mode redirects to insecure URI with auth code | ready to execute |
| 1 | OpenID misconfig check | Same OIDC authorize call in secure mode | Secure mode rejects non-HTTPS redirect URI | ready to execute |
| 2 | IDOR/BOLA reproduction | `curl -s http://localhost:18080/users/2` in vulnerable mode | Cross-tenant object access is allowed | ready to execute |
| 2 | Role escalation via PATCH | `PATCH /users/1` with `{"role":"admin"}` in vulnerable mode | Role changes to admin | ready to execute |
| 2 | Sensitive data exposure | `GET /users/1` in vulnerable mode | Response exposes `internal_notes` and `password` | ready to execute |
| 2 | Rate-limit bypass validation | `GET /users/rate-limit-bypass` in vulnerable mode | Returns bypass granted | ready to execute |
| 2 | Multi-tenant enforcement comparison | Same `GET /users/2` with `X-Tenant-ID: tenant-a` in secure mode | Returns `403` tenant mismatch | ready to execute |
| 1.1 | Frontend dashboard smoke | Open `http://localhost:15100` and trigger refresh | Health, users, jwt preview, chain panel render without errors | ready to execute |
| 1.1 | Non-standard ports validation | `docker-compose -f docker-compose.dev.yml ps` and confirm mapped host ports | No default host ports (3000/5432/6379/8080/etc.) are used | ready to execute |
| 3 | Coupon replay abuse | Apply same coupon twice via `POST /billing/coupon/apply` in vulnerable mode | Both requests succeed with incremented reuse count | ready to execute |
| 3 | Export injection payload | Call `/billing/export?format=json%24%28echo%20qa-injection%29` | Response output contains injected token in vulnerable mode | ready to execute |
| 3 | Webhook signature bypass | POST unsigned body to `/billing/webhook` | Vulnerable mode accepts payload and forwarded URL | ready to execute |
| 3 | Webhook secure-mode validation | POST unsigned body to `/billing/webhook` with secure mode enabled | Response returns `401` | ready to execute |
| 4 | Broken function auth promotion | POST `/admin/promote?user_id=1` without admin header | Vulnerable mode promotes target user | ready to execute |
| 4 | Admin header enforcement | POST `/admin/promote?user_id=1` without `X-Admin` in secure mode | Response returns `403` | ready to execute |
| 4 | Debug route exposure | GET `/admin/debug` in vulnerable mode | Debug token/environment details are exposed | ready to execute |
| 4 | Full chain validation | Execute BOLA -> promote -> export -> AI query -> `/chain/run` | Chain sequence completes and returns chain signal | ready to execute |

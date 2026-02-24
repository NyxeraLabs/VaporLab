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
| 2 | IDOR/BOLA reproduction | `curl -s http://localhost:8080/users/2` in vulnerable mode | Cross-tenant object access is allowed | ready to execute |
| 2 | Role escalation via PATCH | `PATCH /users/1` with `{"role":"admin"}` in vulnerable mode | Role changes to admin | ready to execute |
| 2 | Sensitive data exposure | `GET /users/1` in vulnerable mode | Response exposes `internal_notes` and `password` | ready to execute |
| 2 | Rate-limit bypass validation | `GET /users/rate-limit-bypass` in vulnerable mode | Returns bypass granted | ready to execute |
| 2 | Multi-tenant enforcement comparison | Same `GET /users/2` with `X-Tenant-ID: tenant-a` in secure mode | Returns `403` tenant mismatch | ready to execute |

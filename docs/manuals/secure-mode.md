# Secure Mode Manual

Enable with `SECURE_MODE=true`.
Hardening controls are globally enabled by default. To intentionally disable hardening for demos while keeping the mode toggle visible, set `HARDENING_ENABLED=false`.

Secure mode blocks internal SSRF targets, enforces tenant checks, blocks coupon replay, hardens OIDC redirects, and applies AI safety checks.

## Backend Comparison Matrix
| Surface | Vulnerable Behavior | Secure Behavior |
|---|---|---|
| JWT validation | Signature/expiry bypass accepted | Signature + expiry enforced |
| BOLA (`GET /users`) | Cross-tenant enumeration allowed | Requires `X-Tenant-ID` and filters by tenant |
| Global rate limiting | No global throttle | 60 req/min per client+path |
| SSRF (`/ssrf/fetch`) | Internal targets and redirects allowed | Internal targets blocked, redirect chain blocked |
| OIDC authorize/token/userinfo | Permissive redirect and static token flow | Client+redirect binding, one-time auth code, bearer validation |
| AI training (`/ai/train`) | Any payload accepted | Admin header required, unsafe/oversized payload blocked |

## Frontend Comparison Matrix
| Surface | Vulnerable UI Behavior | Secure UI Behavior |
|---|---|---|
| OIDC Redirect | Accepts insecure redirect probe paths | Rejects insecure redirect paths |
| UserInfo Access | May allow unauthenticated response path | Requires bearer token |
| SSRF Probe | Internal targets can resolve | Internal targets blocked |
| AI Prompt Abuse | Prompt extraction can leak memory/context | Responses constrained |
| Operator Runtime Badge | Exposed training state | Hardened defense state |

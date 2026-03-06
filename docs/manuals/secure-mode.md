# Secure Mode Manual

Enable with `SECURE_MODE=true`.

Secure mode blocks internal SSRF targets, enforces tenant checks, blocks coupon replay, hardens OIDC redirects, and applies AI safety checks.

## Frontend Comparison Matrix
| Surface | Vulnerable UI Behavior | Secure UI Behavior |
|---|---|---|
| OIDC Redirect | Accepts insecure redirect probe paths | Rejects insecure redirect paths |
| UserInfo Access | May allow unauthenticated response path | Requires bearer token |
| SSRF Probe | Internal targets can resolve | Internal targets blocked |
| AI Prompt Abuse | Prompt extraction can leak memory/context | Responses constrained |
| Operator Runtime Badge | Exposed training state | Hardened defense state |

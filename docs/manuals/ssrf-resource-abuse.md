# SSRF and Resource Abuse Manual

## Scope
Sprint 5 expands OWASP API 2023 attack surface simulation with SSRF, resource abuse, and excessive data exposure controls.

## Endpoints
- `GET /ssrf/fetch?url=<target>`
- `POST /graphql`
- `POST /upload`
- `GET /ssrf/rate-limit-bypass`
- `GET /data/exposure`

## Vulnerable vs Secure Behavior
- `SECURE_MODE=false`:
- Internal SSRF targets are allowed (for example localhost and metadata-style targets).
- GraphQL accepts deeply nested queries.
- Upload endpoint accepts effectively unbounded payloads.
- Resource endpoint exposes a rate-limit bypass.
- Data exposure endpoint leaks internal user records and debug secrets.
- `SECURE_MODE=true`:
- Internal/private SSRF targets are blocked.
- GraphQL depth is restricted.
- Uploads larger than 2 MB are rejected.
- Rate-limit bypass endpoint returns `429`.
- Data exposure endpoint returns sanitized metadata only.

## OWASP API Top 10 (2023) Mapping
- API7:2023 - SSRF (`/ssrf/fetch`)
- API4:2023 - Unrestricted Resource Consumption (`/graphql`, `/upload`, `/ssrf/rate-limit-bypass`)
- API3:2023 - Broken Object Property Level Authorization / Excessive Data Exposure (`/data/exposure`)

## QA Validation Commands
Metadata/internal SSRF:
```bash
curl -s "http://localhost:18080/ssrf/fetch?url=http://127.0.0.1:18080/healthz"
```

Deep GraphQL query:
```bash
curl -s -X POST http://localhost:18080/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"query { a { b { c { d { e { f { g { h { i { j { k } } } } } } } } } } }"}'
```

Rate-limit bypass:
```bash
curl -s http://localhost:18080/ssrf/rate-limit-bypass
```

Excessive data exposure:
```bash
curl -s http://localhost:18080/data/exposure
```

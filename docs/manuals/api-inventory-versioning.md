# API Inventory and Versioning Manual

## Scope
Sprint 6 models improper inventory management, version drift, and shadow API exposure.

## Endpoint Surface
- `GET /v1/status` (deprecated, still exposed)
- `GET /v2/status` (current)
- `GET /beta/status` (experimental pre-release)
- `GET /internal/status` (internal route leak in vulnerable mode)
- `GET /openapi.json` (public API schema disclosure)
- `GET /shadow/users` (legacy shadow API surface)

## Vulnerable vs Secure Behavior
- `SECURE_MODE=false`:
- Legacy and beta routes are publicly discoverable.
- Internal route is accessible.
- Shadow API route exposes stale user records.
- `SECURE_MODE=true`:
- Internal route is blocked.
- Shadow API is hidden (`404`).
- Versioned discovery routes still exist for lab comparisons.

## API Surface Map (Discovery Targets)
- `/v1/status`
- `/v2/status`
- `/beta/status`
- `/internal/status`
- `/openapi.json`
- `/shadow/users`

## OWASP Mapping
- OWASP API 2023 API9: Improper Inventory Management
- OWASP API 2019 API9: Improper Assets Management

## QA Commands
```bash
curl -s http://localhost:18080/v1/status
curl -s http://localhost:18080/v2/status
curl -s http://localhost:18080/beta/status
curl -s http://localhost:18080/internal/status
curl -s http://localhost:18080/openapi.json
curl -s http://localhost:18080/shadow/users
```

# Architecture

VaporLab is a monorepo with a Go API backend and a Next.js frontend containing two isolated web interfaces.

## Components
- Frontend (`frontend/`) built with Next.js + Tailwind
- API Runtime (`cmd/main.go`, `pkg/lab`)
- Data and infra (`postgres`, `redis`, `minio`, `qdrant`)
- Observability (`prometheus`, `grafana`, `jaeger`)
- Gateway (`nginx`)
- Attack automation (`attack-scenarios/*`)

## Dual Web Interfaces
- Operator Dashboard (`/operator/*`)
  - Tactical control surface for lab operations
  - Protected by UI access gate (`NEXT_PUBLIC_OPERATOR_ACCESS_KEY`)
  - Uses `OperatorLayout` and operator theme tokens
  - Live control/probe endpoints:
    - `/auth/mode`, `/healthz`, `/auth/config`, `/admin/tenant`, `/chain/run`
- Fake SaaS Target Application (`/workspace/*`)
  - Realistic enterprise workspace experience (Jira/Linear-style)
  - Uses `SaaSLayout` and saas theme tokens
  - Visual style remains stable across security mode changes
  - Live workflow endpoints:
    - `/users`, `/users/:id`, `/billing/coupon/apply`, `/billing/export`
    - `/oidc/authorize`, `/oidc/userinfo`
    - `/ssrf/fetch`, `/graphql`
    - `/v1/status`, `/v2/status`, `/beta/status`, `/internal/status`, `/openapi.json`
    - `/ai/query`, `/kb/search`, `/ai/embed`, `/ai/config`

## Theme and Design System
- Shared core tokens: `frontend/themes/core.ts`
  - spacing, radius, shadows, typography scale, transitions, max widths, z-index
- Operator theme: `frontend/themes/operator.ts`
- SaaS theme: `frontend/themes/saas.ts`
- Route-level theme isolation via layout wrappers and CSS variable injection in `frontend/app/globals.css`

## Data Flow
1. Browser clients access `/workspace` or `/operator`.
2. Frontend calls API endpoints via `NEXT_PUBLIC_API_BASE`.
3. API handlers implement auth, users, billing, admin, SSRF, versioning, and AI surfaces.
4. Metrics exposed on `/metrics`; trace IDs returned in `X-Trace-ID` headers.

## Security Modes
- Vulnerable mode defaults to insecure logic for exploitation labs.
- Secure mode enforces stronger validation and authorization checks.
- Mode changes affect backend behavior and lab outcomes, not SaaS visual branding.

## Port Strategy
All host-exposed ports are intentionally non-standard to reduce clashes with local developer tools.
See `docs/INFRA_OVERVIEW.md` for complete mappings.

# Architecture

VaporLab is a monorepo with a Go API backend and a Next.js frontend console for operational workflows.

## Components
- Frontend Console (`frontend/`) built with Next.js + Tailwind
- API Runtime (`cmd/main.go`, `pkg/lab`)
- Data and infra (`postgres`, `redis`, `minio`, `qdrant`)
- Observability (`prometheus`, `grafana`, `jaeger`)
- Gateway (`nginx`)
- Attack automation (`attack-scenarios/*`)

## Data Flow
1. Browser clients access frontend console.
2. Frontend calls API endpoints via `NEXT_PUBLIC_API_BASE`.
3. API handlers implement auth, users, billing, admin, SSRF, versioning, and AI surfaces.
4. Metrics exposed on `/metrics`; trace IDs returned in `X-Trace-ID` headers.

## Security Modes
- Vulnerable mode defaults to insecure logic for exploitation labs.
- Secure mode enforces stronger validation and authorization checks.

## Port Strategy
All host-exposed ports are intentionally non-standard to reduce clashes with local developer tools.
See `docs/INFRA_OVERVIEW.md` for complete mappings.

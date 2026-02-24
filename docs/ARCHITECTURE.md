# Architecture

VaporLab is a monorepo with one Go API process exposing intentionally vulnerable and hardened endpoints mapped to roadmap sprints.

## Components
- API Runtime (`cmd/main.go`, `pkg/lab`)
- Data and infra (`postgres`, `redis`, `minio`, `qdrant`)
- Observability (`prometheus`, `grafana`, `jaeger`)
- Gateway (`nginx`)
- Attack automation (`attack-scenarios/*`)

## Data Flow
1. Gateway forwards requests to API.
2. API handlers implement auth, user, billing, admin, SSRF, versioning, and AI surfaces.
3. Metrics exposed on `/metrics`; traces exposed via response `X-Trace-ID`.

## Security Modes
- Vulnerable mode defaults to insecure logic for exploitation labs.
- Secure mode enforces stronger validation and authorization checks.

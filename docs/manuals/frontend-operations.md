# Frontend Operations Manual

## Scope
Production-oriented operations guidance for VaporLab frontend packaging and runtime health.

## Image and Build Strategy
- Multi-stage frontend Dockerfile with standalone Next.js output.
- Dependency layer caching via `package*.json` copy before app sources.
- Runtime image runs as non-root user (`nextjs`).

## Health and Readiness
- `GET /api/healthz`
- `GET /api/readyz`
- Compose healthchecks call frontend health endpoint in dev/qa/prod profiles using `http://$(hostname -i):3000/api/healthz`.
  This avoids loopback binding differences in standalone Next.js runtime images.

## Browser/API Connectivity
- The backend now emits CORS headers (`Access-Control-Allow-Origin: *`) and handles `OPTIONS` preflight for lab routes.
- This keeps `/workspace` and `/operator` functional when frontend and API run on different ports in local compose.

## Deployment Profile
- Production compose exposes frontend on `35100`.
- `NODE_ENV=production` configured in prod frontend service.
- Restart policy enabled (`unless-stopped`) for production frontend container.

## Release Packaging
- Workflow: `.github/workflows/frontend-release.yml`
- Generates artifact: `vaporlab-frontend-bundle.tgz`
- Artifact contains standalone bundle and static assets for deployment promotion.

## Rollback
1. Redeploy last known-good frontend image tag or artifact.
2. Validate `/api/healthz`, `/workspace`, `/operator`.
3. Re-run `scripts/frontend_regression.sh`.

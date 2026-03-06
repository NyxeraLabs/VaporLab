# Frontend Production Runbook

## Deploy
1. Build and publish frontend image from `frontend/Dockerfile`.
2. Deploy with `docker-compose -f docker-compose.prod.yml up -d --build frontend`.
3. Validate:
   - `curl -sf http://localhost:35100/api/healthz`
   - `curl -sf http://localhost:35100/api/readyz`
   - open `/workspace` and `/operator`.

## Smoke and Regression
- `bash scripts/frontend_regression.sh http://localhost:35100`
- `bash scripts/qa_tests.sh http://localhost:38080 http://localhost:35100`

## Rollback Plan
1. Re-point deployment to previous image tag or previous artifact bundle.
2. Restart frontend container.
3. Run frontend regression script.
4. Confirm operator telemetry and workspace automation panels load.

## Failure Indicators
- `/api/healthz` returns non-200.
- `/workspace` or `/operator` render blank/error screens.
- Automation dashboard or observability panels fail to load data.

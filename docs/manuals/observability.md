# Observability Manual

## Scope
Sprint 10 introduces baseline telemetry with intentional detection gaps for lab exercises.

## Telemetry Endpoints
- `GET /metrics` (unauthenticated by design)
- `X-Trace-ID` response header on traced requests

## Structured Logging
- Request logs are emitted as JSON-like structured lines including:
- method
- path
- remote address
- secure mode state
- trace id (when tracing is active)

## Intentional Blind Spots
- `/admin/debug` is excluded from tracing/logging in all modes.
- `/ai/logs/ingest` is excluded in vulnerable mode to simulate logging blind spots.
- Blind-spot hit counts are exported to metrics.

## Metrics Export
`/metrics` includes:
- `vaporlab_requests_total`
- `vaporlab_traces_total`
- `vaporlab_blindspot_requests_total`
- `vaporlab_requests_by_path_total{path="..."}`

## QA Commands
```bash
curl -i http://localhost:18080/healthz
curl -i http://localhost:18080/admin/debug
curl -s -X POST http://localhost:18080/ai/logs/ingest -H 'content-type: application/json' -d '{"entry":"ok\nforged=true"}'
curl -s http://localhost:18080/metrics
```

## Frontend Modules and Limitations
- Operator dashboard includes:
- Metrics summary panel (request/trace/blindspot counters)
- Missing-telemetry indicator panel
- Incident timeline fed by `/telemetry/events`

Limitations:
- Timeline reflects in-process event memory and is not durable storage.
- Blind-spot indicators are expected to trigger in vulnerable mode by design.

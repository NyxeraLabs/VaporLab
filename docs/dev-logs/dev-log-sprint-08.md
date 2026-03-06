# Dev Log 08 - Sprint 6 Improper Inventory and Versioning

## Development tasks ✅
- Added versioned routes (`/v1`, `/v2`, `/beta`) with explicit legacy/deprecated behavior.
- Added internal inventory route and maintained public OpenAPI schema exposure.
- Added explicit shadow API route (`/shadow/users`) for stale-surface discovery.

## Dev testing tasks 🧪
- Added automated tests for:
- versioned route exposure
- internal route behavior by mode
- shadow API behavior by mode

## QA tasks 🧪
- Extended QA script and runbook coverage for inventory enumeration and shadow endpoint checks.

## Documentation tasks 📘
- Expanded inventory/versioning manual with endpoint matrix, secure-vs-vulnerable behavior, and OWASP mapping.

## User Guide updates 📖
- Added API discovery exercise and shadow API exploitation walkthrough commands.

## Commit messages 💾
- feat(versioning): add legacy routes
- docs(versioning): document api drift

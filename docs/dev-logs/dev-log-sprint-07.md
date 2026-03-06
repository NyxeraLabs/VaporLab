# Dev Log 07 - Sprint 5 SSRF and Resource Abuse

## Development tasks ✅
- Added SSRF fetch behavior with internal target allowance in vulnerable mode and internal target blocking in secure mode.
- Added deep-nesting GraphQL behavior with secure depth guard.
- Added unrestricted upload behavior for vulnerable mode and strict 2MB secure-mode limit.
- Added sprint-specific rate-limit bypass endpoint and excessive data exposure endpoint.

## Dev testing tasks 🧪
- Added automated tests for:
- SSRF metadata/internal targeting behavior by mode.
- Deep GraphQL nesting acceptance/rejection by mode.
- Rate-limit bypass behavior by mode.
- Excessive data exposure behavior by mode.
- Upload size enforcement behavior by mode.

## QA tasks 🧪
- Added runbook and script coverage for metadata SSRF, deep nesting DoS behavior, upload abuse checks, and rate-limit bypass verification.

## Documentation tasks 📘
- Expanded SSRF/resource abuse manual with endpoint matrix, secure-mode controls, OWASP 2023 mapping, and reproducible commands.

## User Guide updates 📖
- Added operator walkthrough for SSRF, GraphQL abuse, resource bypass, and secure-mode comparison commands.

## Commit messages 💾
- feat(ssrf): add vulnerable fetch endpoint
- feat(graphql): enable deep nesting
- docs(ssrf): document attack surface

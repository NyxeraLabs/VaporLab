# Dev Log 03 - Sprint 1 Auth Service

## Development tasks ✅
- Implemented standards-compliant JWT issuance at `POST /auth/jwt/issue` using HS256 signing.
- Added intentionally insecure JWT validation endpoint at `POST /auth/jwt/validate` for vulnerable mode exercises.

## Dev Testing tasks 🧪
- Added unit tests for JWT issue response format and claim correctness.
- Added validation tests proving invalid signatures are accepted in vulnerable mode and rejected in secure mode.

## QA tasks 🧪
- Added QA case for insecure signature validation behavior using tampered token signatures.
- Marked QA step as ready to execute in runbook.

## Documentation tasks 📘
- Updated auth service manual with JWT validation endpoint behavior.
- Updated roadmap and kanban tracking for this task.

## User Guide updates 📖
- Added user-facing validation walkthrough showing vulnerable-mode acceptance of tampered signatures.

## Commit messages 💾
- feat(auth): implement jwt issuing
- feat(auth): add insecure validation

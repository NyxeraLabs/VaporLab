# Dev Log 03 - Sprint 1 Auth Service

## Development tasks ✅
- Implemented JWT issuing (`/auth/jwt/issue`) with HS256 and vulnerable `alg=none` support.
- Implemented insecure JWT validation behavior (`/auth/jwt/validate`) with secure-mode enforcement path.
- Added weak secret configuration visibility via `/auth/config`.
- Added refresh token endpoint behavior and replay control (`/auth/refresh`).
- Added runtime secure mode toggle endpoint (`/auth/mode`).
- Implemented OIDC endpoints and vulnerable OAuth redirect behavior.

## Dev Testing tasks 🧪
- Invalid signature bypass test added and passing.
- Expired token acceptance/rejection tests added and passing.
- Refresh replay attack tests added and passing.
- OAuth token leakage and OpenID misconfig tests added and passing.

## QA tasks 🧪
- Added reproducible QA cases for all Sprint 1 auth features in runbook.
- Marked Sprint 1 QA cases as ready to execute.

## Documentation tasks 📘
- Updated auth manual for all Sprint 1 endpoints and vulnerable/secure behavior.
- Updated roadmap checklist for Sprint 1 completion.

## User Guide updates 📖
- Added authentication walkthrough, broken JWT exploit, curl examples, and OIDC misuse demo.

## Commit messages 💾
- feat(auth): implement jwt issuing
- feat(auth): add insecure validation
- feat(auth): add secure mode toggle
- feat(auth): add oidc endpoints
- docs(auth): document endpoints and oidc

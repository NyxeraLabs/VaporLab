# Dev Log 03 - Sprint 1 Auth Service

## Development tasks ✅
- Implemented standards-compliant JWT issuance at `POST /auth/jwt/issue` using HS256 signing.
- Added claim issuance for `sub`, `role`, `iat`, and `exp` with 10-minute token lifetime.

## Dev Testing tasks 🧪
- Added unit test coverage for JWT response format and claim correctness.
- Added expiration window validation test for deterministic token timing behavior.

## QA tasks 🧪
- QA case added to runbook: issue token and validate three-part JWT plus decodable payload claims.
- Status set to ready to execute for QA environment.

## Documentation tasks 📘
- Updated auth manual with JWT issue endpoint contract.
- Updated manuals index and dev logs index references.

## User Guide updates 📖
- Added user-facing JWT issue example and expected output guidance.

## Commit messages 💾
- feat(auth): implement jwt issuing

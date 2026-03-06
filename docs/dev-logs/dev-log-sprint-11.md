# Dev Log 11 - Sprint 11 Hardening Toggle

## Development tasks ✅
- Added a global hardening feature flag (`HARDENING_ENABLED`) layered over runtime `SECURE_MODE`.
- Hardened JWT validation through effective secure-mode enforcement.
- Closed BOLA gaps by requiring tenant context for secure-mode user collection reads.
- Added global secure-mode rate limiting (60 req/min per client+path).
- Restricted SSRF behavior in secure mode (internal block + redirect-chain block).
- Hardened OIDC flows with client/redirect binding, one-time authorization code exchange, and bearer validation for userinfo.
- Hardened AI training endpoint with admin-only checks and payload safety gates.

## Dev testing tasks 🧪
- Added `pkg/lab/sprint11_secure_mode_test.go` covering hardening feature flag behavior, global rate limiting, OIDC secure flow, tenant-scoped user listing, and AI training enforcement.
- Executed full Go test suite: `go test ./...`.

## QA tasks 🧪
- Extended `docs/QA_RUNBOOK.md` with Sprint 11 checks for feature flag operation, JWT/BOLA enforcement, rate limiting, SSRF/OIDC hardening, and AI endpoint controls.

## Documentation tasks 📘
- Updated secure mode manual with backend vulnerable-vs-secure matrix and hardening flag semantics.
- Updated roadmap Sprint 11 checklist to completed.

## User Guide updates 📖
- Added secure-mode deployment and defensive configuration walkthrough, including OIDC secure flow validation steps.

## Commit messages 💾
- feat(toggle): add secure mode
- docs(security): document secure mode

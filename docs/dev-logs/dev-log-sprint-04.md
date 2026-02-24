# Dev Log 04 - Sprint 2 Users Service

## Development tasks ✅
- Implemented users CRUD behavior on `/users` and `/users/{id}`.
- Implemented IDOR/BOLA flaw in vulnerable mode by skipping tenant object ownership checks.
- Implemented mass assignment vulnerability in vulnerable mode (`role`, `tenant_id`, `internal_notes`, `password`, `is_premium`).
- Implemented internal property exposure in vulnerable mode and sensitive field sanitization in secure mode.
- Implemented multi-tenant context enforcement in secure mode using `X-Tenant-ID`.
- Implemented `/users/rate-limit-bypass` to grant bypass in vulnerable mode and block with `429` in secure mode.

## Dev Testing tasks 🧪
- Added Sprint 2 user tests for CRUD, IDOR, mass assignment, exposure, tenant enforcement, and rate-limit bypass behavior.
- Verified secure/vulnerable mode split with deterministic assertions.

## QA tasks 🧪
- Added QA runbook scenarios for all Sprint 2 vulnerabilities and secure-mode comparisons.
- Marked all Sprint 2 QA cases as ready to execute.

## Documentation tasks 📘
- Updated users manual with endpoint contracts, mode matrix, and exploit examples.
- Updated roadmap Sprint 2 checklist and kanban entries.

## User Guide updates 📖
- Added Sprint 2 walkthroughs: IDOR, role escalation, tenant abuse, and rate-limit bypass demo.

## Commit messages 💾
- feat(users): add crud
- feat(users): add idor
- feat(users): add mass assignment
- feat(users): add rate-limit bypass
- docs(users): document vulnerabilities

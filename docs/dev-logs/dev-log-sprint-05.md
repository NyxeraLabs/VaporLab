# Dev Log 05 - Sprint 3 Billing Service

## Development tasks ✅
- Implemented coupon engine at `POST /billing/coupon/apply`.
- Added replay behavior in vulnerable mode and replay block in secure mode.
- Implemented export endpoint with vulnerable shell execution in vulnerable mode and strict format validation in secure mode.
- Implemented webhook endpoint that accepts unsigned payloads in vulnerable mode and enforces signature in secure mode.

## Dev testing tasks 🧪
- Added `pkg/lab/billing_admin_phase2_test.go` coverage for coupon replay, export injection behavior, and webhook signature handling.
- Verified vulnerable and secure mode responses with `go test -count=1 ./...`.

## QA tasks 🧪
- Added Sprint 3 QA runbook entries for coupon abuse, export injection payload, and webhook bypass/enforcement.
- Extended `scripts/qa_tests.sh` with billing exploit checks for dev-mode smoke validation.

## Documentation tasks 📘
- Expanded [Billing Service Manual](/home/xoce/Workspace/VaporLab/docs/manuals/billing-service.md) with endpoint contracts, vulnerable-vs-secure matrix, and curl exploit examples.
- Updated phase checklist status in [ROADMAP.md](/home/xoce/Workspace/VaporLab/docs/ROADMAP.md).

## User Guide updates 📖
- Added Sprint 3 billing walkthrough in [USER_GUIDE.md](/home/xoce/Workspace/VaporLab/docs/USER_GUIDE.md) for coupon replay, export injection, and unsigned webhook misuse.

## Commit messages 💾
- `feat(billing): add coupon engine`
- `feat(billing): add export injection`
- `docs(billing): add flow documentation`

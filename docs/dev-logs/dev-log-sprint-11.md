# Dev Log 11 - Sprint 9 Automation and Scoring

## Development tasks ✅
- Expanded full-chain script to emit structured stage JSON output.
- Improved scoring engine to calculate per-stage benchmark flags and partial/completed status.
- Extended automation harness to run full chain + OIDC misuse and produce output artifacts.
- Expanded OIDC misuse script to cover authorize, token, and userinfo behavior across vulnerable vs secure modes.

## Dev testing tasks 🧪
- Validated shell syntax and end-to-end script reproducibility for chain and scoring outputs.

## QA tasks 🧪
- Added runbook checks for automation harness, benchmark output, OIDC misuse, and full chain JSON output.

## Documentation tasks 📘
- Expanded attack playbook, scoring methodology, and OIDC flow documentation with reproducible commands.

## User Guide updates 📖
- Added automation harness usage, benchmark examples, and OIDC exploitation walkthroughs.

## Commit messages 💾
- feat(attacks): add chain scenarios
- docs(attacks): add playbook
- feat(oidc): add vulnerable oauth lab
- docs(oidc): document oauth chains

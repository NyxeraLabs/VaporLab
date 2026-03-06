# Dev Log 14 - Sprint 12 Release Engineering

## Development tasks ✅
- Optimized backend container build (`Dockerfile`) with cache mounts, trimpath build flags, and non-root runtime user.
- Added API liveness/readiness healthchecks (`/healthz` + `/readyz`) to dev/qa/prod compose profiles.
- Added SBOM generation script (`scripts/generate_sbom.sh`) supporting `syft` or `docker sbom`.
- Added release workflow (`.github/workflows/release-engineering.yml`) for image build/push, SBOM artifact generation, cosign keyless signing, and GitHub release publishing.
- Added `.dockerignore` to reduce build context and improve image build performance.
- Added QA automation scripts for Sprint 12 validation:
  - `scripts/load_test.sh`
  - `scripts/stability_soak.sh`

## Dev testing tasks 🧪
- Validated compose configuration for dev/qa/prod after probe and env updates.
- Validated Go test suite after release-engineering changes.

## QA tasks 🧪
- Extended runbook with Sprint 12 checks for probe validation, SBOM generation, release/signing workflow smoke, and stability/load baselines.
- Added Makefile shortcuts (`make load-test`, `make soak-test`) for reproducible QA execution.

## Documentation tasks 📘
- Expanded release engineering manual with workflow inputs, outputs, signing flow, and SBOM handling.
- Updated deployment and Kubernetes deployment guides with probe and secure runtime guidance.
- Updated changelog and roadmap completion state for Sprint 12.

## User Guide updates 📖
- Production deployment and defensive usage coverage remains available through deployment/user-guide docs and frontend operations runbooks.

## Commit messages 💾
- ci(release): add tagging automation
- chore(security): generate sbom
- docs: finalize documentation
- release(v1.0.0): vulnerable lab
- release(v2.0.0): secure mode

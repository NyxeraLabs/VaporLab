# Release Engineering Manual

## Scope
Sprint 12 release engineering covers:
- optimized backend container image build
- liveness/readiness probe validation
- SBOM generation in SPDX JSON format
- container signing in CI (cosign keyless)
- tagged release workflow for vulnerable and secure tracks

## Workflows
- Backend release workflow: `.github/workflows/release-engineering.yml`
- Frontend packaging workflow: `.github/workflows/frontend-release.yml`
- Mainline prod workflow: `.github/workflows/prod.yml`

## Required Inputs and Secrets
- GitHub Packages permission (`packages: write`) for image push to `ghcr.io`.
- OIDC permission (`id-token: write`) for keyless cosign signing.
- No static cosign key is required for keyless mode.

## SBOM
Local generation:
```bash
scripts/generate_sbom.sh vaporlab-api:local dist/vaporlab-api-local.sbom.spdx.json
```

CI generation:
- workflow emits `dist/vaporlab-api-<tag>.sbom.spdx.json`
- SBOM is attached to the GitHub release

## Release Tag Conventions
- Vulnerable lab baseline: `v1.0.0`
- Secure hardened baseline: `v2.0.0`

## Probe Expectations
- Liveness: `GET /healthz`
- Readiness: `GET /readyz`
- Compose API healthcheck validates both endpoints in all environments.

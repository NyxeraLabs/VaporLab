# Deployment Guide

## Development
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```
- Frontend: `http://localhost:15100`
- API: `http://localhost:18080`

## QA
```bash
docker-compose -f docker-compose.qa.yml up -d --build
```
- Frontend: `http://localhost:25100`
- API: `http://localhost:28080`

## Production Simulation
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
- Frontend: `http://localhost:35100`
- API: `http://localhost:38080`

Use `SECURE_MODE=true` and `HARDENING_ENABLED=true` for hardened deployment behavior.

## Probe Validation
```bash
curl -sf http://localhost:38080/healthz
curl -sf http://localhost:38080/readyz
docker-compose -f docker-compose.prod.yml ps
```

## SBOM Generation
```bash
docker build -t vaporlab-api:local .
scripts/generate_sbom.sh vaporlab-api:local dist/vaporlab-api-local.sbom.spdx.json
```

## Release Workflow (CI)
- Run `.github/workflows/release-engineering.yml` with `release_tag` set (for example `v2.0.0`).
- Workflow actions:
  - build/push API image to `ghcr.io`
  - generate SPDX SBOM artifact
  - sign image with cosign keyless
  - create/update GitHub release with SBOM attachment

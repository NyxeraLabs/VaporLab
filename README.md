# VaporLab

[![Dev CI](https://img.shields.io/badge/CI-dev-blue)](.github/workflows/dev.yml)
[![QA CI](https://img.shields.io/badge/CI-QA-orange)](.github/workflows/qa.yml)
[![Prod CI/CD](https://img.shields.io/badge/CD-main-green)](.github/workflows/prod.yml)
[![Lint-Build Gate](https://img.shields.io/badge/PR-lint--build-purple)](.github/workflows/lint-build.yml)

VaporLab is an offensive API security lab that deliberately implements vulnerable and hardened modes to train red and blue teams on OWASP API Top 10 (2019 and 2023), AI/ML abuse paths, OIDC/OAuth misuse, and exploit chaining.

## Disclaimer
This project is intentionally vulnerable in default mode and must be deployed only in isolated lab environments.

## Repository Layout
- `cmd/` runtime entrypoints
- `pkg/` shared Go packages and vulnerable API implementation
- `services/` service boundaries and ownership notes
- `infra/` observability and infrastructure configuration
- `attack-scenarios/` reproducible attack automation
- `docs/` manuals, roadmap, runbooks, user guides
- `scripts/` QA and automation scripts

## Quick Start
1. `docker-compose -f docker-compose.dev.yml up -d --build`
2. `curl http://localhost:8080/healthz`
3. `bash scripts/qa_tests.sh http://localhost:8080`

## Modes
- Vulnerable mode: `SECURE_MODE=false`
- Hardened mode: `SECURE_MODE=true`

## Documentation
- [Roadmap](docs/ROADMAP.md)
- [User Guide](docs/USER_GUIDE.md)
- [QA Runbook](docs/QA_RUNBOOK.md)
- [Manuals](docs/manuals/INDEX.md)
- [Dev Logs](docs/dev-logs/INDEX.md)

## License
Licensed under MIT. See [LICENSE](LICENSE).

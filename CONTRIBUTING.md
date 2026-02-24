# Contributing

## Branching
- `dev` for daily development integration
- `QA` for validation and attack scenario verification
- `main` for release-ready changes

## Local Workflow
1. Create a feature branch from `dev`.
2. Run `make lint test`.
3. Run `bash scripts/qa_tests.sh http://localhost:8080` against a local instance.
4. Open PR into `dev` or `QA` as needed.

## Commit Style
Use conventional commits:
- `feat(scope): ...`
- `docs(scope): ...`
- `chore(scope): ...`
- `ci(scope): ...`
- `release(version): ...`

## Security Note
Do not expose this lab to public networks. Keep secrets out of Git history in real deployments.

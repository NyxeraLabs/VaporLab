# Branching Strategy

- `dev`: development CI and compose build validation.
- `QA`: QA validation branch with attack-path checks.
- `main`: production workflow, deployment build, and automatic patch tagging.

Pull requests run lint-build gate against `dev`, `QA`, and `main`.

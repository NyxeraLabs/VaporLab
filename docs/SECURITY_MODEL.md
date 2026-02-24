# Security Model

VaporLab intentionally models two behaviors:
- Vulnerable behavior for offensive exercises.
- Hardened behavior for defensive validation.

## Global Control
`SECURE_MODE=true|false` toggles auth, authorization, SSRF filtering, token replay checks, and AI safety controls.

## Covered Domains
- OWASP API Top 10 2019 and 2023
- OIDC/OAuth misuse chains
- AI/ML prompt injection and vector poisoning
- Business logic abuse and chained exploitation

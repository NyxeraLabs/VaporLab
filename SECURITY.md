# Security Policy

VaporLab intentionally contains vulnerable-by-design behaviors for training.

## Supported Modes
- `SECURE_MODE=false`: vulnerable lab behavior.
- `SECURE_MODE=true`: hardened behavior for comparison and defensive drills.

## Reporting
If you discover accidental vulnerabilities outside intended lab scenarios, open a private advisory with reproduction steps, affected endpoints, and impact.

## Safe Deployment
- Use isolated network segments.
- Never deploy with production customer data.
- Restrict access with VPN and firewall rules.

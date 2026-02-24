# Kubernetes Deployment

This scaffold provides containerized services and health endpoints (`/healthz`, `/readyz`) suitable for conversion into Kubernetes Deployments and Services.

Recommended production controls:
- NetworkPolicy restrictions
- Secret management via external provider
- Ingress authn/authz policy

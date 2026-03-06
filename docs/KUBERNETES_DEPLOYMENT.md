# Kubernetes Deployment

This scaffold provides containerized services and health endpoints (`/healthz`, `/readyz`) suitable for conversion into Kubernetes Deployments and Services.

Recommended production controls:
- NetworkPolicy restrictions
- Secret management via external provider
- Ingress authn/authz policy

## Probe Configuration Example
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 20
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /readyz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 15
  timeoutSeconds: 5
  failureThreshold: 3
```

## Security and Runtime Env
- `SECURE_MODE=true`
- `HARDENING_ENABLED=true`
- `JWT_SECRET` from Kubernetes Secret
- `AI_API_KEY` from Kubernetes Secret

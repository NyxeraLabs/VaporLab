# Infrastructure Overview

## Service Topology
- Frontend: Next.js + Tailwind operator console
- API: Go monolith with vulnerable/secure mode switching
- PostgreSQL, Redis, MinIO, Qdrant, Prometheus, Grafana, Jaeger, Gateway

## Non-Standard Port Mapping (Host)

### Development
- Frontend: `15100`
- API: `18080`
- Gateway: `18081`
- PostgreSQL: `15432`
- Redis: `16379`
- MinIO API/Console: `19000` / `19001`
- Qdrant: `16333`
- Prometheus: `19090`
- Grafana: `13000`
- Jaeger: `16687`

### QA
- Frontend: `25100`
- API: `28080`
- Gateway: `28081`
- PostgreSQL: `25432`
- Redis: `26379`
- MinIO API/Console: `29000` / `29001`
- Qdrant: `26333`
- Prometheus: `29090`
- Grafana: `23000`
- Jaeger: `26687`

### Production
- Frontend: `35100`
- API: `38080`
- Gateway: `38081`
- PostgreSQL: `35432`
- Redis: `36379`
- MinIO API/Console: `39000` / `39001`
- Qdrant: `36333`
- Prometheus: `39090`
- Grafana: `33000`
- Jaeger: `36687`

## Compatibility Goal
All host ports intentionally avoid common default values to reduce conflicts with local developer tools and other labs.

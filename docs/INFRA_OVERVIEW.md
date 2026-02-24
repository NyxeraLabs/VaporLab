# Infrastructure Overview

## Services
- PostgreSQL: `5432`
- Redis: `6379`
- MinIO API/Console: `9000/9001`
- Qdrant Vector DB: `6333`
- Prometheus: `9090`
- Grafana: `3000`
- Jaeger UI: `16686`
- API: `8080` (dev), `8082` (QA), `8083` (prod)
- Gateway: `8081`

## Dependencies
API depends on postgres, redis, minio, and vectordb in dev profile.

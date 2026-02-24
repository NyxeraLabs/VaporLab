# Development Logs Index – Offensive API Lab

This document is the central index for all development logs of the Offensive API Lab.  
Each entry links to a dedicated log describing commits, development notes, dev testing, and documentation updates for each sprint.

---

## 🧱 Phase 0 – Foundation & Project Governance

### Sprint 0.1 – Repository Bootstrap
- [Repo initialization, pre-commit hooks, CI baseline](sprints/0.1_repo_bootstrap.md)

### Sprint 0.2 – Infrastructure Stack
- [Dockerized infra, PostgreSQL, Redis, MinIO, Vector DB, Prometheus, Grafana, Jaeger](sprints/0.2_infra_stack.md)

---

## 🔐 Phase 1 – Core API Services (OWASP 2019)

### Sprint 1 – Auth Service
- [JWT service, insecure modes, refresh tokens, dev tests](sprints/1_auth_service.md)

### Sprint 2 – Users Service
- [CRUD, BOLA/IDOR, mass assignment, multi-tenant context](sprints/2_users_service.md)

---

## 💳 Phase 2 – Business Logic & Function Auth

### Sprint 3 – Billing Service
- [Coupon engine, command injection, webhook endpoints, dev tests](sprints/3_billing_service.md)

### Sprint 4 – Admin Service
- [Privilege escalation, internal routes, chain testing](sprints/4_admin_service.md)

---

## 🌐 Phase 3 – OWASP 2023 Expansion

### Sprint 5 – SSRF & Resource Abuse
- [File upload, GraphQL deep nesting, internal network access](sprints/5_ssrf_resource_abuse.md)

### Sprint 6 – Improper Inventory
- [API versioning, legacy endpoints, OpenAPI exposure](sprints/6_improper_inventory.md)

---

## 🤖 Phase 4 – AI / ML Attack Surface

### Sprint 7 – RAG & Embeddings
- [Vector DB queries, prompt injection, vector poisoning](sprints/7_rag_embeddings.md)

### Sprint 8 – AI Chaining
- [Training uploads, model config, log injection](sprints/8_ai_chaining.md)

---

## 🔗 Phase 5 – Exploit Framework

### Sprint 9 – Automation & Scoring
- [Attack scripts, scoring engine, benchmark tests](sprints/9_automation_scoring.md)

---

## 📊 Phase 6 – Observability

### Sprint 10 – Logging & Metrics
- [Structured logs, tracing, metrics, dev tests](sprints/10_logging_metrics.md)

---

## 🛡 Phase 7 – Secure Mode

### Sprint 11 – Hardening Toggle
- [Feature flags, JWT/BOLA fixes, rate limiting, SSRF restrictions](sprints/11_hardening_toggle.md)

---

## 🚀 Phase 8 – Production Readiness

### Sprint 12 – Release Engineering
- [Docker optimizations, liveness/readiness probes, SBOM, release workflow, tagging](sprints/12_release_engineering.md)

---

> This index will grow as new development logs are created.  
> Each sprint log captures commits, dev tests, documentation updates, and QA notes.
# Manuals Index – Offensive API Lab

This document is the central index for all functional manuals of the Offensive API Lab.  
Each entry links to a dedicated manual describing usage, attack vectors, and walkthroughs.

---

## 📘 Phase 1 – Core API Services (OWASP 2019)

### Auth Service
- [JWT Authentication & Insecure Modes](auth/README.md)
- [Refresh Tokens & Replay Scenarios](auth/refresh_tokens.md)

### Users Service
- [CRUD Operations & IDOR/BOLA](users/crud_idor.md)
- [Mass Assignment Exploits](users/mass_assignment.md)
- [Data Exposure & Multi-Tenant Context](users/data_exposure.md)

---

## 💳 Phase 2 – Business Logic & Function Auth

### Billing Service
- [Coupon Engine Abuse](billing/coupon_abuse.md)
- [Command Injection & Export Endpoint](billing/command_injection.md)
- [Webhook Signature Bypass](billing/webhook.md)

### Admin Service
- [Privilege Escalation Chains](admin/escalation_chain.md)
- [Tenant Management & Debug Routes](admin/tenant_debug.md)

---

## 🌐 Phase 3 – OWASP 2023 Expansion

### SSRF & Resource Abuse
- [SSRF Walkthrough](ssrf/ssrf.md)
- [Resource Exhaustion / DoS](ssrf/dos.md)
- [GraphQL Deep Nesting](graphql/deep_nesting.md)

### Improper Inventory / API Versioning
- [Legacy Endpoints & Shadow API](versioning/legacy.md)
- [OpenAPI Exposure](versioning/openapi.md)

---

## 🤖 Phase 4 – AI / ML Attack Surface

### RAG & Embeddings
- [Vector Database & Embedding Queries](ai/rag_embeddings.md)
- [Prompt Injection Exploits](ai/prompt_injection.md)
- [Vector Poisoning Scenarios](ai/vector_poisoning.md)

### AI Chaining
- [Training Upload & Model Config](ai/ai_chaining.md)
- [Log Injection & Exploit Chains](ai/log_injection.md)

---

## 🔗 Phase 5 – Exploit Framework

- [Automation Scripts & Scoring Engine](attacks/automation.md)
- [Benchmarking & Attack Playbook](attacks/playbook.md)

---

## 📊 Phase 6 – Observability

- [Structured Logging & Metrics](observability/logging_metrics.md)
- [Tracing & Blind Spots](observability/tracing.md)

---

## 🛡 Phase 7 – Secure Mode

- [Secure Mode Deployment](security/secure_mode.md)
- [Feature Flag Configuration](security/feature_flags.md)

---

## 🛠 Phase 8 – Production Readiness

- [Deployment Guide](deployment/deployment_guide.md)
- [Kubernetes Deployment](deployment/k8s_deployment.md)
- [Lab Usage Guide](deployment/lab_usage.md)
- [Red Team Exercises](deployment/red_team.md)
- [Blue Team Exercises](deployment/blue_team.md)

---

> This index will grow as new manuals are added.  
> Manuals are grouped by phase, service, and type of vulnerability/exploit chain.

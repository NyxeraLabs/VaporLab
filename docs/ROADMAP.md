# 🔥 VaporLab - Offensive API Lab – End-to-End Delivery Roadmap
## From Zero → Fully Production-Ready (With Documentation Lifecycle)

---

# 🧱 PHASE 0 – FOUNDATION & PROJECT GOVERNANCE

## 🚀 Sprint 0.1 – Repository Bootstrap
### 🎯 Goal
Establish repository, standards, governance, CI baseline.

### ✅ Development
- [x] Initialize monorepo structure
- [x] Create services/ directory scaffold
- [x] Create infra/ directory
- [x] Create docs/ directory
- [x] Create attack-scenarios/ directory
- [x] Add Makefile
- [x] Configure pre-commit hooks
- [x] Configure linting & formatting
- [x] Add GitHub Actions baseline (lint + test)
- [x] Define branching model

### 📘 Documentation
- [x] Create `ARCHITECTURE.md`
- [x] Create `CONTRIBUTING.md`
- [x] Create `BRANCHING_STRATEGY.md`
- [x] Create `SECURITY_MODEL.md`
- [x] Create `ROADMAP.md`
- [x] Create base `README.md`

### 📖 User Guide
- [x] Add “Getting Started” section
- [x] Add local setup instructions
- [x] Add environment overview

### 💾 Commits
- [x] `chore(repo): initialize monorepo`
- [x] `docs: add architecture overview`
- [x] `docs: add contributing guide`
- [x] `ci(actions): add lint pipeline`
- [x] `docs(readme): add setup instructions`

---

## 🚀 Sprint 0.2 – Infrastructure Stack
### 🎯 Goal
Fully dockerized infra foundation.

### ✅ Development
- [x] Add PostgreSQL
- [x] Add Redis
- [x] Add MinIO
- [x] Add Vector DB
- [x] Add API Gateway
- [x] Add Prometheus
- [x] Add Grafana
- [x] Add Jaeger
- [x] Configure Docker networking
- [x] Add health checks

### 📘 Documentation
- [x] Update `ARCHITECTURE.md` with infra diagram
- [x] Add `INFRA_OVERVIEW.md`
- [x] Add port mapping documentation
- [x] Document service dependencies

### 📖 User Guide
- [x] Add infra startup guide
- [x] Add troubleshooting section
- [x] Add environment variables reference

### 💾 Commits
- [x] `feat(infra): add postgres`
- [x] `feat(infra): add redis`
- [x] `feat(infra): add minio`
- [x] `feat(infra): add vector db`
- [x] `feat(observability): add prometheus stack`
- [x] `docs(infra): document infrastructure`

---

# 🔐 PHASE 1 – CORE API SERVICES (OWASP 2019 BASELINE)

## 🚀 Sprint 1 – Auth Service
### 🎯 Goal
JWT service with insecure modes + OIDC/OAuth support.

### ✅ Development
- [x] Implement JWT issuing
- [x] Add insecure signature validation
- [x] Allow alg=none mode
- [x] Add weak secret configuration
- [x] Add refresh token endpoint
- [x] Add secure mode toggle
- [x] Add OIDC endpoints (authorize, token, userinfo)
- [x] Introduce vulnerable OAuth client flow

### 🧪 Dev Testing
- [ ] Invalid signature bypass test
- [ ] Expired token acceptance test
- [ ] Refresh replay attack test
- [ ] OAuth token leakage test
- [ ] OpenID misconfig test

### 📘 Documentation
- [x] Document Auth API endpoints
- [x] Add JWT flow diagram
- [x] Document insecure modes
- [x] Document secure mode behavior
- [x] Document OIDC endpoints and flows

### 📖 User Guide
- [x] Add authentication walkthrough
- [x] Add exploit example (broken JWT)
- [x] Add curl examples
- [x] Add OIDC misuse demo

### 💾 Commits
- [x] `feat(auth): implement jwt issuing`
- [x] `feat(auth): add insecure validation`
- [x] `feat(auth): add secure mode toggle`
- [x] `feat(auth): add oidc endpoints`
- [x] `docs(auth): document endpoints and oidc`

---

## 🚀 Sprint 2 – Users Service
### 🎯 Goal
BOLA + Mass Assignment + Data Exposure.

### ✅ Development
- [x] Implement CRUD
- [x] Add IDOR/BOLA flaw
- [x] Add mass assignment flaw
- [x] Expose internal properties
- [x] Add multi-tenant context
- [x] Introduce API rate limit bypass endpoint

### 🧪 Dev Testing
- [ ] IDOR test
- [ ] Mass assignment role escalation
- [ ] Excessive data exposure validation
- [ ] Rate limit bypass test

### 📘 Documentation
- [x] Document user schema
- [x] Document tenant model
- [x] Document vulnerability explanations
- [x] Document rate-limiting flaw

### 📖 User Guide
- [x] Add IDOR exploitation example
- [x] Add role escalation walkthrough
- [x] Add multi-tenant attack scenario
- [x] Add rate-limiting bypass demo

### 💾 Commits
- [x] `feat(users): add crud`
- [x] `feat(users): add idor`
- [x] `feat(users): add mass assignment`
- [x] `feat(users): add rate-limit bypass`
- [x] `docs(users): document vulnerabilities`

---

# 💳 PHASE 2 – BUSINESS LOGIC & FUNCTION AUTH

## 🚀 Sprint 3 – Billing Service
### 🎯 Goal
Business logic abuse + injection.

### ✅ Development
- [x] Add coupon engine
- [x] Allow coupon reuse
- [x] Add export endpoint
- [x] Add command injection flaw
- [x] Add webhook endpoint (no validation)
- [x] Add data exfil via webhook

### 🧪 Dev Testing
- [ ] Coupon abuse test
- [ ] Injection payload test
- [ ] Webhook signature bypass test
- [ ] Exfiltration via webhook test

### 📘 Documentation
- [x] Document billing flows
- [x] Document business logic model
- [x] Document injection points
- [x] Document webhook risks

### 📖 User Guide
- [x] Add coupon abuse tutorial
- [x] Add injection walkthrough
- [x] Add webhook attack demo

### 💾 Commits
- [x] `feat(billing): add coupon engine`
- [x] `feat(billing): add export injection`
- [x] `docs(billing): add flow documentation`

---

## 🚀 Sprint 4 – Admin Service
### 🎯 Goal
Broken function-level authorization + chains

### ✅ Development
- [x] Add promotion endpoint
- [x] Add tenant management
- [x] Remove middleware checks
- [x] Add internal debug route
- [x] Add chained attack scenarios (BOLA → Admin → Billing → AI)

### 🧪 QA
- [ ] Chain: BOLA → Promote → Export → AI exploit

### 📘 Documentation
- [x] Document admin privilege model
- [x] Document attack chain example
- [x] Map to OWASP 2019/2023 Top 10

### 📖 User Guide
- [x] Add full privilege escalation walkthrough
- [x] Add chain exploitation lab guide

### 💾 Commits
- [x] `feat(admin): add promote endpoint`
- [x] `feat(admin): remove auth middleware`
- [x] `feat(admin): add chain scenarios`
- [x] `docs(admin): document escalation chain`

---

# 🌐 PHASE 3 – OWASP 2023 EXPANSION

## 🚀 Sprint 5 – SSRF & Resource Abuse
### ✅ Development
- [x] Add file upload (no size limit)
- [x] Add GraphQL deep nesting
- [x] Add URL fetch endpoint
- [x] Allow internal network access
- [x] Add rate limit bypass
- [x] Add excessive data exposure endpoint

### 🧪 QA
- [ ] Metadata SSRF test
- [ ] Deep GraphQL DoS test
- [ ] Rate limit bypass verification

### 📘 Documentation
- [x] Document SSRF attack surface
- [x] Document resource exhaustion scenarios
- [x] Map to OWASP API Top 10 (2023)

### 📖 User Guide
- [x] Add SSRF walkthrough
- [x] Add DoS demonstration
- [x] Add API discovery exercises

### 💾 Commits
- [x] `feat(ssrf): add vulnerable fetch endpoint`
- [x] `feat(graphql): enable deep nesting`
- [x] `docs(ssrf): document attack surface`

---

## 🚀 Sprint 6 – Improper Inventory & Versioning
### ✅ Development
- [x] Add /v1, /v2, /beta
- [x] Keep deprecated endpoints
- [x] Add /internal route
- [x] Expose OpenAPI publicly
- [x] Add API shadowing

### 📘 Documentation
- [x] Document version drift
- [x] Add API surface map
- [x] Map to OWASP Top 10 (2019 & 2023)

### 📖 User Guide
- [x] Add API discovery exercise
- [x] Add shadow API exploitation guide

### 💾 Commits
- [x] `feat(versioning): add legacy routes`
- [x] `docs(versioning): document api drift`

---

# 🤖 PHASE 4 – AI / ML ATTACK SURFACE

## 🚀 Sprint 7 – RAG & Embeddings
### ✅ Development
- [x] Add /ai/query
- [x] Add /kb/search
- [x] Add embedding endpoint
- [x] Hardcode system prompt
- [x] Expose API key
- [x] Allow vector poisoning

### 🧪 QA
- [ ] Prompt injection extraction
- [ ] Secret exfiltration
- [ ] Vector poisoning scenario

### 📘 Documentation
- [x] Document RAG pipeline
- [x] Document model architecture
- [x] Document AI threat model

### 📖 User Guide
- [x] Add prompt injection tutorial
- [x] Add vector poisoning lab
- [x] Add RAG data exfiltration walkthrough

### 💾 Commits
- [x] `feat(ai): add rag pipeline`
- [x] `feat(ai): insecure prompt`
- [x] `docs(ai): add threat model`

---

## 🚀 Sprint 8 – AI Chaining
### ✅ Development
- [x] Add training upload endpoint
- [x] Expose model config
- [x] Remove token limits
- [x] Add log injection flaw
- [x] Chain AI exploit across multiple services

### 📘 Documentation
- [x] Document AI exploit chains
- [x] Add MITRE mapping draft

### 📖 User Guide
- [x] Add full AI exploitation chain tutorial

### 💾 Commits
- [x] `feat(ai): add training upload`
- [x] `docs(ai): document exploit chain`

---

# 🔗 PHASE 5 – EXPLOIT FRAMEWORK & OIDC
## 🚀 Sprint 9 – Automation & Scoring
### ✅ Development
- [x] Add attack scripts
- [x] Add scoring engine
- [x] Add benchmark output
- [x] Add automation harness
- [x] Add OIDC/OAuth attack scenarios
- [x] Implement full chain scenarios

### 📘 Documentation
- [x] Add `ATTACK_PLAYBOOK.md`
- [x] Add scoring methodology doc
- [x] Document OIDC/OAuth attack flows

### 📖 User Guide
- [x] Add automation usage guide
- [x] Add benchmark example
- [x] Add OIDC exploitation lab guide

### 💾 Commits
- [x] `feat(attacks): add chain scenarios`
- [x] `docs(attacks): add playbook`
- [x] `feat(oidc): add vulnerable oauth lab`
- [x] `docs(oidc): document oauth chains`

---

# 📊 PHASE 6 – OBSERVABILITY
## 🚀 Sprint 10 – Logging & Metrics
### ✅ Development
- [x] Add structured logs
- [x] Leave intentional blind spots
- [x] Expose /metrics unauthenticated
- [x] Add tracing

### 📘 Documentation
- [x] Document telemetry architecture
- [x] Document detection gaps

### 📖 User Guide
- [x] Add blue-team testing guide
- [x] Add observability walkthrough

### 💾 Commits
- [x] `feat(logging): add structured logs`
- [x] `docs(observability): document telemetry`

---

# 🛡 PHASE 7 – SECURE MODE
## 🚀 Sprint 11 – Hardening Toggle
### ✅ Development
- [x] Add global feature flag
- [x] Fix JWT validation
- [x] Fix BOLA
- [x] Add rate limiting
- [x] Restrict SSRF
- [x] Secure AI endpoints
- [x] Secure OIDC flows

### 📘 Documentation
- [x] Document secure mode behavior
- [x] Add comparison matrix (vulnerable vs secure)

### 📖 User Guide
- [x] Add secure mode deployment guide
- [x] Add defensive configuration walkthrough

### 💾 Commits
- [x] `feat(toggle): add secure mode`
- [x] `docs(security): document secure mode`

---

# 🚀 PHASE 8 – PRODUCTION READINESS
## 🚀 Sprint 12 – Release Engineering
### ✅ Development
- [x] Optimize Docker images
- [x] Add liveness probes
- [x] Add readiness probes
- [ ] Generate SBOM
- [ ] Add container signing
- [x] Add release workflow
- [ ] Tag v1.0.0 vulnerable
- [ ] Tag v2.0.0 secure

### 🧪 QA
- [ ] 24h stability test
- [ ] Load test
- [ ] Regression test full exploit coverage

### 📘 Documentation
- [x] Finalize full documentation set
- [x] Add deployment guide
- [x] Add Kubernetes deployment doc
- [x] Add architecture diagram
- [x] Add versioned changelog

### 📖 User Guide
- [x] Add production deployment guide
- [x] Add lab usage guide
- [x] Add red team exercise manual
- [x] Add blue team exercise manual

### 💾 Commits
- [x] `ci(release): add tagging automation`
- [ ] `chore(security): generate sbom`
- [x] `docs: finalize documentation`
- [ ] `release(v1.0.0): vulnerable lab`
- [ ] `release(v2.0.0): secure mode`

---

# 🏁 FINAL STATE CHECKLIST
- [ ] OWASP API 2019 fully covered
- [ ] OWASP API 2023 fully covered
- [ ] AI/ML exploit surface complete
- [ ] OIDC/OAuth exploit surface complete
- [ ] 5+ exploit chains operational
- [x] Secure mode toggle functional
- [x] Observability layer complete
- [x] Full documentation suite
- [x] Full user guide suite
- [x] CI/CD automated
- [ ] Production tagged release

**Estimated Duration:** 16–20 Weeks  
**Total Sprints:** 12  
**Environments:** dev → dev-testing → qa → prod  
**Result:** Enterprise-Grade Offensive API + AI Exploitation Lab + OIDC/OAuth + Top 10 API Coverage

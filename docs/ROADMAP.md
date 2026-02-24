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
- [x] Invalid signature bypass test
- [x] Expired token acceptance test
- [x] Refresh replay attack test
- [x] OAuth token leakage test
- [x] OpenID misconfig test

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
- [ ] Implement CRUD
- [ ] Add IDOR/BOLA flaw
- [ ] Add mass assignment flaw
- [ ] Expose internal properties
- [ ] Add multi-tenant context
- [ ] Introduce API rate limit bypass endpoint

### 🧪 Dev Testing
- [ ] IDOR test
- [ ] Mass assignment role escalation
- [ ] Excessive data exposure validation
- [ ] Rate limit bypass test

### 📘 Documentation
- [ ] Document user schema
- [ ] Document tenant model
- [ ] Document vulnerability explanations
- [ ] Document rate-limiting flaw

### 📖 User Guide
- [ ] Add IDOR exploitation example
- [ ] Add role escalation walkthrough
- [ ] Add multi-tenant attack scenario
- [ ] Add rate-limiting bypass demo

### 💾 Commits
- [ ] `feat(users): add crud`
- [ ] `feat(users): add idor`
- [ ] `feat(users): add mass assignment`
- [ ] `feat(users): add rate-limit bypass`
- [ ] `docs(users): document vulnerabilities`

---

# 💳 PHASE 2 – BUSINESS LOGIC & FUNCTION AUTH

## 🚀 Sprint 3 – Billing Service
### 🎯 Goal
Business logic abuse + injection.

### ✅ Development
- [ ] Add coupon engine
- [ ] Allow coupon reuse
- [ ] Add export endpoint
- [ ] Add command injection flaw
- [ ] Add webhook endpoint (no validation)
- [ ] Add data exfil via webhook

### 🧪 Dev Testing
- [ ] Coupon abuse test
- [ ] Injection payload test
- [ ] Webhook signature bypass test
- [ ] Exfiltration via webhook test

### 📘 Documentation
- [ ] Document billing flows
- [ ] Document business logic model
- [ ] Document injection points
- [ ] Document webhook risks

### 📖 User Guide
- [ ] Add coupon abuse tutorial
- [ ] Add injection walkthrough
- [ ] Add webhook attack demo

### 💾 Commits
- [ ] `feat(billing): add coupon engine`
- [ ] `feat(billing): add export injection`
- [ ] `docs(billing): add flow documentation`

---

## 🚀 Sprint 4 – Admin Service
### 🎯 Goal
Broken function-level authorization + chains

### ✅ Development
- [ ] Add promotion endpoint
- [ ] Add tenant management
- [ ] Remove middleware checks
- [ ] Add internal debug route
- [ ] Add chained attack scenarios (BOLA → Admin → Billing → AI)

### 🧪 QA
- [ ] Chain: BOLA → Promote → Export → AI exploit

### 📘 Documentation
- [ ] Document admin privilege model
- [ ] Document attack chain example
- [ ] Map to OWASP 2019/2023 Top 10

### 📖 User Guide
- [ ] Add full privilege escalation walkthrough
- [ ] Add chain exploitation lab guide

### 💾 Commits
- [ ] `feat(admin): add promote endpoint`
- [ ] `feat(admin): remove auth middleware`
- [ ] `feat(admin): add chain scenarios`
- [ ] `docs(admin): document escalation chain`

---

# 🌐 PHASE 3 – OWASP 2023 EXPANSION

## 🚀 Sprint 5 – SSRF & Resource Abuse
### ✅ Development
- [ ] Add file upload (no size limit)
- [ ] Add GraphQL deep nesting
- [ ] Add URL fetch endpoint
- [ ] Allow internal network access
- [ ] Add rate limit bypass
- [ ] Add excessive data exposure endpoint

### 🧪 QA
- [ ] Metadata SSRF test
- [ ] Deep GraphQL DoS test
- [ ] Rate limit bypass verification

### 📘 Documentation
- [ ] Document SSRF attack surface
- [ ] Document resource exhaustion scenarios
- [ ] Map to OWASP API Top 10 (2023)

### 📖 User Guide
- [ ] Add SSRF walkthrough
- [ ] Add DoS demonstration
- [ ] Add API discovery exercises

### 💾 Commits
- [ ] `feat(ssrf): add vulnerable fetch endpoint`
- [ ] `feat(graphql): enable deep nesting`
- [ ] `docs(ssrf): document attack surface`

---

## 🚀 Sprint 6 – Improper Inventory & Versioning
### ✅ Development
- [ ] Add /v1, /v2, /beta
- [ ] Keep deprecated endpoints
- [ ] Add /internal route
- [ ] Expose OpenAPI publicly
- [ ] Add API shadowing

### 📘 Documentation
- [ ] Document version drift
- [ ] Add API surface map
- [ ] Map to OWASP Top 10 (2019 & 2023)

### 📖 User Guide
- [ ] Add API discovery exercise
- [ ] Add shadow API exploitation guide

### 💾 Commits
- [ ] `feat(versioning): add legacy routes`
- [ ] `docs(versioning): document api drift`

---

# 🤖 PHASE 4 – AI / ML ATTACK SURFACE

## 🚀 Sprint 7 – RAG & Embeddings
### ✅ Development
- [ ] Add /ai/query
- [ ] Add /kb/search
- [ ] Add embedding endpoint
- [ ] Hardcode system prompt
- [ ] Expose API key
- [ ] Allow vector poisoning

### 🧪 QA
- [ ] Prompt injection extraction
- [ ] Secret exfiltration
- [ ] Vector poisoning scenario

### 📘 Documentation
- [ ] Document RAG pipeline
- [ ] Document model architecture
- [ ] Document AI threat model

### 📖 User Guide
- [ ] Add prompt injection tutorial
- [ ] Add vector poisoning lab
- [ ] Add RAG data exfiltration walkthrough

### 💾 Commits
- [ ] `feat(ai): add rag pipeline`
- [ ] `feat(ai): insecure prompt`
- [ ] `docs(ai): add threat model`

---

## 🚀 Sprint 8 – AI Chaining
### ✅ Development
- [ ] Add training upload endpoint
- [ ] Expose model config
- [ ] Remove token limits
- [ ] Add log injection flaw
- [ ] Chain AI exploit across multiple services

### 📘 Documentation
- [ ] Document AI exploit chains
- [ ] Add MITRE mapping draft

### 📖 User Guide
- [ ] Add full AI exploitation chain tutorial

### 💾 Commits
- [ ] `feat(ai): add training upload`
- [ ] `docs(ai): document exploit chain`

---

# 🔗 PHASE 5 – EXPLOIT FRAMEWORK & OIDC
## 🚀 Sprint 9 – Automation & Scoring
### ✅ Development
- [ ] Add attack scripts
- [ ] Add scoring engine
- [ ] Add benchmark output
- [ ] Add automation harness
- [ ] Add OIDC/OAuth attack scenarios
- [ ] Implement full chain scenarios

### 📘 Documentation
- [ ] Add `ATTACK_PLAYBOOK.md`
- [ ] Add scoring methodology doc
- [ ] Document OIDC/OAuth attack flows

### 📖 User Guide
- [ ] Add automation usage guide
- [ ] Add benchmark example
- [ ] Add OIDC exploitation lab guide

### 💾 Commits
- [ ] `feat(attacks): add chain scenarios`
- [ ] `docs(attacks): add playbook`
- [ ] `feat(oidc): add vulnerable oauth lab`
- [ ] `docs(oidc): document oauth chains`

---

# 📊 PHASE 6 – OBSERVABILITY
## 🚀 Sprint 10 – Logging & Metrics
### ✅ Development
- [ ] Add structured logs
- [ ] Leave intentional blind spots
- [ ] Expose /metrics unauthenticated
- [ ] Add tracing

### 📘 Documentation
- [ ] Document telemetry architecture
- [ ] Document detection gaps

### 📖 User Guide
- [ ] Add blue-team testing guide
- [ ] Add observability walkthrough

### 💾 Commits
- [ ] `feat(logging): add structured logs`
- [ ] `docs(observability): document telemetry`

---

# 🛡 PHASE 7 – SECURE MODE
## 🚀 Sprint 11 – Hardening Toggle
### ✅ Development
- [ ] Add global feature flag
- [ ] Fix JWT validation
- [ ] Fix BOLA
- [ ] Add rate limiting
- [ ] Restrict SSRF
- [ ] Secure AI endpoints
- [ ] Secure OIDC flows

### 📘 Documentation
- [x] Document secure mode behavior
- [ ] Add comparison matrix (vulnerable vs secure)

### 📖 User Guide
- [ ] Add secure mode deployment guide
- [ ] Add defensive configuration walkthrough

### 💾 Commits
- [ ] `feat(toggle): add secure mode`
- [ ] `docs(security): document secure mode`

---

# 🚀 PHASE 8 – PRODUCTION READINESS
## 🚀 Sprint 12 – Release Engineering
### ✅ Development
- [ ] Optimize Docker images
- [ ] Add liveness probes
- [ ] Add readiness probes
- [ ] Generate SBOM
- [ ] Add container signing
- [ ] Add release workflow
- [ ] Tag v1.0.0 vulnerable
- [ ] Tag v2.0.0 secure

### 🧪 QA
- [ ] 24h stability test
- [ ] Load test
- [ ] Regression test full exploit coverage

### 📘 Documentation
- [ ] Finalize full documentation set
- [ ] Add deployment guide
- [ ] Add Kubernetes deployment doc
- [ ] Add architecture diagram
- [ ] Add versioned changelog

### 📖 User Guide
- [ ] Add production deployment guide
- [ ] Add lab usage guide
- [ ] Add red team exercise manual
- [ ] Add blue team exercise manual

### 💾 Commits
- [ ] `ci(release): add tagging automation`
- [ ] `chore(security): generate sbom`
- [ ] `docs: finalize documentation`
- [ ] `release(v1.0.0): vulnerable lab`
- [ ] `release(v2.0.0): secure mode`

---

# 🏁 FINAL STATE CHECKLIST
- [ ] OWASP API 2019 fully covered
- [ ] OWASP API 2023 fully covered
- [ ] AI/ML exploit surface complete
- [ ] OIDC/OAuth exploit surface complete
- [ ] 5+ exploit chains operational
- [ ] Secure mode toggle functional
- [ ] Observability layer complete
- [ ] Full documentation suite
- [ ] Full user guide suite
- [ ] CI/CD automated
- [ ] Production tagged release

**Estimated Duration:** 16–20 Weeks  
**Total Sprints:** 12  
**Environments:** dev → dev-testing → qa → prod  
**Result:** Enterprise-Grade Offensive API + AI Exploitation Lab + OIDC/OAuth + Top 10 API Coverage

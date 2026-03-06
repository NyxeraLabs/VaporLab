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

## 🚀 Sprint 1.1 – Frontend Console & Port Compatibility
### 🎯 Goal
Deliver a professional web frontend and non-standard host port strategy across all environments.

### ✅ Development
- [x] Implement Next.js + Tailwind frontend console
- [x] Connect frontend to VaporLab API endpoints
- [x] Dockerize frontend service
- [x] Add frontend service to dev, qa, and prod compose files
- [x] Remap all exposed host ports to non-standard values

### 🧪 Dev Testing
- [x] Validate compose config for dev/qa/prod
- [x] Validate backend compile/tests after port remapping
- [x] Validate frontend container build configuration

### 📘 Documentation
- [x] Document frontend architecture and usage
- [x] Document non-standard host port map
- [x] Update infra and deployment docs for new ports

### 📖 User Guide
- [x] Add frontend access and dashboard walkthrough
- [x] Update API examples to new host ports

### 💾 Commits
- [x] `feat(frontend): add nextjs tailwind operator console`
- [x] `feat(infra): remap host ports to non-standard ranges`
- [x] `docs(frontend): document dashboard and port compatibility`

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
- [x] IDOR test
- [x] Mass assignment role escalation
- [x] Excessive data exposure validation
- [x] Rate limit bypass test

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
- [x] Coupon abuse test
- [x] Injection payload test
- [x] Webhook signature bypass test
- [x] Exfiltration via webhook test

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
- [x] Chain: BOLA → Promote → Export → AI exploit

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

## 🚀 Sprint 4.1 – Frontend Integration (Phase 2)
### 🎯 Goal
Expose Billing and Admin attack flows in the frontend console after backend completion.

### ✅ Development
- [x] Add billing scenario widgets and forms in frontend
- [x] Add admin escalation workflow views
- [x] Add chained exploit visual timeline (BOLA → Admin → Billing → AI)
- [x] Add frontend state/alerts for vulnerable vs secure mode behavior

### 🧪 Dev Testing
- [x] Validate billing exploit frontend actions against API
- [x] Validate admin escalation frontend flow
- [x] Validate chain timeline updates from live responses

### 📘 Documentation
- [x] Document frontend billing/admin modules
- [x] Update architecture with phase 2 frontend components

### 📖 User Guide
- [x] Add frontend walkthrough for business logic and admin chain abuse

### 💾 Commits
- [x] `feat(frontend): add billing and admin console modules`
- [x] `docs(frontend): document phase 2 console flows`

---

## 🚀 Sprint 4.2 – Dual Web UI Architecture (Operator + Target SaaS)
### 🎯 Goal
Introduce two isolated web interfaces: a protected Operator Dashboard and a realistic fake SaaS target application.

### ✅ Development
- [x] Create route-level split: `/operator/*` and `/workspace/*`
- [x] Add token-driven theming with shared core tokens and isolated operator/saas themes
- [x] Add dedicated layouts (`OperatorLayout`, `SaaSLayout`) with strict visual isolation
- [x] Add operator UI modules (mode badge, difficulty selector, vulnerability cards, chain canvas scaffold)
- [x] Add SaaS UI modules (sidebar, workspace switcher, project board, issue modal, profile settings, OAuth settings, AI panel)
- [x] Add mandatory themed footer component for both UIs
- [x] Add operator UI access gate (key-based UI protection)
- [x] Update frontend container build context for new layout/theme directories

### 🧪 Dev Testing
- [x] Validate `/workspace` renders SaaS layout and components
- [x] Validate `/operator` renders operator layout and protected access flow
- [x] Validate frontend production build after architecture split
- [x] Validate no direct hex colors inside component/layout files

### 📘 Documentation
- [x] Document dual-UI architecture and route isolation
- [x] Document theme token structure (`core.ts`, `operator.ts`, `saas.ts`)
- [x] Update frontend manual with Operator vs SaaS workflows

### 📖 User Guide
- [x] Add access instructions for `/workspace` and `/operator`
- [x] Add operator key usage notes for local environments

### 💾 Commits
- [x] `feat(frontend): add dual-ui operator and workspace architecture`
- [x] `docs(frontend): document sprint 4.2 dual interface model`

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
- [x] Metadata SSRF test
- [x] Deep GraphQL DoS test
- [x] Rate limit bypass verification

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

## 🚀 Sprint 6.1 – Frontend Integration (Phase 3)
### 🎯 Goal
Add frontend views for OWASP 2023 discovery and resource abuse surfaces after API rollout.

### ✅ Development
- [x] Add SSRF/resource abuse workspace actions (URL fetch + GraphQL probe)
- [x] Add API inventory explorer checks for v1/v2/beta/internal/openapi
- [x] Add request builders for discovery and misuse scenarios in workspace UI

### 🧪 Dev Testing
- [x] Validate frontend SSRF/resource abuse interactions
- [x] Validate inventory explorer route discovery behavior

### 📘 Documentation
- [x] Document phase 3 frontend modules and data flows
- [ ] Update manuals with frontend-driven OWASP 2023 labs

### 📖 User Guide
- [x] Add frontend lab walkthrough for SSRF and inventory discovery
- [ ] Add frontend DoS walkthrough extensions

### 💾 Commits
- [x] `feat(frontend): add owasp-2023 discovery and resource checks`
- [ ] `docs(frontend): document phase 3 exploit views`

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
- [x] Prompt injection extraction
- [x] Secret exfiltration
- [x] Vector poisoning scenario

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

## 🚀 Sprint 8.1 – Frontend Integration (Phase 4)
### 🎯 Goal
Provide a dedicated frontend AI exploitation cockpit after AI endpoints are implemented.

### ✅ Development
- [x] Add AI response inspector panel in workspace interface
- [x] Add RAG controls (KB search + embed + AI config probes)
- [x] Add AI chain signal visibility in operator runtime panel

### 🧪 Dev Testing
- [x] Validate prompt/AI query flows from frontend to API
- [x] Validate RAG endpoint interactions from frontend

### 📘 Documentation
- [x] Document AI cockpit architecture and usage baseline
- [ ] Update threat model docs with frontend attack paths

### 📖 User Guide
- [x] Add frontend AI lab baseline exercises
- [ ] Add extended misuse scenario walkthroughs

### 💾 Commits
- [x] `feat(frontend): add ai workspace and operator integration modules`
- [ ] `docs(frontend): document phase 4 ai console`

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

## 🚀 Sprint 9.1 – Frontend Integration (Phase 5)
### 🎯 Goal
Expose attack automation and scoring controls in the frontend after framework APIs are ready.

### ✅ Development
- [ ] Add one-click automation runner from frontend
- [ ] Add score/benchmark dashboard and trend cards
- [ ] Add OIDC/OAuth exploit flow visualizer

### 🧪 Dev Testing
- [ ] Validate automation trigger and result rendering
- [ ] Validate scoring output consistency in frontend

### 📘 Documentation
- [ ] Document frontend automation/scoring modules
- [ ] Update attack playbook with frontend execution option

### 📖 User Guide
- [ ] Add frontend automation and scoring tutorial

### 💾 Commits
- [ ] `feat(frontend): add attack automation dashboard`
- [ ] `docs(frontend): document phase 5 automation ui`

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

## 🚀 Sprint 10.1 – Frontend Integration (Phase 6)
### 🎯 Goal
Add observability and blind-spot visibility panels to the frontend console after telemetry APIs are ready.

### ✅ Development
- [ ] Add metrics/trace summary panels in frontend
- [ ] Add blind-spot indicators and missing-telemetry flags
- [ ] Add incident timeline widget from logged attack events

### 🧪 Dev Testing
- [ ] Validate metrics and trace rendering from live endpoints
- [ ] Validate blind-spot indicators under expected gaps

### 📘 Documentation
- [ ] Document observability frontend modules and limitations
- [ ] Update architecture with telemetry UI components

### 📖 User Guide
- [ ] Add frontend blue-team validation walkthrough

### 💾 Commits
- [ ] `feat(frontend): add observability dashboard`
- [ ] `docs(frontend): document phase 6 telemetry ui`

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

## 🚀 Sprint 11.1 – Frontend Integration (Phase 7)
### 🎯 Goal
Add secure mode controls and vulnerable-vs-secure comparison UX to the frontend.

### ✅ Development
- [x] Add secure mode toggle controls in operator frontend
- [x] Add runtime status indicators for vulnerable vs hardened states
- [x] Add blocked-action feedback through workspace/API result panels

### 🧪 Dev Testing
- [x] Validate secure mode toggling effects in frontend flows
- [x] Validate mitigation state rendering for protected endpoints

### 📘 Documentation
- [x] Document frontend secure mode controls
- [ ] Add UI comparison matrix for vulnerable vs secure behaviors

### 📖 User Guide
- [x] Add secure mode frontend walkthrough baseline for defenders

### 💾 Commits
- [x] `feat(frontend): add secure mode control center`
- [ ] `docs(frontend): document phase 7 secure ui`

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

## 🚀 Sprint 12.1 – Frontend Integration (Phase 8)
### 🎯 Goal
Finalize production-grade frontend packaging, hardening, and release workflow.

### ✅ Development
- [ ] Optimize frontend image layers and caching
- [ ] Add frontend health/readiness checks
- [ ] Add frontend production deployment profile
- [ ] Add release artifact generation for frontend bundle

### 🧪 QA
- [ ] Frontend stability test under long-running sessions
- [ ] Frontend regression coverage for all sprint modules

### 📘 Documentation
- [ ] Finalize frontend operations manual
- [ ] Add frontend production runbook and rollback plan

### 📖 User Guide
- [ ] Add production frontend usage guide for red/blue teams

### 💾 Commits
- [ ] `chore(frontend): harden production image and probes`
- [ ] `ci(frontend): add release packaging workflow`
- [ ] `docs(frontend): finalize production manuals`

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

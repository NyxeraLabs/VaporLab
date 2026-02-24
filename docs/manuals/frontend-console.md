# Frontend Manual (Dual UI)

## Purpose
The frontend provides two separate web interfaces:
- Operator Dashboard for lab control and vulnerability orchestration
- Fake SaaS Target Application for realistic user workflows and attack simulation context

## Stack
- Next.js (App Router)
- Tailwind CSS
- Token-driven theming (`themes/core.ts`, `themes/operator.ts`, `themes/saas.ts`)
- Runtime API integration through `NEXT_PUBLIC_API_BASE`

## Environment Variables
- `NEXT_PUBLIC_API_BASE`
  - Dev: `http://localhost:18080`
  - QA: `http://localhost:28080`
  - Prod: `http://localhost:38080`
- `NEXT_PUBLIC_OPERATOR_ACCESS_KEY`
  - Default local value: `vaporlab-ops`
  - Used by operator UI access gate

## Route Model
- `/workspace`
  - Corporate SaaS target interface
  - Sidebar navigation, project board, issue modal, profile settings, OAuth settings, AI suggestion panel
  - Live API-backed workflows:
    - Users profile lookup
    - Billing coupon/export flows
    - OIDC authorize/userinfo checks
    - SSRF and GraphQL probe actions
    - Inventory probes (`v1/v2/beta/internal/openapi`)
    - AI/RAG probes (`/ai/query`, `/kb/search`, `/ai/embed`, `/ai/config`)
- `/operator`
  - Protected operator control panel
  - Persistent mode badge
  - Difficulty selector
  - Vulnerability module cards
  - Exploit chain builder canvas scaffold
  - Live hardening controls via `/auth/mode`
  - Runtime state probes via `/healthz`, `/auth/config`, `/admin/tenant`, `/chain/run`

## Containerization
Frontend is dockerized and included in:
- `docker-compose.dev.yml`
- `docker-compose.qa.yml`
- `docker-compose.prod.yml`

## Access
- Dev:
  - Workspace: `http://localhost:15100/workspace`
  - Operator: `http://localhost:15100/operator`
- QA:
  - Workspace: `http://localhost:25100/workspace`
  - Operator: `http://localhost:25100/operator`
- Prod:
  - Workspace: `http://localhost:35100/workspace`
  - Operator: `http://localhost:35100/operator`

## Theme Isolation Rules
- Operator routes must render only operator theme variables and layout primitives.
- Workspace routes must render only saas theme variables and layout primitives.
- No direct hex color usage in component/layout files.
- Shared tokens must come from `themes/core.ts`.

## Current Phase UI Coverage
- Phase 2:
  - Admin/Billing attack-chain workflows represented through workspace actions and operator control context.
- Phase 3:
  - SSRF/resource misuse and inventory discovery surfaced in workspace request panels.
- Phase 4:
  - AI query + RAG probe controls exposed in workspace UI and operator chain status.
- Phase 7 (baseline):
  - Secure/hardened mode toggling available from operator controls.

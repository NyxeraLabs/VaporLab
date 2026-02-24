# Frontend Console Manual

## Purpose
The frontend provides a professional operations dashboard for probing VaporLab API surfaces without raw curl-only workflows.

## Stack
- Next.js (App Router)
- Tailwind CSS
- Runtime API integration through `NEXT_PUBLIC_API_BASE`

## Environment Variable
- `NEXT_PUBLIC_API_BASE`
  - Dev: `http://localhost:18080`
  - QA: `http://localhost:28080`
  - Prod: `http://localhost:38080`

## Features
- Health and secure-mode status panel
- JWT issuance probe preview
- Users surface preview
- Chain execution probe visualization
- Billing scenario widgets:
  - Coupon apply + replay behavior validation
  - Export injection probe runner
  - Webhook signature bypass/signed request probe
- Admin escalation workflow views:
  - Promote (without and with `X-Admin`) controls
  - Debug route exposure probe
  - Full chain execution trigger
- Chained exploit timeline:
  - Live step states for BOLA -> Admin -> Billing -> AI -> Chain signal
- Mode-aware alerts:
  - Frontend interprets action results against `secure_mode` expectations

## Containerization
Frontend is dockerized and included in:
- `docker-compose.dev.yml`
- `docker-compose.qa.yml`
- `docker-compose.prod.yml`

## Access
- Dev: `http://localhost:15100`
- QA: `http://localhost:25100`
- Prod: `http://localhost:35100`

## Phase 2 API Integration Map
- Billing:
  - `POST /billing/coupon/apply`
  - `GET /billing/export`
  - `POST /billing/webhook`
- Admin:
  - `POST /admin/promote`
  - `GET /admin/debug`
  - `GET /admin/tenant`
- Chain + AI:
  - `GET /chain/run`
  - `POST /ai/query`
  - `GET /users/:id` (BOLA step in chain)

## Dev Testing Checklist (Sprint 4.1)
- Validate billing actions from UI:
  - Coupon replay is allowed in vulnerable mode and blocked (409) in secure mode.
  - Export probe accepts command-like formats in vulnerable mode and rejects invalid formats in secure mode.
  - Webhook request without signature succeeds in vulnerable mode and fails (401) in secure mode.
- Validate admin escalation from UI:
  - Promote without header succeeds in vulnerable mode.
  - Promote without header is blocked (403) in secure mode.
  - Debug route is exposed only in vulnerable mode.
- Validate timeline live updates:
  - Each chain step transitions `idle -> running -> success/blocked/error` based on live API responses.

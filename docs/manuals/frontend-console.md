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

## Containerization
Frontend is dockerized and included in:
- `docker-compose.dev.yml`
- `docker-compose.qa.yml`
- `docker-compose.prod.yml`

## Access
- Dev: `http://localhost:15100`
- QA: `http://localhost:25100`
- Prod: `http://localhost:35100`

# 🧑‍💻 Offensive API Lab – User Guide (Full Index)

Welcome to the **Offensive API Lab**! This guide is for **users** who want to install, explore, and practice with the lab. It is **not a developer guide**, but a usage manual for red/blue team exercises.

---

## 1. Getting Started

- [ ] 1.1 Installation
  - System requirements (Docker, Docker Compose, Git)
  - Clone repository
  - Environment variables setup
  - Initial `docker-compose up -d` command
- [ ] 1.2 Lab Startup
  - Start dev environment
  - Start QA environment
  - Start production (vulnerable/secure toggle)
- [ ] 1.3 Accessing the lab
  - API endpoints overview
  - UI / Swagger / OpenAPI access
  - Ports and URLs

---

## 2. Authentication & OIDC / OAuth

- [ ] 2.1 JWT Service
  - Login / token issuance
  - Broken JWT / alg=none demo
  - Refresh token exploitation
- [ ] 2.2 OIDC / OAuth Flaws
  - Authorization code flow exploit
  - Token leakage scenarios
  - Misconfigured redirect URIs
  - OpenID Connect misuse demo

---

## 3. Users Service – BOLA & Mass Assignment

- [ ] 3.1 CRUD operations
- [ ] 3.2 Broken Object Level Authorization (BOLA)
- [ ] 3.3 Mass Assignment / Role Escalation
- [ ] 3.4 Multi-Tenant Context
- [ ] 3.5 Rate-Limit Bypass
- [ ] 3.6 Exercises & Demo Scenarios

---

## 4. Billing Service – Business Logic Abuse

- [ ] 4.1 Coupon Engine Exploits
- [ ] 4.2 Export Endpoint Injection
- [ ] 4.3 Webhook Endpoint Abuse
- [ ] 4.4 Data Exfiltration via Billing
- [ ] 4.5 Guided Exploit Labs

---

## 5. Admin Service – Function-Level Authorization

- [ ] 5.1 Promotion Endpoint Exploit
- [ ] 5.2 Tenant Management Flaws
- [ ] 5.3 Internal Debug Route
- [ ] 5.4 Multi-Step Exploit Chains
  - BOLA → Admin → Billing → AI/ML
- [ ] 5.5 Lab Exercises & Step-By-Step

---

## 6. API Top 10 Coverage (2019 & 2023)

- [ ] 6.1 Security Misconfigurations
- [ ] 6.2 Broken Function Level Auth
- [ ] 6.3 Excessive Data Exposure
- [ ] 6.4 Mass Assignment / IDOR
- [ ] 6.5 Injection / Command Injection
- [ ] 6.6 Improper Inventory & Shadow APIs
- [ ] 6.7 SSRF & Resource Abuse
- [ ] 6.8 Rate Limit Bypass
- [ ] 6.9 Broken OAuth / OIDC Flaws
- [ ] 6.10 Vulnerable AI / ML Endpoints

---

## 7. AI / ML Lab

- [ ] 7.1 RAG & Embeddings Exploration
- [ ] 7.2 Vector Poisoning & Prompt Injection
- [ ] 7.3 AI Chaining Exploits
- [ ] 7.4 Lab Exercises

---

## 8. Observability & Logging

- [ ] 8.1 Structured Logs Review
- [ ] 8.2 Telemetry & Metrics Exploration
- [ ] 8.3 Detection Gap Exercises
- [ ] 8.4 Blue Team Testing Guide

---

## 9. Secure Mode

- [ ] 9.1 Toggle Vulnerable / Secure
- [ ] 9.2 Fixed JWT, BOLA, Rate Limiting
- [ ] 9.3 Secured SSRF & AI Endpoints
- [ ] 9.4 Comparison Guide: Vulnerable vs Secure

---

## 10. Production & Release

- [ ] 10.1 Release v1.0.0 – Vulnerable Lab
- [ ] 10.2 Release v2.0.0 – Secure Lab
- [ ] 10.3 Lab Deployment Guide
- [ ] 10.4 Kubernetes / Docker Compose Production
- [ ] 10.5 Full Red / Blue Team Exercises

---

## 11. Appendix

- [ ] 11.1 API Reference & OpenAPI Docs
- [ ] 11.2 Environment Variables Cheat Sheet
- [ ] 11.3 Useful Exploit Scripts
- [ ] 11.4 Changelog & Versioning Notes
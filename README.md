# 🔥 VaporLab – Offensive API & AI Exploitation Battlefield

[![CI Build](https://github.com/NyxeraLabs/VaporLab/actions/workflows/dev.yml/badge.svg)](https://github.com/NyxeraLabs/VaporLab/actions/workflows/dev.yml)  
[![Lint & Build](https://github.com/NyxeraLabs/VaporLab/actions/workflows/lint-build.yml/badge.svg)](https://github.com/NyxeraLabs/VaporLab/actions/workflows/lint-build.yml)  
[![QA Pipeline](https://github.com/NyxeraLabs/VaporLab/actions/workflows/qa.yml/badge.svg)](https://github.com/NyxeraLabs/VaporLab/actions/workflows/qa.yml)  
[![Production Deployment](https://github.com/NyxeraLabs/VaporLab/actions/workflows/prod.yml/badge.svg)](https://github.com/NyxeraLabs/VaporLab/actions/workflows/prod.yml)  
[![Latest Release](https://img.shields.io/github/v/release/NyxeraLabs/VaporLab?label=Latest%20Release)](https://github.com/NyxeraLabs/VaporLab/releases/latest)  
[![Docker Pulls](https://img.shields.io/docker/pulls/nyxeralabs/vaporlab)](https://hub.docker.com/r/nyxeralabs/vaporlab)  
[![Security](https://img.shields.io/github/vulnerabilities/NyxeraLabs/VaporLab)](https://github.com/NyxeraLabs/VaporLab/security)  
[![License](https://img.shields.io/github/license/NyxeraLabs/VaporLab)](LICENSE)  

---

## ⚠️ Disclaimer

**VaporLab is intended solely for educational, research, and portfolio purposes.**  
It contains intentionally vulnerable APIs, business logic flaws, AI/ML attack surfaces, and exploit chains.  

**Never deploy in production with sensitive data.**  
NyxeraLabs is not responsible for misuse, unauthorized access, or any damage resulting from use. Use only in isolated, controlled environments.

---

## 🏗️ Overview

VaporLab is an **enterprise-grade offensive security playground** with:

- **OWASP API Top 10 2019 & 2023** coverage  
- **Broken authentication, IDOR/BOLA, mass assignment, SSRF, improper inventory**  
- **AI/ML RAG pipelines & vector DB exploitation**  
- **Exploit chaining (BOLA → Promote → Export, AI chaining)**  
- **Secure mode toggle** to compare vulnerable vs hardened setups  
- **Full CI/CD pipelines** with automated tagging, Docker builds, and production deployment  

---

## 📦 Installation

### Requirements

- Docker & Docker Compose  
- Git  
- Bash shell  

### Quick Start

```bash
# Clone repository
git clone https://github.com/NyxeraLabs/VaporLab.git
cd VaporLab

# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Access services (PostgreSQL, Redis, MinIO, Vector DB, API Gateway)
````

For QA environment:

```bash
docker-compose -f docker-compose.qa.yml up --build
```

For Production (requires host configuration):

```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 🧾 Usage

* Follow the **User Guide** for step-by-step lab usage: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
* Access **Manuals** for each service and vulnerability: [docs/manuals/INDEX.md](docs/manuals/INDEX.md)
* Track development logs and sprint notes: [docs/dev-logs/INDEX.md](docs/dev-logs/INDEX.md)

---

## 📚 Documentation

* [Architecture Overview](docs/ARCHITECTURE.md)
* [Roadmap & Phases](docs/ROADMAP.md)
* [Security Model](docs/SECURITY_MODEL.md)
* [Branching Strategy](docs/BRANCHING_STRATEGY.md)
* [Contributing Guide](docs/CONTRIBUTING.md)

---

## 🤝 Contributing

We welcome contributions for:

* New attack scenarios
* Exploit chains & AI/ML examples
* Documentation improvements

**Please follow the branching and commit standards defined in [BRANCHING_STRATEGY.md](docs/BRANCHING_STRATEGY.md) and [CONTRIBUTING.md](docs/CONTRIBUTING.md).**

---

## ⚖️ License

VaporLab is licensed under **Apache 2.0**. See [LICENSE](LICENSE) for full details.

---

## 🛡 Security

Report vulnerabilities or misconfigurations to the security team via GitHub [Security Tab](https://github.com/NyxeraLabs/VaporLab/security).

---

> 2026 © VaporLab by NyxeraLabs – All rights reserved

---
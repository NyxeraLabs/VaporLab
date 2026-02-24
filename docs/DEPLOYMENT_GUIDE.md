# Deployment Guide

## Development
```bash
docker-compose -f docker-compose.dev.yml up -d --build
```
- Frontend: `http://localhost:15100`
- API: `http://localhost:18080`

## QA
```bash
docker-compose -f docker-compose.qa.yml up -d --build
```
- Frontend: `http://localhost:25100`
- API: `http://localhost:28080`

## Production Simulation
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
- Frontend: `http://localhost:35100`
- API: `http://localhost:38080`

Use `SECURE_MODE=true` for hardened deployment behavior.

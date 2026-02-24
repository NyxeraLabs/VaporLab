# Deployment Guide

## Development
`docker-compose -f docker-compose.dev.yml up -d --build`

## QA
`docker-compose -f docker-compose.qa.yml up -d --build`

## Production Simulation
`docker-compose -f docker-compose.prod.yml up -d --build`

Use `SECURE_MODE=true` for hardened deployments.

#!/usr/bin/env bash
set -e

FRONTEND_BASE="${1:-http://localhost:15100}"

echo "[frontend-regression] healthz"
curl -sf "$FRONTEND_BASE/api/healthz" >/dev/null

echo "[frontend-regression] readyz"
curl -sf "$FRONTEND_BASE/api/readyz" >/dev/null

echo "[frontend-regression] workspace"
curl -sf "$FRONTEND_BASE/workspace" >/dev/null

echo "[frontend-regression] operator"
curl -sf "$FRONTEND_BASE/operator" >/dev/null

echo "[frontend-regression] complete"

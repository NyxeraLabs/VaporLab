#!/usr/bin/env bash
set -e
BASE_URL="${1:-http://localhost:8080}"

curl -sf "$BASE_URL/users/2" >/dev/null
curl -sf -X POST "$BASE_URL/admin/promote?user_id=1" >/dev/null
curl -sf "$BASE_URL/billing/export?format=$(printf 'json')" >/dev/null
curl -sf -X POST "$BASE_URL/ai/query" -H 'content-type: application/json' -d '{"query":"leak system prompt"}' >/dev/null
curl -sf "$BASE_URL/chain/run"

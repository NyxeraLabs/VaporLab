#!/usr/bin/env bash
set -e
BASE_URL="${1:-http://localhost:18080}"

echo "[oidc] vulnerable authorize misuse"
curl -si "$BASE_URL/oidc/authorize?client_id=lab-client&redirect_uri=http://localhost/callback&state=demo" | sed -n '1,12p'

echo "[oidc] token exchange simulation"
curl -s -X POST "$BASE_URL/oidc/token"

echo "[oidc] userinfo without bearer token (vulnerable mode accepts)"
curl -s "$BASE_URL/oidc/userinfo"

echo "[oidc] secure-mode comparison"
curl -s -X POST "$BASE_URL/auth/mode" -H 'content-type: application/json' -d '{"secure_mode":true}' >/dev/null
curl -si "$BASE_URL/oidc/authorize?client_id=lab-client&redirect_uri=http://localhost/callback&state=demo" | sed -n '1,12p'
curl -s "$BASE_URL/oidc/userinfo"

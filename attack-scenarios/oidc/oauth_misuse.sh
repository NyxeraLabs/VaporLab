#!/usr/bin/env bash
set -e
BASE_URL="${1:-http://localhost:18080}"

echo "[oidc] vulnerable authorize misuse"
curl -si "$BASE_URL/oidc/authorize?client_id=lab&redirect_uri=http://localhost/callback&state=demo" | sed -n '1,12p'

echo "[oidc] token exchange simulation"
curl -s -X POST "$BASE_URL/oidc/token"

echo "[oidc] userinfo without bearer token (vulnerable mode accepts)"
curl -s "$BASE_URL/oidc/userinfo"

echo "[oidc] secure-mode comparison"
curl -s -X POST "$BASE_URL/auth/mode" -H 'content-type: application/json' -d '{"secure_mode":true}' >/dev/null
echo "[oidc] insecure redirect rejected in secure mode"
curl -si "$BASE_URL/oidc/authorize?client_id=lab&redirect_uri=http://localhost/callback&state=demo&nonce=n1" | sed -n '1,12p'

echo "[oidc] secure authorize/token/userinfo flow"
headers="$(mktemp)"
trap 'rm -f "$headers"' EXIT
curl -s -D "$headers" -o /dev/null "$BASE_URL/oidc/authorize?client_id=lab&redirect_uri=https://app.vaporlab.local/callback&state=demo&nonce=n1"
location="$(awk 'BEGIN{IGNORECASE=1} /^location:/ {print $2}' "$headers" | tr -d '\r\n')"
code="$(printf '%s' "$location" | sed -n 's/.*[?&]code=\([^&]*\).*/\1/p')"
if [ -n "$code" ]; then
  token_json="$(curl -s -X POST "$BASE_URL/oidc/token" \
    -H 'content-type: application/x-www-form-urlencoded' \
    --data "grant_type=authorization_code&client_id=lab&client_secret=lab-secret&redirect_uri=https://app.vaporlab.local/callback&code=$code")"
  echo "$token_json"
  token="$(printf '%s' "$token_json" | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')"
  if [ -n "$token" ]; then
    curl -s "$BASE_URL/oidc/userinfo" -H "Authorization: Bearer $token"
  else
    echo '{"error":"missing access token from oidc/token"}'
  fi
else
  echo '{"error":"missing authorization code from /oidc/authorize"}'
fi

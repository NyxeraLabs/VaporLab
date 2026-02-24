#!/usr/bin/env bash
set -e
BASE_URL="${1:-http://localhost:8080}"

curl -i "$BASE_URL/oidc/authorize?client_id=lab-client&redirect_uri=http://localhost/callback&state=demo"

#!/usr/bin/env bash
set -e
BASE_URL="${1:-http://localhost:18080}"
CHAIN_OUT="${2:-/tmp/vaporlab_chain_output.json}"
BENCH_OUT="${3:-/tmp/vaporlab_benchmark.json}"
OIDC_OUT="${4:-/tmp/vaporlab_oidc_output.txt}"

attack-scenarios/chains/full_chain.sh "$BASE_URL" "$CHAIN_OUT" >/dev/null
attack-scenarios/oidc/oauth_misuse.sh "$BASE_URL" >"$OIDC_OUT"
scripts/score_attack.sh "$CHAIN_OUT" "$BENCH_OUT"

echo "[automation] chain_output=$CHAIN_OUT"
echo "[automation] benchmark_output=$BENCH_OUT"
echo "[automation] oidc_output=$OIDC_OUT"

#!/usr/bin/env bash
set -e
BASE_URL="${1:-http://localhost:18080}"

attack-scenarios/chains/full_chain.sh "$BASE_URL" >/tmp/vaporlab_chain_output.json
scripts/score_attack.sh /tmp/vaporlab_chain_output.json

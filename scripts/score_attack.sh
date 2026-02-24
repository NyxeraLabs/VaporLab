#!/usr/bin/env bash
set -e

INPUT="${1:-/tmp/vaporlab_chain_output.json}"
OUT="${2:-/tmp/vaporlab_benchmark.json}"

score=0
if rg -q "BOLA" "$INPUT"; then
  score=$((score + 25))
fi
if rg -q "Admin" "$INPUT"; then
  score=$((score + 25))
fi
if rg -q "Billing" "$INPUT"; then
  score=$((score + 25))
fi
if rg -q "AI" "$INPUT"; then
  score=$((score + 25))
fi

cat > "$OUT" <<JSON
{
  "input": "$INPUT",
  "score": $score,
  "max_score": 100,
  "status": "completed"
}
JSON

cat "$OUT"

#!/usr/bin/env bash
set -e

INPUT="${1:-/tmp/vaporlab_chain_output.json}"
OUT="${2:-/tmp/vaporlab_benchmark.json}"

score=0
bola=false
admin=false
billing=false
ai=false

if rg -q '"name":"BOLA","ok":true' "$INPUT"; then
  bola=true
  score=$((score + 25))
fi
if rg -q '"name":"Admin","ok":true' "$INPUT"; then
  admin=true
  score=$((score + 25))
fi
if rg -q '"name":"Billing","ok":true' "$INPUT"; then
  billing=true
  score=$((score + 25))
fi
if rg -q '"name":"AI","ok":true' "$INPUT"; then
  ai=true
  score=$((score + 25))
fi

status="completed"
if [ "$score" -lt 100 ]; then
  status="partial"
fi

cat > "$OUT" <<JSON
{
  "input": "$INPUT",
  "score": $score,
  "max_score": 100,
  "status": "$status",
  "benchmark": {
    "bola": $bola,
    "admin": $admin,
    "billing": $billing,
    "ai": $ai
  }
}
JSON

cat "$OUT"

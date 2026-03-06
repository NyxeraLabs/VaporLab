#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:38080}"
DURATION_MINUTES="${2:-60}"
INTERVAL_SECONDS="${3:-30}"
OUTPUT_LOG="${4:-/tmp/vaporlab_stability_soak.log}"

if [[ "$DURATION_MINUTES" -le 0 ]]; then
  echo "[soak] duration_minutes must be > 0" >&2
  exit 1
fi
if [[ "$INTERVAL_SECONDS" -le 0 ]]; then
  echo "[soak] interval_seconds must be > 0" >&2
  exit 1
fi

deadline=$(( $(date +%s) + (DURATION_MINUTES * 60) ))
failures=0
checks=0

mkdir -p "$(dirname "$OUTPUT_LOG")"
echo "[soak] start base_url=${BASE_URL} duration_min=${DURATION_MINUTES} interval_s=${INTERVAL_SECONDS}" | tee "$OUTPUT_LOG"

while [[ "$(date +%s)" -lt "$deadline" ]]; do
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  health_code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/healthz" || true)"
  ready_code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/readyz" || true)"
  metrics_code="$(curl -s -o /dev/null -w '%{http_code}' "${BASE_URL}/metrics" || true)"
  checks=$((checks + 1))
  status="ok"
  if [[ "$health_code" != "200" || "$ready_code" != "200" || "$metrics_code" != "200" ]]; then
    failures=$((failures + 1))
    status="fail"
  fi
  echo "${ts} status=${status} health=${health_code} ready=${ready_code} metrics=${metrics_code}" | tee -a "$OUTPUT_LOG"
  sleep "$INTERVAL_SECONDS"
done

echo "[soak] complete checks=${checks} failures=${failures} log=${OUTPUT_LOG}" | tee -a "$OUTPUT_LOG"

if [[ "$failures" -gt 0 ]]; then
  exit 2
fi

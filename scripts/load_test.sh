#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:38080}"
TOTAL_REQUESTS="${2:-500}"
CONCURRENCY="${3:-25}"
TARGET_PATH="${4:-/ai/query}"

if [[ "$TOTAL_REQUESTS" -le 0 ]]; then
  echo "[load] total requests must be > 0" >&2
  exit 1
fi
if [[ "$CONCURRENCY" -le 0 ]]; then
  echo "[load] concurrency must be > 0" >&2
  exit 1
fi

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

req() {
  local idx="$1"
  local code
  code="$(curl -s -o "$tmpdir/$idx.body" -w '%{http_code}' \
    -X POST "${BASE_URL}${TARGET_PATH}" \
    -H 'content-type: application/json' \
    -d '{"query":"load-test-status"}' || true)"
  echo "$code" >"$tmpdir/$idx.code"
}

export BASE_URL TARGET_PATH tmpdir
export -f req

echo "[load] base_url=${BASE_URL} target=${TARGET_PATH} total=${TOTAL_REQUESTS} concurrency=${CONCURRENCY}"
start_ts="$(date +%s)"
seq 1 "$TOTAL_REQUESTS" | xargs -I{} -P "$CONCURRENCY" bash -c 'req "$@"' _ {}
end_ts="$(date +%s)"

total=0
ok=0
rate_limited=0
server_err=0
other=0

while IFS= read -r file; do
  code="$(cat "$file")"
  total=$((total + 1))
  case "$code" in
    200) ok=$((ok + 1)) ;;
    429) rate_limited=$((rate_limited + 1)) ;;
    5*) server_err=$((server_err + 1)) ;;
    *) other=$((other + 1)) ;;
  esac
done < <(find "$tmpdir" -name '*.code' -type f | sort)

duration=$((end_ts - start_ts))
if [[ "$duration" -lt 1 ]]; then
  duration=1
fi
rps=$((total / duration))

echo "[load] complete"
echo "[load] duration_s=$duration rps=$rps total=$total ok=$ok rate_limited=$rate_limited server_err=$server_err other=$other"

if [[ "$server_err" -gt 0 || "$other" -gt 0 ]]; then
  echo "[load] failing due to unexpected status distribution" >&2
  exit 2
fi

if [[ "$ok" -eq 0 && "$rate_limited" -eq 0 ]]; then
  echo "[load] no successful or rate-limited responses observed" >&2
  exit 2
fi

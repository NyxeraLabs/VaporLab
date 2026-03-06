#!/usr/bin/env bash
set -euo pipefail

IMAGE_REF="${1:-vaporlab-api:local}"
OUTPUT_FILE="${2:-dist/sbom.spdx.json}"

mkdir -p "$(dirname "$OUTPUT_FILE")"

if command -v syft >/dev/null 2>&1; then
  echo "[sbom] using syft for $IMAGE_REF"
  syft "$IMAGE_REF" -o spdx-json >"$OUTPUT_FILE"
elif docker sbom --help >/dev/null 2>&1; then
  echo "[sbom] using docker sbom for $IMAGE_REF"
  docker sbom "$IMAGE_REF" --format spdx-json >"$OUTPUT_FILE"
else
  echo "[sbom] no supported sbom tool found (requires syft or docker sbom)" >&2
  exit 1
fi

echo "[sbom] written: $OUTPUT_FILE"

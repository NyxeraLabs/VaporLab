#!/usr/bin/env bash
set -e

STATUS="${1:-pass}"
NOTE="${2:-qa run completed}"
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

printf "\n- %s | status=%s | note=%s\n" "$TS" "$STATUS" "$NOTE" >> docs/QA_RUNBOOK.md

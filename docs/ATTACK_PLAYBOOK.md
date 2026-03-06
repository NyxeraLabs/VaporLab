# Attack Playbook

## Automation Entry Points
- Full chain scenario: `attack-scenarios/chains/full_chain.sh`
- Automation harness: `attack-scenarios/chains/automation_harness.sh`
- OIDC/OAuth misuse scenario: `attack-scenarios/oidc/oauth_misuse.sh`
- Scoring engine: `scripts/score_attack.sh`

## Full Chain Stages
1. Enumerate exposed users endpoint (`/users`).
2. Exploit BOLA (`/users/2`).
3. Promote via admin endpoint (`/admin/promote`).
4. Trigger billing export (`/billing/export`).
5. Abuse AI query + chain summary (`/ai/query`, `/ai/chain/run`).

## One-Command Automation
```bash
attack-scenarios/chains/automation_harness.sh http://localhost:18080 \
  /tmp/vaporlab_chain_output.json \
  /tmp/vaporlab_benchmark.json \
  /tmp/vaporlab_oidc_output.txt
```

Outputs:
- `/tmp/vaporlab_chain_output.json`: stage-by-stage chain results
- `/tmp/vaporlab_benchmark.json`: benchmark score output
- `/tmp/vaporlab_oidc_output.txt`: OIDC/OAuth misuse transcript

# Scoring Methodology

VaporLab scoring evaluates exploit chain completion.

- BOLA stage: 25 points
- Admin escalation stage: 25 points
- Billing abuse stage: 25 points
- AI exploitation stage: 25 points

## Scoring Engine
Use `scripts/score_attack.sh <chain-output-json> <benchmark-output-json>`.

Default example:
```bash
scripts/score_attack.sh /tmp/vaporlab_chain_output.json /tmp/vaporlab_benchmark.json
```

## Benchmark Output
The benchmark JSON includes:
- total score (`0-100`)
- status (`completed` or `partial`)
- per-stage booleans (`bola`, `admin`, `billing`, `ai`)

## Reference Workflow
```bash
attack-scenarios/chains/full_chain.sh http://localhost:18080 /tmp/vaporlab_chain_output.json
scripts/score_attack.sh /tmp/vaporlab_chain_output.json /tmp/vaporlab_benchmark.json
cat /tmp/vaporlab_benchmark.json
```

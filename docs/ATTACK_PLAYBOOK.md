# Attack Playbook

## Full Chain
1. Enumerate exposed users endpoint (`/users`).
2. Exploit BOLA (`/users/2`).
3. Promote via admin endpoint (`/admin/promote`).
4. Trigger billing export (`/billing/export`).
5. Abuse AI query surface (`/ai/query`).

Run automated chain:
`attack-scenarios/chains/full_chain.sh http://localhost:18080`

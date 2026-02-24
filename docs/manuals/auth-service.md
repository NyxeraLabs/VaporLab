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

## Endpoint: POST /auth/jwt/validate

Validates a provided JWT token.

### Request
```json
{
  "token": "<header.payload.signature>"
}
```

### Vulnerable mode behavior
- Signature validation is intentionally skipped.
- Tampered signature tokens are accepted if payload is parseable.

### Secure mode behavior
- HMAC SHA256 signature must match configured secret.
- Invalid signatures return `401`.

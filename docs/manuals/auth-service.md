# Auth Service Manual

## Endpoints
- `POST /auth/jwt/issue`
- `POST /auth/jwt/validate`
- `POST /auth/refresh`
- `GET /auth/config`
- `GET|POST /auth/mode`
- `GET /oidc/authorize`
- `POST /oidc/token`
- `GET /oidc/userinfo`

## JWT Issuing
Request:
```json
{"user_id":"42","alg":"HS256|none"}
```

Behavior:
- Vulnerable mode: supports `HS256` and `alg=none`.
- Secure mode: rejects `alg=none`.

## JWT Validation
Request:
```json
{"token":"<header.payload.signature>"}
```

Behavior:
- Vulnerable mode: skips signature and expiration checks.
- Secure mode: enforces HMAC signature and expiration.

## Weak Secret Configuration
- `JWT_SECRET` defaults to `weaksecret` if unset.
- `GET /auth/config` reports `weak_secret=true|false`.
- Vulnerable mode additionally exposes configured `jwt_secret` in response.

## Refresh Tokens
- `POST /auth/refresh` accepts `refresh_token`.
- Vulnerable mode allows replay of refresh token.
- Secure mode blocks replay with `401`.

## Secure Mode Toggle
- `GET /auth/mode` returns runtime mode.
- `POST /auth/mode` with `{"secure_mode":true|false}` toggles mode in-memory.

## OIDC and Vulnerable OAuth Flow
- `GET /oidc/authorize` returns authorization code.
- Vulnerable mode allows insecure `http://` redirect URIs and leaks `state` + `code`.
- Secure mode requires `https://` redirect URI.
- `POST /oidc/token` and `GET /oidc/userinfo` expose simplified OIDC token/userinfo responses.

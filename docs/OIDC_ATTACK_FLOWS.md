# OIDC OAuth Attack Flows

## Redirect URI Abuse
In vulnerable mode, `/oidc/authorize` accepts insecure redirect URIs and can leak authorization codes.

## Token Flow
`/oidc/token` and `/oidc/userinfo` demonstrate permissive behavior in vulnerable mode and stricter checks in secure mode.

## Reproduction Script
```bash
attack-scenarios/oidc/oauth_misuse.sh http://localhost:18080
```

Script behavior:
1. Calls vulnerable `/oidc/authorize` with insecure `http://` redirect URI.
2. Calls `/oidc/token` to demonstrate token issuance path.
3. Calls `/oidc/userinfo` without bearer token (accepted in vulnerable mode).
4. Toggles secure mode and repeats authorize/userinfo checks to show enforcement.

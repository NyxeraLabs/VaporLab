# OIDC OAuth Attack Flows

## Redirect URI Abuse
In vulnerable mode, `/oidc/authorize` accepts insecure redirect URIs and can leak authorization codes.

## Token Flow
`/oidc/token` and `/oidc/userinfo` demonstrate permissive behavior in vulnerable mode and stricter checks in secure mode.

Reproduce with:
`attack-scenarios/oidc/oauth_misuse.sh http://localhost:8080`

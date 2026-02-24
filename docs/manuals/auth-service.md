# Auth Service Manual

Endpoints: `/auth/jwt/issue`, `/auth/refresh`, `/oidc/authorize`, `/oidc/token`, `/oidc/userinfo`.

Vulnerable mode supports weak JWT secret and permissive token behavior. Secure mode enforces redirect and token checks.

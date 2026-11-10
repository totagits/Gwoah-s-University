# HIAU Website Media Administrator — Secure Session Rollout

This implementation is deliberately scoped to the **public website media library only**. The separate student, lecturer, registrar, finance, payroll, and broader ERP APIs remain blocked by the existing security hold.

## Configuration on the server
Set secrets in the deployment's protected environment variables, not in GitHub:
- `HIAU_MEDIA_ADMIN_EMAIL`: institutional administrator email
- `HIAU_MEDIA_ADMIN_PASSWORD_HASH`: `<salt-hex>:<scrypt-hash-hex>`

Generate a strong independent password privately and derive the hash **on the server** (Node.js). Example, with password supplied via a hidden local prompt or secret manager rather than a checked-in script:

```js
const { randomBytes, scryptSync } = require('node:crypto');
const password = process.env.HIAU_NEW_MEDIA_PASSWORD;
if (!password || password.length < 16) throw new Error('Supply a strong password through a temporary secret environment variable');
const salt = randomBytes(16).toString('hex');
console.log(salt + ':' + scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex'));
```

Remove the temporary plaintext password variable after generating the hash. **Never share either password or hash in chat or source control.** Without both server variables set, sign-in fails closed.

## Server protections implemented
- No demo role login, superadmin fallback, or passwordless credentials
- Scrypt-derived password verification against server-provided hash
- In-memory eight-hour server sessions with unpredictable HttpOnly, SameSite=Strict cookies; Secure cookies in production
- CSRF token per session, checked alongside same-origin validation on write operations
- Basic IP-based login throttling; restrict deployment to HTTPS in production
- The media admin routes are authorized server-side before the fail-closed ERP API middleware
- Anonymous or invalid-session requests cannot access the private media list or change videos

## Known limitations before deployment
- In-memory sessions are lost on restart and do not synchronize across multiple replicas; replace with a shared persistent session store and deliberate session revocation before scaling
- IP-based throttling is per-process; use an edge rate limiter or central store for distributed deployments
- A single environment-configured media admin is a foundation, not a complete multi-user institutional identity solution; implement account-level user directory and MFA later
- Validate `Origin`/Host behavior behind the real TLS proxy and enable trusted proxy settings only for validated proxies
- The current MP4 header check is not sufficient media safety validation; add transcoding, malware checks, persistent object storage and quotas
- Separate ERP modules, teacher, staff, student and finance permissions are NOT activated
- Run builds, tests, secure-cookie session tests, CSRF negative tests, unauthorized upload attempts, portal tests, and deployment smoke tests before merging

## Targeted manual test cases
1. Without environment credentials, `POST /api/auth/login` must return 401; no demo access.
2. With valid email and password, login returns a CSRF token and sets an HttpOnly cookie.
3. `GET /api/auth/session` succeeds with cookie and fails without.
4. Admin video endpoints return 401 without cookie, 403 on missing/incorrect CSRF for mutations.
5. Admin video endpoints accept authorized cookie + matching CSRF after configuration.
6. All unrelated ERP routes continue to return 503.
7. Session logout invalidates the cookie and session; subsequent media edits fail.
8. After eight hours or restart, the session must be renewed.

**Not merged, not deployed.** No automated build or runtime integration tests have been performed in this chat.

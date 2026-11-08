# HIAU — Coolify staging deployment

Institution: **Harvest Intercontinental American University (HIAU)**.

- Intended repository after owner renames it: `totagits/Harvest-Intercontinental-American-University`.
- Existing branch: `staging` (do not overwrite or recreate).
- Staging URL: **https://hiau-staging.totag.network**
- Production URL (separate deployment): **https://hiau.totag.network**
- Existing legacy address: `gwoahuniversity.totag.network`. Do not remove or redirect it until the old deployment's data and dependencies are reviewed.

## Prepare DNS and separate Coolify resource

1. In Hostinger DNS for `totag.network`, create an A record named `hiau-staging` pointing to the VPS public IPv4. Create another A record `hiau` for production once ready. Check for conflicting records.
2. In Coolify, create **a new staging application** connected to the renamed GitHub repository and its `staging` branch. Do not repoint or overwrite the old Gwoah's University service.
3. Use the tracked Dockerfile, internal port **3000**, a single replica, and `NODE_ENV=production`.
4. Set `APP_URL=https://hiau-staging.totag.network`; add the staging hostname to Coolify's domain configuration and enable HTTPS. Test /api/health and an unauthenticated homepage visit.
5. Configure a **new staging-only persistent volume** mounted at `/app/runtime-data`. The application uses SQLite files at this stage, not PostgreSQL. Do **not** mount a production or legacy volume into staging.
6. Reconfigure and verify GitHub webhook and Google AI Studio Git remote after the repository rename. Run build, tests and role-based acceptance tests before publicizing the link.
7. Keep staging access restricted to authorized testers, with test accounts and synthetic institutional records only. Do not copy real student or financial records.

## Existing operational implementation

The tracked staging Dockerfile and 0.4 release use `DATA_DIR=/app/runtime-data` and SQLite persistence, including `identity.sqlite` and `operations.sqlite`. This is a separate existing staging implementation, not the JSON-backed `main` application. An earlier release configured `INITIAL_ADMIN_EMAIL=info@totaggroup.com` and `INITIAL_ADMIN_TOKEN_HASH`; preserve those secrets **in the old service only**, and use separate secret values for the new staging application. Never commit activation tokens or credentials.

Prior clean-start migration archives old JSON on an **existing persistent volume**. Do not reuse that volume for HIAU staging without explicit data-migration approval. The configured `/api/health` endpoint previously reported version 0.4.0 and schemaVersion 1; independently verify the new deployment.

## Provider configuration

Keep SMTP or Resend, object-storage backups, Gemini, and CalDAV credentials in Coolify secrets rather than Git; only label a provider connected after a successful test. Review and validate each provider before enabling it.

## Production promotion gates

Keep production and staging isolated, with separate runtime volumes, environment variables, sessions, credentials and deployment hooks. Audit authentication, RBAC, migrations and backups. Confirm SSL, monitoring, logging, recovery rehearsal and end-to-end acceptance before promoting reviewed changes through a staging-to-main pull request.

**Status:** These are deployment instructions committed to GitHub; DNS/Coolify changes require separate execution and verification. No live deployment is implied.

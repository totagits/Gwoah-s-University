# Coolify staging deployment

Repository: totagits/Gwoah-s-University, branch staging. Main remains unchanged.
Domain: https://gwoahuniversity.totag.network

Use the tracked Dockerfile, port 3000, NODE_ENV=production, one replica and the existing named persistent volume mounted at /app/runtime-data. DATA_DIR defaults to this location. /api/health reports version 0.4.0 and schemaVersion 1. Production sessions require HTTPS; APP_URL must match the public origin.

Preserve INITIAL_ADMIN_EMAIL=info@totaggroup.com and INITIAL_ADMIN_TOKEN_HASH. The existing activation link was delivered in a user-authorized private local file; never commit the raw token. Preserve identity.sqlite and all active account credentials.

The clean-start migration archives legacy JSON unchanged before excluding old operational samples. It preserves activated accounts and pending invitations. New operational data lives in operations.sqlite with foreign keys and transactions. See STAGING_FEATURES.md for acceptance steps, availability and remaining production gates. Rollback to the prior application version does not carry new relational writes into old JSON; preserve the full volume and plan data-aware rollback.

## Provider connections

Store all credentials in Coolify, never in Git. Account & integrations shows configuration presence only.

- Email: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM (TLS), or RESEND_API_KEY and MAIL_FROM.
- Encrypted off-site backups: S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY; optional HTTPS S3_ENDPOINT and S3_KMS_KEY_ID. Preserve the encrypted-backups encryption key separately for recovery.
- AI: GEMINI_API_KEY, GEMINI_MODEL. Human review is required before publishing translations.
- CalDAV: CALDAV_URL, CALDAV_USERNAME, CALDAV_PASSWORD. Campus booking screens are pending reconnection.

No provider credentials were found during the earlier Coolify review. Do not label integrations connected until a real connection test succeeds. No hourly billing reminder service is mounted in the clean operational bootstrap. Legacy campus webhook endpoints are also unmounted pending reconnection.

Back up the complete persistent volume consistently. In-app encrypted operational snapshots include normalized workflow tables but do not back up identity credentials, all platform settings or encryption keys. Rehearse full recovery before production use.

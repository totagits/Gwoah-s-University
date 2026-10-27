# Coolify staging deployment

Repository: `totagits/Gwoah-s-University` · branch: `staging` · requested domain: `https://gwoahuniversity.totag.network`.

Use the tracked Dockerfile, container port 3000, dynamic site. It builds the React assets and runs the Express API with `NODE_ENV=production`. Mount the named staging volume at `/app/runtime-data`. The container runs as the `node` user. The health endpoint is `/api/health`.

Preserve the existing Coolify HTTP Basic Authentication gate. The ERP now enforces account activation, password sessions and server-side permissions. Demo role switching and public administrator shortcuts have been removed. Continue using fictional data until provider configuration, institutional records, and operational policies have been reviewed. Protect snapshots and documents with the same access gate. Use one application replica; the file database is not safe for horizontally scaled writes. Establish an authenticated production identity/authorization layer and a transactional database before operational use.

The existing `main` branch is not changed. Rollback can select the previous Coolify deployment or branch. Keep runtime-data snapshots before any migration. New persistent staging storage starts with the repository's sample records; legacy container-local data is not migrated automatically.

## Optional environment settings

- `DATA_DIR=/app/runtime-data` (Docker default)
- `ATTENDANCE_SECRET`: persistent server-only random secret for lecture QR integrity
- `RESEND_API_KEY`, `BILLING_FROM`: email provider key and verified sender
- `BILLING_ENABLED=true`: enables hourly reminder runs; default disabled
- `TUITION_DUE_DATE`: ISO payment deadline; no deadline means no email reminder
- `BACKUP_WEBHOOK_URL`, `BACKUP_WEBHOOK_TOKEN`: authenticated HTTPS cloud storage adapter; returns 2xx after storage
- `LECTURE_CAPTURE_TOKEN`: bearer token for `POST /api/campus/integrations/lecture-capture`
- `OCCUPANCY_FEED_TOKEN`: bearer token for `POST /api/campus/integrations/occupancy`
- `GEMINI_API_KEY`, `GEMINI_MODEL`: configured AI PDF metadata provider and available model

Store credentials in Coolify environment variables, never in Git. Do not enable external delivery against fictional sample addresses. University-reviewed language packs, complete NCHE standards, accurate campus maps, and historical student outcomes are not included.

## Integration payloads

Lecture webhook: `{ "sourceId": "provider-recording-id", "title": "Lecture title", "course": "CSC 301", "url": "https://provider.example/recording", "annotations": "Optional notes" }`. Repeated source IDs are idempotent. A room whiteboard matching the course code is archived with the recording.

Occupancy webhook: `{ "building": "library", "occupied": 42 }`. Building IDs currently include library, science, student-centre and administration. Counts must be whole numbers within building capacity.

The cloud backup webhook receives `{ university, campus, createdAt }`. Only configure an approved institutional storage adapter. A local snapshot remains available if the remote upload fails.

## Secured release configuration

The first administrator is info@totaggroup.com. INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_TOKEN_HASH are configured in Coolify; the raw one-time activation link is supplied separately in a user-authorized private local file and is never committed. Do not put a password in Git. Pending seed accounts cannot sign in until explicitly invited and activated.

The origin defaults to https://gwoahuniversity.totag.network; set APP_URL if deploying under a different primary origin. Production cookies require HTTPS. Identity and platform state use SQLite files on the persistent data volume; university/campus operational records remain in atomic JSON documents and require a single application replica. The deployment is not a normalized multi-tenant student information system.

Account & integrations reports configuration presence without exposing values. Connect SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and MAIL_FROM, or RESEND_API_KEY plus MAIL_FROM. SMTP requires TLS. BILLING_ENABLED and TUITION_DUE_DATE govern actual reminder delivery. Never enable delivery against fictional addresses.

Encrypted S3 backups use S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY; use S3_ENDPOINT for an HTTPS R2/MinIO-compatible endpoint. Optional S3_KMS_KEY_ID enables provider KMS wrapping. Local and uploaded snapshots contain AES-256-GCM ciphertext. Preserve the installation encryption key from the encrypted-backups directory through an approved separate recovery process. Operational restore preserves current identity accounts; disaster recovery must separately protect identity.sqlite, platform.sqlite and the full persistent volume.

CalDAV requires CALDAV_URL pointing to an organizational calendar collection, CALDAV_USERNAME and CALDAV_PASSWORD. Availability reports return busy intervals only; booking publication uses generic appointment titles. Personal Google/Microsoft OAuth calendar connections are not implemented.

ACCESS_CONTROL_TOKEN authenticates student-ID verification at POST /api/campus/integrations/student-id. Send token plus purpose (library, meal or event). Signed student codes expire after 15 minutes. Hardware integration is not connected.

Web Push VAPID keys are generated and persisted automatically. Each user opts in from Account & integrations. Push messages contain no student details. Actual browser delivery must be verified from a subscribed device.

Language packs require reviewer identification and complete catalog entries before publication. Kpelle, Bassa, Vai, Grebo, Kru and Mandingo content is not fabricated; fluent review/import is still needed. AI translation drafts require GEMINI_API_KEY and GEMINI_MODEL and remain unpublished until reviewed. Uncataloged legacy text falls back to English.

Historical prediction requires a CSV with studentId, cohort, priorGpa, attendance, recentAverage, scoreTrend, missingAssignments and needsSupport. The last column is omitted for current-cohort prediction input. Use only features measured before the labeled outcome. Training requires at least 60 records, two cohorts, at least 40 training and 10 holdout records, and five examples of each class in each split. Newest-cohort students are excluded from training. The model supports advisor conversations only. No real model or historical data is shipped.

# Coolify staging deployment

Repository: `totagits/Gwoah-s-University` · branch: `staging` · requested domain: `https://gwoahuniversity.totag.network`.

Use the tracked Dockerfile, container port 3000, dynamic site. It builds the React assets and runs the Express API with `NODE_ENV=production`. Mount the named staging volume at `/app/runtime-data`. The container runs as the `node` user. The health endpoint is `/api/health`.

Preserve the existing Coolify HTTP Basic Authentication gate. The ERP itself still has demo role switching and must not receive real student data. Protect snapshots and documents with the same access gate. Use one application replica; the file database is not safe for horizontally scaled writes. Establish an authenticated production identity/authorization layer and a transactional database before operational use.

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

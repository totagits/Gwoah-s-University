# HIAU dynamic public video library — development release gate

## Functionality in draft branch
- Bundled campus and classroom MP4 videos are preserved as initial library records.
- Administrators can create arbitrary new draft video records and upload or replace their MP4 files.
- Edit titles, descriptions, category and local poster image paths.
- Publish or unpublish; mark featured videos for the public homepage.
- Reorder videos and remove library entries without deleting referenced media files.
- Homepage carousel renders all published, featured records in saved order.
- The public video-tour section can display all published records. Empty states are supported.
- `GET /api/public-media/videos` returns only published videos.

## Draft endpoints — not yet callable
`GET /api/admin/public-media/videos` (admin list)
`POST /api/admin/public-media/videos` (create draft)
`PATCH /api/admin/public-media/videos/:id` (edit metadata/status)
`POST /api/admin/public-media/videos/reorder` (order)
`DELETE /api/admin/public-media/videos/:id` (remove entry only)
`POST /api/admin/public-media/videos/:id/upload` (raw MP4, 50 MB maximum)

**Important:** The existing fail-closed middleware currently returns HTTP 503 for every administrator route. Do not remove it without a fully verified secure server session and role-based authorization implementation. The frontend role label alone is not authorization.

## Production blockers
1. Complete password-based or OIDC institutional authentication with server-enforced administrator permissions and CSRF protection.
2. Configure durable backed-up media storage. Current JSON registry and MP4 uploads are stored under `data/` on the app filesystem; container redeployment could erase them.
3. Verify uploaded media types beyond the MP4 `ftyp` header, scan files, transcode to streaming-friendly formats, generate thumbnails, and set per-upload quotas. The 50 MB cap is per file; not a library-wide storage policy.
4. Add tests for creating >2 videos, draft isolation, featured ordering, publication toggles, deletion, replacement, no published videos, anonymous denial and server restart persistence.
5. Verify public video performance under low bandwidth and confirm all recorded media has publishing rights.
6. Run TypeScript checks, build and deployment smoke testing. **These have not been run in this chat.**

This branch is based on the separate security work in PR #36 and is represented in draft PR #37. Neither is approved for merge or production deployment.

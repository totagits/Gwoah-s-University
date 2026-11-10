# HIAU Public Video Management — Implementation & Release Gate

## Scope
The existing campus and classroom MP4 videos remain the defaults. The public hero and virtual-tour carousel read these two video slots from `GET /api/public-media/videos`, falling back to the bundled files when unavailable.

The super-administrator ERP dashboard includes a video management interface for:
- Editing title, subtitle and poster path;
- Previewing the existing MP4;
- Uploading a replacement MP4 up to 50 MiB.

The server has placeholder management routes:
- `PATCH /api/admin/public-media/videos/:id`
- `POST /api/admin/public-media/videos/:id/upload` with `Content-Type: video/mp4` and raw MP4 body.

**These routes deliberately remain unavailable:** the earlier security-hold middleware returns HTTP 503, because the university ERP has no validated session or RBAC implementation. Do not weaken or bypass the hold to make uploads work.

## Deployment prerequisites
1. Implement verified user credentials, secure session cookies, CSRF protections, rate limiting and audited role-based authorization on the server.
2. Restrict both media management endpoints to authorized website content administrators, independent of the frontend display.
3. Persist `data/public-videos.json` and `data/public-media-uploads/` to a durable, backed-up volume on the actual hosting platform. The application currently writes to the local filesystem and files may disappear after redeploying ephemeral containers.
4. Add production media processing: verify actual MP4 structure, scan uploads, generate poster images, limit dimensions/duration, and remove unreferenced uploads safely. Current `ftyp` signature checking is not sufficient production validation.
5. Add test coverage for anonymous denial, authorized upload/replace, oversize rejection, invalid metadata, persistence across restart, video fallback, and carousel playback on mobile and desktop.
6. Confirm applicable university identity/accreditation claims and media publication rights before public release.

## Manual acceptance sequence
1. Public homepage loads with both default videos even if the media API is offline.
2. Public virtual tour matches the homepage's selected campus/classroom video files.
3. Anonymous PATCH and upload requests fail while the security hold is in place.
4. After real auth is implemented, an authorized content administrator can replace a video without editing code.
5. Reloaded public pages display the replacement; both MP4 and poster assets survive an app restart/redeploy.
6. Nonadministrators cannot read restricted student data, access upload controls, or mutate media.

This work is a **draft integration milestone**, not an approved production release.

# HIAU Website Media — Hostinger/Coolify Release Checklist

This is a deployment runbook, **not an instruction to deploy automatically**. Current GitHub changes are draft PRs #36, #37 and #38. Do not merge until the release blockers and backup plan have been resolved.

## Required persistent volume

The app now supports `HIAU_DATA_DIR` for its stored records and uploaded videos.

For a Coolify deployment using a Docker-style persistent directory mount:
- Mount a writable, persistent volume on the application container at a selected path, for example `/app/persistent-data`.
- Set `HIAU_DATA_DIR=/app/persistent-data` in the application environment.
- Confirm the application user can write to that path.
- The directory contains `university-db.json`, `public-videos.json`, and `public-media-uploads/`.

**Caution:** `university-db.json` is still demonstration data. Do not migrate, overwrite or expose real student or university financial records using this prototype.

The actual Coolify application mount path, runtime user, deployment type (Dockerfile/Nixpacks/other), and rollback/backups must be verified from the connected hosting configuration before any production change.

## Administrator credentials
- `HIAU_MEDIA_ADMIN_EMAIL` — approved site administrator email.
- `HIAU_MEDIA_ADMIN_PASSWORD_HASH` — scrypt salt:hash created via the documented local procedure in `docs/media-admin-authentication.md`.
- Set them as secrets in the hosting dashboard; never put plaintext credentials or hashes into GitHub source or user-visible documentation.
- Ensure HTTPS is active and the original Host header is preserved through the proxy.

## Rollback and acceptance
1. Make an off-host backup of existing persistent application records and uploads.
2. Deploy to a dedicated staging application **without changing the live service**.
3. Verify a clean visitor can browse the public website and see exactly the currently published videos.
4. Confirm anonymous write attempts return HTTP 401; invalid CSRF returns HTTP 403.
5. As the designated test administrator, create a draft, upload a small test MP4, publish it, feature it, reorder it and remove it.
6. Restart staging; verify both `public-videos.json` and MP4 bytes survive.
7. Validate mobile browser video behavior on low-bandwidth networks and inspect proxy upload-size limits.
8. Verify unrelated ERP modules are still inaccessible.
9. Only then prepare an approved production release, monitoring, rollback and storage quota.

## Evidence from repository CI
GitHub Actions run #28, commit `a673adf92d27a4be1ace59d893349b05d155103f`:
- TypeScript check passed
- 28 automated tests passed (security, real Express API integration, MP4 container screening, and public video behavior)
- Vite build passed

There are still non-fatal Vite configuration/bundle-size warnings; production performance needs a separate pass.

## Security and durability remaining
- In-memory sessions and rate limits are single-process. A shared session store and perimeter-level throttling are required for horizontally scaled production.
- Media upload verification checks basic ISO BMFF box structure, but this does not prove a playable video or replace codec inspection, malware checks, transcoding/poster generation, and capacity limits.
- App-local synchronous JSON writes are suitable for a prototype, not concurrent multi-instance writes; a database/object storage layer is required for larger deployments.
- No live Hostinger deployment or browser acceptance was performed by these repository tests.

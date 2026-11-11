# WEB-08 — HIAU CMS acceptance and institutional-content verification

**Status:** Code verification in GitHub only. Live Coolify deployment, user-session testing, mobile acceptance, and real institutional fact verification remain open until evidenced.

## Environment and persistence gate
- HIAU staging application: `https://hiau-staging.totag.network`.
- Dockerfile sets `DATA_DIR=/app/runtime-data`. Database records use `/app/runtime-data/operations.sqlite` and `/app/runtime-data/identity.sqlite`. Site video files, campus photos, staff media and uploads are stored below `DATA_DIR`.
- **Required in Coolify:** attach a persistent named volume or bind mount whose **container destination is `/app/runtime-data`**. Do not rely on writable container layers or the Dockerfile directory as a backup.
- Before any live content entry, confirm the volume is attached to the **staging app**, writable by the application `node` user, and included in a backup and recovery plan.
- Acceptance test: create an unpublished CMS draft, upload a non-sensitive test photo, complete an approved news event, restart the Coolify service, then **redeploy a new image**. Verify draft, published content, audit history, uploaded media and accounts survive both operations.
- Confirm SQLite WAL sidecars (`-wal`, `-shm`) remain on the same volume; perform a safe backup/checkpoint procedure. Keep separate staging and production volumes.

## Permissions and publication gate
- Only super administrator may invite/assign **website_editor** and **website_reviewer**. Editors can author drafts, but cannot verify, publish, unpublish, archive or access ERP APIs. Reviewers can approve and publish, but cannot edit draft body, access ERP, or administer other website media consoles. Super administrator retains authority.
- Test with three separate active user sessions: editor, reviewer, anonymous visitor. Confirm a draft marked “verified” by an editor remains unapproved server-side.
- Confirm anonymous `/api/public/site-content` and `/api/public/news-events` do not expose drafts, reviewer comments, credentials or private staff records.
- Verify same-origin/CSRF protections on state-changing routes. Attempt unauthorized direct API calls, not merely sidebar clicks.
- Verify editing previously published text leaves the old text visible until the new draft is reviewed and published. Check revision conflict handling, restoration, unpublish and archive.

## Scheduled publication gate
- Schedule an approved sample CMS item and a news event for a time in the future. Confirm it is **not** publicly visible early; after the due time, make a public request and confirm the correct version appears. Confirm schedule survives a restart.
- **Implementation detail:** release is activated on the first public content API request at or after the scheduled UTC time. This is durable across restarts but not a guaranteed push at the exact second if there is no web traffic; add an external scheduler only if strict-time publication is required.
- If a second published CMS item already occupies an existing page field, scheduling and due-time activation must not silently overwrite the competing item.

## Desktop, mobile and accessibility gate
- Desktop widths 1280+, tablet ~768 and phones ~375 px: About mega-menu, nested mobile menu, Campus Tour, Academics and new content blocks.
- Keyboard navigation, Escape dismissals, visible focus, legible text and media controls.
- Navigate the public **Explore academic colleges** link as an anonymous visitor. It must never open an administrator/ERP sign-in. Confirm degree cards for each of the 19 degrees open public pages.
- Super admin, editor and reviewer: save, approve, publish, unpublish and schedule on desktop and mobile; all restricted controls absent or disabled for unauthorized accounts.

## Institutional facts and remaining content migration
**Unverified in code is not verified by HIAU.** Obtain university-approved evidence for:
- `src/components/public/PublicVirtualTour.tsx`: phrases claiming “authentic” campus footage, specific room number, library/laboratories, Starlink and solar backups, “NCHE Chartered,” and operational capabilities.
- `src/components/public/PublicCalendar.tsx`: the hard-coded 2026/2027 semester dates, “Senate Approved” banner, and institutional attendance/registration timelines; do not use as an official representation without Registrar/Senate confirmation.
- `src/components/public/PublicFooter.tsx`: main campus, administrative and liaison addresses, telephone numbers, email accounts, and any licensure/partnership statements.
- `src/data/leadershipData.ts`: official names, biographies, publications and appointed roles.
- `src/components/public/PublicColleges.tsx`: degree names, statuses, 4-year durations and future availability; actual course requirements are separately managed by the Registrar.
- Any university seal, header image, external partner logo and degree or marketing video must have verified rights and attribution.

### Remaining migration scope
These remain partially or fully hard-coded: homepage media and marketing copy beyond registered slots, mission/vision supporting paragraphs, the complete static academic calendar, detailed college structure and TVET cards, existing leader biographies, some footer legal/partnership statements, site search keywords and secondary nav descriptions. Campus content and staff media have their own consoles; they are **not** migrated into a single universal schema.

## Evidence required to close milestone
Capture: (1) latest staging deployment commit, (2) Coolify persistent volume configuration, (3) live editor/reviewer/anonymous acceptance results, (4) successful redeployment persistence proof, (5) screenshots of responsive navigation, and (6) institutional owner sign-off on substantive claims.

Do **not** declare “enterprise accepted,” production-ready, or verified campus content on the strength of GitHub CI alone.

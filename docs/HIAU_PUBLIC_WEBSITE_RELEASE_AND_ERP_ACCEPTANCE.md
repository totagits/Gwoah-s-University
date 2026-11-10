# HIAU — public university website release and dedicated ERP acceptance gates

## Phase A: Public website, before ERP business-workflow work

Scope: public home, brand/seal, two-video campus/classroom hero and tour, 19 BLEST degree detail pages, user-supplied program introductions, navigation, mobile layout, leadership, admissions information and application entry, calendar, accessibility, and public access security.

### Implemented for review

- Published academic calendar labels now derive from *Africa/Monrovia* date instead of permanent “Active Now” or “Upcoming” strings. These describe schedule timing, **not** proof that an event occurred; academic dates remain unchanged.
- Source-level automated inventory validates the two original campus and classroom MP4 files, all 19 initial explainers, four user-supplied MP4s and public navigation sections.
- Super Administrator-only **Website Video Library**, linked through protected university administration, manages all 19 degree-page videos **plus** the two homepage/tour slots.
- Upload raw MP4 (up to 50 MB); validate basic MP4 file signature; keep as a private draft; preview behind the protected session; explicitly publish; restore the original static source.
- Original media remains in GitHub. New public versions use a stable `/api/public/video/:slot` endpoint with HTTP byte-range handling. No student or academic record changes.
- Video management requires a logged-in **Super Administrator**. The ERP's session and CSRF checks still protect POST/PUT/DELETE requests. Other roles cannot upload or publish. The public GET media endpoint is anonymous by design.
- Media files are stored at `$DATA_DIR/public-media/`, with published metadata recorded in SQLite settings and audit actions. **Before using on Coolify, confirm `/app/runtime-data` is attached to a persistent volume and backs up both the database and uploaded media.** The in-app SQLite backup alone does not include MP4 files. Staging container replacement without persistent storage could lose custom uploads.
- No untrusted URL import, no automatic publishing, and no external media hosting keys required.

### Remaining manual acceptance before declaring website finished

1. Confirm Coolify deployed the merge commit, reports Running/Healthy and `/api/health` returns 200.
2. Open public site in a fresh browser with no credentials: verify no HTTP Basic Authentication prompt and no ERP data exposed.
3. Test navigation on desktop and mobile at 375px, 768px and desktop width; keyboard-only menus and form errors.
4. Open every one of the 19 degree pages, navigate Back, verify photos and each appropriate MP4 plays, and use Turn on narration.
5. Verify exactly two homepage videos, switching/looping with controls; test the tour.
6. Verify Admissions form **with a deliberately identified test application**, checking resulting receipt/number and handling the test record according to university policy. **Do not charge real applicants or assume payment integration is live** based solely on advertised fee text.
7. Verify contact details, accreditation/licensure, partner claims, university charter and academic calendar **against authoritative institution-approved documentation**. Automated checks do not establish the truth of these claims.
8. With a Super Administrator staging test account, upload a safe MP4 to a degree slot, privately preview, publish and confirm anonymous playback. Restore original and confirm it remains unchanged on other slots. Check that Registrar/Student cannot use manager.
9. Rebuild/restart staging and confirm uploaded published MP4 persists on its mounted storage volume.
10. Conduct responsive, keyboard, performance, low-bandwidth, and screen-reader smoke testing. Publish no actual data without institutional sign-off.

**Public website status:** Feature code and automated tests can pass without completing real Coolify/browser acceptance. Record real observations and screenshots before marking Phase A accepted.

## Phase B: Dedicated ERP development and acceptance — after Phase A

The secure ERP's existing foundation/Curriculum Studio is preserved, but its end-to-end production acceptance is **not complete**. Use separate staging test identities and non-production sample data. Validate all server-side RBAC, cross-account privacy, transactional storage and audit logging.

| Role/workstream | Core acceptance scenario |
| --- | --- |
| Super Administrator | Issue/revoke invitations, set roles, audit events, backups and restore rehearsal |
| Admissions Officer | Apply, review documents, approve/reject, prevent duplicate admission |
| Registrar | Admit and assign student ID, courses/terms, registration, grades and transcript validation |
| Finance/Bursar | Real invoice from registration, test payments, two-person reconciliation, refunds/holds |
| HR | Staff profiles, role assignments, leave/time and payroll interface only once implemented and authorized |
| Faculty | Assigned rosters only, teaching materials, submit grades for Registrar approval |
| Student | Own registrations, published grades, payment statements and protected document access |
| Dean/Academic Office | Scoped academic reports, curriculum approval workflow and faculty oversight |
| Alumni/Guardian and other roles | Scope existence and permissions according to approved institutional requirements |

Do not use live tuition transactions or real students during staging validation. Check persistence across deployments, audit trails, secure backups/restore, role tampering and negative cases. Promote to production only after explicit university sign-off.

### Staging published-video persistence acceptance (2026-11-10)

- User browser test: Super Administrator created an additional homepage video, uploaded a 4.4 MB MP4 as a private draft, previewed it end-to-end, published it, and confirmed carousel playback on staging.
- This documentation-only commit deliberately updates the `staging` branch to test the existing GitHub-to-Coolify webhook. It does not update any video, account, application, or operational record.
- **Acceptance not yet established:** after Coolify reports the commit deployed, refresh the staging homepage and play the newly published extra homepage video. If it remains available, record a passing persistence result. If missing, examine the Coolify persistent volume mounted at `/app/runtime-data`, which contains `operations.sqlite` and `public-media/`, and restore from backup; do not republish unrelated production content.
- A duplicate unpublished extra video slot named `HIAU Campus Life – Test Video` was also visible; remove only the unused, unpublished slot from the Super Administrator Website Video Library after identifying the published slot. The test itself does not delete user data.

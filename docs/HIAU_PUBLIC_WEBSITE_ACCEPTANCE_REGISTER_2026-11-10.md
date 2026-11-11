# HIAU — Public Website Acceptance Register

> **Archived detailed evidence annex — status superseded.** The authoritative project order,
> workstream status, current blockers and acceptance decisions are maintained in
> [HIAU Master Development and Acceptance Register](HIAU_MASTER_DEVELOPMENT_AND_ACCEPTANCE_REGISTER.md).
> Historical checklist statements below are not continuously updated. In particular,
> the earlier claim that `POST /api/applications` does not exist was superseded by
> PR #58 (endpoint implemented) and PR #59 (county field fixed). Neither PR
> by itself verifies a live submission or production release.
>
**Review opened:** 10 November 2026  
**Repository:** totagits/Harvest-Intercontinental-American-University  
**Working branch:** staging  
**Scope:** Public website ONLY. University ERP functionality requires a separately approved development and acceptance phase.

## Acceptance rules
- **Implemented** means code or feature exists, not that a public visitor successfully tested it.
- **Browser-verified** requires the exact staging URL, date, role/viewport, screenshots and observed outcome.
- **Institutionally verified** requires confirmation by an authorized HIAU representative or source documents.
- **Accepted** requires passing functional, accessibility, content, mobile, privacy and deployment-persistence checks. Do not silently replace test records with real university data.
- Never promote staging to production main or enable real student/tuition transactions without explicit authorization.

## Public imagery quality standard — enterprise presentation
- Use **authentic, institution-approved** photographs for named leaders, actual facilities, public events and students. Never use AI-generated substitute faces or depict synthetic campus scenes as verified real facilities.
- Leadership portrait targets: clear face, natural skin tone, sharp focus, professional lighting, uncluttered background, consistent 3:4 portrait crops, and balanced headroom. Preserve identity and original image proportions; do not stretch, beautify, or misrepresent people.
- Academic program and campus images: high-resolution, subject-relevant, consistent color/white balance, realistic captions and rights clearance; avoid generic, mismatched, watermarked or blurry stock photos.
- Serving targets: optimized modern image formats where appropriate with fallback, no visible stretching or distortion, lazy loading below the fold, and stable display dimensions to reduce layout shifts. Don't arbitrarily upscale low-resolution originals.
- Presentation: restrained HIAU purple-and-gold accents around photographs, not heavy gold frames, black gradients over faces, or decorative animation that distracts from the content. Readable names and titles should be separate from photographs.
- Review each actual image **visually and individually**. The asset-existence test does not certify authenticity, clarity, compression quality, institutional approval or legal usage rights. Replace inadequate assets only with approved originals.

## A1 — Public identity, leadership and photos (IN PROGRESS)
- [x] University renamed HIAU in public component and leadership data.
- [x] Leadership directory, 19 profile entries, navigation shortcuts and formal portrait UI present in source.
- [x] Source-level image inventory and directory-reference test added (CI results required); portrait fallback displays initials instead of an empty avatar.
- [ ] Visually open each public leader profile using an unauthenticated browser on staging.
- [ ] Verify every photo depicts the **named person**, is current, approved and licensed for use. Asset existence alone does not verify identity.
- [ ] Confirm office titles, spelling, credentials, biographies, quotations, books/publications and external links against institution-approved evidence. Several long biographies have no source references in the source data and therefore cannot be certified by code review.
- [ ] Verify leadership cards and directory navigation on mobile; test no broken image or empty avatar.
- [ ] Sign off each profile with university representative before production publication.

## A2 — Home, video and administrator content (IN PROGRESS)
- [x] Real Chrome browser previously confirmed first campus video rendering after moving decorative diagonal clipping away from player.
- [x] Super Administrator created/published additional homepage MP4 in staging and confirmed public playback in the prior browser test.
- [x] Nginx Basic Authentication removed for **staging public homepage**; HTTP 200 with no WWW-Authenticate header confirmed by VPS curl (10 Nov 2026).
- [ ] Verify video still displays and auto-sequences after latest hero layout changes. A screenshot of blank purple video cannot be treated as passing.
- [ ] Verify all homepage videos, manual controls, muted autoplay, responsive diagonal design, and keyboard operation.
- [ ] Confirm private uploads and published custom clips persist after a recorded redeploy.
- [ ] Confirm duplicate unpublished homepage test entry removed, without deleting the published clip.
- [ ] Verify video manager denies unauthenticated, Registrar and Student accounts.

## A3 — Academic program pages and navigation (IN PROGRESS)
- [x] Public degree-page layouts and a reversible degree deep-link route resolver are present in the source.
- [x] Automated acceptance guard added for all **19 degree routes** across **five colleges**, unique slugs, narrated explainer metadata and four supplied local MP4 assets. Passing CI is source validation, **not** proof of browser playback.
- [x] Adjusted the repeated public degree hero image caption so illustrative campus media is not presented as documentation of any particular program facility.
- [ ] Open **all 19 individual degree pages** in staging, including deep links, navigation back to the catalog, duration, focus areas, published-curriculum state and responsive layout.
- [ ] Verify each degree video loads, renders, controls/narration work, and no misleading static poster is shown in place of a playable video.
- [ ] Replace any repetitive generic campus artwork with real, high-resolution, university-approved program photographs, one by one, after approval of subject, identity and usage rights. Do not invent or silently substitute photographs.
- [ ] Check desktop hover/click and keyboard Escape/Tab navigation; test mobile menus at 375 px and 768 px.
- [ ] Check navigation items and CTA destinations for missing pages/dead ends.
- [ ] Confirm claims about degree availability, accreditation, curriculum, clinical facilities and admissions against institution-approved documentation.

## A4 — Public Financial Aid & Scholarships (IN PROGRESS)
- [x] Added a concise, accessible Financial Aid & Scholarships information section linked from the Admissions navigation menu.
- [x] Removed unverified GPA cutoffs, scholarship award guarantees, funding availability promises and payment-channel representations from the public financial-aid panel.
- [x] Added `applyingForScholarship` to the client submission payload and optional application type. **This does not mean the request is persisted:** the current staging server has no public `POST /api/applications` handler, and the authenticated workspaces admission workflow is separate.
- [ ] Confirm institution-approved policies, contact emails, deadlines, award eligibility and currently funded schemes before publishing promises.
- [x] Implemented a same-origin, rate-limited, validated public admissions intake endpoint backed by a persistent SQLite table, returning a unique receipt reference only after successful save; storage durability still requires verified Coolify persistent-volume mount.
- [x] Added authenticated, read-only admissions intake queue showing scholarship interest without implying paid fees or accepted applications; requires actual staff-role browser verification.
- [x] Added integration tests for HTTP submission, input validation, persisted scholarship-interest values and unauthenticated read denial (CI results required).
- [ ] Verify APP_URL origin matches staging and production hostnames in each environment; never share credentials. Verify JSON body limits, database backups and application retention policies.
- [ ] Run an explicitly fictional staging applicant through receipt, staff queue and redeploy persistence; verify no personal information is exposed to public visitors.
- [ ] No financial documents are accepted at this stage; secure upload consent and retention must be approved first.
- [ ] Wire scholarship-interest into the secure admissions record, committee screening, student correspondence and access-controlled review. Confirm with end-to-end tests using a staging applicant.
- [ ] Implement scholarship award approvals, financial credit postings, renewals and reconciliation only during ERP-2, with separation of duties and audit history.
- [ ] Verify financial-aid menu scroll, mobile accessibility, and clear distinction between **inquiry**, **application**, and **award**.

## A4 — Admissions and communications (PENDING)
- [ ] Verify application workflow end-to-end with explicitly marked staging/test applicant; no real tuition charge.
- [ ] Verify contact emails, office addresses, data protection notices, receipt/acknowledgment and errors.
- [ ] Check calendar dates and announcements for current and approved content.

## A5 — Accessibility, operations and release (PENDING)
- [ ] Mobile/desktop contrast, zoom 200%, keyboard navigation, visible focus and screen-reader landmarks.
- [ ] Low-bandwidth public performance and first-video buffering without hiding the hero.
- [ ] Verify health endpoint, HTTPS and public-only responses; confirm secure admin entry with credential protection.
- [ ] Confirm Coolify deployment commit and persistent database/media volume; complete backup/restore drill.
- [ ] Record university sign-off for public site before promoting anything to main.

## Separate future milestone: ERP (NOT ACCEPTED)
ERP-1 Identity, Admissions, Registrar, academic catalog, registration/add/drop.  
ERP-2 Tuition, invoices, payment gateways, receipts and bank reconciliation.  
ERP-3 Faculty, online classes, learning management, assessments and conferencing.  
ERP-4 Peer tutoring, student support, alumni/guardian and additional services.

Existing UI/API methods (e.g. `AcademicPlanningRegistration.tsx` and `src/services/api.ts`) do **not** prove backend authorization, workflow correctness, cross-account privacy or financial readiness.

## Verification evidence and limits
Review of `staging` source establishes the components and image references exist. Browser screenshots in this project showed the administrator video library, successful private draft upload, playback, public publish, and later a working campus frame. The latest post-layout autoplay and all leadership identity/photograph claims remain subject to manual staging acceptance. The CI inventory can check file presence but cannot establish that an image depicts the correct individual.

### Intake boundaries and remaining ERP work (November 10, 2026)
- Public admission submissions are stored in `public_admissions_intake` in the existing operations SQLite database, separate from the formal, registrar-approved `applications` table.
- Receipt status `received` confirms storage only. It does not confer admission, WASSCE verification, scholarship approval, paid assessment fees or invoice creation.
- Only authenticated super administrators, registrars and admissions officers may read the intake queue. The staff portal lists self-reported grades, but no mock fee or admission decision.
- Staff approval/rejection, email notifications, document verification, scholarships awards and reconciliation belong to ERP-1 and ERP-2 and are deliberately not enabled here.
- Public privacy/consent copy, data retention/deletion policy, acceptable document uploads, anti-bot measures beyond per-IP throttling, and institution-approved fee disclosure still need acceptance before general public launch.

### Public admissions deployment checks — staging
- [x] Fix public form contract: include the `county` field required by the validated server intake endpoint (and guard with a source regression test).
- [ ] Verify `APP_URL=https://hiau-staging.totag.network` or an equivalent exact staging origin is configured for the staging runtime; identity middleware requires the request's `Origin` to equal configured origin. Do not weaken this security check to accept arbitrary hosts.
- [ ] Verify staging's `DATA_DIR` is a persistent volume and that `operations.sqlite` and `identity.sqlite` survive a restart/redeploy with a tested backup.
- [ ] Use fictional applicant information only for the staged browser submission acceptance; verify reference issuance, staff queue and scholarship flag. Do not submit actual applicant data before university privacy policies are approved.
- [ ] Verify both scholarship opt-in and opt-out, rejected missing fields, failed network/save errors, and denial of public `GET /api/applications`.
- [ ] Confirm an institution-approved privacy notice, record retention/deletion process and data access policy before broad public availability.


## ERP-NAV — Staging sidebar and RBAC milestone (2026-11-10)
- [x] Replaced the crowded top horizontal portal tabs with a responsive left navigation sidebar. The header now retains university branding, global search, notifications, language, theme controls, and logout.
- [x] The sidebar includes independent collapsible groups, a desktop compact icon mode and mobile drawer with an Escape shortcut.
- [x] Sidebar visibility follows the eight actually implemented role identities in `src/portal/moduleRegistry.ts`. No unreleased roles or unfinished ERP modules are advertised.
- [x] React module components are rendered only when `isPortalModuleAvailable(role, tab)` is true, alongside the existing server-side authentication/role checks. Navigation is never a security boundary.
- [x] Updated Curriculum Studio's New program draft action to use the accessible purple/white selected-control style.
- [ ] Verify actual administrator, registrar, dean, lecturer, bursar, admissions officer, student and alumni sign-in experiences on staging, using authorized test identities only.
- [ ] Browser-test sidebar expanded/compact states at desktop widths, and drawer operation, focus movement, Escape, scrolling and content overflow on 375px and 768px layouts.
- [ ] Complete separate RBAC permission-matrix audit: server CRUD, financial approvals, admissions decisions, notifications and protected exports; do not treat menu hiding as a complete permissions review.
- [ ] Verify role-appropriate initial tab, theme contrast and reauthentication after session expiry; capture acceptance screenshots before production merge.


## ERP-RBAC-2 — Sidebar visual correction and server role verification (2026-11-10)
- [x] Corrected the left-clipped sidebar seen in the university administrator screenshot: the mobile off-canvas transform is now disabled at desktop widths, the desktop sidebar stays in normal flow, and text/icons use bounded flex widths.
- [x] Added server-executed role-matrix checks covering all currently supported roles for admissions, finance, audit, accounts and student-only access.
- [x] Added negative tests for spoofed admissions/application and program-creation actions; server permission checks must reject non-authorized roles even when a request is sent directly.
- [ ] Check staging in Chrome at 1440px and 1600px: university name, first icon, selected menu label, and both accordion headings must be fully visible without horizontal clipping.
- [ ] Verify the expanded/collapsed sidebar, 375px mobile drawer, keyboard navigation and screen-reader labels.
- [ ] Run authorized role-based browser acceptance for registrar, admissions officer, bursar, lecturer, dean, student and alumni accounts.
- [ ] Complete a complete API-by-API matrix covering create/view/update/approve/delete/export and record ownership, especially billing, grades, scholarship awards and financial reporting before production release.
- [ ] Confirm any new HR, executive, scholarship committee or auditor roles only after defining distinct server-side permissions and authentication; their navigation is not enabled here.

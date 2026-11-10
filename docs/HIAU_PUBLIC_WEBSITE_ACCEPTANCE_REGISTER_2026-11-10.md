# HIAU — Public Website Acceptance Register
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

## A3 — Academic program pages and navigation (PENDING)
- [x] Public degree pages and route resolver are present in source.
- [ ] Open each of the 19 degree pages, check headings, images, MP4 narration, Back navigation, deep links and available programs.
- [ ] Check desktop menu hover/click and keyboard Escape/Tab handling; test mobile menus at 375 px and 768 px.
- [ ] Check navigation items and CTA destinations for missing pages/dead ends.
- [ ] Validate all claims about degree status, accreditation, institutional charter and admissions availability against approved documentation.

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

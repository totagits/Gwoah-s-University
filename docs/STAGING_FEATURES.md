# Gwoah's University ERP — staging feature review

This branch now requires account activation and password sign-in. Public administrator shortcuts and demo role switching have been removed. Server-side role checks, HttpOnly session cookies, CSRF protection, session revocation, and a security audit are implemented. University records still include staging samples; use fictional data until institutional data, policies and provider connections are verified.

## Security and integration release

- First administrator: info@totaggroup.com. A private one-use activation file is delivered separately; no password or activation secret is committed to Git. Activation expires after 48 hours; sessions expire after 30 minutes idle or eight hours absolute.
- Admin account invitations, role changes, disabling accounts, password changes, and email-backed recovery are implemented. Changing access revokes existing sessions. Sample profiles have no usable passwords by default.
- Historical outcome imports, logistic-regression training, student-disjoint newer-cohort holdout, validation metrics, and current-cohort prediction are implemented. No fabricated model is shipped; training requires at least 60 labeled records and adequate outcome diversity.
- Runtime providers were not configured in Coolify. SMTP/Resend, S3-compatible encrypted backups, Gemini, CalDAV, recording, occupancy and access-control adapters are implemented but cannot be live-verified until the university supplies credentials and service endpoints.
- Translation catalog/editor/import, optional AI drafting, reviewer identification, publication, English fallback and persistent language preference are implemented. Actual indigenous-language packs still require fluent review. Only cataloged interface strings are localized; uncataloged legacy content falls back to English.
- Background browser push, account-synced bookmarks, download activity, scanned-PDF OCR with retained page images, signed student IDs, tutoring approval, mentor meeting responses, research status changes and expenditure ledgers are implemented.

## Design and implementation

The visual system now uses warm ivory surfaces, deep teal actions, restrained gold details, readable typography, and a light default. Existing university modules remain available. Campus life, faculty tools, digital documents, learning studio, alumni, and institutional controls share persistent server records and server-sent change events.

| Requested capability | Staging implementation and remaining dependency |
| --- | --- |
| QR lecture attendance | Signed 15-minute lecture QR codes; camera scan or pasted token; duplicate prevention; shared faculty attendance list. The signing key is persisted on the data volume; explicitly rotating it invalidates old codes. |
| Notification text to speech | Browser speech synthesis reads the latest system notifications; stop control included. Voice availability depends on the device. |
| Office hours | Faculty publishes future availability; students reserve; server rejects double bookings and overlapping reservations. Calendar export is available. |
| Campus map | Interactive illustrative building layout, capacity, and details. Live occupancy starts as unavailable; authenticated occupancy webhook accepts real counts. University must supply accurate geography and feed. |
| Anonymous evaluation | Ratings and comments saved without a student identity in the evaluation record. Do not include identifying details in comments. This demonstration does not provide formal anonymization against a database administrator. |
| Alumni portal | Professional profile, registrar-reviewed transcript requests, university-managed job board. Official transcript issuance remains a registrar process. |
| Recent activity | Server-recorded campus actions plus original ERP writes. Library download actions are included in the account's activity feed. |
| Library live search | Existing catalog search plus publication date/type filters; uploaded library searches titles, course codes, OCR text and tags. |
| OCR digitizer | English Tesseract OCR supports images and scanned PDFs of up to 10 pages. Page images are retained and recognized text is appended as searchable text. Handwriting accuracy varies. First use downloads OCR language assets. |
| Tuition billing and reminders | Recalculates tuition using active enrollment and catalog fees. Hourly reminder checks when enabled; seven-day deadline window; daily duplicate protection and provider idempotency. SMTP or Resend setup and verified sender required. |
| Skill-gap analysis | Transparent keyword comparison of sample coursework to two career profiles. Suggestions are advisory; a verified industry competency catalog and historical completion data remain to be integrated. |
| Virtual whiteboard | Pointer-based drawing, course rooms, completed-stroke synchronization, PDF export to library. Concurrent edits use latest-write behavior rather than conflict-free collaboration. |
| Lecture capture archive | Manual HTTPS links and annotation archive; authenticated provider webhook captures recording events and room-board snapshots. Requires recording-provider connection. |
| Remote proctoring | Explicit student opt-in; webcam snapshots at five-second intervals; faculty monitor and focus signal. Frames remain in memory for up to 30 seconds. No audio, recording, identity verification, or automated misconduct decisions. |
| Digital ID | Signed, expiring ID QR and printable PDF from the linked student's record. An authenticated library/meal/event verification endpoint is implemented; physical access devices need ACCESS_CONTROL_TOKEN and integration. |
| Degree progress | Earned versus required credits and milestones use the account-linked server profile. Accounts without a linked student record receive an explicit empty state. Actual institutional academic records still need onboarding. |
| Course dependency map | Click through catalog prerequisites in academic planning. Uses the current bundled course catalog. |
| Research grants | Application status, funding cycle description, award/request amount and expenditure validation. Research statuses can be updated by owners/reviewers, and validated grant expenditures are retained in a ledger. |
| Peer tutor marketplace | Tutor listings, availability, reservations and calendar export. Eligibility requires a linked student profile, GPA >=3.5 and course score >=85, followed by faculty approval. CalDAV booking publication is implemented when configured. Tutor payment processing is not included. |
| Liberia language localization | Catalog-based localization, pack import/editor, reviewer-gated publication and language persistence are implemented for English, Liberian English, Kpelle, Bassa, Vai, Grebo, Kru and Mandingo. No unreviewed translation packs are enabled; legacy uncataloged text stays in English. |
| Mentorship | Mentor eligibility requires at least 60 earned credits; field matching uses the linked academic program. Meeting requests, recipient-only acceptance/decline, conflict checks and messages are implemented. Actual student records are needed for matching. |
| Student success predictor | Historical labeled CSV import, logistic regression, newer-cohort student-disjoint holdout, AUC/Brier/precision/recall and current-cohort probabilities. No model is trained without real input data. Advisor support only; never automatic eligibility or disciplinary decisions. |
| CSV grade import | Quoted CSV parsing, preview, all-or-nothing validation against catalog/registration, duplicate row checks, grade/GPA recalculation and before/after audit entries. |
| Document version history | Matching title/course uploads append labeled versions. Previous uploads remain downloadable; faculty can change the active version. |
| Assignment/grade push alerts | Server-sent notifications for task and grade writes while the portal is open. Background Web Push with an opt-in service worker is implemented; device permission and a live-delivery test are required. |
| Audit trail | Existing ERP audit plus before/after imported grades, document rollback and backup actions. Identities come from authenticated sessions. Account/security logs use chained hashes; an external checkpoint is needed to detect a complete privileged rewrite. |
| Institutional backup manager | AES-256-GCM encrypted snapshots, protected downloads, optional S3 upload, preview and explicit restore confirmation are implemented. Restores preserve current identity accounts. Preserve the installation encryption key separately; full disaster recovery must also back up the identity database and persistent volume. |
| Study planner | Suggests a 30-minute block between 08:00 and 20:00 around campus bookings, meetings and study plans. Connected CalDAV shared-calendar availability is checked when configured; provider errors stop scheduling rather than silently reporting availability. |
| Library bookmarks | Catalog and document favorites are persisted per authenticated account and sync across devices. |
| AI document tagging | Optional Gemini PDF tagging endpoint and explicit per-document action when configured. Initial upload tags are keyword suggestions. Requires university-provided model and API credentials. |
| NCHE compliance monitor | Ratios and resource counts against manually entered, sourced institution-reviewed thresholds; no compliance determination before thresholds are supplied. Full NCHE policy mapping and verified institutional inventory remain outstanding. |
| Research hub | Collaborative project, ethics submission, and patent status registers. Formal approvals and external IP filing are not automated. |
| Global search | Cross-module courses, people, catalog and digital document search with navigation. |
| Facilities feedback | Building-specific issue reports create actionable ERP tasks and notifications. |
| Library batch upload | Drag/drop or file picker; up to 10 supported files per batch, 4 MB per file, shared course categorization. |
| Document rollback and labels | v1.0, v1.1, etc.; history retained and earlier versions selectable. |

## Verification

Run `npm test`, `npx tsc --noEmit`, and `npm run build`. Server integration checks cover QR integrity/duplicates, booking conflicts, evaluation identity omission, grade batch rollback, valid grade/audit updates, document history/reversion, invalid upload rejection, snapshot path validation, and persisted records. Camera permission, real mail, AI credentials, and external provider integrations require manual verification in the university environment.

## Remaining source document

The pasted brief references `Liberia_University_Operations_Platform_Master_Prompt.md`, but that document was not attached. This checklist covers the supplied pasted requirements only.

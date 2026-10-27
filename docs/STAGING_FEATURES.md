# Gwoah's University ERP — staging feature review

This branch is a demonstration and integration build. It retains the repository's demo role switcher and sample records. Keep Coolify HTTP Basic Authentication enabled and use fictional data only. This is not a production student information system or an accreditation certification.

## Design and implementation

The visual system now uses warm ivory surfaces, deep teal actions, restrained gold details, readable typography, and a light default. Existing university modules remain available. Campus life, faculty tools, digital documents, learning studio, alumni, and institutional controls share persistent server records and server-sent change events.

| Requested capability | Staging implementation and remaining dependency |
| --- | --- |
| QR lecture attendance | Signed 15-minute lecture QR codes; camera scan or pasted token; duplicate prevention; shared faculty attendance list. Lecturer codes reset if the signing secret changes. |
| Notification text to speech | Browser speech synthesis reads the latest system notifications; stop control included. Voice availability depends on the device. |
| Office hours | Faculty publishes future availability; students reserve; server rejects double bookings and overlapping reservations. Calendar export is available. |
| Campus map | Interactive illustrative building layout, capacity, and details. Live occupancy starts as unavailable; authenticated occupancy webhook accepts real counts. University must supply accurate geography and feed. |
| Anonymous evaluation | Ratings and comments saved without a student identity in the evaluation record. Do not include identifying details in comments. This demonstration does not provide formal anonymization against a database administrator. |
| Alumni portal | Professional profile, registrar-reviewed transcript requests, university-managed job board. Official transcript issuance remains a registrar process. |
| Recent activity | Server-recorded campus actions plus original ERP writes. Browser library downloads are not yet included in the central activity feed. |
| Library live search | Existing catalog search plus publication date/type filters; uploaded library searches titles, course codes, OCR text and tags. |
| OCR digitizer | English Tesseract OCR converts uploaded images into searchable text PDFs; handwriting accuracy varies. First use downloads OCR language assets. It does not OCR scanned PDFs or preserve the source page image in the generated PDF. |
| Tuition billing and reminders | Recalculates tuition using active enrollment and catalog fees. Hourly reminder checks when enabled; seven-day deadline window; daily duplicate protection and provider idempotency. Resend setup and verified sender required. |
| Skill-gap analysis | Transparent keyword comparison of sample coursework to two career profiles. Suggestions are advisory; a verified industry competency catalog and historical completion data remain to be integrated. |
| Virtual whiteboard | Pointer-based drawing, course rooms, completed-stroke synchronization, PDF export to library. Concurrent edits use latest-write behavior rather than conflict-free collaboration. |
| Lecture capture archive | Manual HTTPS links and annotation archive; authenticated provider webhook captures recording events and room-board snapshots. Requires recording-provider connection. |
| Remote proctoring | Explicit student opt-in; webcam snapshots at five-second intervals; faculty monitor and focus signal. Frames remain in memory for up to 30 seconds. No audio, recording, identity verification, or automated misconduct decisions. |
| Digital ID | QR sample student ID and printable PDF. Access-control integrations for library, meals and events are not connected. |
| Degree progress | Earned versus required credits and degree milestones from the sample student profile. Live per-student reconciliation remains to be integrated. |
| Course dependency map | Click through catalog prerequisites in academic planning. Uses the current bundled course catalog. |
| Research grants | Application status, funding cycle description, award/request amount and expenditure validation. Records can be created; expenditure amendments and transaction ledgers remain to be built. |
| Peer tutor marketplace | Tutor listings, availability, reservations and calendar export. Tutor eligibility approval, payment processing, and external calendar synchronization are not automated. |
| Liberia language localization | Header language picker shows English and pending Kpelle/Bassa/Vai/Grebo languages. Reviewed translations and full i18n implementation remain outstanding. No fabricated translations are presented. |
| Mentorship | Field-filtered mentor listings, meeting requests and internal messages. Automated matching and senior-year eligibility verification remain outstanding. |
| Student success predictor | Advisory score signal chart with an explicit rule and no eligibility decisions. A trained historical prediction model is not implemented. |
| CSV grade import | Quoted CSV parsing, preview, all-or-nothing validation against catalog/registration, duplicate row checks, grade/GPA recalculation and before/after audit entries. |
| Document version history | Matching title/course uploads append labeled versions. Previous uploads remain downloadable; faculty can change the active version. |
| Assignment/grade push alerts | Server-sent notifications for task and grade writes while the portal is open. Operating-system push while the browser is closed is not implemented. |
| Audit trail | Existing ERP audit plus before/after imported grades, document rollback and backup actions. Staging identities are supplied by the demo role switcher; this is not a tamper-proof production audit store. |
| Institutional backup manager | Manual local snapshots, protected download, optional cloud-storage upload webhook and visible cloud result. Provider configuration, encryption-at-rest and restore automation remain operational requirements. |
| Study planner | Suggests a 30-minute block between 08:00 and 20:00 around campus bookings, meetings and study plans. External calendar availability is not connected. |
| Library bookmarks | Device-local favorites for the existing catalog and uploaded digital documents. Cross-device bookmark synchronization remains outstanding. |
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

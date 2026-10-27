# Staging 0.4 — clean operational foundation

Repository: https://github.com/totagits/Gwoah-s-University/tree/staging
Workspace: https://gwoahuniversity.totag.network/?portal=1

## Available workflows

No sample operational records are loaded. The active application uses normalized SQLite tables, foreign keys, atomic transactions, schema migration tracking and append-only workflow audit entries.

- Administrator: activated accounts, role invitations, account suspension and session revocation.
- Registrar: programs, terms, course tuition rates, prerequisites, required courses, sections, reviewed grading scales, admission, registration, grade publication, graduation and transcript requests.
- Admissions: intake and documented application review. Approved applications become student records through a separate registrar action.
- Faculty: assigned student roster, draft grades and submission for registrar publication.
- Student: own linked record, registration, published grades, invoices, graduation and transcript requests.
- Finance: invoices from actual unbilled registrations; uniquely referenced receipts; second-person reconciliation; financial holds; credit notes for dropped billed registrations.
- Alumni: linked graduate record, professional details and transcript requests. An administrator assigns the alumni account role after graduation.
- Assigned tasks and role-scoped audit history.
- Account settings, encrypted local backups/restore, provider connection status, translation review/publication and historical model tools.

## First acceptance test

1. Activate/sign in as the existing administrator. Invite actual staff accounts under Account & integrations.
2. Create a program, academic term, course, teaching section and approved grading scale using institutional policies. Open the term.
3. Record an application, document its review, approve it, then admit it with an assigned student number.
4. Invite the student using the admitted email; the account links automatically. Register a course.
5. Post tuition, record the actual test receipt reference, and have a second bursar or administrator reconcile it. A recorded receipt alone leaves the balance outstanding.
6. Faculty submits the grade; the registrar publishes it. Confirm the student's published result and earned credits.
7. Request graduation and review academic requirements and financial clearance. Review transcript requests and inspect the audit trail.

Use only records you intentionally create. The system does not seed applicants, balances, grades, historical outcomes, campus statistics or provider responses.

## Migration and recovery

On first 0.4 startup, existing legacy JSON files are copied unchanged into the private persistent volume's migration-archive/clean-start-* directory with SHA-256 manifests. Activated accounts, pending unexpired invitations and the configured owner are preserved. Old operational samples are not imported. Original JSON files remain untouched. Subsequent startups do not reset records.

Keep one application replica. SQLite is transactional but this release has not been certified for enterprise scale, high availability or multi-tenant operation. Back up the full persistent volume, including identity.sqlite, operations.sqlite, platform.sqlite and encryption keys, using a consistent stopped-service snapshot for disaster recovery. In-app encrypted operational snapshots preserve current identity accounts; they do not replace full-volume recovery.

## Explicit remaining work

The legacy campus extensions are unmounted pending reconnection to authoritative operational records: library/document workflows, attendance, room bookings, research, campus maps/occupancy, lecture capture and hardware access. Their earlier source files/tests are retained, but they are not available in this clean release. Reconnect and acceptance-test them incrementally; do not present their old demo screens as completed production functionality.

Email, S3/cloud backup, AI, calendar and hardware integrations need approved credentials. Presence checks do not establish successful external connectivity. Complete reviewed language packs and sufficient real historical outcomes are also required. Prediction has no shipped model or fabricated history. New workspace copy is currently English; full translation coverage remains outstanding.

Further production gates include load testing, independent security review, institutional policy approval, monitoring/alerting, off-site restore rehearsal, deployment rollback rehearsal and complete end-to-end acceptance of the remaining modules.

# HIAU — Master Development & Acceptance Register

**Baseline:** `staging` branch of `totagits/Harvest-Intercontinental-American-University`.  
**Date established:** 2026-11-12 (Liberia time).  
**Governing principle:** Finish and obtain acceptance of the public university website **before** beginning the next dedicated ERP build-out. Support student/staff PWAs in parallel, but do not let PWA refinements reorder the master program.

## Single source of truth: three linked workstreams

| ID | Workstream | Scope | Gate |
|---|---|---|---|
| **WEB** | Public university website | Branding, navigation, credible institutional content, 19 degree pages with video workflows, campus tour, Newsroom, full CMS, security, responsive design | Complete website acceptance (WEB-GATE) before dedicated ERP build-out |
| **ERP** | Enterprise university operations | Admissions, Registrar, Finance, HR, faculty, students, academic planning, attendance, course registration/add/drop, tuition, virtual classrooms, tutoring, student services, audit | Each module: server authorization + real data + tests + live workflow acceptance |
| **PWA** | Student & Staff installable apps | Dedicated identities and manifests, mobile UI of *already authorized* workflows, device install, offline privacy, notifications when approved | Released in parallel with corresponding WEB/ERP modules; not independent project milestones that block the WEB gate |

**Order:** WEB acceptance → ERP departmental modules → ERP end-to-end acceptance, while PWA improvements are attached to the relevant completed module.

## Status definitions (must never be conflated)

- **Not started:** No verified code or acceptance.
- **Implemented / merged:** Code merged to staging; does **not** imply deployment or live acceptance.
- **CI passed:** Automated validation passed; does **not** imply live behavior.
- **Staging deployed:** Confirm deployment commit in Coolify.
- **Partially accepted:** Specific checks evidenced, remaining checks named.
- **Accepted:** Staging deployment, real browser/device tests, security, content accuracy, and expected outputs verified.
- **Deferred:** Defect documented with owner, next gate, and explicit scope; never silently closed.
- **Production released:** Explicitly approved independent step following acceptance.

## Current baseline and historical evidence

| Register | Status | Supporting evidence | Outstanding |
|---|---|---|---|
| WEB-05 public navigation and academic-link isolation | Implemented, merged | PR [#77](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/77), PR [#78](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/78); user browser acceptance of public nav | End-to-end desktop/mobile link inventory |
| WEB-06 degree content / explanatory videos | Partial implementation; verify inventory | Earlier 19-degree requirement and prior degree video activity | 19/19 page-by-page editorial audit: program name, college, credits, overview, media, admin create/replace/delete video, published behavior |
| WEB-07 structured CMS (navigation, contact, academic catalog, news/events) | Implemented in earlier work; incomplete enterprise acceptance | Earlier WEB-07 rollout and CMS console browser screenshots | Field-by-field mapping of editable content and remaining hard-coded content |
| WEB-08 editorial governance & persistence | Partially accepted | Saved draft retained across Coolify redeploy; approval controls and revision history demonstrated; PR [#85](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/85) | Real Editor/Reviewer separation, scheduled publish, rollback and audit verification |
| WEB-09 multimedia newsroom | Partially accepted | PR [#86](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/86), [#87](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/87); user screenshots showed actual HIAU photo, YouTube player, full-width gallery and unpublish removing listing | Public photo URL denied after unpublish; media replacement approval, 12-item limits, mobile and accessibility |
| WEB-10 Campus Tour and staff entry | Implemented, partially accepted | PR [#88](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/88); user screenshots of standalone video | Verify genuine video frame previews, mobile controls, no public Staff ERP promotion |
| PWA-01 dual Student & Staff app foundations | Partially accepted | PRs [#89](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/89), [#90](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/90), [#91](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/91); separate desktop installation and Student Android Home Screen screenshots; staff/admin and student-role sign-in demonstrated | Staff phone installation, role mismatch, mobile layout, logout/session expiry, offline privacy, PWA standalone behavior |
| PWA-02 mobile header | Implemented / staging merged | PR [#92](https://github.com/totagits/Harvest-Intercontinental-American-University/pull/92) | Real phone visual acceptance, search/settings interaction |
| ERP-FOUNDATION identity and student linking | Implemented / partial | Student-role activation and unlinked identity displayed in screenshots; Registrar linking introduced in PR #92 | Approved academic record not yet linked; permissions and records must be validated live |

**No statement above is equivalent to production approval.** `main` release remains a separate change-control event.

## Original public website phase: remaining acceptance checklist

1. **WEB-GATE-01 Institutional accuracy:** Verify legal and institutional identity, licensure/charter wording against documentary evidence, leadership biographies, trustees, partner logos, contact information and footer. Replace unverifiable claims rather than presenting them as fact.
2. **WEB-GATE-02 All 19 degree pages:** Enumerate degree pages from current source and validate all 19 for accurate overview, department/college, credit totals, curriculum, media and admin publishing. Do not silently assume 19 are already done.
3. **WEB-GATE-03 Video & photography governance:** Each program video can be created, replaced, deleted and approved by authorized staff; HIAU actual imagery and captions governed through CMS; placeholders labeled; videos use correct thumbnails and no unrelated hero carousel treatment.
4. **WEB-GATE-04 Navigation/IA:** Home, About, Campus Tour, Academics, Admissions, News, Current Events, Student Experience, leadership profiles, search, footer links, portal isolation. All public pages must remain public without triggering ERP login.
5. **WEB-GATE-05 CMS lifecycle:** Create → private draft → review → publish → unpublish → restore/archive, revision audit, media privacy, scheduled publication and rejected unapproved changes.
6. **WEB-GATE-06 Responsive/accessibility:** At minimum 320px, 375px, 768px, desktop; keyboard controls, focus indicators, alt text, captions, color contrast, device video behavior.
7. **WEB-GATE-07 Security/deployment:** Session/role enforcement, private file access, persisted storage, backup and recovery evidence, staging deploy commit trace and regression suite.
8. **WEB-GATE-08 Stakeholder sign-off:** Document accepted screenshots, any explicitly deferred defects and institutional approval. Only then designate public website accepted and prioritize ERP implementation.

## Original ERP implementation sequence (next primary phase after WEB gate)

| ID | Module | Minimal definition of done |
|---|---|---|
| ERP-01 | Admissions & entrance examinations | Application, fee, exam scheduling, student testing, grading, result notification, privacy and approved admissions decisions |
| ERP-02 | Registrar & academic records | Approved identity linkage, admissions conversion, records, academic years/terms, transcript and graduation control |
| ERP-03 | Finance & tuition | Fee schedules, invoices, payment reconciliation, balances, receipts, controls and audit |
| ERP-04 | Faculty & HR | Staff directory, assignment, attendance, leave, performance and permissions |
| ERP-05 | Academic program & course registration | Degree requirements, credits, prerequisites, enrollment, add/drop approvals, conflicts and capacity |
| ERP-06 | Teaching & learning | Secure Virtual Classroom, attendance, assessments, grading, instructional material and feedback |
| ERP-07 | Student services & peer tutoring | Authorized tutoring, appointments, advising, communication and student support |
| ERP-08 | Institutional operations & reporting | Procurement/assets, academic reports, dashboards, record retention, role matrix and audit |
| ERP-GATE | End-to-end enterprise acceptance | Role-to-role workflows, actual persisted records, exception handling, backups, security, integration and training |

ERP features already visible in the repository are **not automatically accepted**. Reuse and test before adding new code.

## Parallel PWA principle

For **each** accepted WEB/ERP function:
- Add student or staff PWA support only when that role needs it.
- Validate 320/375/768px responsive UI and mobile media/input patterns.
- Validate installed behavior on at least Android; iOS where available.
- Verify authenticated private data never enters offline cache.
- Document the linked main milestone, e.g. `ERP-05 / PWA-ERP05`, rather than inventing a separate detour.

## Engineering procedure

1. Open **one** primary WEB/ERP milestone at a time. The master record states scope and acceptance checklist before coding.
2. Develop on a named feature branch from `staging`; associate PR with the milestone.
3. Update this register in the same PR or a small follow-up status change. Record **code/CI/deploy/live acceptance** separately.
4. Run TypeScript, build, automated tests, and relevant security checks. A green run authorizes staging merge, **not** acceptance.
5. Verify exact merged commit was deployed in Coolify; capture real browser/device evidence.
6. Close the milestone only when acceptance checks pass. Record blockers and deferred items with an explicit return point.
7. Do not change `main` or claim production release without independent approval.

## Current next action — WEB-GATE-01 / WEB-GATE-02 inventory

Conduct a **public website gap audit** first, not a new PWA project:
- Export exact source-driven list of existing 19 degree pages and media references.
- Verify editorial controls per degree and identify missing videos / thumbnails / profiles.
- Audit public navigation, newsroom, campus tour, footer and institutional verification claims.
- Produce a finite prioritized defect/acceptance list, then implement the **first incomplete WEB item**.
- Preserve ERP-02 student linking and PWA-02 Android header work as open acceptance items, to be handled during their linked module phases.

**Change control:** This register governs next milestones unless explicitly revised. Reconcile any mismatch between source code and prior conversations in the audit; user screenshots validate only what they actually show.

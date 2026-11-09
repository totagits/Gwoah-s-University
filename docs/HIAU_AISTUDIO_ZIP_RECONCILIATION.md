# HIAU — Google AI Studio ZIP source reconciliation

**Baseline date:** 2026-11-09  
**User-provided source:** `gwoah's-university-erp-&-portal(1).zip` (AI Studio project `3c461b57-f4e8-46a4-8925-82838edb160e`)  
**GitHub reference:** `main`, originally `f8958b7e5a210943a2620471e82672d8baf80393`  
**Integration branch:** `staging`, originally `f6f68bd4cd7a195738cfc7c4fcae94d313eaba68`

## Verified baseline

The 33 React TSX files in the supplied ZIP match Git blob IDs in GitHub `main`. This establishes a **byte-level AI Studio source reference**, not necessarily an assurance that the ZIP functions safely in production.

The original export also includes `server.ts`, an example JSON database, original HIAU portraits and campus images, MP4 clips, `package.json`, and configuration. It contains demo-user logic and sample academic data. **Do not overwrite staging's live security, SQLite volume, passwords, or administrator accounts with the ZIP's server or JSON database.**

The CI script `scripts/audit-aistudio-baseline.mjs` verifies the frozen ZIP Git blob IDs against a fresh `main` checkout and writes a machine-readable inventory of `staging` component differences. If main's original snapshot changes, the audit fails until explicitly reviewed.

### 33-file source reconciliation

| Category | Count | Meaning |
| --- | ---: | --- |
| Unchanged from ZIP | 12 | Exact Git SHA match in staging |
| Modified in staging | 16 | Must inspect and preserve intentional security changes |
| Missing from staging | 5 | Original feature source exists in ZIP and main; functionality is not migrated |
| **Total** | **33** | React TSX files in supplied original ZIP |

### Missing original React components

1. `src/components/portal/AcademicPeerMessagingModal.tsx` — original academic discussion UI; includes prototype thread data; needs verified course-membership access and persistent server records before enabling.
2. `src/components/portal/CampusFacilitiesFeedback.tsx` — original campus facilities reporting UI; needs institutional ticketing, authorization, attachments and audit rules.
3. `src/components/portal/PortalNotificationsPopover.tsx` — original notification popover; current staging has `NotificationCenter`; preserve secure current API instead of duplicating channels.
4. `src/components/portal/StudentActivityTimeline.tsx` — original mock activity timeline; **do not show seeded histories as real activity**.
5. `src/components/portal/StudentUnifiedSearchFilter.tsx` — original student search; uses seed library records; needs permitted per-student resources and real API results.

### Key modified entry points requiring tracked parity decisions

| Source file | Status | Migration rule |
| --- | --- | --- |
| `src/App.tsx` | Modified | Preserve original website and intent; keep server-session login, role defaults, authenticated routes and no public ERP advertising |
| `src/components/portal/PortalHeader.tsx` | Modified | Original ERP module labels and functionality need mapping to a compact, accessible secured shell; never restore demo role switching |
| `src/components/portal/StudentPortalView.tsx` | Modified | Restore missing student capabilities **only** when authorized real data endpoints exist |
| `src/components/portal/TaskManagementDashboard.tsx` | Modified | Original Task Management is genuinely part of AI Studio; current visual refinements are separate implementation decisions |
| `src/components/portal/PortalLoginModal.tsx` | Modified | Retain secure backend authentication; do not restore ZIP's demo account password behavior |
| `src/components/portal/FacultyAdminDashboard.tsx` | Modified | Confirm staff APIs and permissions; reject sample faculty in operational reports |
| `src/components/portal/IntegratedAnalyticsHub.tsx` | Modified | Real metrics only; separate unconfigured integrations from confirmed realtime feeds |
| `src/components/public/PublicNavbar.tsx` | Modified | Preserve original public information architecture while not publicly advertising ERP/staff login |
| `src/components/public/PublicLeaderProfile.tsx` | Modified | Keep actual verified portraits and readable fallback behavior |
| `src/components/public/PublicFooter.tsx` | Modified | Do not advertise intranet gateway to public visitors |
| `src/main.tsx` | Modified | Preserve secure runtime initialization and current styles |
| Other modified source files | Modified | Reconcile per component against original Git SHA and test behavior |

### Original components already identical in staging

- `AcademicPlanningRegistration`
- `AdmissionsReviewModule`
- `FinanceBursarModule`
- `PolicyComplianceRegister`
- `VirtualClassroomCollab`
- `PublicAbout`
- `PublicAdmissions`
- `PublicCalendar`
- `PublicColleges`
- `PublicDEI`
- `PublicHero`
- `PublicVirtualTour`

*Note:* exact source matching means component source is preserved; it does **not** prove that its backend endpoint is implemented, permitted, persisted, or tested.

## Source-to-staging migration acceptance gate

Do not call the original application fully migrated until ALL criteria below are evidenced:

- [x] Original source archive inventoried and mapped to GitHub main
- [x] Original media assets previously copied into staging and verified in build
- [x] Core public site rendered with original branding
- [x] Basic staging server/session authentication retained
- [ ] All 5 missing original components reconciled, rebuilt or expressly retired by stakeholder decision
- [ ] All 16 modified components have a documented design/function/security decision and browser acceptance test
- [ ] Each ERP screen mapped to a live, tested, server-authorized API contract
- [ ] No seed student, fabricated staff activity, fake metrics or unsafe demo role bypass in operational displays
- [ ] Route, accessibility, keyboard and responsive checks at desktop, tablet and mobile
- [ ] Controlled backup/recovery drill; university live data preserved
- [ ] Original visual identity and enterprise shell approved by HIAU decision makers

## Execution order

1. **Baseline fidelity:** verify source snapshot against GitHub main with this automated audit; record deliberate deviations. Do not replace live staging with ZIP contents.
2. **Student capability integration:** restore activity and search only after backend contracts and record ownership checks; implement discussions behind a feature flag until course membership and permissions are proved.
3. **Institutional workflow integration:** campus facilities and notifications connect to server-authorized resources; no seed-only operations.
4. **Component-by-component acceptance:** admissions, registrar, finance, faculty, academic planning, analytics, compliance, documents.
5. **Enterprise UI/UX:** only after source and behavior are reconciled; consistent design tokens, responsive navigation, visual hierarchy, accessible contrast, no redundant controls, no overflow.
6. **Production gate:** backup proof, security/privacy checks, end-to-end role tests, performance, verified academic/public claims, institutional signoff.

### Operating boundaries

- **Public site:** no prominent ERP sign-in. Private access via protected staff URL and server authentication.
- **AI Studio main:** original source reference, never force-push or overwrite.
- **Staging:** integration only; no automatic production promotion.
- **Production:** do not redeploy or modify during this audit.
- **Demonstration database:** treat `data/university-db.json` as untrusted sample data and never import into institutional records.

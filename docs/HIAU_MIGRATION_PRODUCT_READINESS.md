# HIAU original AI Studio → secure staging migration and product-readiness plan

Updated: 2026-11-09. Authoritative design reference: **the latest `main` branch from Google AI Studio**.
Development branch: `staging`; public staging: `hiau-staging.totag.network`.
Do not push to `main` from the staging branch. Do not move staging data to production automatically.

## Confirmed architecture

- `main` includes the original HIAU public design and ERP presentation, but is not a secure, complete production backend.
- `staging` is a diverged branch with substantial authentication, SQLite persistence, API, and integration work.
- The current `staging` entry point renders the restored `src/App.tsx` with the original public pages and ERP portal.
- The legacy `src/WorkspaceApp.tsx` remains present as migration reference, **not** the active entry point.
- Two original campus videos, the university seal, and 22 image assets were restored into `staging` from `main`.
- The current authentication and staging SQLite volume must be preserved. Server-side access checks remain mandatory regardless of client navigation.

## Priority defects confirmed from source and screenshots

| Problem | Corrective approach | Acceptance criteria |
| --- | --- | --- |
| Super Admin could arrive at Student Portal / demo student ID `u-student` | Use role-aware default and prevent demo impersonation | Super Admin opens Operations; student records only for authorized student identities |
| ERP menu displayed 15+ entries, several with no App renderer | One shared route registry for actual screens, with secondary modules grouped | No dead top-level tabs; menu stays usable at laptop/tablet widths |
| Original AI Studio visual design is mixed with separate staging CSS | Retain original branded public site, isolate ERP shell styles; design tokens and accessible controls | No text-on-text or purple-button contrast regression; consistent spacing |
| Print preparation drew `DEMO_STUDENT` / `u-student` instead of authenticated data | Do not issue apparently official documents from sample data | Document generation is withheld when no linked verified record exists |
| `main` and `staging` diverged; restoring files one at a time lost dependencies | File-by-file migration matrix, backend compatibility checks, no unreviewed branch overwrite | Every major module has source mapping, real endpoint mapping, tests and release gate |
| Public leadership assets were unavailable | Recover original binaries and proper source paths | Production build includes images; individual portraits render in browser |
| Broad institutional claims and fake metrics appear in prototype content | Replace with verified content or explicitly label as draft | No unverified accreditation, operational metrics, fees, dates or institutional biographies presented as verified |

## Workstreams

### M0: Branch and data safety (required before data migrations)

1. Keep `main` as the AI Studio source reference, `staging` as integration, and preserve a known-good release commit.
2. Verify DB location, volume mounts, migration version, actual backup/restore, and permission isolation on the staging server.
3. Never drop or rewrite production tables to align UI mocks. Use additive versioned migrations, transactional scripts and rollback tests.
4. Redact secrets and use staging-only test accounts for acceptance.

### M1: Product shell, navigation, and identity (started in this PR)

- Canonical implemented module registry and role-appropriate default.
- Eliminate dead navigation, fabricated badges, horizontal clutter and unnecessary repeated toolbars.
- Retain original AI Studio navigation structure and brand on public pages, but a distinct enterprise ERP shell.
- Add keyboard focus states, consistent spacing, meaningful hierarchy and mobile navigation.
- Disallow cross-role student profile impersonation and demo-generated documents.

### M2: Backend contract reconciliation (not yet complete)

Audit each original UI component against a real endpoint with tests and permission rules:

| Module | Frontend | Mandatory verification |
| --- | --- | --- |
| Tasks | TaskManagementDashboard | Server persisted tasks, owner assignments, status/approval trail |
| Analytics | IntegratedAnalyticsHub | Real source data, clear empty states, no fabricated realtime metrics |
| Faculty | FacultyAdminDashboard | Staff CRUD, approvals, RBAC, audit history |
| Academic planning | AcademicPlanningRegistration | Terms, prerequisites, sections, enrollment atomicity |
| Admissions | AdmissionsReviewModule | Application lifecycle, identity, review and acceptance |
| Finance | FinanceBursarModule | Invoices, reconciliation, receipts and posted transactions |
| Compliance | PolicyComplianceRegister | Controlled records, authorizations and immutable audit events |
| Student | StudentPortalView | Authenticated student ID, grades, fees, privacy and consent |
| Virtual classroom | VirtualClassroomCollab | Valid service endpoints, access policies, safe disabled state |

**Known risk:** legacy `seedData.ts` and prototype screens still contain sample profiles and literal dates. Their presence does not mean features are production-ready. Inventory, flag, and remove or replace them only after real API parity is verified.

### M3: Enterprise visual polish

- Visual tokens: HIAU purple `#4A1249`, heritage gold `#C39A53`, accessible whites and neutral text.
- Reusable UI components: buttons, tabs, forms, inputs, tables, dialogs, toasts, empty/loading/error states.
- Navigation: compact module hierarchy and responsive behavior, consistent header/footers and one search entry.
- Screen-by-screen review at desktop, tablet and mobile widths; resolve overflow, truncation, contrast, alignment, hierarchy, accessibility and interaction.
- Preserve original AI Studio public-site character; do not rewrite home/leadership layout for cosmetic convenience.

### M4: Enterprise security and data acceptance

- Test real role-specific login, refresh, logout, disabled accounts, password reset, and CSRF.
- Test data isolation: users cannot read or modify another user's academic/finance records.
- Validate backups, restore rehearsals, migrations, file uploads and signed attachments.
- Audit PII logging, rate limits, access policies and integration secrets.

### M5: Release gate

Do **not** promote to `hiau.totag.network` until all of the following are green:
- CI typecheck/build/tests + end-to-end UX smoke tests.
- Correct `main`-derived original public design and assets.
- No dead navigation / erroneous role default / demo data in live workflows.
- Accurate institutional content, fees and dates approved by HIAU.
- Verified finance/admissions/registrar/RBAC and clean audit trail.
- Backup and rollback rehearsal, performance and responsive accessibility checks.
- Explicit stakeholder sign-off.

## Current PR scope

This PR is **M1 foundation**, not a claim of complete migration. It fixes route integrity, admin entry, unauthorized student portal fallback, and fake student print records. Remaining M2–M5 work must be developed and tested in separate reviewable changes before product-ready status.

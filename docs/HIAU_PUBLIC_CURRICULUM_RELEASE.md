# HIAU public degree-curriculum release — controlled milestone

## What changed

Curriculum Studio now has a **separate public publication step**. Super Administrators may publish a fully approved internal curriculum to a matching public degree page for a stated effective academic year. Approval alone remains private.

An immutable snapshot of program code/title, credential, college, credit-category breakdown, year/semester course sequence, and prerequisites is served from `GET /api/public/degree-curriculum/:route` **only after explicit publication**.

The public response **never includes** private source notes, reviewers, identities, or unresolved drafts. The exact public degree title must match one of the 19 approved UI route names. A provisional `REF-*` code or `SOURCE_REVIEW_REQUIRED` record cannot be released.

## Actions and protections

- **Registrar:** Enter draft, source, courses, credit totals and submit for review. Cannot publish or withdraw.
- **Super Administrator:** Approve reconciled curriculum, then separately choose **Publish to degree page**, enter effective academic year, and confirm.
- **Withdrawal:** Explicitly remove the active release from public pages without deleting its version history or changing existing student enrollments.
- **Versioning:** Every re-publication creates a new numbered snapshot; only one may be active for a degree.
- **Audit:** Release/withdrawal operations record actor and degree/version actions.
- **Backups:** Publication table participates in operational SQLite export/import; old backups may omit it without failing.
- **Live ERP:** No changes to existing `programs`, `courses`, admissions, registration, graduation, grades or invoices.
- **Failure states:** If not published, the degree page explains that the detailed course sequence is unavailable rather than showing draft information.

## Acceptance gates

Run lint, production build, integration tests, role checks, public anonymity tests, withdrawal tests and backup round-trip. On deployed staging, use an approved **test curriculum** matching an existing degree title to demonstrate all three conditions: draft hidden, approved hidden, published visible. Do not publish PDF reference programs automatically or infer approval from the historical College of Science file.

Video content and the user-provided Accounting replacement stay unchanged.

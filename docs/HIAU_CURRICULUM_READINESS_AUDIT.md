# HIAU curriculum completion — readiness and prerequisite audit

This milestone adds a controlled **readiness report** to Curriculum Studio, rather than silently treating the 26-page *College of Science.pdf* as an official, fully reconciled curriculum.

## Administrative experience

Registrar and Super Administrator can select a program under **ERP → Curriculum Studio** and see:
- Entered versus required credits for university general, college core, major, minor and elective categories.
- Missing required-course entries and mismatched category totals.
- Duplicate course codes within a program, including repetitions across semesters.
- Prerequisite codes that do not match the entered curriculum.
- Courses scheduled before or alongside their own prerequisites.
- Circular dependencies and self-prerequisites.
- Missing course-level source-page references (advisory).
- Unverified `REF-*` program codes and unresolved `SOURCE_REVIEW_REQUIRED` notes (blocking).

The backend returns an authenticated `GET /api/curriculum/programs/:id/readiness` report to Registrar or Super Administrator only. It **does not change** any source totals, enrolled students, fees, course registrations, or published academic records.

The approval endpoint now **rejects** blocking readiness issues, and the separate public publishing endpoint checks readiness again immediately before release.

## Confirmed user instruction

**Civil Engineering uses 179 total credits**, broken down as 44 university general + 36 college + 90 major + 9 electives. This was already recorded in the reference source. The uploaded PDF's competing 177 figure remains source evidence, not an alternative operative graduation total.

## Scope and limitations

The university's uploaded College of Science document supplies degree-plan information and sample sequences, but not every course has yet been transcribed and verified against individual page tables. The readiness report identifies absent and conflicting data **after entry**. It is not a PDF parser, and does not assert the catalogue is complete until actual rows reconcile.

Prerequisites written in the current manual field must be comma- or semicolon-separated exact course codes; complex policy expressions (either/or prerequisites, waivers, concurrent enrollment, external prerequisites and cross-listed aliases) require a future structured academic rules model and must not be invented from narrative PDF text.

A passing automated readiness audit does not establish regulatory approval, accreditation, current program availability, or completeness of the original PDF. A Registrar/academic committee must still sign off on the actual course catalogue.

## Staging acceptance

1. Open an unverified reference program and confirm it shows blockers.
2. Add or correct one course and confirm the report updates.
3. Enter a duplicate code, unknown prerequisite and out-of-order prerequisite; confirm approval blocks them.
4. Run authenticated role tests: student cannot call the readiness API.
5. Confirm approved and published programs retain their existing public degree pages and that student records are unchanged.
6. Verify TypeScript, build, automated tests and the deployed Coolify interface before production.

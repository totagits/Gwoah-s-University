# HIAU Curriculum Studio — administrative intake and review

This protected module is accessed through **ERP → Other workspaces → Curriculum Studio**, for `super_admin` and `registrar` accounts only. It provides manual entry and review of:
- Official program names, codes, college, credential, total graduation-credit requirements;
- Required university general, college core, major, minor and elective credit portions (0.5-credit precision);
- Course codes, official titles, requirement category, credit values, academic year and semester, prerequisite codes, notes and page references;
- Source-document citation (e.g., *College of Science.pdf*), source page and unresolved discrepancies.

## Approval controls

A Registrar or Super Administrator may create/edit a **Draft**, add and remove course entries, and submit it **In Review**. Only a Super Administrator can approve the review or reopen it for corrections. Approval is blocked if totals do not reconcile, required core categories are incomplete, or required elective/minor pools have no entries.

**Important:** “Approved” currently means approved for **internal academic catalog preparation**, NOT published. It does not create entries in the operational `programs`, `courses`, `program_requirements`, `sections`, registration, fee or graduation tables. A separate publishing/mapping workflow with the Registrar's signoff is required. This isolation protects existing student records from inconsistent input.

Administrative actions create audit entries. Curriculum tables reside in `operations.sqlite`, are included in existing relational backups, and remain compatible with backups made before these tables existed. Existing session and CSRF middleware protects the URLs; server roles are checked separately from the frontend.

## Curriculum PDF review constraints

The uploaded 26-page *College of Science, Technology, and Allied Health* outline is a reference **not an automatically approved catalog**. Discrepancies requiring Registrar review include:
- Initial 6-degree summary credits (44/26 general/college) versus individual degree plans (38/29);
- Science & Technology total 133 in one table versus 129 in another;
- Information Technology total 129 versus 131;
- Course-code collisions such as ITCB 404 (internship versus information security);
- Initial offerings (Science & Technology, IT, Environmental Science) versus additional intended allied-health offerings;
- Engineering and health degrees require proof of program availability and accreditation before display as current admissions offerings.

Enter exact documentary values **with source pages**, attach an explanatory discrepancy note, and do not submit for approval until the department reconciles them.

## Outstanding product readiness

- Bulk CSV/PDF extraction with staging preview, validation and conflict resolution.
- Verified course codes across programs, alias management and shared general courses.
- Semester credit load and prerequisite graph validation across all degree sequences.
- Formal Registrar/Dean/Academic Senate signoff and immutable curriculum versioning.
- Explicit approved-curriculum → published catalog release, with effective academic year and rollback.
- Tests with actual Registrar and Super Administrator accounts on deployed Coolify staging.

No automatic PDF import, live university data overwrite or production change is included in this slice.

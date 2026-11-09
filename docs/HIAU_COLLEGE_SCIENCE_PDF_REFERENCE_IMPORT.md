# HIAU College of Science PDF — reviewed intake milestone

**Source:** user-provided 26-page *College of Science.pdf*.

## What is staged

Protected `ERP → Other workspaces → Curriculum Studio → PDF reference drafts` provides a preview of eight degree candidates named in the uploaded document. Registrar or Super Administrator can import them into the **draft-only** `curriculum_programs` and `curriculum_courses` tables, with 8 source-referenced program candidates and carefully selected example course sequences. Import is transactionally atomic, idempotent, and does not overwrite existing codes.

**No import occurs on deployment.** An authorized administrator must preview, confirm, and trigger it in the secure UI. The attached PDF is not published and does not become university policy.

Program codes are provisional `REF-HIAU-*`, because the PDF lists degree titles but does not establish official program identifiers. Administrators can edit codes to institution-approved values. `SOURCE_REVIEW_REQUIRED` flags and `REF-` codes **prevent submission for review**, and even after they are resolved, approval requires full general/college/major sequences and minor/elective options.

## Source trace and inconsistencies

| Degree candidate | Source pages | Candidate category split | Review required |
| --- | --- | --- | --- |
| B.S. Information Technology | 1, 3, 5–7 | 44 + 26 + 39 + 12 + 12 = 133 | Table 3B 129, later schedule 131; ITCB 404 collision |
| B.S. Environmental Science | 1, 4–5, 8 | 44 + 26 + 44 + 12 + 12 = 138 | Detailed program claims 135; course-code mismatches |
| B.S. Science and Technology | 1, 3, 5–6 | 44 + 26 + 43 + 12 + 12 = 137 | Tables also claim 133 and 129 |
| B.S. Civil Engineering | 9–13 | 44 + 36 + 90 + 9 = 179 | Source total 177; content section says 90/91 |
| B.S. Electrical Engineering | 14–17 | 44 + 36 + 93 + 9 = 182 | HEEN 301 is reused; actual approval/availability unknown |
| B.S. Nursing | 1, 17–20 | 44 + 26 + 54 + 12 = 136 | Later-intended offering, availability/approval unverified |
| B.S. Laboratory Science | 1, 20–23 | 44 + 26 + 54 + 12 = 136 | 'Medical Laboratory Services' terminology also used |
| B.S. Health Administration | 1, 24–26 | 44 + 26 + 54 + 12 = 136 | B.S. and B.A. wording conflict |

Course entries are **examples extracted from specified semester pages**, not a complete program curriculum. Some codes in the PDF conflict or appear typographically inconsistent. Do not infer prerequisites where the source does not specify them.

## Security and release conditions

- Only Registrar and Super Administrator can list/import drafts.
- User identity comes from authenticated server session; POST uses existing same-origin/CSRF middleware.
- All inserted records are draft-only, source-referenced, explicitly unverified, auditable and included in SQLite backup snapshots.
- Imported drafts do **not** touch live operational `programs`, `courses`, `sections`, fees, student enrollment or graduation rules.
- Do not attempt to bypass missing-course approval checks by inserting fictitious records.
- Verify the deployed workspace with real authorized credentials, review each entry with the Registrar, then complete/correct academic sequence.
- No production catalog publication until HIAU formally confirms exact program codes, credit requirements, authorized degree offerings and accreditation.

## Remaining steps

Complete the full 26-page course-level transcription with page/row verification, reconcile source contradictions, assign official program codes and sequence prerequisites, and implement explicit separately approved publication/version control after university sign-off.

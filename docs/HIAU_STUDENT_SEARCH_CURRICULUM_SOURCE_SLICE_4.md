# HIAU — verified student unified search and academic curriculum source review

Source snapshot: user-supplied `College of Science.pdf`, 26 pages, entitled *College of Science, Technology, and Allied Health*.

## Slice 4: secure Student Unified Search

The original AI Studio `StudentUnifiedSearchFilter.tsx` loads demonstration library resources and expects legacy materials/calendar endpoints that are not available as authenticated, verified search services in the present staging server.

A controlled feature-parity implementation now indexes **only records already returned to the authenticated student** by `GET /api/workspaces/state`. Results are scoped to the student ID in `SecureStudentWorkspace` and include:
- enrolled/previously registered courses with actual course codes and term labels;
- grades only when their server-provided `status` is `published`;
- posted student invoices with recorded monetary amounts in integer USD cents.

Search and type filtering are done locally on this authorized subset, with honest empty states. The feature does **not** expose other students, publicly query a catalog, search uploaded materials, issue financial documents, or fabricate examination schedules. No new API, database migration or demo content is introduced.

## Curriculum document: useful but not yet approved import data

The PDF is an unusually valuable source of actual university program structures, credit requirements, course codes and four-year course sequences. It should be mapped into the Registrar's editable **draft curriculum staging** workflow only after academic verification and approval.

The document itself contains material differences that must be resolved before setting credits, prerequisites or graduation rules:

| Page(s) | Source statement | Verification issue |
| --- | --- | --- |
| 1–2 | Opening six-degree comparison lists general credits at 44 and college credits at 26; totals IT 133, Environmental Science 138, Science & Technology 137 | Subsequent tables for initial programs use general credits 38 and college credits 29, with different totals |
| 3, 5 | Science & Technology is described as 133 total hours in its degree-requirement table; later detailed plan identifies 129 | Total degree credits conflict |
| 3, 5 | Information Technology degree requirements show 129 in one header; later plan gives 131 | Total degree credits conflict |
| 4–5 | Electives section says 24 credits, comprising 12 general BLEST electives and 12 minor credits; summary separates both categories | Ensure minors are not counted twice or treated as unrestricted electives |
| 2, 17–18 | Three initial degree programs are distinguished from later Nursing, Laboratory Science and Health Administration offerings | Do not label future degree offerings as currently open without institutional confirmation |
| 9–17 | Civil and Electrical Engineering plans appear with 177 and 182 total credits respectively | Confirm approval, available cohorts, and prerequisites before publishing as enrollable programs |
| 3, 6–7 | ITCB 404 appears as Technology internship in Science & Technology and as Information Assurance and Security in IT | Course-code collision needs department review before creating a unique course record |

**Decision gate:** no automatic PDF-to-database import, no graduation-credit recalculation, and no publication of these curricula as approved academic regulations until the Registrar or authorized College leadership confirms corrected totals, course codes, sequence and availability. Preserve the PDF as source evidence.

## Acceptance requirements

- Verify student search with an authenticated student who has one valid course, published grade and invoice.
- Verify a second student sees only their own records; unpublished grades do not appear.
- Verify empty search and filtering, keyboard behavior and mobile layout.
- Validate source review with the university Registrar before any degree-program or course catalog population.
- No release to production until these checks, authorization and backup acceptance pass.

# WEB-GATE — 19-Degree Public Website Inventory

**Source inspection date:** 2026-11-12.  
**Sources:** `src/components/public/PublicColleges.tsx`, `scripts/hiau-degree-video-content.json`, `src/components/public/PublicDegreeDetail.tsx`, `src/components/portal/WebsiteVideoLibrary.tsx`.

## What is confirmed from source code

- **19 unique program names** are declared in public college cards.
- **19 corresponding degree-explainer records** exist in the video educational content JSON.
- **19/19 names agree exactly** between these two datasets; no missing/extra title detected in this comparison.
- Public degree details use a named program route and dynamic managed video endpoint `/api/public/video/{route}`.
- The Website Video Library provides degree-focused management UI. Its functioning and authorized save/publish/remove workflow for **each** of the 19 programs has **not** yet been verified by this source-only check.
- This is a **catalog/title inventory**, not university accreditation, approved curriculum verification, or proof that every video asset currently exists and plays.

## Verified program-name inventory

| # | Public program title | College source key | Acceptance |
|---:|---|---|---|
| 1 | Bachelor of Business Administration in Accounting | business | Listed; media and credits live validation pending |
| 2 | Bachelor of Business Administration in Entrepreneurship | business | Listed; media and credits live validation pending |
| 3 | Bachelor of Arts in Liberal Arts & Humanities | liberal_arts | Listed; media and credits live validation pending |
| 4 | Bachelor of Arts in Strategic Communications & Media | liberal_arts | Listed; media and credits live validation pending |
| 5 | Bachelor of Science in Social Sciences & General Studies | liberal_arts | Listed; media and credits live validation pending |
| 6 | Bachelor of Education in Early Childhood Education | education | Listed; media and credits live validation pending |
| 7 | Bachelor of Education in Elementary Education (Language Arts & Social Studies) | education | Listed; media and credits live validation pending |
| 8 | Bachelor of Education in Elementary Education (Math & Science) | education | Listed; media and credits live validation pending |
| 9 | Bachelor of Education in Secondary Education (Mathematics Focus) | education | Listed; media and credits live validation pending |
| 10 | Bachelor of Education in Secondary Education (English Focus) | education | Listed; media and credits live validation pending |
| 11 | Bachelor of Science in Information Technology (IT) | science_tech | Listed; media and credits live validation pending |
| 12 | Bachelor of Science in Science and Technology | science_tech | Listed; media and credits live validation pending |
| 13 | Bachelor of Science in Nursing (BSN) | science_tech | Listed; media and credits live validation pending |
| 14 | Bachelor of Science in Laboratory Science | science_tech | Listed; media and credits live validation pending |
| 15 | Bachelor of Science in Environmental Science | science_tech | Listed; media and credits live validation pending |
| 16 | Bachelor of Science in Health Administration | science_tech | Listed; media and credits live validation pending |
| 17 | Bachelor of Theology in Christian Education | theology | Listed; media and credits live validation pending |
| 18 | Bachelor of Theology in Christian Counseling | theology | Listed; media and credits live validation pending |
| 19 | Bachelor of Theology in Missions & Global Evangelism | theology | Listed; media and credits live validation pending |

### Totals by college source key

- `business`: 2
- `liberal_arts`: 3
- `education`: 5
- `science_tech`: 6
- `theology`: 3

## Explicit inconsistency requiring resolution

`PublicDegreeDetail.tsx` includes a special case for **Bachelor of Science in Civil Engineering**, referring to a **179-credit** curriculum under Registrar review. **Civil Engineering is not among the 19 names in the present public-college program list or corresponding 19-item degree-explainer data.**

Do **not** add this degree as a twentieth active public program or silently remove the reference. Reconcile its authorized academic/program status against officially approved HIAU catalog and Registrar documentation. If not currently offered, the special case should be removed or stored as non-public draft; if approved, update the source catalog and explain the resulting change to the 19-degree scope.

## Degree-by-degree acceptance evidence required (all 19)

For every program, record:
- Program belongs to officially verified college/department; exact public title, credential, and availability status approved.
- Curriculum credits and semester breakdown correspond to published, approved Registrar source; unapproved credits must be labeled draft, never asserted as accredited.
- Public details page opens on desktop and phone without ERP login.
- Institutional description and career claims are approved and avoid unsupported guarantees.
- Actual program-specific video exists and plays; verify source, poster/thumbnail, muted/autoplay fallback and captions.
- Authorized CMS staff can upload, edit, replace, delete/restore and approve the video without editing GitHub source.
- Unpublished video files are denied anonymously; published revisions behave correctly.
- Any illustrative image is clearly identified and replaceable from CMS.
- Capture staging deployment commit, screenshot, reviewer, result, and unresolved finding.

## Bundled video file audit (2026-11-12)

Checked the configured `defaultSrc` for each of the 19 slots in `server/publicWebsiteMedia.ts` against the actual file path on GitHub `staging`. The first four program slots use explicit historical filenames; all other slots use normalized college/program path keys.

**Found at configured bundled paths (4/19):**
- Accounting — `public/assets/degree-clips/image_20261108_223153.mp4`
- Entrepreneurship — `public/assets/degree-clips/image_20261108_232357_1.mp4`
- Liberal Arts & Humanities — `public/assets/degree-clips/image_20261108_233524.mp4`
- Strategic Communications & Media — `public/assets/degree-clips/image_20261109_002629_2.mp4`

**Not found at their configured bundled paths (15/19):** Social Sciences & General Studies; Early Childhood Education; Elementary Education (Language Arts & Social Studies); Elementary Education (Math & Science); Secondary Education (Mathematics); Secondary Education (English); Information Technology; Science and Technology; Nursing; Laboratory Science; Environmental Science; Health Administration; Christian Education; Christian Counseling; Missions & Global Evangelism.

**Critical caveat:** Public video playback first uses any published upload in the server's private public-media storage. GitHub bundled-path inspection cannot see those uploads. Thus 15 absent bundled files **does not establish** 15 absent or broken live public videos. Audit CMS media records and perform an authenticated staging/public browser playback check for all 19 separately. No approved media should be silently replaced or invented.

**Next website priority:** In administrator Website Video Library export 19-degree audit CSV, record per-program `published`/`draft`/`defaultAvailable` state and test public URL, actual video, correct thumbnail, admin replace/unpublish/restore and mobile accessibility. Cross-check content approval before marking Accepted.

## Evidence status

**Source inventory check: Passed (19/19 matching labels).**  
**Official program approval: Pending.**  
**19/19 live video-management checks: Pending.**  
**Civil Engineering scope/credit reconciliation: Pending.**  
**Complete public website acceptance: Pending.**

Parent register: `docs/HIAU-MASTER-DEVELOPMENT-REGISTER.md`. Tracking: GitHub issue #93.

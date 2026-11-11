# HIAU Master Development and Acceptance Register

**Baseline:** 10 November 2026 · **Version:** 1.0 · **Status:** Active source of truth  
**Project:** Harvest Intercontinental American University (HIAU)  
**Repository:** totagits/Harvest-Intercontinental-American-University  
**Staging:** https://hiau-staging.totag.network · **Working branch:** `staging`  
**Production:** `main` — no promotion without explicit university authorization.

This master register governs development order and acceptance. The older [Public Website Acceptance Register](HIAU_PUBLIC_WEBSITE_ACCEPTANCE_REGISTER_2026-11-10.md) is a supporting evidence annex, not a second project plan. Its duplicate A4 headings and outdated statement that the admissions endpoint is absent are superseded by the actual PR #58 and #59 implementations.

## 1. Original scope and mandatory order

**P1 — Public website first.** Complete HIAU identity, branding, homepage, leadership and governance, all five colleges and 19 public degree-detail routes, authentic media, admissions and financial-aid information, tour, events, calendar, student experience, contact details, public content administration, accessibility and mobile views.

**G1 — Website acceptance gate.** Test public behavior, content accuracy, privacy, accessibility, data persistence and institutional approval. Do not label the site accepted solely on source changes or GitHub green tests.

**E0 — Existing ERP foundation verification.** The ERP is embedded underneath the public website and requires authenticated access. Retain work already completed (login, sidebar, intake, permissions) but **pause new ERP features** until public website acceptance.

**E1–E4 — Dedicated ERP development:** admissions/Registrar/course registration; Finance/tuition/scholarships; faculty/HR/online classes/assessments; student services/peer tutoring/library/alumni/analytics.

**G2 — Production gate.** Promote to `main` only with institutional approval, a verified target commit, rollback/backup plan, and relevant test sign-offs. No real payments or real student records as test data.

## 2. Exact meanings of project status

- **Implemented:** Code exists, not proof of live operation.
- **CI passed:** Specific commit passed automated lint, build and tests, not a deployment confirmation.
- **Browser observed:** The specific behavior visible in a dated screenshot or browser session; not an end-to-end test.
- **Acceptance pending:** Required live, content, permission, persistence, or accessibility review is incomplete.
- **Blocked:** Known prerequisite, such as a signed university policy or approved photograph, is missing.
- **Accepted:** Named authorized reviewer approved the defined test cases with recorded evidence.
- **Released:** Approved version deployed to production and verified.

Every acceptance entry must record date, commit, URL, role, viewport, expected and actual outcome, evidence, reviewer, and decision. Do not include credentials, private applicant data or personal financial information.

## 3. Master status matrix — public website

| ID | Component | Development evidence | Outstanding acceptance requirement | Status |
| --- | --- | --- | --- | --- |
| WEB-01 | Brand, homepage and navigation | Public site exists; HIAU branding visible in user screenshots | Full home/menu/search/CTA/footers test and approved copy | Acceptance pending |
| WEB-02 | Governance, directory and 19 leader profiles | PRs #52, #53, #56; individual profiles positively assessed | Recheck all 19, photo identities/titles/biographies, directory/mobile | Acceptance pending |
| WEB-03 | Footer | PR #54 | Confirm post-fix contrast, phone/address/email accuracy and links | Acceptance pending |
| WEB-04 | Homepage videos and admin media | PRs #48–#51 and existing media UI; earlier campus playback observed | Video start/fallback/controls, publishing permissions, redeploy persistence | Acceptance pending |
| WEB-05 | Five colleges and 19 degree routes | PR #55 CI coverage | Open 19/19 pages; check course details, videos, image rights, navigation | Acceptance pending |
| WEB-06 | Admissions and aid information | PR #57 | Confirm institution-approved policies, dates, fees and scholarship criteria | Acceptance pending / policy blocker |
| WEB-07 | Public application intake and scholarship interest | PRs #58–#59; backend HTTP tests | Fictional browser submission, receipt, staff queue, origin, privacy and persistence | Acceptance pending |
| WEB-08 | Events, calendar, tour, student experience | Public components present | Current events/claims, assets and links reviewed by HIAU | Acceptance pending |
| WEB-09 | Responsive, accessible, reliable site | Partial CSS and functional improvements | 375/768/1440/1600 px, zoom, keyboard, screen readers, slow network | Acceptance pending |
| WEB-10 | Operational and content release | Existing staging website and API | Confirm Coolify SHA, TLS, volumes, backup/restore, approved identity/claims | Blocked until checks |
| WEB-11 | Public-site final sign-off (G1) | None recorded | University approves WEB-01–10 and all critical defects close | Not accepted |

## 4. Master status matrix — existing ERP foundation (paused)

| ID | Component | Existing evidence | Remaining work | Status |
| --- | --- | --- | --- | --- |
| ERP-01 | Credential-protected portal | Screenshot shows signed-in University Administrator | Session, recovery, role changes and restricted API tests | Partially observed |
| ERP-02 | Collapsible sidebar | PR #60; screenshot confirms sidebar appeared | User screenshot showed left clipping; verify PR #61 corrected it | Acceptance pending |
| ERP-03 | Server role checks | Existing identity/workspace code; PRs #60–#61 targeted automated tests | Complete view/create/update/approve/delete/export/ownership matrix | Acceptance pending |
| ERP-04 | Admissions/Registrar | Public intake PRs #58–#59; formal workflow separate | Admissions decisions, records, registration/add/drop and testing | Future E1 |
| ERP-05 | Finance and scholarship awards | Partial ERP components, no complete transactional sign-off | Tuition, installments, reconciled receipts, awards, audit | Future E2 |
| ERP-06 | HR, faculty, LMS and online classes | Partial components/planned requirements | End-to-end staff, attendance, teaching, assessments and permissions | Future E3 |
| ERP-07 | Student services and advanced operations | Partial components/planned requirements | Peer tutoring, campus services, library, alumni and dashboards | Future E4 |

**Current priority: WEB-01 through WEB-11. No new ERP expansion.**
The eight existing roles are super administrator, registrar, dean, lecturer, bursar, admissions officer, student, and alumni. New HR, scholarship committee, executive, and auditor roles require approved server-side permission definitions before enablement.

## 5. Pull request evidence ledger

| PR | Staging merge SHA (short) | Work delivered |
| --- | --- | --- |
| #48–51 | 00f7da3d, b2177df0, 349a452b, 5c70a734 | Homepage video and diagonal refinement |
| #52 | e97dd228 | Leadership portrait quality baseline |
| #53 | 7b531d53 | Simplified individual leadership profiles |
| #54 | 6f785f88 | Footer contrast/layout |
| #55 | a157aac2 | Degree-route and media checks |
| #56 | da8ab791 | Leadership directory and governance redesign |
| #57 | d2a48532 | Public financial aid and scholarship inquiry |
| #58 | 7e5b932c | Persisted public admissions intake |
| #59 | e32d2a5c | Fix missing county submission field |
| #60 | 9a2c51a5 | ERP sidebar and role-aware rendering |
| #61 | 3bc16b87 | Desktop sidebar clipping correction and targeted RBAC tests |

A PR merge is **not** a deployment verification or institutional sign-off.

## 6. Test sequence and closure conditions

**P1A — Home/navigation:** Check homepage hero, menus, search, public CTAs, footer and protected portal entry, desktop and mobile. Capture screenshots and link defects to WEB-01,03,04,09.

**P1B — Leadership/content:** Verify all 19 leader cards and profile pages; approved photographs, names, titles, biographies, directory filters and governance overview. HIAU must approve identity/rights (WEB-02).

**P1C — Academic catalog:** Open every one of the 19 degree routes; verify media playback, duration, academic/credential claims and return links. Do not substitute generic or AI-made proof of real university facilities (WEB-05).

**P1D — Admissions/aid:** Verify published policy language; submit only fictional test applicants with aid opt-in and opt-out; confirm server reference and restricted staff queue; confirm error paths. Existing screenshot shows authorized queue with **zero received applications**, not a successful end-to-end submission (WEB-06–07).

**P1E — Quality and operations:** Audit calendar/events/tour, keyboard, mobile, 200% zoom, theme contrast, low bandwidth, authentication boundary, exact staging `APP_URL`, persistent `DATA_DIR` and restart/backup survival (WEB-08–10).

**G1:** All public tests and policies passed, open defects resolved, representative signs off specific deployed commit. Only then resume ERP E0–E4.

## 7. Open defects and decisions

| ID | Issue | Evidence | Fix in code | Verification |
| --- | --- | --- | --- | --- |
| DEF-01 | ERP sidebar left text/icons clipped | User staging screenshot after #60 | #61 | **Post-fix browser retest pending** |
| DEF-02 | County omitted from public admissions payload | Source contract review | #59 | **Live fictional submission pending** |
| DEF-03 | Governance assembly image blank | User screenshot before redesign | #56 | **Post-fix visual retest pending** |
| DEF-04 | Reused illustrative degree imagery | Existing degree page design | #55 clarifies captions | **Approved program imagery still needed** |
| DEF-05 | Final hero video start/blank state | Prior browser observations | #48–51 | **Latest browser retest pending** |
| DEF-06 | Deployment data durability unknown | No verified persistent-volume restart evidence | None | **Coolify acceptance required** |

All listed defects remain open until a recorded retest passes; the presence of a fix commit is not enough.

## 8. Stage gates, ownership and next action

**Institutional reviewer:** Confirms official academic content, leadership identity, photograph permissions, admissions/financial-aid policies, applicant privacy and final release acceptance.  
**Development:** Implements fixes, runs CI, documents verified results and tracks each open defect.  
**Operations:** Verifies exact deployed SHA, persistent storage and backup/recovery, TLS and environment configuration.

**Current active milestone: WEB-02 — Leadership and Governance review.** WEB-01 has been explicitly paused by the project owner with its Apply Now defect outstanding; it is not accepted. Review leader directory, 19 profiles, portraits, titles, governance, navigation and mobile layouts, without reopening the deferred Apply Now issue unless the owner requests it.

**Change-control rule:** Every future PR cites a WEB/ERP/DEF identifier and its acceptance result. Do not start another unrelated feature simply because the previous PR merged. Production `main` remains unchanged without explicit release authorization.


## WEB-01 evidence update — navigation source audit (10 November 2026)

- [x] Audited source for HIAU home navigation and footer destinations. Removed links invoking nonexistent `facilities` and `library` ERP tabs; removed unverified `/api/calendar/export.ics` link from the public menu rather than advertise a dead download.
- [x] Changed the public-site keyword navigation to report no match instead of silently sending unknown search terms to About; added Financial Aid/Scholarship lookup, responsive search wrapping and accessible labels.
- [x] Adjusted the Admissions menu to describe the existing intake rather than unimplemented acceptance decisions; restricted staff shortcut is now shown only to eligible authenticated roles.
- [x] Added Escape-to-close and mobile disclosure state for public navigation; supplied a source regression test.
- [ ] **Live staging review outstanding:** staging URL could not be retrieved through the external browsing tool in this session. Do not call browser behavior accepted on the basis of code alone.
- [ ] User/authorized reviewer must open Home, About, Campus Tour, Academics, Admissions/Financial Aid, Current Events, Student Experience, search, primary CTAs and footer on desktop and mobile; record screenshots and live deployment commit.
- [ ] Verify homepage hero autoplay and video controls, public text claims/approved media, and keyboard focus in Chrome; not established by these navigation fixes.

**WEB-01 remains Acceptance pending.** This change is a focused navigation repair, not overall public-site acceptance. Continue WEB-01 browser checks; no ERP work was added.


### WEB-01 homepage video loading observation and test (10 November 2026)
- [x] Source audit found no poster image for the first hero video, leaving a blank video surface while first frames buffer. Existing HIAU campus photograph `/assets/aistudio/image_29eb5504.png` is now attached as a **campus-video-only** loading poster, with a test checking the image asset and preservation of player controls.
- [ ] Live autoplay, buffering, video rotation, mute, poster behavior, and desktop/mobile layout remain **unverified**. A poster provides a visible initial preview, not evidence that video playback is fixed.
- [ ] Verify actual content identity/usage rights for the campus still; the photograph should not be shown as the identity of other clips.
- [ ] Live staging website could not be reached by the external fetcher and browser tab access was unavailable in this session. Confirm Coolify deployed commit, then conduct WEB-01 Chrome checks and attach screenshots.
- [ ] Final WEB-01 status: **Acceptance pending**. Other public website acceptance milestones and new ERP expansion are not unlocked.


### WEB-01 correction — restore video-only carousel (10 November 2026)
- [x] Per university owner instruction, **reversed PR #64's campus photo poster** in the public homepage hero. Images are not carousel slides and must not appear as a first-frame placeholder.
- [x] Added non-interactive loading spinner text while a selected video begins playing, including buffering, and explicit playback-error messaging without hiding player controls.
- [x] Preserved original video playlist order, muted autoplay attempt, automatic progression, previous/next, play/pause, mute and administrator-published video support.
- [x] Replaced the previous campus poster regression with a test that fails if any `poster=` attribute or the removed campus image is reintroduced to the carousel.
- [ ] **Live review pending:** verify the first content shown is the **actual campus video** after loading, then the classroom clip and any administrator-published clips; spinner is not the first carousel slide.
- [ ] Verify browser autoplay, buffering, published video playback, audio, mobile controls and actual staging deployed commit before WEB-01 acceptance.
- [ ] Do not mark WEB-01 accepted based solely on successful CI; `main` remains unchanged.


### WEB-01 public CTA and mobile navigation review (10 November 2026)
- [x] Source confirmed **Apply Now** on the public navbar is rendered while browsing a standalone degree or leadership page, but the admissions modal was previously mounted only inside the homepage. Fixed by making the same form available on degree/profile views without duplicating the homepage Admissions section or changing its position.
- [x] Mobile top-level section navigation now closes the menu after selection instead of leaving a dropdown covering the destination section.
- [x] Added source regressions for hero **Become a Student**, header **Apply Now**, profile/degree entry points, application cancellation, and public intake payload invariants (including county and scholarship interest).
- [ ] **Live staging verification pending:** from homepage, a degree page and a leadership profile, open Apply Now/Become a Student, verify the form appears, cancel without submitting, and verify navigation remains usable.
- [ ] Mobile 375 px and 768 px menu actions, website search results/no-match, scroll targets, keyboard navigation and viewport overflow remain to be observed in Chrome.
- [ ] No actual applicant data or paid transaction is authorized for this navigation acceptance. Use only fictional records if submission later becomes necessary under WEB-07.
- [ ] WEB-01 remains **Acceptance pending** until a dated browser observation and institutional sign-off are documented. Prior user-confirmed playback of campus/classroom videos is a functional observation, not full homepage approval.


### WEB-01 corrective retest — Apply Now failed on Accounting degree page (11 November 2026)
- **User evidence:** staging screenshot at `#degree=business--bachelor-of-business-administration-in-accounting` shows public header **Apply Now** button; user reports clicking it did **not** open the application form. The prior source-level PR #67 was insufficient; browser acceptance **failed**.
- **Remediation:** the header Apply Now controls are now real desktop/mobile links to `/?apply=1`, and the Admissions menu uses the same explicit destination. The URL can be pasted or refreshed, and the application dialog initializes from this public query parameter.
- **Layering correction:** application dialog is rendered via `createPortal(..., document.body)` above public header/dropdown stacking contexts. Closing the dialog removes the `apply` query without discarding other URL state.
- **Regression protection:** tests cover native links, query-controlled modal entry, degree/leader views, existing homepage application, underlying no-charge API payload and dialog layering.
- [ ] Confirm staging is deployed to the resulting commit, open the Accounting degree URL, click Apply Now, and verify the application form appears without signing in.
- [ ] Repeat on a leadership page and on a 375px mobile menu; cancel rather than submit personal details.
- [ ] Test direct `https://hiau-staging.totag.network/?apply=1` entry and close/reload behavior.
- [ ] **WEB-01 remains OPEN:** a green CI build is not an end-to-end browser acceptance.


### Owner decision — defer WEB-01 Apply Now; continue public website (11 November 2026)
- **Decision:** Project owner requested we stop repeated Apply Now attempts because they are consuming time and move forward. Preserve current work and revisit the defect only at a later, expressly selected repair/acceptance point.
- **Deferred defect DEF-07 — Apply Now on individual degree page:** University owner reported that the highlighted header button did not open the application from `#degree=business--bachelor-of-business-administration-in-accounting` after prior fixes. PRs #67 and #68 changed code and passed automated checks, but **no successful owner/browser retest has been recorded**. Status: **OPEN — DEFERRED / NOT ACCEPTED**. Avoid claiming the button works on staging.
- **WEB-01 status:** Partially observed (campus and classroom video playback/autoadvance reported working, university seal reported working); other checks remain pending. **Not accepted; not a production release gate.**
- **Next active milestone: WEB-02 — Leadership and Governance.** Review leadership directory and all 19 profiles, photo authenticity/rights, official titles and bios, header navigation, visual alignment, and mobile usability.
- **Exception to strict milestone order:** Owner has explicitly authorized proceeding to the next **public website** section despite the deferred WEB-01 defect. ERP development remains paused, and production `main` remains unchanged.
- **Follow-up condition:** Return to DEF-07 during consolidated public-site defect closure before final G1 acceptance; any repair must include a true browser validation rather than source-only assertions.


### WEB-02 implementation audit and new public staff profile controls (11 November 2026)
- [x] Verified the 19 **existing, hard-coded** public university leaders and faculty are represented by detail-profile identifiers, with automated source and portrait presence checks. Authenticity, appointment validity, titles, contact details and permission to display the photographs remain institutional approval items.
- [x] Fixed the invalid-profile fallback that could otherwise display the Chancellor's biography for a nonexistent leader URL. Invalid/retired profile links now display an explicit unavailable state.
- [x] Introduced **Public Staff Profiles** as a Super Administrator-only website content management workspace: create draft, edit professional name/title/category/biography, upload a JPEG/PNG portrait (up to 2 MB), preview, publish, unpublish and remove. New staff can be categorized as executives, trustees or faculty/staff.
- [x] Existing static leadership entries remain unchanged; newly published profiles appear in the leadership directory, filters and individual profile view. **Drafts, unpublished photos, and HR/employee records are not publicly exposed.** The feature records audit actions for publication changes.
- [x] Public staff changes use existing persistent `DATA_DIR` SQLite settings and protected photo storage; file/record preservation across a Coolify restart still requires operational verification.
- [x] Added API-level tests for unauthorized role denials, private drafts, required photo before publication, public visibility after publication and removal after unpublishing.
- [ ] Verify in staging as university Super Administrator: create a fictional faculty/staff draft, upload an approved test portrait, preview, publish, open the public directory and individual link, then unpublish and verify both public routes disappear. Use only fictional data in staging.
- [ ] Confirm official HIAU leadership details, staff appointment authority, photograph permission/identity, spelling, titles and qualifications, including all 19 existing profiles. Neither automated tests nor this content management feature constitutes such verification.
- [ ] Verify desktop/mobile layout, shareable direct links, keyboard/filters, audit records and photo persistence after approved backup/redeploy test.
- [ ] WEB-02 remains **acceptance pending** until browser acceptance and official content approval. WEB-01 Apply Now remains an explicitly deferred, separate defect.

# HIAU Partner Academic Distribution — Staging Acceptance Gate

**Scope:** PR #140 → #141 → #142 (dependent branches). This is **not** a production release authorization. It does not replace the 19-degree website audit, existing course planning/Registrar/Finance workflows, or separate Student and Staff PWAs.

## Gates before staging deployment
- [ ] PR #140 CI successful (lint, build, full tests).
- [ ] PR #141 CI successful (lint, build, full tests; partner identity and academic review tests).
- [ ] PR #142 CI successful (lint, build, full tests; distribution tests, backup round-trip, authenticated HTTP acceptance test).
- [ ] Review all dependency diffs and merge sequentially to `staging` only; verify Coolify deployment SHA and health.
- [ ] Snapshot/restore trial includes partner tables and operational records. Independently verify `identity.sqlite` backup and credential/session recovery.
- [ ] Use **local or isolated staging test identities only**, not production user data, and a clearly fictional partner agreement; never present test account/library data as a real active partnership.

## Authenticated browser acceptance matrix
Use different authenticated sessions or incognito windows. Record actual HTTP statuses and a screenshot in the issue. Never paste passwords, session cookies, CSRF tokens or activation URLs into the issue.

| Persona | Action | Expected |
| --- | --- | --- |
| Super Admin | Create draft, verify, activate with signed-reference and scope | Scoped record created with immutable audit; no activation before verification/agreement |
| Partner Representative | Sign in via one-time invitation after approval | Only Academic Resource Exchange sidebar; internal Registrar/Finance/HR APIs return 403 |
| Partner Representative | Submit `lecture` covered by agreement with rights declaration | Submission initially `submitted`; nothing student-visible |
| Partner Representative | Submit `library` NOT covered by agreement | 403, no submitted record |
| HIAU Super Admin | Approve submission | Review state becomes `approved`, still not visible to students |
| HIAU Super Admin | Approve distribution with verified rights reference and expiry | Separate distribution approval event; not public |
| HIAU Super Admin | Grant an active enrolled student and assigned lecturer | Each appears in authenticated Partner Academic Library |
| Unassigned enrolled student | List/direct link | Empty list; direct link returns 404, no third-party URL |
| Inactive/unregistered student | List/direct link | Empty list/direct link denied |
| Alumni or partner representative | Access student library endpoint | 403 |
| Assigned faculty member | Open resource | Fresh permission check; HTTPS external link only, publisher may require own sign-in |
| Admin | Revoke student grant | Student immediately loses list item and direct link (404), lecturer grant unaffected |
| Admin | Set rights expiration in past (test fixture) | All direct access immediately denied, including preexisting grants |
| Admin | Withdraw distribution or academic approval | All recipients immediately lose direct access |
| Admin | Suspend partner / revoke agreement | Partner submissions and every recipient access blocked at once |
| User with invalid CSRF | Modify grants/content | 403 |
| Unauthenticated visitor | List/grant/access | 401; nothing leaks |
| Cross-institution account | List other partner submissions | No foreign institution records |

## Desktop & mobile/PWA
- [ ] Desktop Chrome: Student sign-in → Partner Academic Library; faculty sign-in → same module; unassigned account sees empty state.
- [ ] Mobile Safari/Chrome at narrow widths: no clipped card text, buttons usable, no off-screen approvals; keyboard focus, accessibility text, readable error notices.
- [ ] Student PWA: installed app signs in, module visible for students, works online; absence/revocation reflected after refresh. Do not cache third-party licensed content offline.
- [ ] Staff PWA: HIAU admin review and grants available; ordinary lecturer sees authorized read-only library; partner representative is explicitly **not** a Staff PWA user.
- [ ] Verify release SHA, `Cache-Control: no-store` on authorized endpoints, logout/session expiration behavior and revoked access after page refresh.
- [ ] Simulate slow/offline network: show graceful error; no stale source URLs in app storage.

## Known boundaries
- Source URLs are shared through **permission-checked link-out only**. Once disclosed, they cannot be technically revoked from the external publisher by HIAU. Contractual rights and external site authentication are still necessary.
- Resource approval does not automatically enroll anyone, grant course credit, post grades, alter Registrar records, generate fees, or permit student-wide publication.
- Library licensing documentation is currently an administrator-entered reference, not a cryptographically verified or uploaded signed license.
- Protected content hosting, malware scanning, per-cohort/course entitlements, digital rights management, live conferencing and true institutional library integration remain future milestones.

## Decision record
**Hold** until CI passes, dependency branches are sequentially merged into staging, the deployed commit is confirmed, all personas pass real browser checks, and the team signs off backup/restore and authorization results. Do **not** promote to production or mark #136/#137 complete on source-code presence alone.

# HIAU cross-workspace color consistency audit — 12 November 2026

## Brand control tokens
- Primary action (ordinary action, not status): HIAU plum `#4A1249`, white `#FFFFFF` text; hover deep plum `#35103B`.
- Secondary action: white background, `#4A1249` text and border; subtle pale-plum hover.
- Disabled action: neutral `#E8E4EA`, dark text `#544B59`, visible disabled state; never convey an available action with status green.
- Keyboard focus: accessible visible gold `#C39A53` outline; do not rely only on color.
- Status badges: success green, warning amber, destructive/error red remain semantically distinct. Green is **not** a generic button color.
- Public promotional gold is an accent for typography, borders and illustration; it must not silently replace the primary call-to-action design.

## Scoped source review
Studied current staging versions of `src/index.css`, `src/App.tsx`, `PortalHeader`, `FacultyAdminDashboard`, `AdmissionsReviewModule`, `TaskManagementDashboard`, `AcademicCalendarView`, `SharedResourceLibrary`, `StudentPortalView`, `VirtualClassroomCollab`, `PublicNavbar`, and `PublicAdmissions`.

### Remediations in the current PR
- Faculty messaging sender and recipient names use plum rather than accidental green/teal accent, while retaining purposeful green **Active** badges.
- Task-management modal primary submission, calendar export action, four resource-library actions and five Student PWA actions use existing `hiau-action-primary` scoped styling. Existing toolbar selections and status colors retain their meaning.
- Public Admissions primary CTAs and application submission/confirmation buttons align to plum/white with visible focus, consistent with Public Navbar Apply Now.

### Remediations already merged before this PR
- #118 established reusable ERP primary/secondary/disabled control classes and applied them to Faculty + Academic Planning.
- #117 fixed the Virtual Classroom Next button readable label.
- #115 improved Faculty tab state and Compliance tab palette.
- #114 made Analytics refresh readable and added true error/empty states.
- #119–#120 connected messaging to real authorized directory/records; stakeholder browser verified one message persisted and a student directory entry was visible.

## Acceptance checklist (must be verified on deployed staging)
1. Compare header, sidebar, Faculty, Admissions, Analytics, Finance, Academic Planning, Virtual Classroom, Library, Calendar, Task Management, public navbar and public admissions CTAs in light and dark themes.
2. Check Student PWA and Staff PWA at narrow phone widths: no clipped button labels, focus indicators visible, disabled differentiation clear, touch targets usable.
3. Inspect **hover, focus, disabled, loading, success, warning, destructive** states, and keyboard-only navigation.
4. Use contrast testing against WCAG AA: ordinary text >=4.5:1 and UI boundaries / nontext indicators >=3:1. Check real computed styles, not just class declarations.
5. Confirm no green-colored generic action buttons remain in audited surfaces. Retain contextual colors only where they convey a genuine domain status.
6. Verify a real message remains visible after reload and the user directory state is accurate; do not infer full RBAC or account-activation acceptance from a screenshot.
7. Confirm deployed Coolify commit SHA and relevant PWA cache revision; no production release before complete gate.

## Remaining scope
This is a source-level audit of named public and institutional surfaces, **not an exhaustive inventory** of every component, custom dark-mode override, or external widget. An automated component/CSS class scan, screenshot regression and cross-device accessibility review are still required before labeling HIAU site-wide palette acceptance complete.

Website WEB-GATE issue #93 remains the primary release gate. ERP and two PWA workstreams remain linked and parallel.

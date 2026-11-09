# HIAU notifications migration — controlled slice 3

Source reference: the original Google AI Studio `PortalNotificationsPopover.tsx` in `main`.
The original component expected `/api/notifications`, `/api/notifications/stream`, and legacy read endpoints. The secured staging server did not implement those endpoints, and its temporary `CampusServices.NotificationCenter` used a different prototype data source.

This slice creates a reliable baseline:
- New recipient-scoped SQLite `notifications` table in the existing operations database. It is additive and has no example rows.
- Notifications generated **within the same SQLite transaction** as real task assignment, task status changes, published grades, and transcript request reviews.
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all`. All actions derive recipient identity from the authenticated session. Non-GET requests require the existing origin and CSRF token middleware.
- Updated institutional header includes the new responsive notification inbox rather than the prototype campus notification widget.
- Existing backup snapshot export includes notifications. Older snapshots remain import-compatible; old imports clear inbox records to avoid stale notifications.
- Automated coverage for real task events, cross-account access, read state, read-all, and backup restoration.

Non-goals: sample notification import, WebSocket/SSE streaming, fabricated historical notifications, broadcast announcements, self-service message sending, SMS/email delivery, or public notification access. These need separate backend authorization and workflow tests.

**Release checklist:** confirm CI build/tests, Coolify staging deployment, browser access with two different staff accounts, CSRF enforcement, notification appearance after an actual task assignment, and persistence through container restart. Do not claim real-time delivery or production readiness before those checks.

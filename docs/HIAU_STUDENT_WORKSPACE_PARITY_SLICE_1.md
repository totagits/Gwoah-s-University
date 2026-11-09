# HIAU student source migration — functional slice 1

**Original reference:** supplied AI Studio export and GitHub main.  
**Secure integration:** staging operations SQLite plus `GET /api/workspaces/state`.

The legacy `StudentPortalView` imported from the original AI Studio contains fixed demo faculty names, course codes, and a client calling `/api/students/:id` that is not registered by the current staging server. We preserve its source for future feature-parity evaluation, but replace the active route for students with a secure **read-only** component.

The new component:
- Fetches `/api/workspaces/state` with the logged-in browser session; it checks server-returned actor identity and role.
- Renders only the authenticated user's `ownStudent` and matching enrollments/invoices.
- Includes published grades only; unpublished grades do not appear.
- Uses integer cents from the actual database to format USD values, with no invented balances.
- Shows a truthful unlinked-record state and API failures, never fallback data from `seedData.ts`.
- Leaves student communications, timeline, universal search, transcript issuance and live payments disabled until endpoints, authorization and data contracts are verified.

This is **only the first authenticated student slice**. The original five missing AI Studio components still need a separate integration decision each. The general institution-facing ERP modules remain unverified. No schema migration or database mutation is performed.

# Gwoah's University — implementation status

This branch is a development branch, not a production release.

## Audit findings
- Existing /api/auth/login accepts a role or email without validating a password and returns a simulated token. This is a critical blocker.
- App.tsx query parameters autostart=1 or portal=1 can create a demo super-admin session. Remove before any public deployment.
- The portal header offers client-side role switching. Remove in production and enforce server-side RBAC on every protected endpoint.
- The JSON-file persistence layer and seeded institutional/accreditation claims are not suitable for live university operations.

## Implementation sequence
1. Secure server sessions, hashed passwords, CSRF protections, access-controlled API routes, and session recovery.
2. PostgreSQL migrations and isolated demonstration seed data.
3. Accessible institutional design system and nested website-to-ERP navigation.
4. Student/faculty engagement workflows: office hours, QR attendance, resource search/versioning, notifications, feedback, alumni.
5. Payments, OCR, AI, lecture capture, proctoring, campus occupancy, and NCHE verification only after providers, privacy safeguards, and official specifications are confirmed.

## Deployment rule
Do not deploy this branch with actual student records until all critical security blockers have been resolved and verified with automated authorization tests.

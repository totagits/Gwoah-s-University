# Pre-deployment checklist

- [ ] Replace demo authentication and remove role-only login.
- [ ] Block unauthenticated access to every ERP API and uploaded document.
- [ ] Test students cannot access other students' records; faculty cannot alter unauthorized grades.
- [ ] Remove demo super-admin URL bypass and role switcher.
- [ ] Configure secure sessions, secrets, rate limits, TLS, backup/restore and monitoring.
- [ ] Replace unverified accreditation and campus claims with approved institutional facts.
- [ ] Run npm install, npm run lint, npm run build and API authorization tests.
- [ ] Deploy staging first; do not enable real payments or student data until signed off.

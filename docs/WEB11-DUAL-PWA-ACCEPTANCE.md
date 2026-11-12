# WEB-11 — HIAU mobile PWA and campus tour acceptance

## Product split
- **Student App:** `https://hiau-staging.totag.network/student/`. Manifest ID and scope `/student/`, install name "HIAU Student App". Student role only. Existing secured student workspace includes academic, classroom and other permitted student modules.
- **Staff ERP App:** `https://hiau-staging.totag.network/staff/`. Manifest ID and scope `/staff/`, install name "HIAU Staff ERP". Staff/admin role only. No public-tour or primary navigation button advertises the staff installation URL; distribute by authorized IT onboarding.
- Apps share one HIAU server and authentication backend. Installation does **not** authenticate anyone. Anyone with the URL can view a login page; server-side authorization and session security, not URL obscurity, protect university data.
- This change supplies installable web apps, **not** native Android APK/iOS IPA files and does not claim complete offline student ERP capability.

## Install on phone (after staging deploy)
**Android Chrome:** open the appropriate URL in Chrome; tap **Install Student App** or **Install Staff App**, then confirm the browser's Install prompt. If the prompt is unavailable, use Chrome menu → "Install app"/"Add to home screen". Both installations should have different names and icons.

**iPhone Safari:** open the appropriate URL; tap Share → Add to Home Screen → Add. Manifest support and icons differ with iOS version; verify the installed name. If the full Safari install prompt is unavailable, the page provides the manual instruction.

## Security and offline
- Worker caches only `/offline.html`, a static generic page. Public website navigations use network-first / offline fallback. API data and ERP media are not cached by the worker.
- Do **not** store university records, tokens, tuition data, clinical/personal data, or user session responses in Cache Storage. No local offline editing or background upload of records.
- If a signed-in student visits `/staff/` or staff visits `/student/`, the dedicated app must deny entry into the other application's workspace and present an account-switch message. Role checks on the server remain authoritative.
- Public Campus Tour has no Facilities/ERP sign-in link. Authorized staff enter from `/staff/`.

## Tour thumbnail
- Both public tour choices use their **actual MP4 frames**. Removed unrelated static poster image files. Browser loads metadata and seeks to an early video frame without autoplay; native controls remain available.
- If poster frame remains black or blurry, add a reviewed video-poster media workflow with an uploaded thumbnail derived from the video. Avoid guessing/posting unrelated promotional imagery.

## Live acceptance not yet performed
1. Verify correct commit in Coolify; use private/incognito phone browser to visit `/student/`.
2. Install Student App; verify distinct icon/name, standalone launch, credential prompt, student-only role, course/materials display within assigned permissions.
3. Install Staff ERP from authorized link `/staff/`, verify distinct icon/name and staff credentials; check unauthorized student credentials cannot access staff workspace.
4. Test signed-in role mismatch, sign-out, session expiry, back-to-public navigation, airplane-mode offline page, and returning online without exposing private cached data.
5. On public website, verify Staff link is removed and the Campus Tour thumbnail matches the actual first moments of the playing video, on desktop and phone.
6. Confirm PWA icon requests `/hiau-student-192.png`, `/hiau-student-512.png`, `/hiau-staff-192.png` and `/hiau-staff-512.png` return HTTP 200 with `image/png`. Record installs on Android and iOS.
7. Accessibility: keyboard interaction, 320/375/768px widths, safe-area spacing, screen-reader labels.

**No production main changes until live acceptance is complete.**

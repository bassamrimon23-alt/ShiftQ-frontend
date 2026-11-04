# Employee screens (Rawan) — handoff for the frontend repo

Adds the employee Dashboard and Attendance screens (designed after the Figma) on top of the existing layout, routing and login. Nothing in the existing layout, routes or login was changed.

## How to apply
1. Unzip over the project root (keeps the same paths). Files that already exist and are replaced:
   - `src/features/employee/Attendance.jsx`
   - `src/features/employee/EmployeeDashboard.jsx`
   - `package.json` (only adds `axios`)
2. `npm install`   (adds axios and updates package-lock.json — commit the lock file)
3. `npm run dev`, log in as `employee@shiftq.com` / `123456`.

Or: `git apply employee-screens.patch` then `npm install`.

## What is inside
- `src/features/employee/` — Dashboard, Attendance (stat cards, weekly hours chart, records list, check-in / check-out dialog).
- `src/api/` — Armia's API layer (axios client, error mapping, Mock APIs), copied unchanged.
- `src/services/attendanceApiAdapter.js` — converts the API shapes to what the screens use.
- `src/services/attendanceService.js` — single entry point for the screens.
- `src/services/attendanceMock.js` — standalone mock (fallback + shared constants).
- `.env` — mock settings (no secrets).

## Switches (`.env`)
- `VITE_USE_MOCK=false` + `VITE_API_BASE_URL=<backend>` → real Backend, no change in the screens.
- `VITE_ATTENDANCE_SOURCE=local` → skip the API layer and use the standalone mock.
- `VITE_MOCK_ALWAYS_INSIDE=false` → the mock checks the geofence for real. "Use office location (demo)" passes; any other place is rejected.

## Demo notes
- Mock QR: "Use demo QR" works. Type `EXPIRED` or `INVALID` to see the errors.
- "Reset demo data" (bottom of Attendance) brings back the sample history and clears today's record.
- Demo bridge: the Login page is not connected to `src/api` yet, so while the mock is on, `attendanceApiAdapter.js` signs in the mock employee automatically. Remove `ensureSession()` once Login uses `src/api/authService.js`.
- The upcoming schedule and the recognition/leave/reward cards are demo data (no API yet).

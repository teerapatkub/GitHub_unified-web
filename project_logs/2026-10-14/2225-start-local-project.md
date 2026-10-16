# Started the local project

Date: 2026-10-14

- Started the backend with `npm start` from `server/`. It reported completed database migrations and readiness using the configured Supabase connection.
- Started Vite on `http://127.0.0.1:5174/` and confirmed the page returns HTTP 200.
- Left both processes running for manual use.
- Follow-up: unauthenticated requests to `/api/health/live` and `/api/health/ready` returned HTTP 401 despite the backend startup-ready message. Investigate health-route middleware order before relying on these probes for deployment.

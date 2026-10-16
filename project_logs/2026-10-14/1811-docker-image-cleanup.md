# Docker Desktop image cleanup

Date: 2026-10-14

## Completed

- Confirmed Docker Desktop had no containers before cleanup.
- Removed unused images: `postgres:18`, `postgres:16-alpine`, and `postgrest/postgrest:latest`.
- Confirmed the remaining images are `unified-web-app:latest`, `postgres:18-alpine`, and `busybox:1.37.0`.
- Confirmed all 14 anonymous volumes remain present. Their contents may include old database data, so none were deleted.

## Ongoing Docker cleanup rule

After using Docker, inspect containers, images, and volumes. Remove temporary images and volumes only when their purpose is known and they are no longer needed. Preserve volumes that may hold persistent data until their contents and ownership are verified.

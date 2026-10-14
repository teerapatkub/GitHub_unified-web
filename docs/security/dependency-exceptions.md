# Dependency audit exceptions

Reviewed 2026-10-14. The production dependency audit (`npm audit --omit=dev --audit-level=low`) reports zero vulnerabilities in both `client` and `server`. These exceptions apply only to development/build tooling and expire on **2026-11-14**.

| Dependency chain | Owner | Reason and mitigation | Exit criterion |
| --- | --- | --- | --- |
| `client` Tailwind CSS 3 → `chokidar`/`fast-glob`/`micromatch` → `braces` ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)); Tailwind CSS 3 → `postcss-nested` → `postcss-selector-parser` ([GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)) | PyArena maintainers | Tailwind CSS 4 is a major migration. Build inputs are repository-controlled; CI installs the reviewed lockfile with `npm ci`, uses public browser configuration only, and never ships these packages in the runtime image. | Migrate to Tailwind CSS 4, confirm visual parity, and rerun full audit before expiry. |
| `server` dev-only `nodemon` → `chokidar` → `braces` ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)) | PyArena maintainers | `nodemon` is only used by `npm run dev`. It is in `devDependencies`; CI and Docker install the server with `npm ci --omit=dev`, so it is absent from the runtime image. Development should only watch repository-controlled paths. | Replace or upgrade the watch tool to a patched dependency chain and rerun full audit before expiry. |

Do not waive a production dependency finding under these exceptions. If a newer advisory affects the production tree, fail the release gate and investigate it separately.

# Repository Guidelines

## Project Structure & Module Organization

This repository contains a browser-based game in the `unified-web` project. Keep the page entry point, styles, and client-side game logic easy to locate at the project root unless the existing layout provides a more specific module directory. Store reusable images, sounds, and other static files under `assets/`. Put automated checks in `tests/` (or alongside the module they exercise) and keep generated output such as `dist/` out of source control.

## Build, Test, and Development Commands

Use the package manager and scripts defined by the repository manifest:

- `npm install` — install local dependencies.
- `npm run dev` — start the local development server, when provided.
- `npm test` — run the automated test suite.
- `npm run build` — create the production bundle, when provided.

For a static-only change, use a local HTTP server rather than opening HTML with `file://`; for example, `python -m http.server 8000`, then visit `http://localhost:8000`.

## Coding Style & Naming Conventions

Use two spaces for JavaScript, HTML, and CSS indentation. Prefer small, single-purpose functions and descriptive names. Use `camelCase` for JavaScript variables and functions, `PascalCase` for classes or components, and lowercase kebab-case for CSS classes and asset filenames (for example, `player-score` and `sprites/player-idle.png`). Match the project’s existing formatter and linter configuration; run them before submitting changes.

## Testing Guidelines

Add regression coverage for gameplay rules, scoring, input handling, and state transitions when a test harness exists. Name tests after observable behavior (for example, `player-collision.test.js`). Always run `npm test` and manually verify the affected game flow in a browser, including a refresh and a narrow viewport for UI changes.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects such as `Fix player collision bounds` or `Add pause control`. Keep commits focused. Pull requests should explain the user-visible change, list validation commands, link the relevant issue when applicable, and include screenshots or a short recording for visual or gameplay changes.

## Security & Configuration Tips

Do not commit API keys, credentials, or machine-specific configuration. Keep secrets in local environment files that are ignored by Git, and validate any user-controlled input before using it in DOM or network operations.

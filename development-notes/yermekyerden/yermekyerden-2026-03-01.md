# Date: 2026-03-01

## What was done
- ✅ Frontend scaffold prepared and reviewed:
  - Removed Vite demo artifacts and reset `frontend/src` to the planned project structure (`app/`, `ui/`, etc.).
  - Added initial routing scaffold with a layout shell (`AppShell`) and placeholder screens (Library / Mission Run / Replay / Not Found).
  - Updated frontend docs (`frontend/README.md`).
  - Moved Tailwind build tooling (`tailwindcss`, `@tailwindcss/vite`) to `devDependencies`.
  - Switched routing to hash-based navigation and set Vite `base` for GitHub Pages compatibility.

- ✅ CI/CD (GitHub Actions) set up in a dedicated branch:
  - Added `frontend-ci` workflow for PR/push checks (lint + format check + build).
  - Added `frontend-pages` workflow to deploy `frontend/dist` to GitHub Pages from `main`.
  - Confirmed GitHub Pages settings: Source = GitHub Actions.

## Problems / blockers
- Problem: VS Code showed a warning about `environment: github-pages` being invalid.
- What I tried: Verified actual workflows and validated files for hidden Unicode characters.
- Current status: Not a real workflow error; local validation returned OK, CI checks are green.
- What I need next: Merge CI/CD PR into `develop`, then verify Pages deploy after merging `develop -> main`.

## Decisions (and why)
- Decision: Use Hash routing for now.
- Why: GitHub Pages does not support SPA rewrites reliably; hash routing avoids 404 issues on deep links.
- Trade-offs: URLs contain `#`, but deployment becomes stable on static hosting.

- Decision: Use GitHub Actions for Pages deploy instead of `gh-pages` npm package.
- Why: Official Pages workflow deploys artifacts cleanly without maintaining a separate `gh-pages` branch.
- Trade-offs: Requires repo Pages configuration (Source = GitHub Actions).

## What I learned
- Concept / tool / pattern: GitHub Actions CI vs GitHub Pages deployment workflows (CI on PRs, deploy on `main`).
- What I understand now: Hash routing is the safest choice for GH Pages; Vite `base` must match repo path for asset resolution.
- What is still unclear: None for now; will validate the first real Pages deploy run after merge to `main`.

## Plan (next steps)
## Plan (next steps)
- [ ] Perform `develop -> main` merge and verify GitHub Pages deploy (`frontend-pages` workflow).
- [ ] Review other teammates’ PRs (quality, structure, readiness).
- [ ] Start research on “Terminal” feature for the frontend:
  - What is required to emulate a terminal UI in the browser (input, output, history, cursor, keybindings).
  - How we will run user code safely (execution model, IO, timeouts, resource limits).
  - Compare sandbox options (e.g. in-browser interpreter / WebAssembly / server-side runner) and document pros/cons.
  - Discuss options with the team and align on the most realistic approach for MVP.
- [ ] Create a GitHub Discussion with the research summary.

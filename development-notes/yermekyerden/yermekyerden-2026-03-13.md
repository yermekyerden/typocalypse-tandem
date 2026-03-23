# Date: 2026-03-13

## What was done
- ✅ Added frontend testing setup for Week 4:
  - installed `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`
  - added test scripts for frontend and repository root
  - added shared test setup file
- ✅ Configured frontend testing and CI:
  - created `vitest.config.ts`
  - updated frontend CI to run tests
  - fixed ignore rules for generated `.vite` files
- ✅ Added first real frontend tests for routing:
  - mission route
  - replay route
  - unknown route / `404`
- ✅ Verified everything locally:
  - `npm test`
  - `npm run build`
  - `npm run lint`
  - `npm run format:check`
- ✅ Opened PR, passed checks, and merged it into `develop`

## Problems / blockers
- Problem: initial test setup caused build/type issues and lint/format started checking generated `.vite` files.
- What I tried: separated Vitest config from regular Vite config and updated ignore rules.
- Current status: resolved, all checks are passing.
- What I need next: add more personal tests and continue Week 4 tasks.

## Decisions (and why)
- Decision: use Vitest + React Testing Library for frontend tests.
- Why: good fit for Vite + React and easy to extend later.
- Trade-offs: extra setup was needed before the team could start writing tests.

## What I learned
- Concept / tool / pattern: Vitest setup, routing tests, CI test integration.
- What I understand now: test setup should be checked together with build, lint, format, and CI.
- What is still unclear: which frontend parts should be covered next for the best value.

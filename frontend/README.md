# Frontend (Typocalypse — Terminal Dojo)

This folder contains the web client for Typocalypse.

The frontend is built as a React + TypeScript app with a minimal scaffold that will evolve as features land (game screen, mission selection UI, account menu, etc.).

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 + shadcn/ui
- Radix UI primitives (via shadcn/ui)
- React Router (navigation)
- Zustand (planned for client/UI state)

## Requirements

- Node.js: `22` (see root `.nvmrc`)

## Getting started

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Commands

- `npm run dev` — start dev server
- `npm run build` — type-check + production build
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint
- `npm run format` — format all files with Prettier
- `npm run format:check` — check formatting (CI-friendly)

## Code quality workflow

- Husky + lint-staged run formatting/lint fixes on staged files before commit (local guardrails).
- For PR validation, run:
  - `npm run lint`
  - `npm run build`
  - `npm run format:check`

## Testing

Automated unit/integration tests are not configured yet.
For now, treat these as the baseline checks:

- `npm run build` (type-check + bundling)
- `npm run lint`
- manual smoke check in `npm run dev` (navigation + basic rendering)

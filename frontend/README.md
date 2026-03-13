# Frontend (Typocalypse — Terminal Dojo)

This folder contains the web client for **Typocalypse**.

The frontend is built with **React + TypeScript + Vite** and already includes:

- application routing
- base UI structure
- shared utilities and mocks
- frontend testing setup with **Vitest** and **React Testing Library**

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4 + shadcn/ui
- Radix UI primitives (via shadcn/ui)
- React Router
- Zustand
- Vitest
- React Testing Library

## Requirements

- Node.js `22` (see root `.nvmrc`)

## Getting started

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Available commands

- `npm run dev` — start local dev server
- `npm run build` — type-check + production build
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint
- `npm run format` — format files with Prettier
- `npm run format:check` — check formatting without rewriting files
- `npm run test` — run frontend tests once
- `npm run test:watch` — run frontend tests in watch mode

## Project structure

```txt
frontend/
  src/
    app/         # app composition, providers, router setup
    assets/      # static frontend assets
    lib/         # shared helpers / utilities
    mocks/       # mock data for development
    store/       # state management
    ui/          # screens, layouts, UI components
    test/        # shared test setup
```

## Testing

Frontend tests are configured with:

- **Vitest**
- **jsdom**
- **React Testing Library**
- **@testing-library/jest-dom**

Current routing tests are located in:

```txt
src/app/compositionRoot.test.tsx
```

Run tests with:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

## How to add new tests

Prefer writing tests for code you personally changed.

Recommended places:

- route behavior
- small UI components
- screen rendering
- utility functions
- store logic

Naming convention:

- `*.test.ts`
- `*.test.tsx`

Examples:

- `src/app/compositionRoot.test.tsx`
- `src/ui/components/Button.test.tsx`
- `src/lib/someHelper.test.ts`

## Local quality check before PR

Run these commands before opening a PR:

```bash
npm run test
npm run build
npm run lint
npm run format:check
```

## CI

Frontend CI runs:

- install
- lint
- format check
- tests
- build

So if something passes locally with the commands above, the PR is much more likely to pass CI as well.

## Notes for teammates

If you only want to start working on a feature:

1. install dependencies with `npm ci`
2. run `npm run dev`
3. make your change
4. add/update tests if the change affects frontend behavior
5. run the local checks:
   - `npm run test`
   - `npm run build`
   - `npm run lint`
   - `npm run format:check`

This folder already has the base testing setup, so you do **not** need to configure Vitest again.
You only need to add tests for your own feature or logic.

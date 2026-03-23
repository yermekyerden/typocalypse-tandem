# Typocalypse — Terminal Dojo 🧠💻

Terminal Dojo is a game-like CLI training app for RS School Tandem.

Users practice real Linux terminal thinking in a **safe simulated sandbox** (no OS execution), solve missions, get feedback, and track progress.

---

## Team 👥

> Course-required format: **Name + GitHub link**.

- **TL: Yermek Yerdenov** — https://github.com/yermekyerden
- **Denis Nasonov** — https://github.com/JasonScriptLord
- **Yesset Bimanov** — https://github.com/YessetHumanMan
- **Alessya Tkachenko** — https://github.com/BerserkBat
- **Roman Plis** — https://github.com/romanplis
- **Mentor: Igor Moskalev** — https://github.com/ivmoskalev

---

## What we’re building 🎯

A mission-based “terminal dojo” where users type commands in a controlled environment.

The app validates results (**state/output**), explains mistakes, and helps build real CLI habits.

---

## MVP scope ✅

- 🖥️ Terminal-like UI + input experience
- 🧩 Safe command subset (simulated, no OS execution)
- 🗂️ Virtual File System (VFS) for deterministic missions
- 🧪 Mission runner + validators (state/output checks)
- 💡 Clear failure feedback (“what failed and why”)
- 📈 Progress tracking (local-first)

---

## Current project status 🚧

The repository already contains:

- **Frontend** web client
- **Backend** NestJS API
- **Project docs** with SSOT structure
- **Development diary** artifacts required by the course
- **Frontend CI** and **GitHub Pages deploy**

Current frontend routing includes screens for:

- library
- mission run
- replay
- profile
- not found

---

## Tech stack 🛠️

### Frontend 🎨
- ⚛️ React + TypeScript (**strict**)
- ⚡ Vite
- 🌬️ Tailwind CSS v4
- 🧱 shadcn/ui
- 🗺️ React Router
- 🧠 Zustand

### Backend 🧰
- 🪺 NestJS
- 📘 Swagger / OpenAPI
- ✅ ValidationPipe
- 🩺 Health checks

### Tooling 🔧
- 🐶 Husky
- 🧹 ESLint
- 🎯 Prettier
- 🧪 Vitest (frontend)
- 🤖 GitHub Actions

---

## Limitations (by design) 🧱

- 🐚 Not a full Bash implementation (only documented subset)
- 🔒 No arbitrary code execution, no OS commands
- 📜 Only supported commands/features will be documented

---

## Repository structure 🗂️

```text
.
├── frontend/            # React + TypeScript web client
├── backend/             # NestJS API
├── docs/                # SSOT docs: product, architecture, process
├── development-notes/   # Course diary artifacts
└── .github/workflows/   # CI and Pages deploy
```

---

## Links 🔗

* 🚀 Live demo (GitHub Pages, deployed from `main`): [https://yermekyerden.github.io/typocalypse-tandem/](https://yermekyerden.github.io/typocalypse-tandem/)
* 📚 Docs hub: `docs/README.md`
* ⚡ Quick Summary: `docs/00-quick-summary/README.md`
* 🎯 Vision: `docs/00-overview/vision.md`
* 🏗️ Architecture: `docs/02-architecture/system-overview.md`
* 📄 Contracts: `docs/02-architecture/data-contracts.md`
* 🎨 Design (Figma): [Terminal Dojo Layout](https://www.figma.com/design/M8k8QQWPYbfbfTUdQdFSye/Terminal-Dojo?node-id=0-1&t=LA99qExkew468f47-1)

---

## Requirements 📦

* Node.js **22** (see `.nvmrc`)

---

## How to run locally 🚀

### Frontend

```bash
nvm use
cd frontend
npm ci
npm run dev
```

Then open the local Vite URL shown in the terminal.

### Backend

```bash
nvm use
cd backend
npm ci
npm run start:dev
```

Backend default URL:

```text
http://localhost:3001
```

If the frontend runs on a non-default origin, start the backend with `CORS_ORIGIN`:

```bash
CORS_ORIGIN=http://localhost:3000 npm run start:dev
```

---

## Quality checks ✅

### Frontend

```bash
cd frontend
npm run lint
npm run format:check
npm run build
npm run test
```

### Backend

```bash
cd backend
npm run lint
npm run format:check
npm run build
npm run test
npm run test:e2e
```

---

## Repository workflow 🧭

* 🌿 `main` — stable branch, release/checkpoint snapshots, GitHub Pages deploy
* 🧪 `develop` — integration branch for daily team work
* 🧵 feature branches — `feat/*`, `fix/*`, `docs/*`, `chore/*` → PR → merge into `develop`
* 📝 documentation / diary updates — handled through focused branches and PRs when needed

---

## Docs-first rule 📚

If something is unclear in the codebase, the first question is:

**What do the docs say?**

Start here:

* `docs/README.md`
* `docs/00-quick-summary/README.md`

---

## Notes 📝

* Live demo is deployed from **`main`**, so it may lag behind the latest changes in `develop`.
* The project is intentionally built around a **safe simulated shell**, not around real OS command execution.

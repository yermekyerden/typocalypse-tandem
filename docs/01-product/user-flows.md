# User Flows (SSOT)

This document defines **end-user flows** for Terminal Dojo:
screens, navigation, states, and what data is read/written in each step.

**Goals:**
- Make the product flow crystal clear for the whole team.
- Define the “demo-ready” path (fast, impressive, deterministic).
- Serve as a reference for UI + Application use-cases + backend contracts.

Related:
- `01-product/mvp-scope.md` — MVP loop definition
- `01-product/mission-design.md` — mission format/checks/hints
- `02-architecture/system-overview.md` — runtime pipeline + boundaries
- `02-architecture/data-contracts.md` — Mission/Progress/Attempt contracts

---

## 0) Screens (MVP)

### Required screens
1) **Library** (Mission Catalog)
2) **Mission Run** (Terminal + Panels)
3) **Replay** (Playback a past attempt)

### Optional (can be embedded into Library for MVP)
- **Progress** (as a section on Library)
- **Settings** (budgets, UI preferences) — can be postponed

---

## 1) Global navigation model

### Top-level routes
- `/` → Library
- `/mission/:missionId` → Mission Run
- `/replay/:attemptId` → Replay

### Navigation rules
- User must always be able to return to Library.
- Mission Run must not lose state accidentally:
  - leaving the route prompts if current attempt has unsaved steps (optional for MVP, but recommended).

---

## 2) Core flow: Library → Start Mission → Solve → Validate → Save → (Optional Replay)

### 2.1 Library screen (Mission Catalog)

**User goal:** pick a mission and start practicing.

#### UI blocks
- **Chapter list** (expand/collapse)
- **Mission cards**
  - title, difficulty, estimated time
  - status: locked/available/completed (MVP can be available by default)
  - last attempt summary (optional but impressive)
- **Progress summary**
  - completed count, streak (optional), last played mission

#### Primary actions
- `Start Mission` (opens Mission Run)

#### Data reads
- `GET /api/missions` (catalog)
- `GET /api/progress/:userId` (progress summary)
- local cache read (IndexedDB/localStorage) for fast load

#### Data writes
- none (unless storing last visited screen)

#### Empty / error states
- Missions not loaded:
  - show skeleton/loading
  - retry
- Backend unavailable:
  - show “Offline mode (cached missions)” if cache exists
  - if no cache: show error and retry button

---

### 2.2 Mission Run screen (Terminal + Panels)

**User goal:** type commands until mission validates successfully.

#### Layout (MVP)
- **Terminal Panel** (main)
  - output area
  - input prompt
  - command history navigation (↑/↓)
- **Mission Panel** (side/top)
  - title, description, goal
  - allowed commands (if provided)
- **Feedback Panel** (side/bottom)
  - validation status (pass/fail)
  - failed check explanation (which check failed + why)
  - hint unlock UI
- **Explain Panel** (toggle / tab)
  - last command trace: parse → resolve → execute → validate
- **Replay Panel** (optional quick list)
  - shows steps in current attempt (inputs)

#### Primary actions
- Submit command line (Enter)
- Toggle Explain Mode
- Request hint (if available/unlocked)
- Reset mission (restart from snapshot)
- Finish/Exit mission (back to Library)

#### Runtime behavior (per command)
When user submits a command:
1) Domain pipeline runs (parse → resolve → execute → validate → trace)
2) UI updates terminal output (stdout/stderr)
3) UI updates validation summary (pass/fail + reasons)
4) Application appends step to attempt log
5) Application persists attempt/progress (local first, then backend sync)

#### Data reads
- `GET /api/missions/:id` (mission full definition)
- local attempt/progress cache (optional)
- (optional) read “latest attempt for this mission” to show baseline

#### Data writes
- local: append step log, attempt summary, progress summary
- backend:
  - `POST /api/attempts/:userId` (attempt summary; step log optional)
  - `PUT /api/progress/:userId` (idempotent update)

#### States to support
- **Ready** (mission loaded, awaiting input)
- **Running** (a command is being processed; quick)
- **Command error** (parse/resolve/execute error)
- **Validation failed** (show which check failed + why)
- **Validation success** (celebrate, show “completed”)
- **Saving** (background; never blocks the UI)
- **Offline** (queue sync; show banner)

#### Exit codes UX rules (MVP)
- `exitCode = 0` → normal success (even if mission still not complete)
- non-zero → show as error:
  - stderr highlighted/marked
  - feedback panel shows typed error explanation

---

### 2.3 Mission Completion flow

**When mission validates OK:**
- Show success state in Feedback Panel:
  - “Mission Completed”
  - summary of what changed (optional: “/dojo created” if effects exist)
- Allow:
  - `Replay this attempt` → Replay screen (optional quick link)
  - `Next mission` → Library (or direct next mission if defined)
  - `Restart` → reset mission state

**Data writes (required)**
- mark mission completed in progress
- store attempt summary

---

## 3) Replay flow: Library → Replay → Inspect trace step-by-step

### 3.1 Replay screen

**User goal:** learn by reviewing a past run.

#### Layout
- left: step list (inputs with timestamps)
- main: terminal output playback
- side: Explain Mode (trace for selected step)
- top: metadata
  - mission title, attempt date, result (success/fail), duration, step count

#### Controls
- Play / Pause
- Step forward / backward
- Jump to step
- Exit to mission / library

#### Data reads
- local attempt storage preferred
- backend optional:
  - `GET /api/attempts/:userId/:attemptId` (if we store step logs server-side)

#### Data writes
- none (optional: “last watched step” locally)

---

## 4) Secondary flows (MVP-friendly)

### 4.1 Reset mission
- Rebuild state from snapshot (Domain)
- Clear current attempt steps (or start a new attempt)
- Add an attempt record only if at least 1 command was executed (recommended)

### 4.2 Offline mode
- If backend is unreachable:
  - missions from cache (if present)
  - attempts/progress stored locally
  - show “Queued for sync” badge
- When connection returns:
  - sync queued writes (attempts then progress)

### 4.3 Help flow (in Mission Run)
- User types `help` or `help <command>`
- Terminal prints dialect-correct help text
- This is part of the learning loop (not a separate screen)

---

## 5) Demo flow (fast, impressive, repeatable)

### Demo script (recommended)
1) Open **Library** → pick Chapter 1 mission
2) Enter Mission Run → type 2–4 commands
3) Show a failure → Feedback shows *which check failed + why*
4) Toggle **Explain Mode** → show trace (parse → resolve → execute → validate)
5) Fix it → mission completes
6) Open **Replay** → step through and show trace for each step

**Requirement:** the demo must work deterministically even offline (cached missions).

---

## 6) UX rules (terminal feel)

- Terminal output is plain text (escape everything).
- stderr is distinguishable (label, prefix, or style), but stored separately.
- Command history must feel real:
  - ↑ / ↓ to navigate inputs
  - Enter to submit
- The prompt should show:
  - user indicator (static, e.g. `dojo`)
  - current working directory (from Domain state)

---

## 7) Data ownership rules (important)

### Domain owns
- current mission runtime state
- VFS state
- cwd
- last command result + trace
- mission validation result

### UI owns
- layout, tabs, toggles
- input focus and editing
- user navigation

### Application owns
- attempt logging & persistence orchestration
- sync strategy (local-first → backend)
- mapping domain events to stored records

---

## 8) Open questions (to finalize soon)

- Mission unlocking:
  - all available by default, or chapter gating?
- Do we store full step logs in backend or only summaries?
  - Recommendation: store summaries for MVP, step logs local-first.
- Do we support “resume attempt” after refresh?
  - Recommendation: yes (impressive), but keep it simple.

---

# Roadmap (5-week delivery plan)

> This roadmap is aligned with the hard deadline: **2026-03-30**.
> We deliver in **vertical slices**: each week must produce something demoable.

---

## Timebox and dates

- **Week 1:** 2026-02-22 → 2026-03-01
- **Week 2:** 2026-03-02 → 2026-03-08
- **Week 3:** 2026-03-09 → 2026-03-15
- **Week 4:** 2026-03-16 → 2026-03-22
- **Week 5 (Stabilization + Demo):** 2026-03-23 → 2026-03-30

Rule: by **end of Week 4** the product must be “feature-complete MVP”.
Week 5 is for stabilization, bugs, polish, deploy, and presentation.

---

## Milestone definition

A week is “done” only if:
- the main flow runs end-to-end,
- tests exist for new Domain logic,
- docs remain accurate,
- CI stays green.

---

## Week 1 — Foundations + first vertical slice

### Goal
Ship the smallest real loop: **run 1 mission** using minimal engine + minimal UI.

### Frontend deliverables
- Project scaffolding, CI (lint/typecheck/test/build)
- Domain skeleton:
  - tokenizer (minimal)
  - command dispatcher registry
  - minimal VFS (tree + cwd)
- UI skeleton:
  - terminal input/output component (simple)
  - Library → Mission Run navigation (can be very basic)
- First working command set: `pwd`, `ls`, `cd` (minimal behavior)
- One mission hardcoded (temporary) to prove flow

### Backend deliverables
- NestJS skeleton + CI
- `GET /api/health`
- `GET /api/version` (returns `contractsVersion`, `missionsVersion`)
- `GET /api/missions` (can return stub list for now)

### Docs deliverables
- `vision.md` ✅
- `system-overview.md` ✅ (already)
- Start `data-contracts.md` skeleton (types list + versions)

### Week 1 acceptance criteria
- A user can run a mission and see success/fail.
- The engine does not touch OS.
- Basic typed error handling exists (even if small).

---

## Week 2 — Missions as data + validation + trace v1

### Goal
Make missions data-driven and add explainable validation.

### Frontend deliverables
- Mission contracts (discriminated unions)
- Mission runner:
  - load mission snapshot
  - execute commands
  - run checks
- Trace v1:
  - parse summary
  - resolved path summary
  - execution steps (minimal)
  - validation steps (which check failed + why)
- Add commands: `echo`, `cat` (basic)
- 3–5 missions in JSON (frontend can temporarily bundle until API is ready)

### Backend deliverables
- `GET /api/missions` returns real list (from JSON files in backend repo)
- `GET /api/missions/:id` returns full mission
- Contracts version fields returned consistently

### Week 2 acceptance criteria
- Missions are not hardcoded.
- Validation explains *which check failed*.
- Explain Mode shows trace for at least the happy path + one failure case.

---

## Week 3 — Persistence (DB) + Replay + Help system

### Goal
Progress and attempts are real, replay works, help is useful.

### Backend deliverables (DB)
- PostgreSQL + Prisma
- Minimal schema:
  - Users (anonymous id)
  - Progress (per mission status + timestamps)
  - Attempts (summary; optionally step log)
- Endpoints:
  - `GET /api/progress/:userId`
  - `PUT /api/progress/:userId`
  - `POST /api/attempts/:userId`
- Idempotency strategy:
  - progress updates overwrite by mission id + updatedAt
  - attempts are append-only

### Frontend deliverables
- Anonymous `userId` generation + storage
- Progress sync adapter (API + cache)
- Replay:
  - store step logs locally for instant UX
  - optionally upload attempt summary to backend
- Help system:
  - `help`, `help <command>` content from a single SSOT structure (not scattered strings)

### Week 3 acceptance criteria
- User progress persists across reloads and across devices if backend is deployed.
- Replay can playback a run.
- Help pages match the actual dialect.

---

## Week 4 — Full MVP command set + budgets + mission pack

### Goal
Feature-complete MVP by end of week.

### Frontend deliverables
- Finish MVP command set: `mkdir`, `touch`, `rm` (restricted)
- Budgets enforced (input/output/fs limits)
- Error model expanded (typed errors → UX messages)
- Mission pack target: **10–12 missions** (balanced difficulty)
- UI polish:
  - consistent panels layout
  - readable terminal output
  - clear success/failure states
  - reset/retry UX

### Backend deliverables
- Mission versioning:
  - `missionsVersion` in responses
- Progress/attempts robustness:
  - validation of payloads
  - basic rate limiting / size limits (simple)
- Deploy baseline (even if simple hosting)

### Week 4 acceptance criteria
- MVP is complete and demoable end-to-end.
- Safety/determinism rules are enforced (not “planned”).

---

## Week 5 — Stabilization, deploy, demo, presentation

### Goal
Make it rock solid and presentable.

### Deliverables
- Bug fixing + edge cases
- Performance sanity (no freezes)
- More domain tests for risky areas (parser/path/vfs/rm)
- Final docs alignment:
  - `data-contracts.md` finalized
  - `terminal-engine.md` and `virtual-filesystem.md` updated
- Deploy frontend + backend
- Demo script:
  - 3-minute “fast demo”
  - 8–10 minute “full demo”
- Release checklist completed

### Week 5 acceptance criteria
- “Demo-ready” checklist passes.
- No flaky behavior in core loop.
- Presentation story is clear: problem → solution → architecture → demo.

---

## Parallel execution rules (to avoid chaos)

- Contracts are locked (or changed deliberately) via `data-contracts.md`.
- Domain changes require tests.
- Backend and frontend must integrate at least once per week (not at the end).
- Anything that breaks determinism/safety is blocked.

---

## Risk list (watch-outs)

- Parser complexity creep (avoid Bash features)
- Over-scoping missions (missions must fit dialect)
- UI polish too late (start earlier)
- Backend persistence done too late (Week 3 is the latest safe point)

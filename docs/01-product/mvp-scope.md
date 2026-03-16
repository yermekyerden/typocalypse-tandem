# MVP Scope (Non-Negotiable)

This document defines the **minimum shippable product** that must be delivered by the end of the project.
It is intentionally strict: MVP here means **the full training loop**, not “a terminal UI”.

**MVP success criteria:** we can run a short demo that is **safe**, **deterministic**, and **impressive**:
missions → simulated execution → validation with reasons → explain trace → replay → persistence.

Related:
- `00-overview/vision.md`
- `01-product/user-flows.md`
- `01-product/mission-design.md`
- `02-architecture/system-overview.md`
- `02-architecture/data-contracts.md`

---

## 0) Definition of MVP (one paragraph)

**Terminal Dojo MVP** is a mission-based CLI training app where users solve missions inside a **fully simulated shell + Virtual File System**, receive **result-based validation** (state/output), get **structured explanations** (execution trace), can **replay attempts**, and have **progress persisted** via backend (with local cache for resilience).
**No OS execution, no eval, no real filesystem access — ever.**

---

## 1) MVP must include (deliverables)

### 1.1 End-user screens (required)
1) **Library (Mission Catalog)**
   - list missions by chapter/difficulty
   - show basic progress status (at least completed/not completed)
2) **Mission Run**
   - terminal input/output experience
   - mission description + goal
   - feedback panel (pass/fail + reasons)
   - explain mode (trace)
3) **Replay**
   - step-by-step playback of an attempt
   - trace view per step (recommended)

> If Replay UI is too heavy, we still must ship “attempt history” + “replay as list of steps”.
> Full playback controls are nice, but the feature must exist.

---

### 1.2 Safe shell engine (required)
- Tokenizer + parser for a **documented safe subset**
- Deterministic execution pipeline:
  - parse → resolve → execute → validate → trace
- Command registry/dispatcher (no giant switch)
- Predictable typed errors + exit codes
- Plain-text output (escape everything)

---

### 1.3 Virtual File System (required)
- POSIX-like path behavior:
  - `/`, `.`, `..`, absolute/relative
- Directories + files
- Bounded content sizes and bounded tree size
- Snapshot loader for missions (start state is deterministic)

---

### 1.4 Mission system (required)
- Missions are **data-driven**, not hardcoded.
- Mission contains:
  - `initialFsSnapshot`
  - `checks[]` (validators)
  - `hints[]` (progressive, non-spoiler)
- Validation is **result-based**:
  - check VFS state, cwd, stdout/stderr, exit code
  - no “exact command string” matching as primary success condition

---

### 1.5 Explain Mode (required)
After each command, show a **structured trace**:
- parse summary (tokens/AST)
- path resolution decisions
- command handler steps (effects)
- validation steps (which checks ran, which failed, why)

**Rule:** Explain Mode must be readable to a beginner. Not raw logs.

---

### 1.6 Attempts history + replay (required)
- Store command sequence + results + timestamps
- Ability to view a past run and inspect:
  - each input line
  - stdout/stderr
  - validation status
  - trace for that step (recommended)

---

### 1.7 Backend integration (required, non-optional)
Backend must exist and be used in MVP.

Minimum backend responsibilities:
- **Missions catalog** (source of missions, versioning)
- **Progress persistence**
- **Attempt persistence** (at least summaries)

Minimum endpoints (names can change, contracts must exist):
- `GET /api/missions`
- `GET /api/missions/:id`
- `GET /api/progress/:userId`
- `PUT /api/progress/:userId`
- `POST /api/attempts/:userId`
- optional: `GET /api/health`, `GET /api/version`

Identity for MVP:
- anonymous `userId` generated in frontend (UUID) and stored locally.

---

### 1.8 Budgets / sandbox limits (required)
Even in MVP, we must implement limits to prevent freezes and keep determinism:
- max input length (chars)
- max output size (lines/bytes)
- max VFS nodes
- max VFS depth
- max file size
- deterministic behavior when a budget is exceeded:
  - typed error + stable message + exit code
  - trace records the budget violation

---

## 2) MVP shell dialect (baseline commands)

### Required command set
- Navigation: `pwd`, `ls`, `cd`
- Read: `cat`
- Output: `echo`
- FS ops: `mkdir`, `touch`, `rm` (restricted)
- Help: `help`, `help <command>`

### Required dialect documentation
- `help` output must match the actual implemented dialect:
  - syntax
  - examples
  - limitations
  - common mistakes

> “Help that doesn’t suck” is part of the product experience.

---

## 3) Quality bar (non-negotiable engineering rules)

### TypeScript
- `strict: true`
- no `any`, no `@ts-ignore`
- discriminated unions for:
  - command results
  - errors
  - checks/validators
  - trace steps

### Architecture
- Clear boundaries:
  - UI does not mutate VFS
  - Domain remains deterministic/pure
  - Application orchestrates persistence and flow
- DI is used (composition root):
  - repositories (missions/progress/attempts)
  - clock/logger/id generator
  - use-cases exposed via Context (frontend)

### Testing (minimum)
- Domain unit tests for:
  - parser/tokenizer basics
  - path resolution
  - VFS invariants
  - at least 2–3 command handlers
  - at least 2 check types
  - budget exceed behavior

---

## 4) Explicit non-goals (MVP cut lines)

We are not building a full Bash. Out of scope for MVP:
- redirects `>`, `>>`, `<`
- subshell `$(...)`
- env expansion `$HOME`
- complex globbing and scripting (variables/loops)
- OS calls / real filesystem access
- unbounded recursion/output

**Rule:** if a mission would need unsupported features, we redesign the mission.

---

## 5) Stretch goals (only after MVP is stable)

These are allowed only if MVP is demo-stable:
- pipelines `|`
- `find`, `grep`, `head`, `tail`, `wc`
- Bug Hunter mode
- mission editor UI
- easter egg mini-game
- advanced analytics
- AI mentor / RAG

---

## 6) Cut order (if time is tight)

If we slip, we cut in this order:
1) AI mentor / RAG
2) Extra modes (Bug Hunter, mini-games)
3) Mission editor UI
4) Advanced commands (pipelines, find/grep/etc.)
5) Fancy replay controls (keep replay as a step list)

**Never cut:**
terminal + engine + VFS + missions + validators + explain + attempts history + backend persistence + budgets.

---

## 7) “Demo-ready” acceptance checklist

MVP is considered shipped only if:
- A user can start a mission from Library.
- Typing commands mutates VFS deterministically.
- Validation shows pass/fail + *why*.
- Explain Mode shows trace for last command.
- An attempt is saved and can be replayed.
- Progress is persisted via backend (and works after refresh).
- Budgets prevent freezing and return stable errors.
- The same demo works twice with the same outcome.

---

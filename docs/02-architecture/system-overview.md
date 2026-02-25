# System Overview

This document describes the **end-to-end architecture** of Typocalypse (Terminal Dojo):
boundaries, data flow, runtime pipeline, and how frontend and backend collaborate.

> Goal: keep the product **safe**, **deterministic**, **testable**, and **demo-ready**.

---

## 1) Big picture

Terminal Dojo is a **simulated shell** running in the browser.
The frontend owns the **execution engine** (parser → VFS → commands → validation → trace).
The backend provides:
- missions catalog (source of missions, versioning),
- persistence (progress/attempts),
- optional analytics (later, low priority).

**Non-negotiable rule:** the backend never executes user commands.
All command execution is simulated in the frontend Domain.

---

## 2) High-level component diagram

```

+-------------------------- Frontend (React + TS) --------------------------+
|                                                                           |
|  UI Layer                 Application Layer            Domain Layer       |
|  (screens/components)      (use-cases)                 (pure engine)      |
|                                                                           |
|  - Library Screen          - StartMission              - Tokenizer/Parser |
|  - Mission Run Screen      - RunCommandLine            - ExecutionPipeline|
|  - Replay Screen           - ValidateAttempt           - CommandRegistry  |
|  - Panels:                 - SaveAttempt               - CommandHandlers  |
|    * Mission               - LoadReplay                - Virtual FS (VFS) |
|    * Feedback              - SyncProgress              - Mission Validators|
|    * Explain               - SyncMissions              - Trace Builder    |
|    * Replay                                                     ^         |
|                                                                 |         |
|                              Adapters / Infra                   |         |
|                              - MissionRepo (API)                |         |
|                              - ProgressRepo (API + cache)       |         |
|                              - Local cache (IndexedDB)          |         |
|                              - Logger/Clock/Id                  |         |
+--------------------------------------------------------------------------+
| HTTP (JSON) contracts / versioning
v
+----------------------------- Backend (NestJS) ----------------------------+
|  Controllers -> Services -> Repositories                                  |
|  - Missions API (read)                                                    |
|  - Progress API (read/write)                                              |
|  - Attempts API (write, optional read)                                    |
|  - Health/Version                                                         |
|  Persistence: PostgreSQL (Prisma)                                         |
+---------------------------------------------------------------------------+

```

---

## 3) Clean Architecture boundaries (frontend)

### Layer responsibilities

**UI**
- rendering, inputs, navigation
- no parsing, no VFS mutations, no validation logic

**Application (Use-cases)**
- orchestrates Domain + repositories
- decides *when* to validate, save attempts, load missions
- no direct React concerns

**Domain**
- deterministic simulation
- contains the full ruleset of the shell dialect
- returns typed results, errors, traces

**Adapters**
- fetch missions from backend
- store progress/attempts (backend + local cache)
- provide side-effect dependencies (clock/logger/id)

### Dependency direction
Dependencies point inward:
- UI -> Application -> Domain
- Adapters implement interfaces consumed by Application/Domain
- Domain depends only on **interfaces + pure types**

---

## 4) Runtime pipeline (single source of behavior)

When the user submits a command line:

1) **Parse**
- tokenize input
- parse tokens into an AST (or a validated command call structure)
- return typed parse errors (no exceptions as control flow)

2) **Resolve**
- resolve paths against `cwd`
- normalize `.`, `..`, `/`
- enforce path safety rules (depth/budgets)

3) **Execute**
- dispatch to a command handler via `CommandRegistry`
- handler reads/writes VFS through a single VFS API
- produce `CommandResult` with:
  - `stdout`, `stderr`, `exitCode`
  - structured `effects` (optional but recommended for Explain Mode)

4) **Validate**
- run mission `checks[]` against:
  - VFS state
  - cwd
  - stdout/stderr/exitCode
- produce:
  - `ValidationOk` or `ValidationFailed` (with *which check failed + why*)

5) **Trace**
- build `ExecutionTrace`:
  - tokens/AST summary
  - resolved paths
  - command steps
  - validation steps

6) **After pipeline (Application responsibility)**
- append step to attempt log
- persist local-first
- sync to backend (does not block the core loop)

This pipeline must be **stable** and the only way commands are executed.

---

## 5) Safety and determinism model

### What we guarantee
- **No OS execution.** No `eval`. No access to real filesystem.
- Output is plain text (escape/render safely).
- Deterministic simulation:
  - mission starts from snapshot
  - same input produces same result (within budgets)

### Budgets (must exist, even in MVP)
- max input length (characters)
- max output lines/bytes
- max VFS nodes / depth
- max file size
- max recursion/iterations (future `find`)
- max pipeline stages (future `|`)

If a budget is exceeded:
- return typed error
- deterministic error message + exit code
- trace records budget violation

---

## 6) Backend responsibilities (NestJS)

Backend is required, but it remains **supporting infrastructure**, not “the engine”.

### Storage choice (MVP)
- **Missions:** versioned JSON files inside the backend repo (read-only API). Not stored in DB.
- **Progress/Attempts:** PostgreSQL via Prisma (docker-compose). Optional: SQLite for local dev, same Prisma schema.

### MVP endpoints (minimal but real)
- `GET /api/missions`
  Returns missions list (with versioning fields).
- `GET /api/missions/:id`
  Returns full mission definition (snapshot + checks + hints).
- `GET /api/progress/:userId`
  Returns user progress summary.
- `PUT /api/progress/:userId`
  Replaces progress snapshot (idempotent).
- `POST /api/attempts/:userId`
  Stores attempt summary (and optionally step log).

Optional:
- `GET /api/health`
- `GET /api/version` (contracts version)

### Identity for MVP
For RS Tandem MVP, simplest approach:
- frontend generates a `userId` (UUID) and stores it locally
- backend treats it as an anonymous identity
- if later you add auth, keep contracts stable (wrap user identity behind an adapter)

---

## 7) Contracts and versioning

Frontend and backend must agree on:
- `Mission` (including snapshot/checks/hints)
- `Check` discriminated unions
- `CommandResult` (at least attempt summary)
- `ValidationResult` + error types
- `ExecutionTrace` shape (if stored/sent)

Rules:
- Contracts live in one place as SSOT: `data-contracts.md`.
- Include a `contractsVersion` field in API responses.
- If contracts version changes, update both sides in one PR (or coordinated PRs).

---

## 8) DI approach

### Frontend (manual DI)
- `compositionRoot` creates:
  - `MissionRepository` (API + cache)
  - `ProgressRepository` (API + local)
  - `Clock`, `Logger`, `IdGenerator`
  - `UseCases` wired to Domain + repos
- expose use-cases via React Context (`AppProviders`)

### Backend (NestJS DI)
- `MissionsModule`, `ProgressModule`, `AttemptsModule`
- each module exports services via providers
- repositories are interfaces (or tokens) so they can be swapped for tests

---

## 9) Testing strategy (what makes this “Senior TS”)

**Domain unit tests (highest ROI):**
- tokenizer/parser
- path resolution
- VFS operations invariants
- command handlers
- validators/checks
- budgets behavior

**Application tests:**
- run-command use-case (happy + error path)
- persistence calls triggered correctly
- replay rebuild correctness

**Backend tests:**
- contract-level tests for endpoints (request/response)
- mission versioning and retrieval
- progress write idempotency

---

## 10) Non-goals (architecture-level)

- No server-side command execution, ever.
- No “full bash” behavior.
- No unbounded operations that can freeze UI.
- No mixing UI state with domain state (domain stays pure).

---

## 11) Related docs

- `data-contracts.md` — SSOT for contracts
- `terminal-engine.md` — parsing/execution details
- `virtual-filesystem.md` — VFS invariants and operations
- `sandboxing.md` + `determinism.md` — budgets and repeatability
- ADR: simulated shell, no OS exec

---

# Glossary (SSOT)

This glossary defines **strict shared terminology** for Typocalypse (Terminal Dojo).
If a term is used in docs, code, UI, or API contracts — it must match the definitions here.

Goals:
- prevent ambiguous wording (“attempt” vs “step”, “mission” vs “chapter”),
- keep contracts and UI language consistent,
- reduce discussions and bugs caused by naming drift.

Rules:
- Keep it **small** (only terms we actually use).
- Prefer **one term** for one concept (no synonyms).
- Technical terms are in English and should match the docs/contracts.

---

## Core terms

### Mission
A single training task with:
- a deterministic start state (`initialFs`, `initialCwd`),
- validation rules (`checks[]`),
- teaching support (`hints[]`),
- metadata (difficulty, estimated time, version).

### Chapter
A logical grouping of missions (e.g., “Basics”, “Navigation”).
Chapters are product taxonomy, not engine logic.

### Dialect
The **supported subset** of shell behavior and commands.
Not “real bash”. Everything outside the dialect is unsupported by design.

### Command line
A single user input line submitted to the engine (e.g., `mkdir /dojo`).

### Pipeline (engine pipeline)
The stable sequence:
**Parse → Resolve → Execute → Validate → Trace**.
No other code path is allowed to execute commands.

---

## Progress & history terms

### Attempt
A **mission run** from start until the user exits or completes the mission.
Attempts are mission-specific and persisted (backend).

Hint unlocking is based on **attempt count**, not per-command submissions.

### Step
One submitted command line inside an attempt.
A step includes input + result + timestamp (+ trace reference).

### Replay
A playback view of an attempt’s steps, step-by-step.
Replays must be reproducible and tied to the mission version used at recording time.

---

## Validation & teaching terms

### Check
A single validation rule (minimal and orthogonal).
Checks validate **effects** (state/output), not exact command sequences.

Examples:
- `cwd_is`
- `path_exists`
- `file_content_matches`
- `output_contains`
- `exit_code_is`

### Validation result
The outcome of running checks:
- `ok` (all checks passed), or
- `failed` (includes which check failed + why).

### Hint
A progressive teaching message, unlocked by attempts.
Hints should guide thinking, not spoil with exact command sequences.

---

## Engine & data terms

### VFS (Virtual File System)
An in-memory filesystem model used by the engine.
It is deterministic, bounded by budgets, and never touches the real OS filesystem.

### Snapshot (VFS snapshot)
A mission-defined starting filesystem state.
Snapshots must be bounded (size/depth/file bytes) for safety and performance.

### Budget
A hard limit that guarantees safety and prevents freezes.
Budgets must produce typed deterministic errors when exceeded.

Common budgets:
- max input length
- max output lines/bytes
- max VFS nodes / depth / file bytes
- max iterations/recursion (future `find`)
- max pipeline stages (future `|`)

### Execution trace (Explain Mode trace)
A structured record explaining what happened:
- parse result (tokens/AST summary),
- resolved paths,
- command handler steps,
- validation steps (which check failed and why),
- budget violations (if any).

---

## Output & errors

### stdout / stderr
Separate output streams returned by the engine.
UI may render them together, but data must remain separated.

### Exit code
Numeric result code of a command:
- `0` = success
- non-zero = failure (typed error mapped to UX message)

### Typed error
A discriminated union error from Domain/Application.
We do not use exceptions as control flow for expected errors.

---

## Architecture terms (frontend)

### Domain
Pure deterministic core: parser, VFS, commands, validators, trace builder.
No React, no storage, no HTTP.

### Application (use-cases)
Orchestrates Domain + repositories:
start mission, run line, validate, persist, replay, sync.

### Adapters / Infrastructure
Side effects and integrations:
API clients, storage (IndexedDB/local cache), clock/logger/id providers.

### UI
React screens and components:
renders state, collects input, does navigation.
No parsing or VFS logic inside UI.

---

## Cross-repo terms (frontend + backend)

### Contracts (SSOT)
The shared API/data shapes defined in `02-architecture/data-contracts.md`.
Frontend and backend must match these contracts.

### contractsVersion
A version string/number included in API responses to detect contract mismatches.

### missionVersion
A numeric version on mission definition.
Attempts must record `{ missionId, missionVersion }`.
If a mission updates, UI may show: “Recorded on v1, current is v2”.

---

## Abbreviations

- **SSOT** — Single Source of Truth
- **ADR** — Architecture Decision Record
- **DoD** — Definition of Done
- **VFS** — Virtual File System

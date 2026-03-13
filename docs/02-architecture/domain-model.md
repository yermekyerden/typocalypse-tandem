# Domain Model (SSOT)

This document defines the **core domain concepts** of Terminal Dojo and how they relate.
It exists to keep:
- clean boundaries (UI/Application/Domain),
- consistent naming,
- stable contracts and testable core logic.

Related:
- `02-architecture/system-overview.md`
- `02-architecture/data-contracts.md`
- `01-product/mission-design.md`

---

## 0) Domain goals

The Domain is a **deterministic simulation**:
- same input + same mission snapshot → same result,
- no OS execution, no network, no randomness (MVP),
- bounded work (budgets) to prevent freezes.

The Domain returns:
- typed command results,
- typed validation results,
- structured execution traces.

---

## 1) Core entities and value objects

### 1.1 Mission (entity, data-driven)
Represents a single training task:
- metadata (title, difficulty, version),
- start state (snapshot + initial cwd),
- validation checks,
- hints.

SSOT shape lives in `data-contracts.md`.

### 1.2 VFS (Virtual File System) (aggregate)
Represents the simulated filesystem state:
- directories and files,
- POSIX-like paths,
- bounded by budgets.

The VFS is mutated only by command handlers via a single VFS API.

### 1.3 EngineState (value object)
Represents current runtime state for a mission:
- `cwd`,
- `vfs`,
- optional: environment-like flags (MVP: none).

EngineState is **the truth** for validation.

### 1.4 Command (concept)
A command is a named operation implemented as a handler:
- `pwd`, `ls`, `cd`, `cat`, `echo`, `mkdir`, `touch`, `rm`, `help`.

Commands are registered in a `CommandRegistry` (Strategy pattern).
No giant switch statement.

### 1.5 CommandInvocation (value object)
Result of parsing input line:
- command name,
- args,
- raw input line (for trace).

### 1.6 CommandResult (value object)
The outcome of executing a command in the simulation:
- stdout/stderr strings,
- exitCode number,
- typed engine error (if failed),
- traceId (links to Explain Mode).

SSOT in `data-contracts.md`.

### 1.7 MissionCheck (value object)
A single validator rule:
- `path_exists`, `cwd_is`, output checks, etc.

Checks are minimal and orthogonal (see `mission-design.md`).

### 1.8 ValidationResult (value object)
Outcome of running checks against EngineState + outputs:
- ok or failed,
- check reports (which failed + why).

### 1.9 ExecutionTrace (value object)
Structured explanation:
- parse summary,
- resolve summary,
- execute effects,
- validation steps,
- budget violations.

Trace is produced on every step.

### 1.10 Budget (value object)
A hard limit that guarantees safety and determinism:
- max input length,
- max output size,
- max nodes/depth/file bytes,
- max iterations, etc.

Budgets violations return typed errors and appear in trace.

---

## 2) Relationships (concept map)

```

Mission
├── initialFs (VfsSnapshot) ──> VFS
├── initialCwd
├── checks[] (MissionCheck) ──> ValidatorEngine ──> ValidationResult
└── hints[] (MissionHint)

User input line
└── Parser ──> CommandInvocation
└── Resolve (paths) ──> normalized paths
└── Execute (CommandRegistry -> CommandHandler) ──> CommandResult + effects
└── Validate (checks) ──> ValidationResult
└── TraceBuilder ──> ExecutionTrace

Application layer
└── persists Attempt/Progress using repositories (backend + local cache)

```

Rule:
- Domain does not know about HTTP, storage, React, routing.

---

## 3) Domain services (pure logic)

### Parser / Tokenizer
Input: raw line string
Output:
- ok: CommandInvocation
- or typed ParseError

No exceptions as control flow.

### PathResolver
Input: cwd + raw paths
Output: normalized absolute paths (POSIX rules)

Must enforce:
- depth budgets,
- invalid path segments,
- deterministic normalization.

### CommandRegistry
Maps command name → handler.
Supports:
- list commands (for help),
- validate command exists,
- dispatch execution.

### CommandHandlers
Each command:
- reads/writes EngineState through VFS API,
- returns CommandResult,
- emits structured effects (recommended).

### ValidatorEngine
Runs mission checks against:
- EngineState (cwd + vfs)
- CommandResult (stdout/stderr/exitCode)

Returns:
- ValidationOk or ValidationFailed
- with reports (actionable messages)

### TraceBuilder
Builds ExecutionTrace from:
- parse info,
- resolve info,
- execute info,
- validate reports,
- budgets (if violated).

---

## 4) Invariants (must always hold)

### Determinism invariants
- No access to OS filesystem, process, or network.
- No hidden randomness.
- Same input + same state → same result.

### VFS invariants
- tree structure is valid (no cycles),
- node names contain no `/`,
- budgets are enforced on any mutation,
- all operations are performed via VFS API.

### Error invariants
- Any failure must be represented as a typed error.
- UI-facing messages must be safe to display.

### Validation invariants
- Checks validate effects, not exact command strings.
- Failure must point to a specific check.

---

## 5) Patterns used (by intent)

### Strategy (CommandHandlers)
- Each command is a separate handler class/module.
- New commands added by registering a handler.

### Factory / Composition Root (Frontend DI)
- Domain is pure.
- Application wires use-cases and repositories in one place.

### Result types (no exceptions for expected flow)
- parse/execute/validate returns discriminated unions.
- errors are typed and testable.

### SSOT contracts
- shared types and JSON shapes defined once in `data-contracts.md`.

---

## 6) What belongs where (anti-leak rules)

### UI must NOT:
- parse commands,
- mutate VFS,
- implement validation,
- “compute” mission completion.

### Application must NOT:
- contain low-level VFS logic,
- contain parsing or path normalization.

### Domain must NOT:
- access localStorage/indexedDB,
- call backend,
- know about React component state.

---

## 7) Testability guidance

High ROI unit tests:
- Parser: tokens, quotes (MVP), invalid cases
- PathResolver: `.` `..` absolute/relative, edge cases
- VFS: mkdir/touch/rm invariants and budgets
- Validators: each check type, failure messages
- Budgets: deterministic violations

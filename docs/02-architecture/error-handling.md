# Error Handling & UX Mapping (SSOT)

This document defines how Terminal Dojo handles errors **end-to-end**:
Domain typed errors → terminal output → feedback panel → explain trace → persistence behavior.

**Goals**
- Errors are **typed**, deterministic, and testable.
- The user always sees **actionable** feedback (not vague “wrong”).
- The terminal experience feels “real enough” (exit codes, stderr), without implementing full Bash.
- We never leak stack traces, internals, or unsafe HTML.

Related:
- `02-architecture/data-contracts.md` (EngineError, ApiError)
- `02-architecture/system-overview.md` (pipeline)
- `02-architecture/sandboxing.md` (security rules)
- `02-architecture/determinism.md` (budgets + repeatability)
- `01-product/user-flows.md` (UI states + panels)

---

## 0) Core rule: no exceptions as control flow

Expected failures (wrong command, missing path, budget exceeded) MUST be represented as:
- `CommandFailed` with a typed `EngineError`
- deterministic `exitCode`
- deterministic, human-readable stderr message

Exceptions may exist only for truly unexpected bugs (programmer errors).
Even then:
- UI must show a safe generic message
- details go to logs (not to the user)

---

## 1) Error taxonomy

Errors fall into three buckets:

### 1.1 Domain Engine errors (frontend)
Produced inside the pipeline:
Parse → Resolve → Execute → Validate → Trace.

Examples:
- parse errors, unknown commands, invalid arguments
- path resolution errors (not found, not a directory)
- budgets exceeded
- mission constraints blocked (allowedCommands)

These use `EngineError` from contracts.

### 1.2 Validation failures (mission checks)
Not “engine errors” — these are normal outcomes:
- mission is not complete yet
- or a specific check failed

Validation is reported via `ValidationResult` and must be shown in Feedback Panel.

### 1.3 Backend/API errors (network/persistence)
Use `ApiError` envelope:
- `validation_error`, `not_found`, `rate_limited`, `internal_error`, etc.

These affect persistence/sync, but must not break the local core loop.

---

## 2) Deterministic exit code policy (dialect rules)

We implement a small, stable exit code policy.
It does not need to match Bash perfectly, but it must be:
- consistent
- documented
- easy to test

### 2.1 Exit code mapping (MVP)

| EngineError.type          | Exit code | Notes |
|--------------------------|----------:|------|
| `parse_error`            | 2         | “usage/syntax” style error |
| `unknown_command`        | 127       | classic “command not found” vibe |
| `invalid_arguments`      | 2         | wrong flags/args |
| `path_not_found`         | 1         | runtime error |
| `not_a_directory`        | 1         | runtime error |
| `is_a_directory`         | 1         | runtime error |
| `budget_exceeded`        | 137       | deterministic “killed by limits” style |
| `operation_not_allowed`  | 126       | “found but not allowed” (mission constraints / safety) |

**Rule:** exit code is part of the dialect. Changing it is a breaking change → bump contracts + ADR.

### 2.2 Validation results and exit codes
Mission validation does NOT change the command’s exit code.
Example:
- `mkdir /dojo` can succeed (exitCode 0)
- but mission may still be incomplete → validation failed (Feedback Panel)

---

## 3) User-facing messaging rules

### 3.1 Terminal stderr message format
All engine errors produce exactly one short primary message line in `stderr`.

Recommended format (stable):
- `dojo: <command>: <message>`

Examples:
- `dojo: cd: path not found: /nope`
- `dojo: mkdir: invalid arguments: missing <path>`
- `dojo: ???: unknown command`

### 3.2 No leaking internals
Never show:
- stack traces
- file paths from our repo
- raw exception messages
- JSON dumps
- regex engine errors

If something unexpected happens:
- show: `dojo: internal error (please retry)`
- record details to logger (dev-only)

### 3.3 “Actionable” rule (Feedback Panel)
For engine errors, Feedback Panel must show:
- error title (friendly)
- short explanation
- “what to try” (one bullet is enough)

Example (unknown command):
- Title: `Unknown command`
- Explanation: `The dialect does not include "rmrf".`
- Try: `Type "help" to list available commands.`

---

## 4) Mapping layer (single place, SSOT in code)

We will implement a single mapping function (Application layer):
- `presentEngineError(error: EngineError): PresentedError`

Where `PresentedError` contains:
- `exitCode`
- `terminalStderrLine`
- `feedbackTitle`
- `feedbackBodyMd` (safe markdown subset)
- optional `helpLink` concept (e.g., suggest `help <command>`)

**Rule:** UI and Domain must not invent messages ad-hoc.
One mapping table = SSOT.

---

## 5) Mission constraints errors (allowedCommands)

When a mission defines `allowedCommands`, and user tries a blocked command:
- produce `operation_not_allowed` with a stable reason:
  - `reason: "command_not_allowed"`
- stderr example:
  - `dojo: rm: not allowed in this mission`
- Feedback Panel:
  - Title: `Command not allowed`
  - Body: `This mission restricts commands to: pwd, ls, cd, mkdir, touch, help`

Explain Trace must include:
- “Blocked by mission constraint: allowedCommands”

---

## 6) Budget exceeded behavior (safety + UX)

When a budget is exceeded:
- do not mutate VFS
- return `budget_exceeded` error
- deterministic exit code (137)
- deterministic stderr message:
  - `dojo: budget exceeded: max_output_lines`

Feedback Panel must explain:
- which budget
- why it exists (safety/determinism)
- what to do (e.g., “narrow your output”, “avoid huge content”)

Trace must record:
- `budgets.violated = <BudgetName>`

---

## 7) Backend/API error handling (offline-first UX)

### 7.1 Core loop must not depend on backend availability
Mission execution, validation, and trace must work without network.

Persistence behavior:
- write locally first (cache)
- enqueue sync to backend
- show “Offline / queued” banner if sync fails

### 7.2 API error to UX mapping (MVP)
- `rate_limited` → “Too many requests. Retrying soon.”
- `validation_error` → “Client/server mismatch. Please refresh.”
- `internal_error` → “Server error. Working offline.”
- `not_found` (mission id) → “Mission not found. Refresh catalog.”

We do NOT show raw `details` to the user.
Details go to logs for debugging.

---

## 8) Trace rules for errors

Explain Mode must always be available after a command submission, even on errors.

Minimum trace on failure:
- parse stage: ok=false with parse_error OR ok=true
- resolve stage: show cwd + resolved paths if applicable
- execute stage: exit code + error type
- validate stage: present last known validation (or “skipped due to engine error”)

**Rule:** if engine fails before validation, validation is reported as:
- “validation skipped (engine error)” in trace UI (not as a mission failure)

---

## 9) Testing requirements (DoD for error work)

Any new error type or mapping change must add tests:
- Domain: error produced in the correct scenario
- Application: mapping returns correct exitCode + messages
- Snapshot tests (optional): stderr line format is stable

Minimum high-ROI tests:
- unknown command → 127 + correct stderr prefix
- parse error → 2
- path not found → 1
- operation not allowed → 126
- budget exceeded → 137 and no state mutation

---

## 10) Examples (expected UX)

### 10.1 Unknown command
Input:
- `makedir /dojo`

Terminal:
- stderr: `dojo: makedir: unknown command`
- exitCode: 127

Feedback:
- `Unknown command`
- `Type "help" to see supported commands.`

### 10.2 Path not found (cd)
Input:
- `cd /nope`

Terminal:
- stderr: `dojo: cd: path not found: /nope`
- exitCode: 1

Feedback:
- `Path not found`
- `Check spelling or run "ls" to inspect directories.`

### 10.3 Budget exceeded
Input that produces too much output.

Terminal:
- stderr: `dojo: budget exceeded: max_output_lines`
- exitCode: 137

Feedback:
- `Output limit exceeded`
- `This prevents freezes. Try smaller output or narrower commands.`

---

# Terminal Engine (SSOT)

This document defines the **single execution path** for Terminal Dojo:
how an input line becomes deterministic state changes, validation results, and an explainable trace.

**Non-negotiable:**
- No OS execution, no eval, no real filesystem access.
- The engine is deterministic: same input + same snapshot => same result (within budgets).
- Command execution happens only through the pipeline:
  **Parse → Resolve → Execute → Validate → Trace**.

Related:
- `02-architecture/system-overview.md`
- `02-architecture/data-contracts.md` (SSOT for types/contracts)
- `01-product/mission-design.md` (check philosophy + hints)
- `00-overview/glossary.md`

---

## 0) Goals

- Make the engine **safe** (sandboxed), **deterministic**, and **bounded** (budgets).
- Make failures **actionable**:
  - typed errors (no exceptions for expected flow),
  - clear messages,
  - trace that explains: parse → resolve → execute → validate.
- Make the engine **testable**:
  - Domain is pure,
  - handlers are small and isolated,
  - VFS invariants are enforced in one place.

---

## 1) Pipeline overview (the only execution path)

When the user submits a command line:

1) **Parse**
- Tokenize the raw input line.
- Parse tokens into a `CommandInvocation`:
  - `commandName`
  - `args[]`
- Fail with typed `ParseError` when invalid.

2) **Resolve**
- Resolve any path-like arguments against `cwd`.
- Normalize POSIX segments: `.`, `..`, `/`.
- Apply path budgets and invalid-segment rules.
- Produce a `ResolvedInvocation` (same command, resolved args where needed).

3) **Execute**
- Enforce mission constraints:
  - `allowedCommands` (if present) must be checked here.
- Dispatch via `CommandRegistry` to a `CommandHandler`.
- Handler reads/writes VFS only via VFS API.
- Produce `CommandResult` + optional structured `effects`.

4) **Validate**
- Run mission `checks[]` against:
  - current `EngineState` (cwd + vfs),
  - `CommandResult` (stdout/stderr/exitCode).
- Produce `ValidationResult`:
  - ok, or failed (includes which check failed + why).

5) **Trace**
- Build `ExecutionTrace` for Explain Mode:
  - parse summary,
  - resolve summary,
  - execute summary (exitCode, effects, typed error),
  - validate summary (reports, failed check),
  - budget violations (if any).

**Important rule:**
- Trace is built for **every step**, even failed parse/resolve/execute cases.

---

## 2) Core data shapes (Domain-level)

> Canonical JSON contract types live in `data-contracts.md`.
> Here we define the engine’s internal intent.

### 2.1 EngineState (runtime truth)
- `cwd: PosixPath`
- `vfs: Vfs` (aggregate)
- optional: engine config/budgets (MVP: simple)

### 2.2 CommandInvocation (parsed)
- `inputLine: string`
- `commandName: string`
- `args: string[]`

### 2.3 ResolvedInvocation (post-resolve)
Same as invocation, but with resolved paths where applicable.

Rule:
- Resolve only what the command declares as “path args”.
- Do not guess.

### 2.4 Effects (structured, for trace and UX)
Use `TraceEffect` variants from `data-contracts.md`:
- `cwd_changed`
- `node_created`
- `node_removed`
- `file_written`

Effects are optional but strongly recommended because they make Explain Mode feel “real”.

---

## 3) Parsing rules (MVP dialect)

We implement a **safe, small** parser. We do not try to be Bash.

### 3.1 Tokenization (MVP)
- Tokens split by whitespace, except inside quotes.
- Supported quotes:
  - single quotes `'...'` (no escapes inside)
  - double quotes `"..."` (supports basic escapes)
- Supported escaping:
  - `\"` inside double quotes
  - `\\` inside double quotes
  - `\ ` (escaped space) outside quotes (optional; can be MVP+)

### 3.2 Parsing output
- If no tokens: treat as a no-op command submission:
  - produce `CommandOk` with empty output and `exitCode=0`
  - validation still runs (optional; recommended: run validation to allow “empty step” to be neutral)
- First token is `commandName`.
- Remaining tokens are raw `args[]`.

### 3.3 Parse errors (typed)
Use `EngineError` union from `data-contracts.md`.
For parsing:
- return `ParseError` with:
  - `message`
  - optional `position`

Rules:
- Never throw exceptions for invalid user input.
- Parse errors must be deterministic and stable.

---

## 4) Path resolution rules (POSIX-like, deterministic)

### 4.1 Inputs
- `cwd` (absolute, normalized)
- raw path segments from args

### 4.2 Normalization rules
- If path starts with `/`, it is absolute.
- Else, it is relative to `cwd`.
- Normalize:
  - `.` => stay
  - `..` => go up (cannot escape `/`)
  - collapse multiple `/` into one
- Reject invalid segments:
  - empty segment in the middle (after normalization is okay)
  - segment containing `/`
  - optionally reject `\0` and control characters

### 4.3 Budget checks during resolution
Resolution must enforce:
- max path length (optional, but good)
- max depth (from budgets)

If exceeded:
- return `BudgetExceededError` (typed) and record in trace.

---

## 5) Command dispatch (registry, no giant switch)

### 5.1 CommandRegistry responsibilities
- Register all available command handlers.
- Provide:
  - `has(commandName)`
  - `get(commandName)` -> handler
  - `list()` for `help`

### 5.2 Handler contract (conceptual)
A handler:
- reads/writes VFS only through VFS API
- returns:
  - stdout/stderr
  - exitCode
  - typed error on failure (no throw)
  - optional `effects[]`

### 5.3 Unknown command behavior
If command not found:
- return `UnknownCommandError` typed error
- exitCode non-zero (recommend `127` for “command not found”, but pick one and keep stable)

---

## 6) Mission constraints: allowedCommands

If mission defines `allowedCommands`:
- enforce in **Execute** stage before handler dispatch.

If blocked:
- return typed `OperationNotAllowedError` (from `data-contracts.md`) with:
  - `reason: "command_not_allowed"`
  - message: mission-friendly
- exitCode non-zero (recommend `126` for “not allowed”, but keep stable)

Trace must show:
- blocked by mission constraint
- include allowed list (optional, but helpful)

---

## 7) Validation engine (checks run after each step)

### 7.1 What validation sees
- current `EngineState` (cwd + vfs)
- current `CommandResult`

### 7.2 Check execution rules
- Checks are executed in mission-defined order.
- Collect `CheckReport[]` for each check.
- On first failure:
  - produce `ValidationFailed` with `failedCheckId`
  - still include reports up to and including failed check
  - (optional) include all reports; MVP can stop early for simplicity

### 7.3 Messaging rules
- Reports must be safe to show.
- If a check has `failMessage`, prefer it over technical engine phrasing.
- Validation must be stable and deterministic.

---

## 8) Budgets (must be enforced in the pipeline)

Budgets prevent freezes and keep determinism.

### 8.1 MVP budget list
- `max_input_length`
- `max_output_bytes`
- `max_output_lines`
- `max_vfs_nodes`
- `max_vfs_depth`
- `max_file_bytes`
- future-proof:
  - `max_iterations` (for `find`, `grep`)
  - `max_pipeline_stages` (for `|`)

### 8.2 Where to enforce budgets
- Parse stage:
  - input length
- Resolve stage:
  - path depth / length
- Execute stage:
  - VFS mutation budgets
  - output size budgets
  - iterations budgets (future)
- Validate stage:
  - avoid expensive scans (checks must be designed to be bounded)

### 8.3 Behavior on budget violation
- Return `BudgetExceededError` (typed)
- Deterministic message + deterministic exitCode
- Trace records:
  - which budget was violated
  - at which stage (parse/resolve/execute/validate)

---

## 9) Trace building rules (Explain Mode quality bar)

Trace must answer:
- What did you type?
- What did we think you meant? (parse)
- What paths did we resolve? (resolve)
- What changed? (execute effects + exitCode)
- Why is the mission still failing/passing? (validation reports)

Rules:
- Trace is always built, even on failures.
- Trace must never include unsafe content (escape user input on render).
- Trace is a product feature, not debug logging.

---

## 10) End-to-end example (one step)

Input:
- `mkdir /dojo`

Assume mission snapshot:
- `cwd = /`
- VFS has only `/home`

Pipeline outcome (high-level):
- Parse: ok => `commandName="mkdir" args=["/dojo"]`
- Resolve: raw `/dojo` => resolved `/dojo`
- Execute:
  - create dir `/dojo` in VFS
  - effects: `{ type:"node_created", path:"/dojo", kind:"dir" }`
  - stdout/stderr empty, exitCode 0
- Validate:
  - check `path_exists /dojo` => ok
  - next check might fail (e.g., file missing) => show which and why
- Trace:
  - includes all summaries + effects + validation reports

---

## 11) Implementation boundaries reminder

### Domain must NOT
- call HTTP
- read/write localStorage/IndexedDB
- know about React state or routing

### Application layer must
- call Domain pipeline
- append step logs
- persist attempt/progress (local-first, then backend)
- handle offline queueing

---

## 12) Definition of Done (engine changes)

A change to engine behavior is “done” only if:
- Domain tests cover the change,
- budgets remain enforced,
- trace remains accurate and helpful,
- contracts/docs remain aligned (`data-contracts.md` and this doc).

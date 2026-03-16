# Determinism (SSOT)

This document defines what **determinism** means in Terminal Dojo and how we enforce it.
Determinism is mandatory for:
- fair validation,
- reproducible replays,
- reliable debugging (Explain Mode),
- stable demos.

**Rule:** the same mission version + same inputs must produce the same outputs and state changes,
within documented budgets.

Related:
- `00-overview/vision.md` (principles)
- `02-architecture/system-overview.md` (pipeline)
- `02-architecture/virtual-filesystem.md` (VFS invariants)
- `02-architecture/data-contracts.md` (contracts, trace, errors)
- `01-product/mission-design.md` (mission rules)

---

## 0) Determinism definition (one paragraph)

Given:
- a mission `{ missionId, missionVersion }`,
- its start snapshot `{ initialFs, initialCwd }`,
- the same ordered list of submitted command lines,

the engine MUST produce:
- identical VFS end state,
- identical per-step `stdout`, `stderr`, `exitCode`,
- identical validation outcomes (which checks fail/pass),
- identical (or semantically equivalent) traces.

If this is violated, it is a **bug** unless explicitly allowed by a documented exception.

---

## 1) Scope: what must be deterministic

### 1.1 Engine pipeline output
For each step:
- parse result (`commandName`, `args` or parse error)
- resolved paths (`raw -> resolved`)
- command execution result
- validation result
- budget violations

### 1.2 VFS behavior
- path normalization is stable
- directory listing order is stable
- all mutations are atomic (no partial state updates)
- budget failures do not mutate state

### 1.3 Replay correctness
A replay recorded on mission version `vN` must be reproducible on:
- the same engine version, and
- the same mission version.

If mission changed (now `vN+1`):
- we still can show the replay,
- but the UI must clearly display: “Recorded on vN, current is vN+1”.
Re-running the old steps against a new mission version is not required to match.

---

## 2) Sources of non-determinism (forbidden)

The Domain engine MUST NOT depend on:

### 2.1 Real time
- `Date.now()`, `new Date()`
- system timezones
- performance timers

If timestamps are needed for persistence:
- they are generated in Application/Adapter layer and stored as data, not used for decisions.

### 2.2 Randomness
- `Math.random()` and equivalents

If randomness is ever needed (post-MVP):
- use a seedable PRNG,
- the seed MUST be recorded in attempt metadata,
- seeded randomness must be part of the trace.

MVP policy: **no randomness at all**.

### 2.3 OS / environment
- real filesystem
- environment variables
- process state
- network calls inside Domain

### 2.4 Floating behavior & iteration order bugs
- relying on JS object key iteration order for correctness
- relying on insertion order of maps/sets for user-visible output

Rule: if ordering matters (e.g., `ls`), define it and implement it explicitly.

---

## 3) Determinism boundaries (where time is allowed)

### 3.1 Domain (pure) — must be deterministic
Domain is pure simulation:
- parsing
- path resolution
- VFS operations
- command handlers
- validation checks
- trace building

Domain input must be explicit data only:
- input command line
- current state snapshot
- mission checks

### 3.2 Application / Adapters — can use time, but must not affect results
Allowed side effects:
- timestamps for persistence
- logging
- network requests to backend
- local storage (IndexedDB)

But:
- these must NOT change the command result or validation outcome
- failure to persist must not change mission logic
  - it only affects “sync status” UI

---

## 4) Stability rules for user-visible output

### 4.1 stdout/stderr formatting
Output must be stable:
- do not include dynamic timestamps
- do not include “random ids”
- do not include “memory addresses”
- do not include environment-specific strings

### 4.2 Directory listing order
`ls` output order MUST be deterministic.
Recommended:
- lexicographic ascending sort by name.

### 4.3 Error messages
Typed errors should have stable `type` + stable `message`.
If you must include details:
- include stable data only (paths, expected vs actual)
- never include stack traces in user-facing messages

---

## 5) Budgets are part of determinism

Budgets prevent “depends on machine performance” behavior.

### 5.1 Budget exceed behavior
When a budget is exceeded:
- return typed error (`budget_exceeded`) with the specific budget name
- exit code must be stable
- VFS must not change
- trace must record the violation

### 5.2 Budget definitions
Budgets are defined in:
- engine defaults (global)
- per-mission budgets in snapshot (optional)

Mission budgets may be clamped to global max.

---

## 6) Trace determinism requirements

Trace must be produced in a stable shape:
- the presence/absence of fields must be consistent
- arrays must be in stable order
- do not include runtime-dependent data (time, random)

We allow **semantically equivalent** traces when:
- internal refactors change wording but not meaning
- field order in JSON changes (clients must not depend on ordering)

But:
- `TraceEffect[]` must remain stable in order for the same operation sequence.

---

## 7) Versioning rules (missions, contracts, engine)

### 7.1 Mission version
Mission definition includes `missionVersion`:
- if snapshot/checks/hints meaning changes -> increment `version`
- attempts record `{ missionId, missionVersion }`

### 7.2 Contracts version
Backend responses include `contractsVersion`:
- mismatches must be detectable
- breaking changes require ADR

### 7.3 Engine version (optional but recommended)
For best replay diagnostics, store a lightweight engine build/version string:
- `engineVersion` in attempt summary (optional field)

This helps debug: “replay differs because engine changed”.

---

## 8) Tests: how we prove determinism

### 8.1 Golden tests (recommended)
For a given mission snapshot + inputs:
- run pipeline
- assert:
  - final VFS structure (paths + contents)
  - per-step stdout/stderr/exitCode
  - validation results
  - key trace fields

Store expected outputs as fixtures (JSON).

### 8.2 Replay round-trip test
- run attempt
- store steps
- rebuild state by replaying steps
- assert final state matches original

### 8.3 Order stability tests
- `ls` ordering
- trace effects order
- check report ordering

---

## 9) Debug policy (what to do when determinism breaks)

If the team sees “same input yields different output”:
1) reproduce with the same mission version and inputs
2) capture trace + engine version
3) identify source:
   - ordering bug
   - time/random leak
   - mutation outside VFS API
   - budget behavior inconsistent
4) fix and add a regression test

**Severity:** determinism bugs are “blocker” for MVP.

---

## 10) Definition of Done

A change that touches Domain/VFS/validation is “done” only if:
- determinism rules are still satisfied,
- golden/regression tests exist for the change,
- docs remain accurate (`system-overview`, `virtual-filesystem`, `data-contracts` if needed).

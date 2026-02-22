# Vision (Terminal Dojo)

> **Source of truth** for: vision, MVP boundaries, safety/determinism rules, and cut lines.

---

## 0) One-liner

**Terminal Dojo** is a mission-based CLI training app where users build real terminal habits by solving missions inside a **fully simulated shell + virtual file system** (**no OS execution**).
Missions validate **results** (state/output), explain mistakes using **structured traces**, and store **replays + progress**.

---

## 1) Project constraints (timeline)

- **Today:** 2026-02-22
- **Hard deadline (project end):** **2026-03-30**
- We plan for **5 delivery weeks** ending at the deadline.
- Presentation/demo preparation is treated as **part of delivery**, not “after”.

> Rule: we do not rely on any “extra” time. If an extra week exists, it becomes buffer only.

---

## 2) Why this exists (problem → solution)

### Problem
Beginners often learn CLI as memorized snippets, not as a mental model. In real work they struggle with:
- reading filesystem state,
- composing command sequences,
- interpreting errors and side effects.

### Solution
A deterministic training sandbox:
- user types commands,
- our engine mutates a Virtual File System (VFS),
- missions validate **effects** (state/output), not exact command strings,
- failures give actionable feedback (**which check failed + why**),
- Explain Mode shows the trace: **parse → resolve → execute → validate**.

---

## 3) Non-negotiable principles

### Safety by design
- **No OS execution**, no `eval`, no real filesystem access.
- Output is rendered as **plain text** (escape everything).
- Strict budgets prevent freezes and infinite work.

### Determinism
- Every mission starts from a known snapshot.
- Same input → same output/state (within documented budgets).

### Validation by result
- We validate terminal **effects**:
  - cwd
  - VFS state
  - stdout/stderr patterns
  - exit codes

### Teach-by-debugging
- Explain Mode is part of the learning loop, not optional polish.

### Senior-grade engineering
- Strict TypeScript, no `any`, discriminated unions for contracts/errors.
- Clean Architecture boundaries are real (not “for docs only”).
- SOLID / DRY / KISS / Clean Code / DI are enforced by structure + reviews.

---

## 4) MVP definition (must ship)

MVP is the full loop that is **impressive in demo**.

### MVP loop
1) **Terminal experience**
   - input line + output stream
   - command history
   - data-level separation of stdout vs stderr (even if visually merged)

2) **Safe shell engine (limited dialect)**
   - tokenizer + parser
   - typed parse errors (no silent failures)
   - command registry/dispatcher (no giant switch)
   - predictable exit codes

3) **Virtual File System (VFS)**
   - POSIX-like paths (`/`, `.`, `..`)
   - directories + files with budgets
   - snapshot loader for missions

4) **Mission system (data-driven)**
   - missions defined as data contracts
   - validators check state/output/cwd
   - progressive hints (non-spoiler policy)

5) **Explain Mode (Execution Trace)**
   - structured trace: parse → resolve → execute → validate
   - readable steps, not raw logs

6) **Replay + attempts history**
   - store commands + results + timestamps
   - step-by-step replay

7) **Command help that matches our dialect**
   - `help` and `help <command>` with:
     - syntax
     - examples
     - limitations
     - common mistakes

8) **Safety budgets**
   - max input length
   - max output lines/bytes
   - max FS nodes/depth/file size
   - bounded iterations / recursion (future-proof)

---

## 5) Shell dialect (safe subset)

### MVP commands
- Navigation: `pwd`, `ls`, `cd`
- Read: `cat`
- Output: `echo`
- FS ops: `mkdir`, `touch`, `rm` (restricted)
- Help: `help`, `help <command>`

### Parsing rules (MVP)
- space-separated tokens
- quotes `'...'` and `"..."` (basic)
- limited escaping `\`
- strict validation with meaningful typed errors

### Explicit non-goals (MVP)
We do **not** implement full Bash:
- redirects `>`, `>>`, `<`
- subshell `$(...)`
- env expansion `$HOME`
- complex globbing / scripting

Rule: if a mission would require unsupported features, we **redesign the mission**, not hack the dialect.

---

## 6) Product flow (what the user experiences)

### Core screens
1) **Library**
   - chapters → missions
   - difficulty + estimated time
   - progress indicators

2) **Mission Run**
   - terminal panel (input/output)
   - mission panel (goal + hints)
   - feedback panel (validation result + “why failed”)
   - Explain panel (trace)
   - quick actions: reset, retry, replay

3) **Replay**
   - list of attempts
   - step-by-step playback (input → result → trace)

---

## 7) Backend (mandatory) — what it does and doesn’t do

### Backend does
- provides missions catalog over API (read-only for MVP)
- stores progress and attempts (persistence)
- exposes contract/version info for compatibility

### Backend never does
- never executes user commands
- never interprets shell input
- never becomes the “engine”

### Persistence choice (recommended)
- **PostgreSQL + Prisma**
- Missions are stored as **JSON in repo** (backend serves them).
- DB stores:
  - users (anonymous id)
  - progress summary
  - attempts (summary, optionally step log)

---

## 8) Architecture shape (frontend)

We follow **Clean Architecture**: UI and infra are adapters around a deterministic domain.

- **Domain**
  - parser/tokenizer
  - command handlers + registry
  - VFS operations + invariants
  - mission validators
  - trace building
- **Application**
  - use-cases: start mission, run command, validate, save attempt, replay
- **Adapters**
  - mission API client + cache
  - progress/attempts repo (API + local cache)
  - clock/logger/id generator
- **UI**
  - React screens/components only

---

## 9) Cut lines (if time slips)

Cut order (first cut = easiest to drop, last = never drop):
1) AI Mentor / RAG
2) Any extra editor tooling / mission builder UI
3) Easter eggs / mini-games
4) Extra dialect features (`find`, `grep`, pipelines)
NEVER cut:
- terminal + engine + VFS + missions + validators + explain + replay + budgets

---

## 10) Demo scenario (minimum impressive flow)

1) Open app → pick a mission
2) Type commands → VFS changes → output
3) Validation → clear success/fail + reason
4) Explain Mode → trace (parse → resolve → execute → validate)
5) Replay → playback attempt step-by-step

---

## 11) Open questions (to resolve early)

- MVP mission count target: **10–12** vs **12–15**
- Do we store full attempt step logs in DB or only summaries (MVP: summaries + last N steps)?
- Should missions be versioned by `missionsVersion` in API (recommended: yes)

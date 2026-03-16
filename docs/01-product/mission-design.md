# Mission Design (SSOT)

This document defines how missions are **written**, **validated**, and **taught** in Terminal Dojo.

**Goals:**
- Missions validate **results**, not “exact command strings”.
- Missions teach a **mental model** (filesystem state + effects), not memorization.
- Missions remain **safe, deterministic, and demo-ready**.

**Source of truth for:**
- mission JSON fields and how we use them,
- check philosophy,
- hints rules,
- mission quality bar,
- mission authoring workflow.

Related SSOT:
- Contracts: `02-architecture/data-contracts.md`
- Engine pipeline: `02-architecture/terminal-engine.md`

---

## 0) Mission philosophy (how we teach)

### Validate by effect (never by exact command)
We validate:
- **VFS state** (paths exist / do not exist, file contents),
- **cwd** (current working directory),
- **stdout/stderr** (patterns/contains),
- **exit codes** (success/failure),
not the exact sequence of commands.

**Why:** there are multiple correct solutions. The product is about **thinking**, not copying.

### Teach-by-debugging
A failed mission must be “actionable”:
- show **which check failed**
- explain **why** (expected vs actual)
- link to Explain Mode trace (parse → resolve → execute → validate)

### Determinism is sacred
A mission must start from a known snapshot and always behave the same.
No randomness unless it is seeded and recorded (avoid in MVP).

---

## 1) Mission structure (data contract)

Mission fields are defined in `data-contracts.md` (`Mission`, `MissionCheck`, `MissionHint`, `VfsSnapshot`).

At a product level, a mission contains:

- **Metadata**: `id`, `version`, `chapterId`, `title`, `difficulty`, `estimatedMinutes`
- **Text**: `descriptionMd`, optional `goalMd`
- **Start state**: `initialCwd`, `initialFs`
- **Validation**: `checks[]`
- **Teaching**: `hints[]`
- Optional constraints: `allowedCommands[]`, `maxStepsHint`

---

## 2) Check design rules (core)

### 2.1 Rule: checks must be minimal and orthogonal
Each check should verify **one thing**.

✅ Good:
- “cwd is /dojo”
- “/dojo/readme.txt exists”
- “stdout contains ‘done’”

❌ Bad (mixing multiple concerns):
- “Create /dojo, cd into it, and print it” (should be 2–3 checks)

### 2.2 Rule: prefer state checks over output checks
Outputs can be ambiguous. State is the truth.

Priority order:
1) `path_exists`, `path_not_exists`
2) `file_content_equals` / `file_content_matches`
3) `cwd_is`
4) `exit_code_is`
5) output checks (`output_contains`, `output_matches`) — only when it teaches something important

### 2.3 Rule: checks should avoid fragile string matching
If you check output:
- prefer `output_contains` for stable substrings,
- or `output_matches` with a robust regex.

Avoid matching full lines that can change due to formatting.

### 2.4 Rule: checks must give good failure messages
Even if the engine produces rich messages, mission authors can provide `failMessage`.

**Use `failMessage` when:**
- the engine message would be too technical,
- you want to nudge toward a learning point,
- the expected value is conceptually important.

---

## 3) Supported checks (MVP set)

From `data-contracts.md` (must remain aligned):
- `cwd_is`
- `exit_code_is`
- `path_exists`
- `path_not_exists`
- `file_content_equals`
- `file_content_matches`
- `output_contains`
- `output_matches`

**Authoring guidance:**
- Use `path_exists` with `expectedKind` when the kind matters (file vs dir).
- Use `file_content_equals` for deterministic text content (small).
- Use `file_content_matches` for tolerant checks (trim/newlines variations).

## 3.1 Normalization rules (for stable checks)

To avoid flaky validations, the engine applies normalization before matching:

- Line endings: convert `\r\n` to `\n`
- Optional trim mode (per check): `trim: true` trims leading/trailing whitespace
- Optional collapse mode (per check, rare): `collapseWhitespace: true` turns multiple spaces into one

Rules:
- `*_equals` checks default to **no trim** (strict), unless the mission explicitly sets `trim: true`.
- `*_matches` checks should default to **trim: true** to be robust, unless strictness is required.
- `output_*` checks always specify the `stream` (`stdout` | `stderr` | `both`).

---

## 4) Hints design rules (teaching system)

Hints exist to prevent frustration, not to spoil.

### 4.1 Hints are progressive (non-spoiler → clearer)
Hints must be ordered from:
1) conceptual reminder,
2) mild direction,
3) stronger direction,
4) near-solution suggestion (still not “type this exact command sequence”).

### 4.2 Unlock rules
Prefer attempt-based unlocking:
- `unlockAfterAttempts: 2` for hint #2
- `unlockAfterAttempts: 4` for hint #3

Time-based is allowed but less predictable.

### 4.3 Hint quality bar
Each hint must:
- reference an idea (“absolute vs relative paths”, “cwd matters”),
- avoid listing full command sequences,
- avoid revealing exact expected file names unless the mission already gave them.

### 4.4 What counts as an attempt
An "attempt" is a **mission run** from start until the user exits or completes it.
Attempts are persisted (backend) and are mission-specific.
Hint unlock is based on **attempt count**, not per-command submissions.

---

## 5) allowedCommands policy (when to use)

`allowedCommands` is optional. Use it only when:
- the mission is specifically about mastering a command subset, or
- you want to avoid solution paths that rely on future dialect features.

**Do not** use `allowedCommands` to force one solution.
If multiple solutions exist within the subset — good.

Engine behavior:
- If a command is not allowed, return a typed error (`CommandNotAllowed`) with a mission-friendly message.
- Explain Mode must show: "Blocked by mission constraint: allowedCommands".

---

## 6) Mission difficulty rubric

### Easy
- 1–2 concepts
- 2–4 checks
- no tricky error handling
- clear snapshot and description

### Medium
- 2–3 concepts
- 4–7 checks
- introduces an error case or constraint (e.g., missing path)

### Hard
- multi-step reasoning
- 7–10 checks (careful not to overdo)
- includes at least one “debug the failure” moment via Explain Mode
- still no “gotchas” that feel unfair

---

## 7) Mission quality checklist (Definition of Done)

A mission is “done” when:

### Product clarity
- [ ] Description explains the goal in plain language
- [ ] Goal is achievable with supported dialect
- [ ] The mission teaches at least one real terminal mental model

### Determinism & safety
- [ ] Snapshot is bounded (no huge trees/files)
- [ ] No unbounded operations required
- [ ] No randomness

### Validation
- [ ] Checks validate **effects**, not command strings
- [ ] Checks are minimal and orthogonal
- [ ] Failure messaging is actionable

### Hints
- [ ] Progressive hints exist (at least 2 for medium/hard)
- [ ] Hints do not spoil instantly

### Demo readiness
- [ ] Mission showcases engine value (VFS changes + validation + trace)
- [ ] Explain Mode tells a coherent story on failure

---

## 8) Authoring workflow (team process)

### 8.1 Where missions live
Backend is source of missions via API, but missions should be authored as **versioned JSON files** in the backend repository.

Recommended:
- `backend/missions/ch-01-basics/*.json`
- a manifest file `backend/missions/index.json` (optional)

Backend loads files at startup and serves them.

### 8.2 Versioning rules
- `mission.version` increments when mission behavior changes:
  - snapshot changes,
  - checks change,
  - hints change in a meaningful way.
- Small copy edits that do not affect meaning may keep version (team decision).

Compatibility:
- Stored attempts must record `missionId` + `missionVersion`.
- Replays are viewed against the same version they were created with.
- If a mission is updated, the UI may show: "This attempt was recorded on v1, current is v2".

### 8.3 Review rules
Every mission PR must include:
- JSON file diff
- quick “How to test” note:
  - what success looks like,
  - what a typical failure looks like.

---

## 9) Examples (copy-paste templates)

### 9.1 Mission example — “Create structure”
This mission teaches:
- `mkdir`, `touch`
- paths and structure
- state-based validation

```json
{
  "id": "f2cbd6b1-2a2b-4b93-8c34-8a0c2a5f7c7b",
  "version": 1,
  "chapterId": "ch-01-basics",
  "title": "Build a small folder structure",
  "difficulty": "easy",
  "estimatedMinutes": 5,
  "shortDescription": "Create /dojo and a file inside it.",
  "descriptionMd": "Create a directory at `/dojo` and a file named `readme.txt` inside it.\n\nWhen you are done, you should be able to confirm the file exists from anywhere.",
  "goalMd": "End state: `/dojo/readme.txt` exists.",
  "initialCwd": "/",
  "initialFs": {
    "root": {
      "type": "dir",
      "name": "",
      "children": [
        { "type": "dir", "name": "home", "children": [] }
      ]
    },
    "budgets": { "maxNodes": 50, "maxDepth": 10, "maxFileBytes": 2000 }
  },
  "checks": [
    {
      "id": "check-01",
      "type": "path_exists",
      "path": "/dojo",
      "expectedKind": "dir",
      "failMessage": "Expected a directory `/dojo` to exist."
    },
    {
      "id": "check-02",
      "type": "path_exists",
      "path": "/dojo/readme.txt",
      "expectedKind": "file",
      "failMessage": "Expected a file `/dojo/readme.txt` to exist."
    }
  ],
  "hints": [
    {
      "id": "hint-01",
      "order": 1,
      "textMd": "Remember: directories and files are different things. You create directories first, then files inside.",
      "unlockAfterAttempts": 2
    },
    {
      "id": "hint-02",
      "order": 2,
      "textMd": "You can create a directory with `mkdir <path>` and a file with `touch <path>`.",
      "unlockAfterAttempts": 4
    }
  ],
  "allowedCommands": ["pwd", "ls", "cd", "mkdir", "touch", "help"]
}
````

### 9.2 Mission example — “Output check (teaches stdout)”

Use output checks when the output is the learning point.

```json
{
  "id": "0f0c2d2a-0f5a-4e77-9cbb-9a6b2b3b7c01",
  "version": 1,
  "chapterId": "ch-01-basics",
  "title": "Say hello",
  "difficulty": "easy",
  "estimatedMinutes": 2,
  "shortDescription": "Print a specific text to stdout.",
  "descriptionMd": "Print the exact text `hello dojo` to stdout.",
  "initialCwd": "/",
  "initialFs": {
    "root": { "type": "dir", "name": "", "children": [] }
  },
  "checks": [
    {
      "id": "check-01",
      "type": "output_contains",
      "stream": "stdout",
      "text": "hello dojo",
      "failMessage": "Expected stdout to include `hello dojo`."
    },
    {
      "id": "check-02",
      "type": "exit_code_is",
      "expectedExitCode": 0
    }
  ],
  "hints": [
    {
      "id": "hint-01",
      "order": 1,
      "textMd": "This mission is about stdout. Which command prints text?",
      "unlockAfterAttempts": 2
    }
  ],
  "allowedCommands": ["echo", "help"]
}
```

---

## 10) Anti-patterns (avoid these)

* **Command-sequence enforcement** (“must use cd then ls then …”)
* **Gotchas** without teaching value (“hidden requirement”)
* **Over-checking** (10+ checks for an easy mission)
* **Brittle output matching** (full-line strict matching for formatted output)
* **Unsupported dialect dependencies** (missions that require pipes if pipes are not shipped yet)

---

## 11) Future (post-MVP) extensions

When the dialect grows, missions can introduce:

* `find`, `grep`, `head`, `tail`, `wc`
* bounded pipelines `|`
* Bug Hunter scenarios

But: we only add missions that require new features **after** those features are stable and tested.

---

# Virtual File System (VFS) (SSOT)

This document defines the **Virtual File System** used by the Terminal Dojo engine:
data model, invariants, operations, budgets, and deterministic behavior.

**Non-negotiable:**
- VFS is **in-memory**, deterministic, and never touches the real OS filesystem.
- All mutations go through a **single VFS API** (no direct tree edits from outside).
- Budgets are enforced to prevent freezes and keep behavior stable.

Related:
- `02-architecture/terminal-engine.md` (pipeline and execution rules)
- `02-architecture/data-contracts.md` (snapshot contracts + budgets types)
- `02-architecture/system-overview.md` (boundaries)
- `00-overview/glossary.md` (terminology)

---

## 0) Goals

- Provide a POSIX-like mental model:
  - `/` root
  - absolute and relative paths
  - `.`, `..`
  - directories and files
- Keep behavior **deterministic** and **bounded**:
  - budgets limit tree size, depth, and file bytes
- Make operations **testable**:
  - invariants are explicit
  - every operation has clear error cases
- Keep the engine safe:
  - no access to OS
  - no unsafe content rendering (handled by UI, but VFS stays pure)

---

## 1) Data model

### 1.1 Node kinds
VFS consists of nodes:
- `dir` nodes: own `children`
- `file` nodes: own `content` (string)

Contract shape for snapshots lives in `data-contracts.md`:
- `VfsSnapshot`
- `VfsNode`, `VfsDirNode`, `VfsFileNode`
- `VfsBudgets`

Runtime representation may differ (maps/ids), but must preserve the same semantics.

### 1.2 Root rule
- Root is always a directory.
- Root path is `/`.
- In snapshot form, root dir is represented by `name: ""`.

### 1.3 Names and paths
- Node `name`:
  - MUST NOT contain `/`
  - MUST NOT be empty except for root
  - SHOULD be treated as case-sensitive (Linux-like)
- Paths are POSIX-style:
  - `/a/b/c`
  - relative paths resolved against `cwd`

---

## 2) Invariants (must always hold)

These invariants define the correctness of the VFS.

### 2.1 Structural invariants
- Root exists and is a directory.
- Every directory’s `children` contains **unique names** (no duplicates).
- No cycles:
  - a node cannot be its own descendant
- Every node is reachable from root (single tree).

### 2.2 Content invariants
- File `content` is a string.
- File content length is bounded by budgets (`maxFileBytes`).

### 2.3 Path invariants
- All resolved paths are normalized:
  - no `.` segments
  - no `..` segments (already applied)
  - no repeated slashes
- Resolution never escapes root:
  - `/..` stays `/`

### 2.4 Budget invariants
At any moment:
- Total nodes count ≤ `maxNodes`
- Max depth ≤ `maxDepth`
- Each file content bytes ≤ `maxFileBytes`

If an operation would violate budgets:
- it MUST fail deterministically with a typed error
- VFS state MUST remain unchanged

---

## 3) Budgets (safety limits)

Budgets guarantee:
- no UI freeze
- predictable memory usage
- deterministic operation bounds

### 3.1 Budget set (MVP)
From `VfsBudgets` (snapshot-level) or engine defaults:
- `maxNodes` — total nodes (dirs + files)
- `maxDepth` — max nesting depth (root depth = 0)
- `maxFileBytes` — per-file maximum content bytes

### 3.2 Default budget policy
- Engine has global defaults.
- Mission `initialFs.budgets` can override (within a safe max limit).
- The engine MAY clamp mission budgets to global max to avoid malicious missions.

### 3.3 Node counting rule
Nodes include:
- root dir
- every dir
- every file

This must be consistent across all implementations.

### 3.4 Depth counting rule
- root `/` depth = 0
- `/a` depth = 1
- `/a/b` depth = 2

---

## 4) Error model (typed)

Engine-level typed errors are defined in `data-contracts.md` (`EngineError` union).
VFS operations must map failures to those types.

Typical VFS-related errors:
- `path_not_found`
- `not_a_directory`
- `is_a_directory`
- `operation_not_allowed` (for restricted operations like rm)
- `budget_exceeded` (with specific budget name)

Rule:
- do NOT throw exceptions for expected invalid user input.

---

## 5) Supported operations (MVP)

VFS is manipulated only through these operations (or equivalents).
The exact API surface is your implementation choice, but semantics must match.

### 5.1 Read operations
- `exists(path)` -> boolean
- `stat(path)` -> `{ kind: "file"|"dir" }` (or typed union)
- `listDir(path)` -> `string[]` (child names, stable order)
- `readFile(path)` -> `string`
- `getCwd()` (engine state owns cwd; VFS itself does not need it)

### 5.2 Write/mutation operations
- `makeDir(path)` (mkdir)
- `makeFile(path, initialContent="")` (touch)
- `writeFile(path, content)` (optional for MVP; can be introduced via `echo` later)
- `remove(path)` (rm, restricted)

### 5.3 Atomicity rule
Every operation is **atomic**:
- either it succeeds fully, or it fails without changing state.

This is mandatory for determinism and for clean trace/effects.

---

## 6) mkdir semantics (POSIX-like, simplified)

Command: `mkdir <path>`

Rules:
- If parent path does not exist -> `path_not_found`
- If parent is not a dir -> `not_a_directory`
- If target already exists:
  - MVP: return error (non-zero exit) with stable message
  - (optional later) support `mkdir -p` as a separate feature
- If target name invalid -> `invalid_arguments` (or parse/resolve error)
- If budgets would be exceeded -> `budget_exceeded`

Effects (for trace):
- `node_created` with `kind:"dir"`

---

## 7) touch semantics (simplified)

Command: `touch <path>`

Rules:
- If parent does not exist -> `path_not_found`
- If parent is not a dir -> `not_a_directory`
- If target exists and is a dir -> `is_a_directory`
- If target exists and is a file:
  - MVP: no change (success) OR update "modifiedAt" (but we do not track timestamps in MVP)
  - recommended: no-op success
- If budgets would be exceeded (new node) -> `budget_exceeded`

Effects:
- if file created: `node_created kind:"file"`
- if no-op: no effect (or optional `file_touched` in future, not MVP)

---

## 8) rm semantics (restricted, safe)

Command: `rm <path>`

We restrict rm to keep missions safe and avoid tricky recursion.

MVP policy (recommended):
- `rm` can remove files only
- directories cannot be removed in MVP (unless empty and you add `rmdir`)
- no recursive delete in MVP

Rules:
- If path not found -> `path_not_found`
- If target is a directory -> `operation_not_allowed` (reason: "rm_dir_not_supported")
- If file removed:
  - remove node
  - budgets become freer (node count decreases)
- Never allow deleting `/` (root) under any circumstances.

Effects:
- `node_removed path:"..."`

---

## 9) ls semantics (reads VFS)

Command: `ls [path]`

MVP rules:
- If no path: list `cwd`
- If path is file: print its name (or treat as error; pick one and keep consistent)
  - recommended: POSIX-like => print file name, exitCode 0
- If path is dir: list child names
- Stable ordering:
  - sort lexicographically ascending (recommended)
  - deterministic ordering is required

Output:
- `stdout` contains listing (one per line or space-separated; pick one and keep consistent in help)
- `stderr` empty on success

---

## 10) cat semantics (reads file)

Command: `cat <path>`

Rules:
- If path not found -> `path_not_found`
- If path is dir -> `is_a_directory`
- If file -> print content exactly as stored

Budget note:
- `cat` output must respect output budgets (`max_output_bytes/lines`) enforced by engine pipeline.

---

## 11) VFS ordering rules (determinism)

Determinism requirements:
- Listing order for directories must be stable and defined.
- If internal representation uses maps, the output MUST still be stable:
  - explicitly sort child names for `ls`
- Snapshot serialization must be stable:
  - if you generate JSON missions, keep a stable children ordering (nice but optional)
  - runtime correctness must not depend on JSON order

---

## 12) Snapshot loading (mission start state)

A mission provides `initialFs` as `VfsSnapshot`.

Loading rules:
- Validate snapshot against invariants:
  - root is dir
  - child name uniqueness
  - budgets satisfied
- If mission snapshot is invalid:
  - fail mission load deterministically (this is a content bug)
  - show a friendly error (Application layer)
  - do not start attempt

Recommended:
- snapshot loader returns either:
  - `ok: true, vfs`
  - or `ok: false, error` with details for debugging

---

## 13) Suggested internal implementation (not a contract)

You may implement VFS as:
- Tree nodes with arrays
- Or a normalized store:
  - `nodeId -> node`
  - `parentId -> childName -> childId`

As long as:
- invariants hold
- semantics match
- operations are atomic
- order is deterministic

Recommended for simplicity (MVP):
- tree with arrays + helper functions
- enforce uniqueness on insert
- sort for ls output (do not rely on insertion order)

---

## 14) Testing checklist (must exist)

High ROI unit tests:
- Path normalization:
  - `/a/./b` => `/a/b`
  - `/a/b/..` => `/a`
  - `..` from `/` stays `/`
- mkdir:
  - parent missing -> error
  - parent not dir -> error
  - duplicate name -> error
  - budget exceeded -> error and no mutation
- touch:
  - create new file
  - touch existing file -> no-op success
  - touch path where dir exists -> error
- rm:
  - remove file success
  - rm dir -> operation_not_allowed
  - rm root -> operation_not_allowed
- ls ordering stable
- snapshot loader rejects invalid snapshots

---

## 15) Definition of Done (VFS changes)

A VFS-related change is “done” only if:
- invariants remain true,
- budgets are enforced and tested,
- error mapping is stable (typed),
- `ls` output ordering remains deterministic,
- docs remain accurate (`data-contracts.md` + this doc).

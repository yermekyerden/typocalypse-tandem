# Sandboxing & Safety Model (SSOT)

This document defines the **safety model** of Terminal Dojo:
what we protect against, where trust boundaries are, and which rules are **non-negotiable**.

**Non-negotiable principle:** user input is treated as **data**, never as executable code.
The system must remain safe even if the user types malicious or weird input.

Related:
- `00-overview/vision.md` (principles, cut lines)
- `02-architecture/system-overview.md` (boundaries)
- `02-architecture/determinism.md` (repeatability + budgets)
- `02-architecture/data-contracts.md` (typed errors, budgets, trace)
- `01-product/mission-design.md` (checks, hints, mission constraints)

---

## 0) Safety invariants (must/never rules)

### Must
- The engine runs in a **fully simulated** environment (VFS in memory).
- All output is rendered as **plain text** in the terminal (escaped).
- All markdown content (`descriptionMd`, `hints`) is rendered with **sanitization**.
- Budgets exist and are enforced (input/output/VFS/iterations).

### Never
- Never execute OS commands (no `child_process`, no shell, no system calls).
- Never `eval` user input (directly or indirectly).
- Never access the real filesystem from the Domain engine.
- Never allow raw HTML injection into the UI (`dangerouslySetInnerHTML` is forbidden by default).
- Backend never interprets or executes terminal commands.

Violation of any “Never” item is a **blocker bug** for MVP.

---

## 1) Threat model (what we defend against)

### Primary attacker
The end user (untrusted) can type arbitrary command lines including:
- very long input
- weird unicode
- attempts to break parsing
- attempts to create huge outputs
- attempts to exploit UI rendering (XSS via output or markdown)

### Secondary risk
Mission content (JSON) can be malformed or overly heavy:
- huge snapshots
- too many checks/hints
- expensive regex patterns

Missions are authored by the team and stored in the backend repo, but we still validate them because:
- mistakes happen,
- “bad mission” can freeze or break the demo.

---

## 2) Trust boundaries (where we assume untrusted input)

### Untrusted
- terminal user input line (`inputLine`)
- user identity (`userId` in MVP is anonymous, treat as untrusted)
- any persisted attempt/progress payloads coming from network

### Controlled but validated
- missions served by backend (team-owned, but schema-validated)
- regex patterns used in checks (team-owned, but must be bounded)

### Trusted
- frontend code (compiled)
- backend code (compiled)
- DB schema (migrations)

---

## 3) Frontend sandbox rules (Domain engine)

### 3.1 Domain purity boundary
Domain must be pure/deterministic:
- no network calls
- no storage calls
- no time/random calls
- no DOM access
- no OS/FS access

Domain only receives explicit data:
- `inputLine`
- current runtime state
- mission definition + checks

### 3.2 Command execution model
- Commands are resolved by a **registry/dispatcher** (Strategy style).
- Each command is a handler that operates only through the VFS API.
- No dynamic code execution, no dynamic imports based on user input.

### 3.3 Budgets (anti-freeze rules)
Budgets are mandatory and enforced in the pipeline:
- max input length
- max output bytes/lines
- max VFS nodes / depth / file bytes
- max iterations/recursion (future-proof)
- max pipeline stages (future-proof)

When a budget is exceeded:
- return typed error (`budget_exceeded`) + stable exit code
- do not mutate VFS
- trace records the violation

Budgets are part of safety and determinism.

---

## 4) Output rendering safety (XSS prevention)

### 4.1 Terminal output
`stdout` and `stderr` must be rendered as text, not HTML.
Rules:
- escape `<`, `>`, `&`, quotes
- preserve whitespace/newlines safely (e.g., `<pre>` with escaped text or CSS `white-space: pre-wrap`)

### 4.2 Markdown rendering (mission descriptions + hints)
Mission fields:
- `descriptionMd`
- `goalMd`
- `hint.textMd`

Rules:
- use a markdown renderer with sanitization (e.g., `react-markdown` + `rehype-sanitize`)
- forbid raw HTML in markdown by default
- allow only a safe subset (headings, lists, code blocks, emphasis, links)
- links must be safe:
  - no `javascript:` URLs
  - optionally enforce `rel="noreferrer noopener"`

### 4.3 Forbidden UI patterns
- `dangerouslySetInnerHTML` is forbidden by default.
If ever needed (should not be), it must be justified via ADR and guarded with sanitization.

---

## 5) Backend sandbox rules (NestJS)

Backend is supporting infrastructure:
- missions catalog
- persistence (progress/attempts)
- version/contracts metadata

### 5.1 Backend never executes commands
Backend never:
- parses terminal commands
- interprets shell input
- executes OS commands
- performs file operations based on user input

If the backend receives any “command-like” data, it is stored as plain text only.

### 5.2 Input validation (API)
All endpoints must validate:
- request body shape (DTO / schema validation)
- payload size limits
- userId format (UUID v4) for MVP
- rate limits (basic, even if mild)

Recommended NestJS baseline:
- `ValidationPipe` (whitelist + forbidNonWhitelisted)
- `helmet` for security headers
- request body size limits (e.g., 256KB for MVP endpoints)
- CORS configured explicitly (frontend origin)

### 5.3 Persistence rules
- progress updates are idempotent (`PUT /api/progress/:userId`)
- attempts are append-only (`POST /api/attempts/:userId`)
- reject huge step logs (store summaries by default)

---

## 6) Mission safety rules (catalog hardening)

Missions are served from backend repo JSON files.
Backend must validate missions on load:
- schema validation (required fields, types)
- snapshot budgets (max nodes/depth/file bytes)
- checks count bounded
- hints count bounded
- allowedCommands (if present) must be a subset of known dialect commands

If mission validation fails:
- fail fast in dev
- in prod/demo, prefer “mission excluded with error log” (team decision), but never crash the whole server silently.

### 6.1 Regex safety (checks)
Checks allow regex patterns (`*_matches`).
Rules:
- patterns are authored by the team only (not user input)
- still enforce guardrails:
  - maximum pattern length
  - disallow catastrophic patterns if possible
  - cap evaluated text length (apply budgets before regex matching)

If regex matching would exceed safe limits:
- return deterministic typed error (treated as “mission author error” in logs)
- mission should be fixed immediately

---

## 7) Safety checklist (Definition of Done)

A change is “done” only if:

### Frontend
- [ ] Domain code has no OS/network/storage/time/random dependencies
- [ ] terminal output is rendered as escaped text
- [ ] markdown is sanitized (no raw HTML injection)
- [ ] budgets are enforced (or new logic is bounded)

### Backend
- [ ] endpoints validate inputs and enforce payload limits
- [ ] no code path executes OS commands
- [ ] mission loading validates mission files

### Tests
- [ ] at least one regression test exists for the risk area
  (e.g., budget exceed, XSS escaping, mission schema validation)

---

## 8) ADR policy for safety changes

Any relaxation of safety rules requires an ADR, for example:
- allowing raw HTML in markdown
- storing full step logs in DB without size limits
- adding new dialect features that increase parser complexity

Default answer is “no” unless there is a strong reason and a clear mitigation plan.

---

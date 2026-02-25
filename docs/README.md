# Typocalypse Docs (Terminal Dojo)

This folder is the **source of truth** for product scope, architecture, and team process.
If something is unclear in the codebase, the first question is: **what do the docs say?**

## Quick Summary (Start here)
Read these first (10 minutes):
- `00-quick-summary/README.md`

Rule: Quick Summary is the entry point. SSOT docs are the reference.
If they conflict, we update SSOT to match Quick Summary (and add ADR if needed).

---

## How to read (recommended order)

1) **Overview**
- `00-overview/vision.md` — what we build, why, MVP, cut lines
- `00-overview/glossary.md` — shared terminology (keep it small but strict)
- `00-overview/roadmap.md` — 5-week milestones (high-level)

2) **Product**
- `01-product/mvp-scope.md` — the non-negotiable MVP loop
- `01-product/user-flows.md` — end-user screens + flows
- `01-product/mission-design.md` — mission format, checks philosophy, hints rules
- `01-product/ui-guidelines.md` — UI consistency rules (terminal feel + panels)

3) **Architecture**
- `02-architecture/system-overview.md` — big picture: boundaries + data flow + pipeline
- `02-architecture/domain-model.md` — domain concepts and relationships
- `02-architecture/data-contracts.md` — SSOT of TS contracts (frontend + backend)
- `02-architecture/terminal-engine.md` — parse/execute/trace pipeline
- `02-architecture/virtual-filesystem.md` — VFS invariants + operations
- `02-architecture/determinism.md` — snapshots, budgets, repeatability
- `02-architecture/sandboxing.md` — safety model (no OS exec, no eval)
- `02-architecture/error-handling.md` — typed errors → UX mapping

4) **Process**
- `03-process/working-agreement.md` — Git/PR rules, reviews, DoD, communication
- `03-process/board.md` — how we use the board (columns, labels, definitions)
- `03-process/meeting-notes.md` — lightweight minutes template + cadence
- `03-process/release-checklist.md` — “demo-ready” definition

5) **ADR**
- `04-adr/README.md` — how we write decisions
- `04-adr/0000-template.md` — template
- `04-adr/0001-simulated-shell-no-os-exec.md` — core decision (non-negotiable)

---

## Docs structure (folder map)

```
docs/
README.md

00-overview/
vision.md
glossary.md
roadmap.md

01-product/
user-flows.md
mvp-scope.md
mission-design.md
ui-guidelines.md

02-architecture/
system-overview.md
domain-model.md
data-contracts.md
terminal-engine.md
virtual-filesystem.md
determinism.md
sandboxing.md
error-handling.md

03-process/
working-agreement.md
board.md
meeting-notes.md
release-checklist.md

04-adr/
README.md
0000-template.md
0001-simulated-shell-no-os-exec.md
```

---

## Source of truth rules (SSOT)

### Product scope
- **SSOT:** `00-overview/vision.md` + `01-product/mvp-scope.md`
- If code contradicts MVP: **code must change** or we update docs via ADR.

### Data contracts (frontend + backend)
- **SSOT:** `02-architecture/data-contracts.md`
- The API and frontend models must match these contracts.
- Breaking changes require:
  1) Update contracts doc
  2) Add ADR (if non-trivial)
  3) Update both sides (frontend + backend)

### Backend persistence
- **SSOT:** `02-architecture/data-contracts.md` + `backend/prisma/schema.prisma` (when backend is bootstrapped)
- DB schema changes must not silently break API contracts. If they do: update contracts + add ADR + migrate both sides.

### Architecture boundaries
- **SSOT:** `02-architecture/system-overview.md`
- If someone introduces a shortcut (UI calling low-level storage directly), it’s a bug.

### Decisions
- **SSOT:** `04-adr/*`
- Any “why did we do this?” must be answered by an ADR.

---

## Writing conventions

- Keep docs **short, strict, and actionable**.
- Prefer bullets + examples over long essays.
- Add diagrams in ASCII when helpful.
- Use consistent terms (see glossary).
- Prefer “must/never” language for safety and determinism rules.

---

## Updating docs (Definition of Done)

A change is not “done” unless:
- it compiles/tests,
- and the relevant docs remain accurate.

Typical doc updates:
- New command → update `terminal-engine.md` + add to `help` dialect + add mission examples
- New check type → update `mission-design.md` + `data-contracts.md`
- New endpoint → update `data-contracts.md` + `system-overview.md` if it changes flow

---

## Links from repo root

Recommended in the root `README.md`:
- Add: `Docs: ./docs/README.md`
- Add: `Vision: ./docs/00-overview/vision.md`
- Add: `Architecture: ./docs/02-architecture/system-overview.md`
- Add: `Contracts: ./docs/02-architecture/data-contracts.md`

---

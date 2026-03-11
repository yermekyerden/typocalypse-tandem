# Board Usage (SSOT)

This doc defines how we use the project board so work stays predictable.

---

## Columns

### Backlog
Not ready to start. Missing clarity, contracts, or acceptance criteria.

### Ready
Clear task with:
- description,
- acceptance criteria,
- owner (optional),
- dependencies resolved.

### In Progress
Someone is actively working on it (branch exists).

### In Review
PR opened, waiting for feedback / fixes.

### Blocked
Cannot move due to a dependency (contract decision, missing API, unclear spec).

### Done
Merged to `develop` and verified (locally or in preview).

---

## Labels (recommended)

Layer:
- `domain`, `ui`, `application`, `backend`, `docs`, `infra`

Type:
- `feature`, `bug`, `refactor`, `test`, `chore`

Priority:
- `p0` (must), `p1` (should), `p2` (nice)

MVP relevance:
- `mvp`, `post-mvp`

---

## Task quality rules

A task is "Ready" only if it includes:
- **Acceptance criteria** (observable)
- **Constraints** (budgets, determinism, security)
- **Out of scope** (if relevant)

Examples:
- ✅ "Implement `ls` stable ordering + unit tests"
- ✅ "Add `GET /api/version` returning contractsVersion"
- ❌ "Make terminal better"


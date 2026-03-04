# Working Agreement (Team Process SSOT)

This document is the single source of truth for how the team works:
Git workflow, PR rules, reviews, Definition of Done, communication cadence.

If reality diverges from this doc — either we fix the behavior or we update this doc deliberately.

---

## 0) Principles

- **Ship vertical slices**: every week must produce something demoable.
- **Protect determinism and safety**: anything that breaks "no OS exec" or determinism is a blocker.
- **Small PRs, fast reviews**: reduce merge pain, increase learning speed.
- **SSOT discipline**: contracts and docs are updated with code, not after.

---

## 1) Branching model

### Branch roles
- `main` — release snapshots / stable checkpoints
- `develop` — integration branch for day-to-day work
- feature branches — `feat/*`, `fix/*`, `docs/*`, `chore/*`
- `diary` — diary-only (development notes) PRs into `main`

### Rules
- Never commit directly to `develop` or `main`.
- Every change goes through a PR.
- Feature branches are short-lived (1–3 days).

### Merge strategy
- PRs into `develop`: **Squash merge** (one clean commit per feature/fix/doc).
- `develop` -> `main`: once per week or per milestone (release snapshot).

Rationale:
- `develop` stays integration-friendly.
- `main` stays clean and demo-ready.

---

## 2) Commit message rules (squashed commits)

Squash commit format:

```

<type>(scope): <short summary>

Context:

* Why this change exists (1–3 bullets)

What changed:

* Key changes (3–7 bullets)

How to test:

* Steps to verify locally (commands, expected behavior)

Docs/Contracts:

* List updated docs/contracts (if any)

Limitations:

* Known gaps / follow-ups

```

Types:
- `feat`, `fix`, `docs`, `chore`, `refactor`, `test`

Scopes (examples):
- `domain`, `vfs`, `parser`, `ui`, `api`, `contracts`, `missions`, `ci`

---

## 3) PR rules

### PR size
Prefer:
- 1 feature = 1 PR
- 200–600 lines changed (not strict, but a target)

If bigger:
- split by vertical slices or by layers (Domain vs UI) when possible.

### PR description template
Each PR must include:

- **Goal**: what this PR delivers in the product
- **Changes**: bullets
- **How to test**: exact steps
- **Screenshots/GIF** (if UI)
- **Docs/Contracts updated**: list files
- **Risks**: what could break

### Review minimum
- At least **1 reviewer** for small changes
- At least **2 reviewers** if:
  - contracts changed,
  - Domain/VFS rules changed,
  - security/sandbox boundaries touched

---

## 4) Definition of Done (DoD)

A change is "done" only if:

### Engineering
- [ ] TypeScript strict is green (no `any`, no `@ts-ignore`)
- [ ] New Domain logic has unit tests
- [ ] CI is green
- [ ] No OS execution paths added (frontend Domain stays pure)

### Product
- [ ] The change is demoable (or clearly supports a demo slice)
- [ ] UX errors are actionable (typed error -> terminal + feedback + trace)

### Docs / SSOT
- [ ] Relevant docs updated
- [ ] If contracts changed: `data-contracts.md` updated + both FE/BE updated

---

## 5) Communication cadence

- Daily async updates in chat:
  - what I did yesterday
  - what I do today
  - blockers
- Weekly sync (15–30 min):
  - demo the current slice
  - decide next slice
  - review risks and cut lines

---

## 6) Conflict resolution

When there is disagreement:
1) Check SSOT docs (`vision`, `mvp-scope`, `data-contracts`)
2) If SSOT is missing: write an ADR (short, strict)
3) Decide and move on (timebox discussions)

---

## 7) Quality gates (non-negotiable)

Block PR if:
- breaks "no OS exec" boundary
- introduces non-determinism in Domain
- changes contracts without updating SSOT docs
- adds a new feature without tests in risky Domain areas (parser/path/vfs)

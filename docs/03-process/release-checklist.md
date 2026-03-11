# Release Checklist (Demo-Ready SSOT)

This checklist is used for Week 5 and for any "release snapshot" merge into `main`.

---

## 1) Product demo flow works end-to-end
- [ ] Library loads missions (API or cached)
- [ ] Mission Run executes commands (no OS exec)
- [ ] Validation shows pass/fail + which check failed + why
- [ ] Explain Mode shows trace (parse -> resolve -> execute -> validate)
- [ ] Attempt history exists
- [ ] Replay shows steps and per-step trace (at least as step list + inspector)

---

## 2) Determinism & safety
- [ ] Same mission version + same inputs => same outputs/state
- [ ] `ls` ordering is stable
- [ ] Budgets enforced (input/output/vfs), violations are typed errors
- [ ] Terminal output is rendered as escaped text (no XSS)
- [ ] Markdown rendering is sanitized (no raw HTML)

---

## 3) Engineering quality gates
- [ ] Frontend: lint / typecheck / tests pass
- [ ] Backend: lint / tests (or minimum smoke tests) pass
- [ ] No `any` / `@ts-ignore` introduced
- [ ] Key Domain areas have unit tests (parser/path/vfs/validators)

---

## 4) Docs & contracts
- [ ] `data-contracts.md` matches FE + BE
- [ ] `docs/*` reflect reality
- [ ] ADRs exist for major decisions

---

## 5) Deploy / run instructions
- [ ] Root README "How to run" is accurate (or points to docs)
- [ ] Backend health/version endpoints respond
- [ ] Frontend build works

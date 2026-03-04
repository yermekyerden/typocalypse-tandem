# Workflow (Git / PR / DoD)

## Branches
- `main`: stable demo snapshots
- `develop`: daily integration
- `feat/*`, `fix/*`, `docs/*`, `chore/*`: short-lived branches (1–3 days)

Rules:
- Never commit directly to `main`/`develop`
- Everything goes via PR

## Merge strategy
- PR -> `develop`: **Squash merge** (1 clean commit per PR)
- `develop` -> `main`: weekly / milestone snapshots

## Squash commit template
(scope): short title

Context:
- why (1–3 bullets)

What changed:
- key changes (3–7 bullets)

How to test:
- exact steps

Docs/Contracts:
- list updated files

Limitations:
- gaps / follow-ups

## DoD (minimum)
- TS strict OK (no `any`, no `@ts-ignore`)
- Domain changes have unit tests
- CI green
- No OS exec paths added
- Docs/contracts updated with code

## PR checklist (copy into PR description)
- [ ] Goal is clear (what user value / demo slice)
- [ ] Small scope (easy to review)
- [ ] “How to test” is exact and reproducible
- [ ] Domain changes have tests
- [ ] No safety/determinism rule is broken (no OS exec, no time/random in Domain)
- [ ] Contracts updated if API/data shapes changed
- [ ] Docs updated if behavior changed
- [ ] UI changes have screenshot/GIF (if visible)

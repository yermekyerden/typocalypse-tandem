# Workflow (Git / PR / DoD)

## Branches
- main: stable demo snapshots
- develop: daily integration
- feat/* fix/* docs/* chore/*: short-lived branches (1–3 days)

Rules:
- Never commit directly to main/develop
- Everything via PR

## Merge
- PR -> develop: Squash merge (1 clean commit per PR)
- develop -> main: weekly / milestone

## Squash commit template
(scope): <short title>

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
- TS strict OK, no any/ts-ignore
- Domain changes have unit tests
- CI green
- No OS exec paths added
- Docs/contracts updated with code

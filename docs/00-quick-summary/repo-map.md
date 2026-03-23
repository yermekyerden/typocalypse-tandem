# Repo Map (Modularity)

## Top-level
- `/frontend` — React + TS (engine lives here)
- `/backend` — NestJS (missions + persistence)
- `/docs` — SSOT + Quick Summary

## Parallel work lanes (to avoid blocking)
- Lane A (Domain): parser/resolver, VFS + budgets, command handlers, trace
- Lane B (Validation): checks engine + check types + messaging
- Lane C (UI): Library / Mission Run / Replay + panels + terminal UX
- Lane D (Backend): missions/progress/attempts endpoints + DB

## Integration points (keep them small)
- contracts (DTO shapes) in `docs/02-architecture/data-contracts.md`
- small PRs (1 lane at a time when possible)
- a demoable vertical slice every week

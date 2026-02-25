# Repo Map (Modularity)

Top-level:
- /frontend  React + TS (engine lives here)
- /backend   NestJS (missions + persistence)
- /docs      SSOT + quick summary

## Parallel work lanes (so we don’t block each other)
Lane A (Domain): parser/resolver, VFS+budgets, command handlers, trace
Lane B (Validation): checks engine + check types + messaging
Lane C (UI): Library/Mission Run/Replay + panels + terminal UX
Lane D (Backend): missions/progress/attempts endpoints + validation + DB

Integration points:
- contracts (DTO)
- small PRs
- demo slice every week

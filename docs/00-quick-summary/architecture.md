# Architecture (Quick Summary)

## Big picture
- Frontend (React + TS) owns the deterministic engine (simulated shell).
- Backend (NestJS) is infrastructure: missions catalog + persistence.
- Backend never executes commands.

## Frontend layers (Clean Architecture)
- **UI**: screens/components, routing, input focus
- **Application**: use-cases (StartMission, RunCommandLine, SaveAttempt, Replay, SyncProgress)
- **Domain (pure)**: Parser/Resolver, VFS, Commands, Validators, TraceBuilder
- **Adapters/Infra**: API clients, cache (IndexedDB), storage, logger/clock/id providers

## The only execution path (Domain pipeline)
**Parse → Resolve → Execute → Validate → Trace**

After pipeline (Application):
- append step to attempt log
- persist local-first
- sync to backend in background

## Safety + determinism
- No OS exec / no eval / no real FS
- Output is escaped text; markdown is sanitized
- Budgets exist and are enforced (typed errors)

## Suggested frontend/src structure
- `src/app/` — composition root, providers, router, bootstrap
- `src/ui/` — screens + components
- `src/application/` — use-cases + ports (interfaces)
- `src/domain/` — engine (parser/vfs/commands/validators/trace)
- `src/adapters/` — API clients, repositories, cache/storage
- `src/shared/` — tiny shared utils/types (no business rules)

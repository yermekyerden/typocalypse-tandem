# Architecture (Quick Summary)

## Big picture
Frontend (React + TS) owns the deterministic engine (simulated shell).
Backend (NestJS) is infra: missions catalog + persistence. Backend never executes commands.

## Frontend layers (Clean Architecture)
UI -> Application -> Domain
Adapters/Infra plug into Application.

- UI: screens/components, routing, input focus
- Application: use-cases (StartMission, RunCommandLine, SaveAttempt, Replay, SyncProgress)
- Domain (pure): Parser/Resolver, VFS, Commands, Validators, TraceBuilder
- Adapters: API clients + cache (IndexedDB), logger/clock/id

## The only execution path (pipeline)
Parse → Resolve → Execute → Validate → Trace → Persist (local-first)

## Safety + determinism
- No OS exec / no eval / no real FS
- Output is escaped text; markdown is sanitized
- Budgets exist and are enforced (typed errors)

## Suggested frontend/src structure
src/
  app/          compositionRoot, providers, router
  ui/           screens + components
  application/  use-cases + ports (interfaces)
  domain/       engine (parser/vfs/commands/validators/trace)
  adapters/     api clients, repositories, cache
  shared/       tiny shared utils/types (no domain logic)

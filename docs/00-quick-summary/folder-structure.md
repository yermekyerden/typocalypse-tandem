# Folder Structure (Quick Summary)

Goal: keep code modular, easy for parallel work, and DI-friendly (Clean Architecture).

## Frontend (recommended)
src/
  app/                # composition root: DI wiring, router, app bootstrap
    compositionRoot.ts
    routes/
    providers/
  ui/                 # React Views (screens + presentational components)
    screens/
      library/
      mission-run/
      replay/
    components/        # shared UI primitives (dumb/presentational)
  application/         # use-cases (orchestrate Domain + repos via ports)
    use-cases/
    ports/             # interfaces: repositories, clock, id, logger
  domain/              # pure engine: deterministic, no side effects
    parser/
    vfs/
    commands/
    validators/
    trace/
  adapters/            # implementations of ports (http, cache, storage)
    http/
    repositories/
    storage/
  shared/              # small shared utils/types (NO business rules)

## Backend (recommended, feature modules)
src/
  missions/
  attempts/
  progress/
  shared/
  prisma/

## Placement rules (fast)
- If it renders UI -> ui/
- If it coordinates steps / calls domain + repos -> application/
- If it parses / validates / mutates VFS -> domain/
- If it calls network or storage -> adapters/
- DI wiring lives only in app/compositionRoot.ts

## Feature-by-folder (where it helps)
We use feature folders mainly in:
- ui/screens/<feature>/
- application/use-cases/<feature>/

Example:
ui/screens/mission-run/
  MissionRunPage.tsx
  components/
    TerminalInput.tsx
    OutputPanel.tsx
  MissionRunPage.module.css   # only if Tailwind is not enough
  index.ts

Rule: a UI feature should not require editing many unrelated folders.

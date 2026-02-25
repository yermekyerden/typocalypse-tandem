# Folder Structure (Quick Summary)

Goal: keep code modular, easy for parallel work, and DI-friendly (Clean Architecture).

## Frontend (recommended)
```txt
src/
  app/                # composition root: DI wiring, router, bootstrap
    compositionRoot.ts
    routes/
    providers/
  ui/                 # React views (screens + presentational components)
    screens/
      library/
      mission-run/
      replay/
    components/        # shared UI primitives (dumb/presentational)
  application/         # use-cases + ports (interfaces)
    use-cases/
    ports/
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
```

## Placement rules (fast)

* If it renders UI → `ui/`
* If it coordinates steps / calls domain + repos → `application/`
* If it parses / validates / mutates VFS → `domain/`
* If it calls network or storage → `adapters/`
* DI wiring lives only in `app/compositionRoot.ts`

## Feature-by-folder (where it helps)

Use feature folders mainly in:

* `ui/screens/*`
* `application/use-cases/*`

Rule: a UI feature should not require editing many unrelated folders.

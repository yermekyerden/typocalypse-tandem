# DI Rules (Quick Summary)

Goal: keep Domain pure, allow parallel work, and make code easy to test.

## Golden rules
1) Domain is pure: NO HTTP, NO storage, NO Date.now(), NO Math.random(), NO globals.
2) Domain depends on nothing outside `domain/`.
3) Application coordinates: it calls Domain + ports (interfaces).
4) Adapters implement ports (HTTP, cache, storage, logger).
5) DI wiring happens only in ONE place: `src/app/compositionRoot.ts`.
6) UI never imports from adapters directly. UI calls Application (use-cases).
7) Ports are defined in `application/ports/` and named `XRepository` / `Clock` / `IdGenerator` / `Logger`.
8) Adapters must be replaceable (mockable): same interface, different implementation.
9) Side effects are allowed only in Adapters (and sometimes in Application when orchestrating).
10) Every dependency direction is one-way:
    UI -> Application -> Domain
           Application -> Ports -> Adapters

## Minimal example (ports + wiring)

### Port (interface)
application/ports/MissionsRepository.ts
- `getMissionById(missionId): Promise<Mission>`

### Adapter (implementation)
adapters/repositories/HttpMissionsRepository.ts
- uses fetch/axios to call backend

### Use case (orchestrator)
application/use-cases/StartMissionUseCase.ts
- depends on MissionsRepository (interface)

### Wiring
app/compositionRoot.ts
- creates HttpMissionsRepository
- creates StartMissionUseCase
- exports ready-to-use objects

## Rule of thumb
If you need to mock it in tests, it should be a port (interface).
If it touches network/storage/time, it is an adapter.

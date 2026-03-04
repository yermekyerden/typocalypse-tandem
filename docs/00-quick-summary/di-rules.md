# DI Rules (Quick Summary)

Goal: keep Domain pure, allow parallel work, and make code easy to test.

## Golden rules
1) Domain is pure: NO HTTP, NO storage, NO Date.now(), NO Math.random(), NO globals
2) Domain depends on nothing outside `domain/`
3) Application coordinates: it calls Domain + ports (interfaces)
4) Adapters implement ports (HTTP, cache, storage, logger)
5) DI wiring happens only in one place: `src/app/compositionRoot.ts`
6) UI never imports from adapters directly — UI calls Application (use-cases)

Dependency direction:
- UI → Application → Domain
- Application → Ports → Adapters

## Minimal example
- Port: `application/ports/MissionsRepository.ts`
- Adapter: `adapters/repositories/HttpMissionsRepository.ts`
- Use case: `application/use-cases/StartMissionUseCase.ts`
- Wiring: `app/compositionRoot.ts`

Rule of thumb:
- If you need to mock it in tests → it should be a port (interface)
- If it touches network/storage/time → it is an adapter

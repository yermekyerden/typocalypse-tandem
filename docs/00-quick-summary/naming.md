# Naming (Quick Summary)

Goal: predictable names that match Clean Code + KISS.

## General
- Use English technical terms (Parser, Validator, Repository, UseCase).
- Prefer descriptive names over short ones.
- Avoid abbreviations unless common (API, DTO, UI, VFS).

## Files & folders
- Folders: `kebab-case` (mission-run/, use-cases/)
- React components: `PascalCase` (MissionRunPage.tsx)
- Other TS files: `camelCase` or role-based `PascalCase` (compositionRoot.ts, StartMissionUseCase.ts)

## React (UI)
- Components: `PascalCase` (TerminalInput, OutputPanel)
- Props: `XxxProps` (TerminalInputProps)
- Hooks: `useXxx` (useMissionRunState)

## Application / Domain (OOP-friendly)
Use clear role suffixes:
- Use cases: `*UseCase`
- Ports (interfaces): `*Repository`, `Clock`, `IdGenerator`, `Logger`
- Adapters (implementations): `HttpMissionsRepository`, `IndexedDbProgressRepository`

Rules:
- No `I` prefix for interfaces.
- Errors: `*Error` (ParseError, ValidationError, EngineError).
- Prefer discriminated unions for error types when possible.

## CSS Modules
- File name: `*.module.css`
- Class names: simple and semantic (local scope): `root`, `container`, `header`, `panel`
- No BEM.

# Naming (Quick Summary)

Goal: predictable names that match Clean Code + KISS.

## General
- Use English technical terms (Parser, Validator, Repository, UseCase).
- Prefer descriptive names over short ones.
- Avoid abbreviations unless common (API, DTO, UI, VFS).

## Files & folders
- Folders: kebab-case
  - mission-run/, use-cases/, domain-model/
- TS/TSX files: PascalCase for React components, otherwise camelCase or PascalCase by role
  - MissionRunPage.tsx
  - compositionRoot.ts
  - StartMissionUseCase.ts
  - MissionsRepository.ts

## React (UI)
- Components: PascalCase
  - TerminalInput, OutputPanel, MissionRunPage
- Component props types:
  - TerminalInputProps
- Hooks: useX
  - useMissionRunState

## Application / Domain (OOP-friendly)
Use clear role suffixes:
- Use cases: <Verb><Noun>UseCase
  - RunCommandLineUseCase
  - StartMissionUseCase
- Repositories (interfaces/ports): <Noun>Repository
  - MissionsRepository, ProgressRepository, AttemptsRepository
- Adapters (implementations): <Tech><Noun>Repository
  - HttpMissionsRepository
  - IndexedDbProgressRepository
- Services (if needed): <Noun>Service (use rarely, prefer UseCase)
- Factories: <Noun>Factory
- Parsers/Validators:
  - CommandLineParser
  - MissionValidator

Interfaces:
- Do NOT use I-prefix (no IMissionsRepository).
- Use `interface` for ports and stable contracts.

Errors:
- Suffix Error: ParseError, ValidationError, EngineError
- Prefer discriminated unions for error types when possible.

## CSS Modules
- File name: <Component>.module.css
  - MissionRunPage.module.css
- Class names: simple and semantic (local scope)
  - root, container, header, panel, title (No BEM!)

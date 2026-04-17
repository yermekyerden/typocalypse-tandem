# Self-Assessment — Yermek Yerdenov

GitHub: [yermekyerden](https://github.com/yermekyerden)
Role in the project: Team Lead, Frontend/Backend Contributor
Self-assessment PR: [PR #124](https://github.com/yermekyerden/typocalypse-tandem/pull/124)

## Personal Feature Table

| Category | Feature | Score | Evidence |
|---|---|---:|---|
| My Components | Complex Component — Contextual Assistant Chat UI | 25 | [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107), [PR #115](https://github.com/yermekyerden/typocalypse-tandem/pull/115) |
| My Components | Complex Backend Service — Context-aware Assistant Backend / AI Context Manager | 30 | [PR #82](https://github.com/yermekyerden/typocalypse-tandem/pull/82), [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |
| AI | AI Chat UI | 20 | [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |
| AI | AI Streaming | 10 | [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |
| AI | Raw LLM API | 10 | [PR #82](https://github.com/yermekyerden/typocalypse-tandem/pull/82), [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |
| Architecture | State Manager | 10 | [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |
| Architecture | API Layer | 10 | [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |
| UI & Interaction | i18n (assistant UI integration) | 10 | [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |
| UI & Interaction | Theme integration in my component (assistant panel) | 10 | [PR #115](https://github.com/yermekyerden/typocalypse-tandem/pull/115) |
| DevOps & Role | Architect | 10 | [PR #17](https://github.com/yermekyerden/typocalypse-tandem/pull/17) |
| DevOps & Role | Auto-deploy | 5 | [PR #44](https://github.com/yermekyerden/typocalypse-tandem/pull/44) |
| Backend & Data | Backend Framework | 10 | [PR #82](https://github.com/yermekyerden/typocalypse-tandem/pull/82) |
| Frameworks | React | 5 | [PR #39](https://github.com/yermekyerden/typocalypse-tandem/pull/39), [PR #107](https://github.com/yermekyerden/typocalypse-tandem/pull/107) |

**Total: 165**

> I intentionally do not claim test coverage points here.
> I added frontend testing infrastructure and first routing tests, but I do not want to overclaim coverage-based points without a clearly measured percentage for my personal code.

---

## Summary of My Personal Work

My work on this project was split across several layers.

First, as Team Lead, I helped establish the repository baseline and workflow:
- project-ready repository structure
- long-lived branches (`main`, `develop`, `diary`)
- checkpoint-oriented repository hygiene
- release / sync support between branches
- review and coordination support

Second, I built a large part of the documentation foundation:
- quick summary docs
- glossary and shared terminology
- architecture notes
- terminal engine and sandboxing docs
- process docs
- ADR structure for decisions

Third, I created important frontend engineering foundations:
- frontend scaffold cleanup
- application structure reset after the starter template
- routing foundation
- `AppShell`
- GitHub Pages-compatible routing setup
- frontend CI and deployment workflow

Fourth, I added frontend testing infrastructure:
- Vitest
- React Testing Library
- shared test setup
- CI integration for frontend tests
- first routing tests

Finally, my strongest technical contribution was the AI assistant feature.
I implemented it in two stages:
1. backend OpenRouter integration and attempt-based assistant endpoint
2. full end-to-end contextual assistant with streaming, transcript hydration, retry/stop flows, localized guard responses, state management, and UI integration

---

## My 2 Personal Feature Components

## 1. Contextual Assistant Chat UI

### What it is
This is the user-facing assistant interface integrated into the learning flow.

It is not a generic chatbot.
It is attached to the current learning context and works inside the Library experience.

### What I implemented personally
- assistant overlay in the Library screen
- assistant panel UI
- prompt input and send flow
- streaming response rendering
- stop button for active stream
- retry flow for interrupted / failed turns
- transcript hydration from backend history
- detached scroll mode and jump-to-latest behavior
- markdown rendering for completed assistant replies
- localized assistant UI copy
- light and dark theme support for the assistant panel
- assistant state management
- assistant API isolation from UI components

### Main files
- `frontend/src/features/assistant/ui/AssistantPanel.tsx`
- `frontend/src/features/assistant/ui/AssistantMessageMarkdown.tsx`
- `frontend/src/features/assistant/model/assistantStore.ts`
- `frontend/src/features/assistant/api/assistantApi.ts`
- `frontend/src/features/assistant/api/assistantStreamApi.ts`
- `frontend/src/ui/screens/library/sections/LibraryAssistantOverlay.tsx`
- `frontend/src/ui/components/AiAssistant.tsx`

### Why I consider it one of my main components
This component has real product complexity:
- multiple UI states
- async request lifecycle
- streaming
- retry / stop flows
- transcript restoration
- error handling
- localization inside my component
- theme integration inside my component
- state synchronization with the current attempt

This is one of the components I know best and can explain in technical detail during both defences.

### What was difficult
The hardest part was not the happy path.
The hard part was building a UX that still behaves well when the stream is interrupted, when partial content already exists, when the user stops generation manually, or when transcript history must be restored correctly.

### What I can demonstrate during defence
- ask a contextual question from the learning flow
- show streaming response
- stop the stream
- retry after interruption
- show hydrated transcript
- show light / dark theme support in the assistant panel
- show localized assistant UI behavior

---

## 2. Context-aware Assistant Backend / AI Context Manager

### What it is
This is the backend assistant service that powers the feature.

Instead of exposing an LLM directly to the frontend, I kept the provider integration inside the NestJS backend and attached the assistant to a concrete learner attempt.

### What I implemented personally
- dedicated `AssistantModule`
- `AssistantController`
- `AssistantService`
- `OpenRouterClient`
- attempt-based endpoint for assistant requests
- mission-aware prompt building
- bounded context based on attempt and mission state
- provider-side error handling
- timeout handling
- streaming support
- in-memory per-attempt chat history
- transcript history endpoint
- localized off-topic guard
- backend tests for assistant-related logic

### Main files
- `backend/src/assistant/assistant.module.ts`
- `backend/src/assistant/assistant.controller.ts`
- `backend/src/assistant/assistant.service.ts`
- `backend/src/assistant/openrouter.client.ts`
- `backend/src/assistant/prompt/assistant-prompt.builder.ts`
- `backend/src/assistant/prompt/assistant-offtopic.guard.ts`
- `backend/src/assistant/history/in-memory-assistant-chat-history.repository.ts`
- `backend/src/assistant/stream/assistant-stream.writer.ts`

### Why I consider it one of my main components
This is not only API wiring.
It is a real backend feature with architecture decisions:
- dedicated module instead of mixing assistant logic into unrelated services
- attempt-based context instead of generic chat
- provider isolation behind backend
- raw integration with the LLM API
- support for streaming and history
- safety constraints through a localized off-topic guard

### What was difficult
The hardest part was designing the assistant as a product-safe service, not as a simple “call LLM and print text” feature.

I had to think about:
- what context should be sent
- how to keep the feature grounded in the actual learning flow
- how to handle provider failures and timeouts
- how to preserve partial useful output
- how to keep history lightweight and bounded
- how to make the system expandable without polluting unrelated modules

### What I can explain during defence
- why I used a dedicated assistant module
- why the assistant is tied to `attemptId`
- why OpenRouter stays behind the backend layer
- how streaming works from backend to frontend
- how history is stored and hydrated
- how off-topic protection works
- how timeouts and provider errors are handled

---

## Additional Personal Contributions

## Documentation Foundation
I built a major part of the project documentation baseline:
- docs map / bootstrap
- glossary
- architecture quick summary
- system overview
- terminal engine documentation
- virtual filesystem documentation
- sandboxing and safety notes
- process docs
- ADR structure

This work helped the team establish a clearer single source of truth and made technical decisions easier to track.

Main evidence:
- [PR #17](https://github.com/yermekyerden/typocalypse-tandem/pull/17)

## Frontend Foundation and Deployment Setup
I built the early frontend structure and deployment baseline:
- cleaned the starter scaffold
- introduced app structure and composition root
- added `AppShell`
- added route wiring
- switched the app to hash routing for GitHub Pages compatibility
- configured Vite `base`
- added frontend CI
- added GitHub Pages deploy workflow

Main evidence:
- [PR #39](https://github.com/yermekyerden/typocalypse-tandem/pull/39)
- [PR #44](https://github.com/yermekyerden/typocalypse-tandem/pull/44)

## Frontend Testing Infrastructure
I added the first frontend testing baseline for the project:
- Vitest
- React Testing Library
- jsdom
- shared test setup
- CI test step
- first routing tests

Main evidence:
- [PR #64](https://github.com/yermekyerden/typocalypse-tandem/pull/64)

## Team Lead / Workflow Support
As Team Lead, I also contributed to:
- repository baseline and checkpoint readiness
- release-oriented workflow around `main` and `develop`
- repository cleanup and documentation order
- support with reviews and branch synchronization
- general project hygiene

---

## What Was the Most Difficult for Me

The most difficult part of my work was the assistant feature, because it combined many concerns at once:
- product UX
- frontend state
- backend architecture
- LLM integration
- streaming
- history
- localization
- failure handling

It was the part where I had to make the most design decisions myself, not just write code.

A second difficult area was building a clean project baseline early in the project:
- repository order
- documentation structure
- route foundation
- deploy setup
- keeping the work practical for checkpoint needs

---

## Tools and Technologies I Worked With

- React
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- NestJS
- Swagger
- GitHub Actions
- GitHub Pages
- Vitest
- React Testing Library
- OpenRouter API

---

## Final Note

The two personal feature components I want to focus on during Peer Review and Mentor Review are:

1. **Contextual Assistant Chat UI**
2. **Context-aware Assistant Backend / AI Context Manager**

These are the parts I implemented personally, know best, and can explain in the most detail: architecture, code structure, trade-offs, edge cases, and product behavior.

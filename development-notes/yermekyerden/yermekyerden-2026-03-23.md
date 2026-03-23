# Date: 2026-03-23

## What was done
- ✅ Implemented the first backend version of the AI assistant module for the project.
- ✅ Added a separate `AssistantModule` to keep the integration isolated and aligned with the existing NestJS architecture.
- ✅ Added a protected backend endpoint for attempt-based AI hints:
  - `POST /assistant/attempts/:attemptId`
- ✅ Integrated OpenRouter through the backend only, without exposing the provider key to the frontend.
- ✅ Connected the assistant flow to existing project services, so the AI response is based on the real learner attempt and mission context.
- ✅ Added environment template support for the new integration (`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`).
- ✅ Manually tested the flow through Swagger:
  - authenticated with JWT
  - retrieved a mission
  - created an attempt
  - called the assistant endpoint
  - received a valid hint response from a free OpenRouter model with zero cost in the tested request
- ✅ Opened a PR for the backend integration and described the architecture and reasoning in detail.
- ✅ After mentor review, added unit tests for the assistant-related backend logic:
  - `AssistantService`
  - `OpenRouterClient`

## Problems / blockers
- Problem: the first integration attempt was slowed down by backend setup issues and understanding how the existing auth / attempt flow works.
- What I tried: step by step checked JWT authentication, mission flow, attempt creation, Prisma setup, and Swagger testing until the full chain worked correctly.
- Current status: the backend assistant flow is working and covered by unit tests for the main assistant-related branches.
- What I need next: sync with the mentor, review remaining comments carefully, and decide how the frontend part should be connected later.

## Decisions (and why)
- Decision: implement the AI integration as a separate backend module instead of mixing it directly into unrelated services.
- Why: this keeps the architecture cleaner and makes the assistant logic easier to review, test, and extend later.
- Trade-offs: it adds a few extra files and some setup overhead, but the separation of responsibilities is much better.

- Decision: attach the assistant to a concrete `attemptId` instead of creating a generic free-form AI chat endpoint.
- Why: this allows the assistant to respond based on the real mission and learner progress, not on abstract prompts without context.
- Trade-offs: the endpoint is more specific, but the AI output is more grounded and useful.

- Decision: use OpenRouter through the backend only and default to a free model path.
- Why: this is safer for secrets and enough for the current prototype and course scope.
- Trade-offs: free models may have limitations, but they are sufficient for proving the integration path.

## What I learned
- Concept / tool / pattern: backend AI integration should be treated as an architectural boundary, not just as a quick API call.
- What I understand now: a good first step is a small backend vertical slice that proves auth, attempt context, provider integration, and response handling end to end.
- What is still unclear: the final frontend UX for the assistant and how far the AI functionality should go in the project scope.

## Plan (next steps)
- [ ] Review the remaining mentor feedback and align the final backend version with the expected PR scope.
- [ ] Discuss the next integration step with the mentor on call.
- [ ] Decide how the frontend should interact with the assistant endpoint.
- [ ] Keep future PRs narrower by logical module or feature.

## Links (optional)
- PRs: `#82`

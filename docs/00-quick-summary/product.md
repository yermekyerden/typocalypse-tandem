# Product (Quick Summary)

## One-liner
Terminal Dojo is a mission-based CLI training app.
Users solve missions inside a fully simulated shell + VFS (**NO OS exec**).
We validate results (state/output), show Explain Mode (trace), and store replays + progress.

## TL;DR (MVP loop)
1) Library: pick a mission
2) Mission Run: type command lines
3) Validation: pass/fail + “which check failed + why”
4) Explain Mode: show trace (Parse → Resolve → Execute → Validate → Trace)
5) Replay: step-by-step playback
6) Persistence: local-first + backend sync

## Glossary alignment (must use these terms)
- **Attempt** = one mission run from start until exit/completion
- **Step** = one submitted command line inside an attempt

## Non-negotiables (Must / Never)
- Never execute OS commands, never `eval`, never touch real filesystem.
- Deterministic: same snapshot + same input => same output/state (within budgets).
- Validate by **effects**, not exact command strings.
- Trace exists for every step (Explain Mode is not “optional polish”).
- Budgets are mandatory (input/output/VFS/iterations).

## MVP screens
- Library
- Mission Run (Terminal + panels: Mission / Feedback / Explain)
- Replay

## Demo script (minimum impressive)
1) Start a mission
2) Run 2–4 commands → show a failure with a clear reason
3) Toggle Explain Mode → show the trace
4) Fix → mission completed
5) Replay → step through outputs + trace

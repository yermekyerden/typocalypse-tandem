# Product (Quick Summary)

## One-liner
Terminal Dojo is a mission-based CLI training app where users solve missions inside a fully simulated shell + VFS (NO OS exec). We validate results (state/output), show structured Explain Mode (trace), and store replays + progress.

## MVP loop (must be demoable)
1) Library: pick mission
2) Mission Run: type commands
3) Validation: pass/fail + “which check failed + why”
4) Explain Mode: Parse → Resolve → Execute → Validate
5) Replay: step-by-step playback
6) Persistence: local-first + backend sync

## Non-negotiables
- No OS execution, no eval, no real filesystem — ever.
- Deterministic: same snapshot + same input => same output/state (within budgets).
- Validate by result (effects), not exact command strings.
- Explain Mode is required (trace always exists).
- Budgets are mandatory (input/output/VFS/iterations).

## MVP screens
- Library
- Mission Run (Terminal + panels: Mission / Feedback / Explain)
- Replay

## Demo script (minimum impressive)
1) Start mission
2) 2–4 commands → show a failure with clear reason
3) Toggle Explain Mode → show trace
4) Fix → mission completed
5) Replay → step through outputs + trace

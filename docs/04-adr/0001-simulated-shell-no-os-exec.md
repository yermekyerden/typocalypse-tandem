
### `docs/04-adr/0001-simulated-shell-no-os-exec.md`

# ADR 0001: Simulated Shell in Frontend (No OS Execution)

## Status
Accepted

## Context
We are building a CLI training app. User input is untrusted and can be malicious or weird.
We also need determinism for:
- fair validation,
- reproducible replays,
- stable demos.

If we execute real OS commands (even in containers), we introduce:
- security risk,
- non-determinism (env differences),
- increased ops complexity,
- harder debugging and testability.

## Decision
- The terminal engine runs as a **fully simulated** shell in the **frontend Domain**.
- The filesystem is a **Virtual File System (VFS)** in memory.
- Backend **never** executes or interprets user commands.
- All user output is treated as **data** and rendered as escaped text.
- Budgets are enforced to prevent freezes and keep behavior deterministic.

## Consequences
Positive:
- Strong safety boundary (no OS exec).
- Deterministic behavior by design.
- Easy to unit test Domain logic.
- Demo stability.

Trade-offs:
- We implement only a safe dialect (not full Bash).
- Some "real-world" behaviors must be simplified and documented.

## Alternatives considered
- Server-side execution in containers:
  - rejected due to security/ops complexity and determinism issues.
- Client-side execution via WebAssembly shell:
  - rejected for MVP due to complexity and time risk.


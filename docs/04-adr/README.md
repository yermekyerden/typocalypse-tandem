# ADR (Architecture Decision Records)

ADRs capture "why we decided X" in a short, strict format.

Rules:
- If a decision affects safety, determinism, contracts, or scope — write an ADR.
- ADRs are immutable (append new ADRs instead of rewriting history).
- Reference ADRs from docs when relevant.

Naming:
- `0001-title-slug.md`, `0002-...`

Minimum content:
- Context
- Decision
- Consequences
```

### `docs/04-adr/0000-template.md`

```md
# ADR 0000: <Title>

## Status
Proposed | Accepted | Superseded

## Context
What problem are we solving? What constraints matter?

## Decision
What we decided, in 3–7 bullets.

## Consequences
Positive:
- ...

Negative / trade-offs:
- ...

## Alternatives considered
- Option A (why rejected)
- Option B (why rejected)

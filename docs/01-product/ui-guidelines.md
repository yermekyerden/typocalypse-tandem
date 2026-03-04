# UI Guidelines (SSOT)

This document defines **UI rules** for Terminal Dojo so that:
- the app feels consistent and “terminal-authentic”,
- feedback and Explain Mode are readable and actionable,
- the UI does not leak Domain logic into components.

Scope:
- layout rules, interaction rules, terminal rendering rules,
- panel behavior and states,
- accessibility and keyboard-first behavior.

Related:
- `01-product/user-flows.md`
- `01-product/mvp-scope.md`
- `02-architecture/system-overview.md`

---

## 0) Core UI principles (non-negotiable)

### Terminal-first experience
The terminal is the primary interaction surface.
Everything else (mission text, feedback, trace, replay) must **support** it, not compete with it.

### Explainability over decoration
A beginner must understand:
- what went wrong,
- what the system expected,
- what they actually did,
- how to fix it.

No “mystery failures”.

### Readability and calm
Prefer clean spacing, short blocks, and predictable layout.
Avoid visual noise and “gamified chaos”.

### Keyboard-first
A user should be able to complete missions without touching the mouse:
- input focus stays correct,
- history navigation works,
- key actions have shortcuts.

---

## 1) Layout (MVP)

### Default layout (desktop)
Use a 2-column layout:
- **Left / Main:** Terminal panel (largest)
- **Right / Side:** Mission + Feedback + Explain (tabs or collapsible sections)

Minimum:
- Terminal always visible.
- Feedback always visible (at least as a compact status header).

### Mobile / small screens
Allow a stacked layout:
- Terminal on top
- Panels below as collapsible sections or tabs

Rule: do not hide the terminal behind navigation unless necessary.

---

## 2) Panels and responsibilities

### Terminal Panel
Must contain:
- output viewport (scrollable)
- prompt line
- input field (single line)
- optional: “soft controls” (reset, clear, toggle explain) as icons/buttons

Must NOT contain:
- mission validation rules,
- filesystem mutations logic,
- “business” explanation text beyond output rendering.

### Mission Panel
Shows:
- mission title, difficulty, estimated time
- description + goal
- allowed commands (if present)
- hints (locked/unlocked state)

Rules:
- mission text is Markdown-rendered safely (no raw HTML).
- mission goal should be visually distinct from description.

### Feedback Panel
Shows:
- mission status: not completed / failed / completed
- on failure: **failed check** + actionable message
- optionally: summary of “expected vs actual”

Rules:
- Always show **which check failed** (by meaning, not by id).
- Always show a short “next step” hint if possible (non-spoiler).

### Explain Panel (Trace)
Shows structured trace for the **last step** (or selected replay step):
- Parse summary
- Resolve summary
- Execute summary (effects + exit code)
- Validate summary (check reports)

Rules:
- The trace is not raw logs.
- Prefer bullet blocks and small tables/kv lists.

### Replay Panel / Screen
Replay must allow:
- selecting a step
- viewing output and trace for that step

Rule:
- “Replay step selection” must not change current mission state unless the user explicitly starts a replay-run.

---

## 3) Terminal rendering rules

### Output model
The UI must treat output as:
- `stdout` string
- `stderr` string
- `exitCode` number

Even if visually rendered together, keep the streams separate in state.

### Rendering conventions
- Output is rendered as plain text:
  - escape everything
  - preserve line breaks
  - preserve monospace
- Consider a stable prefix for stderr lines (e.g., `stderr:`) if styling is subtle.
- Do not auto-wrap long lines in a way that loses meaning; prefer horizontal scroll within output lines if needed.

### Prompt conventions
Prompt must display:
- a stable user/host label (static, e.g., `dojo`)
- current working directory from Domain state

Example (visual idea, not strict):
`dojo:/home/student$`

### Command echo
When a user submits a command, the terminal should show:
- the prompt
- the user input line
- then output

This keeps the terminal narrative coherent.

---

## 4) Interaction rules

### Input focus rules
- On entering Mission Run: input is focused.
- After submitting a command: input is focused again (unless modal opened).
- Clicking in other panels must not permanently “steal” focus.

### History navigation
- Up/Down arrow navigates input history.
- A partially typed line should be preserved when browsing history (recommended behavior).

### Key shortcuts (recommended)
- `Enter`: submit command
- `Ctrl+L`: clear terminal output viewport (optional; does not reset state)
- `Ctrl+R`: reset mission (dangerous; confirm if it drops progress)
- `Ctrl+E`: toggle Explain panel (optional)

Shortcuts must not conflict with browser defaults in harmful ways.

### Reset behavior
Reset must be explicit:
- “Reset mission” restores initial snapshot and starts a new attempt.
- “Clear output” only clears the viewport, does not change state.

---

## 5) States and UI messaging

### Loading states
- Loading mission: show skeleton in side panel; terminal disabled.
- Loading catalog: skeleton list.

### Offline / backend unavailable
Show a small banner:
- “Offline: using cached data”
- writes are queued (if applicable)

Never block the user from practicing if missions are cached.

### Errors
Errors must be:
- typed (from Domain/Application)
- shown in a friendly message
- optionally expandable to show technical details (for dev/debug)

Rule:
- No stack traces in the UI for end users.

---

## 6) Consistency rules (components)

### Design system
- Use shadcn/ui components as the base.
- Avoid ad-hoc styling duplication (create small UI primitives if needed).

### Spacing and typography
- Keep consistent paddings and line heights.
- Use monospace only where appropriate (terminal output, code blocks).

### Icons and badges
- Use icons sparingly:
  - completion status
  - hint locked/unlocked
  - connectivity state

---

## 7) Accessibility (minimum bar)

- All interactive controls must be reachable via keyboard.
- Focus states must be visible.
- Terminal output must be readable with screen zoom.
- Buttons/toggles must have labels (aria-label where needed).

---

## 8) UI “Definition of Done”

A UI change is done when:
- It doesn’t leak Domain logic into UI components,
- It keeps keyboard-first interaction working,
- It preserves terminal narrative (prompt → input → output),
- It doesn’t break determinism (no hidden state mutations),
- Docs remain accurate.

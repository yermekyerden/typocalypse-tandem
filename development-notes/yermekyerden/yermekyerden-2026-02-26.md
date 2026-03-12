# Date: 2026-02-26

## What was done
- ✅ Reviewed and merged several PRs; handled incoming changes from teammates.
- ✅ Resolved merge conflicts after Tailwind setup (tooling + config collisions).
- ✅ Reduced / tightened documentation to a smaller, more maintainable scope.
- ✅ Discussed with the team the idea to split docs / UI work into clearer components and responsibilities.

## Problems / blockers
- Problem: Burnout and very low motivation to continue.
- What I tried: Tried to keep discipline and push day-by-day, but it’s getting harder.
- Current status: I don’t see much value in the course certificate anymore, and I’m actively holding myself back from quitting right now.
- What I need next:
  - Reduce coordination overhead.
  - Focus only on the MVP tasks I own (terminal main screen + routing).
  - Clarify what “done” means for routing and for the terminal screen in this week.

## Decisions (and why)
- Decision: Set a strict boundary — I will not work in a team for free anymore unless it’s paid.
- Why: The cost (time + stress + burnout) is too high, and “free team work” creates a bad incentive structure.
- Trade-offs:
  - Less “social” projects, but more control and better long-term sustainability.
  - If I do unpaid work, it will be only for my own projects (where the output belongs to me).

- Decision: Keep the documentation smaller and closer to the MVP.
- Why: Large docs are expensive to maintain; right now we need clarity, not volume.
- Trade-offs: Some details will be postponed, but the docs will stay readable and actionable.

- Decision: Acknowledge the team size as a major early mistake.
- Why: Bigger team = higher communication overhead + more coordination + more conflicts.
- Trade-offs: We may need stricter process and simpler scope to compensate.

## What I learned
- Concept / tool / pattern: Merge conflict resolution in a real team flow (especially around Tailwind/tooling changes).
- What I understand now: Tooling changes must be isolated, merged carefully, and communicated early to avoid “configuration wars”.
- What is still unclear: The best minimal routing structure for our UI + how to keep the terminal screen architecture clean without overengineering.

## Plan (next steps)
- [ ] Define the routing map (routes list, layouts, nested routes if needed).
- [ ] Implement routing in the project (basic navigation + placeholder screens).
- [ ] Draft the main terminal screen structure (layout, key UI blocks/components).
- [ ] Align terminal screen decisions with the team (short async message + checklist).

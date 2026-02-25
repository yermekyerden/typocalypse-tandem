# Styling Rules (No Global CSS)

Goal: consistent UI without global side effects.

## Default approach
1) Tailwind classes in JSX (primary).
2) CSS Modules ONLY when Tailwind becomes too noisy or needs complex selectors.
3) No global CSS files, no BEM.

## Allowed styling locations
- Component-level:
  ui/**/<Component>.module.css
- App bootstrapping:
  (optional) a minimal base file in app/ only if absolutely required by tooling,
  but avoid writing global selectors.

## When to use CSS Modules
Use `.module.css` only for:
- complex states (e.g., animations with keyframes)
- pseudo selectors that are awkward in Tailwind
- large repeated style blocks that reduce readability in JSX

Otherwise, keep Tailwind in JSX.

## Class naming in CSS Modules
Because scope is local:
- root
- container
- content
- title
- panel
- hint
- error
- success

## Reuse strategy (KISS)
- Shared small UI building blocks go to:
  ui/components/
- Avoid "mega shared styles".
- Prefer reusing components instead of reusing CSS.

## Practical rule
If a component requires > ~15–20 Tailwind classes and becomes hard to read,
move the repeated part into:
- a small UI component, or
- a CSS Module for that component.

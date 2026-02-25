# Styling Rules (No Global CSS)

Goal: consistent UI without global side effects.

## Default approach
1) Tailwind classes in JSX (primary)
2) CSS Modules only when Tailwind becomes too noisy or needs complex selectors
3) No global CSS files, no BEM

## Allowed styling locations
- Component-level: `ui/**/.module.css`
- App bootstrapping: only minimal tooling-required base (avoid global selectors)

## When to use CSS Modules
Use `.module.css` only for:
- complex states (animations/keyframes)
- pseudo selectors awkward in Tailwind
- large repeated blocks that reduce JSX readability

## Reuse strategy (KISS)
- Reuse small UI components (`ui/components/`)
- Avoid “mega shared styles”
- Prefer reusing components instead of reusing CSS

---
applyTo: "src/app/**/*.tsx,src/components/**"
description: "UI conventions for Premise React components and the workbench page."
---

# Frontend conventions

- Client components start with `"use client"`. Keep data-fetching in
  `src/app/page.tsx`; keep `src/components/*` presentational and prop-driven.
- Style only through `src/components/workbench.module.css` and the CSS variables
  in `src/app/globals.css`. Do not add a CSS framework or inline design tokens.
- Accessibility is required, not optional:
  - Every input has a `<label>`; errors use `role="alert"` and `aria-invalid`.
  - Status changes are announced through an `aria-live="polite"` region.
  - Interactive elements must show a visible focus ring and work by keyboard.
  - Respect `prefers-reduced-motion` (already handled globally — don't override it).
- Render list data (requirements, risks, experiments) as repeated items, not as
  nested cards. Avoid decorative AI imagery.
- Keep layout stable across empty, loading, success, and error states — no layout
  shift when results appear.

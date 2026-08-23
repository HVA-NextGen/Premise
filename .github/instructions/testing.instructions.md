---
applyTo: "tests/**,e2e/**"
description: "How to write and run tests for Premise without cloud credentials."
---

# Testing conventions

- Unit, component, and route tests use **Vitest** in `tests/` and run with
  `npm test`. End-to-end tests use **Playwright** in `e2e/` and run with
  `npm run test:e2e`.
- Tests must never call APIM or Azure:
  - For gateway tests, mock the `openai` module.
  - For route tests, mock `@/lib/model-gateway`.
  - For e2e, intercept `**/api/brief` with `page.route(...)`.
- Reuse fixtures from `tests/fixtures.ts` for valid input and a valid brief.
- When you add a `BriefErrorCode`, add a gateway test that triggers it and a route
  test that asserts its HTTP status.
- Prefer role- and label-based queries (`getByRole`, `getByLabelText`) so tests
  also guard accessibility.

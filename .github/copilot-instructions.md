# Premise — Copilot repository instructions

Premise is a small software **product-manager helper** for planning epics and
features in existing software products. A user enters a proposed feature, its
target users, supporting evidence, and constraints; a model hosted in **Microsoft
Foundry** and consumed **through Azure API Management (APIM)** returns a
structured, implementation-ready feature plan.

This repository exists to **demonstrate agentic development with GitHub Copilot**.
The application deliberately contains **no GitHub functionality** — the GitHub
story is told through how this repo is built, tested, reviewed, and evolved.

## Golden rules

- Use documented, supported approaches and established best practices for the
  repository's frameworks, tools, and deployment targets.
- Do not introduce workarounds, compatibility shims, or custom replacement
  mechanisms unless the standard approach is demonstrably unavailable. Explain
  the blocker and obtain explicit user confirmation before implementing one.
- Stay focused on the requested task. Prefer the simplest sufficient change and
  avoid speculative abstractions, unrelated refactors, extra tooling, or
  additional features.
- The browser must never receive model endpoints, subscription keys, prompt
  internals, or raw SDK errors. All model access stays server-side.
- `src/lib/brief-schema.ts` is the single source of truth. Form validation, API
  validation, model-output parsing, and inferred types all flow from it. When the
  brief shape changes, update the Zod schema **and** the JSON schema together.
- Keep the model boundary mockable. Tests never call APIM or Azure.

## Architecture

- **Framework:** Next.js (App Router) + TypeScript (strict), React, CSS Modules.
- **UI:** `src/app/page.tsx` (client) orchestrates state; presentational pieces
  live in `src/components/`.
- **API:** `src/app/api/brief/route.ts` validates input, calls the gateway, and
  returns a stable `{ ok: true, brief } | { ok: false, error }` envelope.
  `src/app/api/health/route.ts` reports configuration presence only.
- **Model access:** `src/lib/model-gateway.ts` (server-only) calls APIM, which
  fronts the Foundry deployment. Prompt construction is in
  `src/lib/product-brief-prompt.ts`.

## Commands

```bash
npm run dev        # local dev server on http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest unit/component/route tests
npm run test:e2e   # Playwright (intercepts /api/brief; no cloud creds needed)
npm run build      # production build
```

Before proposing a change complete, run `lint`, `typecheck`, `test`, and `build`.

## Configuration

The app reads these environment variables (never commit real values):

- `APIM_GATEWAY_URL` — APIM AI-gateway base URL.
- `APIM_SUBSCRIPTION_KEY` — APIM subscription key (server-side secret).
- `APIM_MODEL_DEPLOYMENT_NAME` — the model deployment name behind the gateway.
- `APIM_API_VERSION` — optional; defaults to a version that supports structured outputs.

## Conventions

- Prefer small, focused modules and multi-file changes that keep the schema,
  prompt, UI, and tests in sync.
- Preserve accessibility: semantic headings, labelled controls, visible focus,
  `aria-live` status, and reduced-motion support.
- Match the existing product-operations visual language; do not introduce a UI kit.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Premise

Repository guidance for agents lives in
[.github/copilot-instructions.md](.github/copilot-instructions.md). Read it before
making changes. In short: this is a product-manager helper that reaches a
Microsoft Foundry model **through Azure API Management**; the app has **no GitHub
functionality**; and `src/lib/brief-schema.ts` is the single source of truth. Run
`npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before
calling a change done.

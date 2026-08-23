---
mode: agent
description: "Implement a Premise product-brief feature from an issue, keeping schema, prompt, UI, and tests in sync."
---

# Implement a product-brief change

You are implementing a change to **Premise**. Follow the repository instructions
and the `product-brief-quality` skill.

Given the issue described in the chat:

1. **Locate the seams.** Identify which of these must change together: the Zod
   schemas and JSON schema in `src/lib/brief-schema.ts`, the prompt in
   `src/lib/product-brief-prompt.ts`, the gateway/route in `src/app/api/**` and
   `src/lib/model-gateway.ts`, and the UI in `src/app/page.tsx` /
   `src/components/**`.
2. **Change the contract first.** Update `brief-schema.ts` (Zod **and**
   `productBriefJsonSchema`) before touching anything downstream.
3. **Propagate.** Update the prompt, then the UI rendering, then the sample in
   `src/lib/sample-brief.ts` if a field was added.
4. **Cover it.** Add or update tests in `tests/**` (and `e2e/**` if the flow
   changed). Keep the model boundary mocked.
5. **Verify.** Run `npm run lint`, `npm run typecheck`, `npm test`, and
   `npm run build`. Fix anything that fails.
6. **Summarize** the files you changed and how the schema, prompt, UI, and tests
   stayed in sync.

Never add GitHub functionality to the app, and never expose the gateway URL,
subscription key, or raw errors to the browser.

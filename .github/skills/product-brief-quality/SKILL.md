---
name: product-brief-quality
description: "Standards for Premise's product briefs and how to evolve them safely. USE WHEN: adding or changing a brief field, editing the model prompt, judging brief quality, adding a decision-log or evidence-strength style section, or keeping brief-schema.ts, product-brief-prompt.ts, the UI, and tests in sync. For the Premise product-manager helper only."
---

# Product brief quality

Use this skill when working on what a Premise brief contains or how good it is.

## What a good brief looks like

A decision-ready brief is specific, evidence-grounded, and honest about
uncertainty. Judge and produce briefs against the rubric in
[references/rubric.md](references/rubric.md).

## The single source of truth

`src/lib/brief-schema.ts` defines the brief shape twice, on purpose:

- `productBriefSchema` (Zod) — runtime validation and inferred TypeScript types.
- `productBriefJsonSchema` — the structured-output contract sent to the model.

These must always agree. The end-to-end change recipe is in
[references/schema-sync.md](references/schema-sync.md).

## Change checklist

When you add or change a brief section or field:

1. Update `productBriefSchema` and `productBriefJsonSchema` together.
2. Update the prompt rules in `src/lib/product-brief-prompt.ts` so the model knows
   how to fill the new shape.
3. Update the UI in `src/components/BriefResult.tsx` and any tags/styles.
4. Update `src/lib/brief-markdown.ts` so the export includes the new content.
5. Update `src/lib/sample-brief.ts` if you added an input field.
6. Add/adjust tests in `tests/**`; keep the model boundary mocked.
7. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

## Guardrails

- Never expose the APIM gateway URL, subscription key, prompt internals, or raw
  errors to the browser.
- Keep the API envelope stable: `{ ok: true, brief } | { ok: false, error }`.
- The app never gains GitHub functionality.

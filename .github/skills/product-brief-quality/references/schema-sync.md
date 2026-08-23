# Keeping the brief contract in sync

The brief shape lives in `src/lib/brief-schema.ts` as two artifacts that must
always agree: the Zod `productBriefSchema` and the `productBriefJsonSchema` sent
to the model. Here is the safe order of changes.

## Example: add a `confidence` field to each requirement

1. **Zod schema** — extend `requirementSchema`:

   ```ts
   export const requirementSchema = z.object({
     title: z.string().min(1),
     rationale: z.string().min(1),
     priority: z.enum(PRIORITY_VALUES),
     confidence: z.enum(["low", "medium", "high"]),
   });
   ```

2. **JSON schema** — mirror it in `productBriefJsonSchema.properties.requirements.items`:
   add `confidence` to both `required` and `properties`, keeping
   `additionalProperties: false`.

3. **Prompt** — in `src/lib/product-brief-prompt.ts`, add a rule telling the model
   how to choose a confidence level.

4. **UI** — render the new field in `src/components/BriefResult.tsx` (e.g. a tag),
   and add any needed styles in `workbench.module.css`.

5. **Markdown** — include it in `src/lib/brief-markdown.ts`.

6. **Fixtures & tests** — update `tests/fixtures.ts` and add assertions in
   `tests/brief-schema.test.ts` (accepts valid, rejects invalid) and any render
   test in `tests/BriefResult.test.tsx`.

7. **Verify** — `npm run lint && npm run typecheck && npm test && npm run build`.

## Why two schemas?

The JSON schema constrains the model at generation time (structured outputs); the
Zod schema is the runtime guard that rejects anything off-contract before it
reaches the UI. If they drift, valid-looking model output can crash rendering — so
change them in the same commit.

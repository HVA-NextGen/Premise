---
mode: agent
description: "Review a Premise change for schema/prompt/UI/test sync, security, and accessibility."
---

# Review a product-brief change

Review the current change (or the diff provided) against Premise's standards.
Report findings as a short, prioritized list. Do not rewrite the code unless asked.

Check for:

1. **Contract sync** — If `brief-schema.ts` changed, did both the Zod schema and
   `productBriefJsonSchema` change? Did the prompt, UI, sample, and tests follow?
2. **Security boundary** — No gateway URL, subscription key, prompt internals, or
   raw SDK errors reachable from the client. `model-gateway.ts` stays server-only.
   Every failure maps to a `BriefError` code.
3. **Envelope stability** — The API still returns
   `{ ok: true, brief } | { ok: false, error }`, and any new `BriefErrorCode` has
   an HTTP status mapping and tests.
4. **Accessibility** — Labels, `role="alert"` on field errors, `aria-live` status,
   visible focus, keyboard support, reduced-motion respected.
5. **Scope** — No GitHub functionality added to the app; no unrelated refactors or
   new dependencies.
6. **Tests & gates** — Adequate coverage with the model boundary mocked; `lint`,
   `typecheck`, `test`, and `build` would pass.

End with a clear verdict: approve, or the specific changes required.

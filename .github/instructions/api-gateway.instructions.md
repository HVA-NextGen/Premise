---
applyTo: "src/app/api/**,src/lib/model-gateway.ts,src/lib/product-brief-prompt.ts"
description: "Server boundary rules for the brief API, APIM gateway client, and prompt."
---

# API & model-gateway conventions

- `src/lib/model-gateway.ts` is server-only (`import "server-only"`). Never import
  it from client components.
- The app reaches the Foundry model **only through APIM**. Build the OpenAI client
  with `baseURL = ${APIM_GATEWAY_URL}/openai/deployments/${deployment}`,
  `defaultQuery["api-version"]`, and the `Ocp-Apim-Subscription-Key` header.
- Normalize every failure to a `BriefError` with one of the known `BriefErrorCode`
  values. Never let a raw SDK error, endpoint, or key reach the client.
- Validate model output with `productBriefSchema` before returning it. Off-schema
  output is a `invalid_model_output` error, not a rendered brief.
- The route returns a stable envelope: `{ ok: true, brief }` or
  `{ ok: false, error: { code, message, fieldErrors? } }`. Keep the
  `BriefErrorCode` → HTTP status map in sync when adding a code.
- When you add or change a field, update `briefInputSchema` / `productBriefSchema`
  **and** `productBriefJsonSchema` together, then the prompt in
  `product-brief-prompt.ts`.

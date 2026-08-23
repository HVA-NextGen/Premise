# Premise

**Plan software epics and features with evidence.**

Premise is a small software **product-manager helper** for planning epics and
features in existing software products. Enter a proposed feature, its target
users, supporting evidence, and constraints; a model hosted in **Microsoft
Foundry** and consumed **through Azure API Management (APIM)** returns a
structured, implementation-ready feature plan: summary, assumptions, prioritized
requirements, acceptance criteria, risks, and experiments.

## Architecture

```
Browser ──> Next.js API (/api/brief) ──> APIM AI gateway ──> Foundry model deployment
             validate + envelope         subscription key       structured output
```

- **Framework:** Next.js (App Router), TypeScript (strict), React, CSS Modules.
- **Contract:** `src/lib/brief-schema.ts` is the single source of truth — Zod
  schema, JSON schema for structured outputs, and inferred types in one place.
- **Model access:** `src/lib/model-gateway.ts` is server-only. The app talks to
  APIM (which fronts Foundry, holds the backend managed identity, and applies
  token limits, metrics, and content safety); it never calls Foundry directly.
- **Security boundary:** the browser never receives the gateway URL, subscription
  key, prompt internals, or raw SDK errors.

## Prerequisites

- Node.js 22 and npm. Build deployment artifacts on Linux to match App Service.
- An APIM instance configured as an AI gateway in front of a Foundry model
  deployment, plus a subscription key. (To set this up, see the
  `azure-aigateway` guidance and
  [GenAI gateway capabilities](https://learn.microsoft.com/azure/api-management/genai-gateway-capabilities).)

## Configuration

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `APIM_GATEWAY_URL` | APIM AI-gateway base URL (up to, not including, `/openai`). |
| `APIM_SUBSCRIPTION_KEY` | APIM subscription key (server-side secret). |
| `APIM_MODEL_DEPLOYMENT_NAME` | Model deployment name behind the gateway. |
| `APIM_API_VERSION` | Optional; defaults to a version supporting structured outputs. |

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

Load the built-in example, then select **Luo suunnitelma**. Without configuration
the app still runs and returns a clear configuration error instead of a plan.

## Scripts

```bash
npm run dev        # dev server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest unit/component/route tests
npm run test:e2e   # Playwright (intercepts /api/brief; no cloud creds needed)
npm run build      # production build
npm run build:standalone # build and copy static/public assets into .next/standalone
```

## Deploy to Azure

Build the deployment artifact on Linux (GitHub Actions or WSL) so native Node
dependencies match the Linux App Service runtime. ZIP the contents of the
standalone directory, not the directory itself:

```bash
npm ci
npm run build:standalone
mkdir -p dist
(cd .next/standalone && zip -q -r ../../dist/premise-web.zip .)
```

For a local deployment, azd provisions the infrastructure and uploads that ZIP
without repackaging or rebuilding it:

```bash
azd provision --no-prompt
azd deploy web --from-package dist/premise-web.zip --no-prompt
```

Do not use plain `azd up` for this deployment. Its built-in Node.js packager
excludes the traced `node_modules` included by Next.js standalone output. The
explicit `--from-package` path preserves the complete, prebuilt artifact.

The GitHub Actions deployment uses the same `dist/premise-web.zip` artifact with
`az webapp deploy`. App Service only hosts the prebuilt output;
`SCM_DO_BUILD_DURING_DEPLOYMENT` remains disabled.

## Testing

- **Vitest** (`tests/`): schema, prompt, Markdown export, gateway error mapping,
  the `/api/brief` route, and the React components.
- **Playwright** (`e2e/`): one happy-path that intercepts `/api/brief`, so it runs
  without any Azure or APIM credentials.

The model boundary is always mocked in tests — CI never calls the cloud.

## Copilot customization in this repo

Everything that makes this a good agentic-development demo lives alongside the app:

| Artifact | Purpose |
| --- | --- |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Repo-wide rules, architecture, commands, guardrails. |
| [.github/instructions/](.github/instructions) | Scoped conventions for the frontend, the API/gateway, and tests. |
| [.github/prompts/](.github/prompts) | Reusable `implement` and `review` prompts. |
| [.github/agents/](.github/agents) | Custom agents from [awesome-copilot](https://github.com/github/awesome-copilot): Next.js, React, accessibility, and product-manager specialists. |
| [.github/skills/product-brief-quality/](.github/skills/product-brief-quality) | The brief rubric and the schema/prompt sync workflow. |
| [.github/ISSUE_TEMPLATE/feature_request.yml](.github/ISSUE_TEMPLATE/feature_request.yml) | A structured feature form suitable for Copilot coding agent. |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | Lint, typecheck, test, build the artifact, credential-free e2e, and a gated deploy job (OIDC → Bicep + artifact to App Service). |
| [.github/dependabot.yml](.github/dependabot.yml) | Grouped weekly npm and GitHub Actions dependency updates. |

## Configuration health

`GET /api/health` reports whether the gateway is configured (`modelConfigured`)
without exposing any values.

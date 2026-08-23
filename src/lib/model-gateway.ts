import "server-only";

import OpenAI from "openai";

import {
  productBriefJsonSchema,
  productBriefSchema,
  type BriefErrorCode,
  type BriefInput,
  type ProductBrief,
} from "@/lib/brief-schema";
import { buildBriefMessages } from "@/lib/product-brief-prompt";

/**
 * The app consumes the Foundry-hosted model through Azure API Management (APIM)
 * acting as an AI gateway. APIM mirrors the Azure OpenAI REST surface, applies
 * governance policies (token limits, metrics, content safety), and holds the
 * managed identity to the backend. The app authenticates to APIM with a
 * subscription key and never talks to Foundry directly.
 */

/** Application-level error carrying a safe, client-facing code and message. */
export class BriefError extends Error {
  constructor(
    readonly code: BriefErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "BriefError";
  }
}

const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_API_VERSION = "2024-10-21";
const SUBSCRIPTION_KEY_HEADER = "api-key";

interface GatewayConfig {
  gatewayUrl: string;
  subscriptionKey: string;
  deployment: string;
  apiVersion: string;
}

/** Reads gateway configuration without throwing, for health checks. */
export function getGatewayConfig(): GatewayConfig | null {
  const gatewayUrl = process.env.APIM_GATEWAY_URL?.trim();
  const subscriptionKey = process.env.APIM_SUBSCRIPTION_KEY?.trim();
  const deployment = process.env.APIM_MODEL_DEPLOYMENT_NAME?.trim();
  const apiVersion =
    process.env.APIM_API_VERSION?.trim() || DEFAULT_API_VERSION;

  if (!gatewayUrl || !subscriptionKey || !deployment) {
    return null;
  }
  return { gatewayUrl, subscriptionKey, deployment, apiVersion };
}

function requireConfig(): GatewayConfig {
  const config = getGatewayConfig();
  if (!config) {
    throw new BriefError(
      "not_configured",
      "AI-yhdyskäytävää ei ole määritetty. Aseta APIM_GATEWAY_URL, APIM_SUBSCRIPTION_KEY ja APIM_MODEL_DEPLOYMENT_NAME.",
    );
  }
  return config;
}

function createClient(config: GatewayConfig): OpenAI {
  // Tolerate a trailing slash and an already-included /openai segment so the
  // final path is always .../openai/deployments/<deployment>/chat/completions.
  const base = config.gatewayUrl
    .replace(/\/+$/, "")
    .replace(/\/openai$/i, "");
  const baseURL = `${base}/openai/deployments/${config.deployment}`;
  return new OpenAI({
    baseURL,
    apiKey: config.subscriptionKey,
    defaultQuery: { "api-version": config.apiVersion },
    // APIM authenticates via the api-key header and handles backend auth
    // itself, so drop the SDK's default Authorization: Bearer header.
    defaultHeaders: {
      [SUBSCRIPTION_KEY_HEADER]: config.subscriptionKey,
      Authorization: null,
    },
  });
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

function statusOf(error: unknown): number | undefined {
  return (error as { status?: number })?.status;
}

/** Logs gateway failures server-side only, never returned to the client. */
function logGatewayError(error: unknown): void {
  const err = error as {
    status?: number;
    code?: string;
    message?: string;
    error?: unknown;
  };
  console.error("[model-gateway] request failed", {
    status: err?.status,
    code: err?.code,
    message: err?.message,
    body: err?.error,
  });
}

/**
 * Calls the model through the APIM gateway and returns a validated brief.
 * All failure modes are normalized to BriefError so nothing internal leaks out.
 */
export async function generateBrief(
  input: BriefInput,
  options: { timeoutMs?: number } = {},
): Promise<ProductBrief> {
  const config = requireConfig();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let rawContent: string | null | undefined;
  try {
    const client = createClient(config);
    const completion = await client.chat.completions.create(
      {
        model: config.deployment,
        messages: buildBriefMessages(input),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "product_brief",
            strict: true,
            schema: productBriefJsonSchema,
          },
        },
      },
      { timeout: timeoutMs },
    );

    rawContent = completion.choices[0]?.message?.content;
  } catch (error) {
    if (error instanceof BriefError) {
      throw error;
    }
    logGatewayError(error);
    if (isAbortError(error)) {
      throw new BriefError(
        "timeout",
        "Mallin vastaus kesti liian kauan. Yritä uudelleen.",
      );
    }
    const status = statusOf(error);
    if (status === 401 || status === 403) {
      throw new BriefError(
        "unauthorized",
        "AI-yhdyskäytävä hylkäsi tilausavaimen. Tarkista APIM_SUBSCRIPTION_KEY ja sen käyttöoikeudet.",
      );
    }
    if (status === 429) {
      throw new BriefError(
        "rate_limited",
        "AI-yhdyskäytävä rajoittaa pyyntöjen määrää. Odota hetki ja yritä uudelleen.",
      );
    }
    throw new BriefError(
      "service_error",
      "AI-yhdyskäytävä palautti virheen. Yritä uudelleen.",
    );
  }

  if (!rawContent) {
    throw new BriefError(
      "invalid_model_output",
      "Malli palautti tyhjän vastauksen.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new BriefError(
      "invalid_model_output",
      "Mallin vastaus ei ollut kelvollista JSON-muotoa.",
    );
  }

  const result = productBriefSchema.safeParse(parsed);
  if (!result.success) {
    throw new BriefError(
      "invalid_model_output",
      "Mallin vastaus ei vastannut odotettua suunnitelman rakennetta.",
    );
  }

  return result.data;
}

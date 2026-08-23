import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validBrief, validInput } from "./fixtures";

const createMock = vi.fn();

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: createMock } };
  },
}));

async function loadModule() {
  return import("@/lib/model-gateway");
}

function modelResponse(content: string | null) {
  return { choices: [{ message: { content } }] };
}

describe("model-gateway", () => {
  beforeEach(() => {
    createMock.mockReset();
    process.env.APIM_GATEWAY_URL = "https://apim.example.net/ai";
    process.env.APIM_SUBSCRIPTION_KEY = "test-key";
    process.env.APIM_MODEL_DEPLOYMENT_NAME = "gpt-test";
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.APIM_GATEWAY_URL;
    delete process.env.APIM_SUBSCRIPTION_KEY;
    delete process.env.APIM_MODEL_DEPLOYMENT_NAME;
  });

  it("returns a validated brief on success", async () => {
    createMock.mockResolvedValue(modelResponse(JSON.stringify(validBrief)));
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).resolves.toEqual(validBrief);
  });

  it("reports not_configured when env vars are missing", async () => {
    delete process.env.APIM_GATEWAY_URL;
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "not_configured",
    });
  });

  it("maps 401 responses to unauthorized", async () => {
    createMock.mockRejectedValue(Object.assign(new Error("nope"), { status: 401 }));
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "unauthorized",
    });
  });

  it("maps 429 responses to rate_limited", async () => {
    createMock.mockRejectedValue(Object.assign(new Error("slow down"), { status: 429 }));
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "rate_limited",
    });
  });

  it("maps abort errors to timeout", async () => {
    const abort = new Error("aborted");
    abort.name = "AbortError";
    createMock.mockRejectedValue(abort);
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "timeout",
    });
  });

  it("maps other failures to service_error", async () => {
    createMock.mockRejectedValue(new Error("boom"));
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "service_error",
    });
  });

  it("rejects empty model content as invalid_model_output", async () => {
    createMock.mockResolvedValue(modelResponse(null));
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "invalid_model_output",
    });
  });

  it("rejects non-JSON model content as invalid_model_output", async () => {
    createMock.mockResolvedValue(modelResponse("not json at all"));
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "invalid_model_output",
    });
  });

  it("rejects off-schema model content as invalid_model_output", async () => {
    createMock.mockResolvedValue(modelResponse(JSON.stringify({ summary: "x" })));
    const { generateBrief } = await loadModule();
    await expect(generateBrief(validInput)).rejects.toMatchObject({
      code: "invalid_model_output",
    });
  });
});

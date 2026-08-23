import { beforeEach, describe, expect, it, vi } from "vitest";

import { validBrief, validInput } from "./fixtures";

const generateBriefMock = vi.fn();

class MockBriefError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

vi.mock("@/lib/model-gateway", () => ({
  generateBrief: generateBriefMock,
  BriefError: MockBriefError,
}));

function post(body: unknown, raw?: string) {
  return import("@/app/api/brief/route").then(({ POST }) =>
    POST(
      new Request("http://localhost/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: raw ?? JSON.stringify(body),
      }),
    ),
  );
}

describe("POST /api/brief", () => {
  beforeEach(() => {
    generateBriefMock.mockReset();
  });

  it("returns the brief on success", async () => {
    generateBriefMock.mockResolvedValue(validBrief);
    const response = await post(validInput);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, brief: validBrief });
  });

  it("returns 400 with field errors for invalid input", async () => {
    const response = await post({ ...validInput, productIdea: "short" });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.error.code).toBe("invalid_input");
    expect(data.error.fieldErrors).toHaveProperty("productIdea");
    expect(generateBriefMock).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed JSON body", async () => {
    const response = await post(undefined, "{ not valid json");
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("invalid_input");
  });

  it("maps a not_configured BriefError to 503", async () => {
    generateBriefMock.mockRejectedValue(
      new MockBriefError("not_configured", "no config"),
    );
    const response = await post(validInput);
    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data.error.code).toBe("not_configured");
  });

  it("maps a rate_limited BriefError to 429", async () => {
    generateBriefMock.mockRejectedValue(
      new MockBriefError("rate_limited", "slow down"),
    );
    const response = await post(validInput);
    expect(response.status).toBe(429);
  });

  it("maps an unexpected error to 502 service_error", async () => {
    generateBriefMock.mockRejectedValue(new Error("boom"));
    const response = await post(validInput);
    expect(response.status).toBe(502);
    const data = await response.json();
    expect(data.error.code).toBe("service_error");
  });
});

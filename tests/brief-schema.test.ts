import { describe, expect, it } from "vitest";

import {
  briefInputSchema,
  productBriefJsonSchema,
  productBriefSchema,
} from "@/lib/brief-schema";
import { validBrief, validInput } from "./fixtures";

describe("briefInputSchema", () => {
  it("accepts valid input and trims strings", () => {
    const result = briefInputSchema.safeParse({
      ...validInput,
      productIdea: `  ${validInput.productIdea}  `,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.productIdea).toBe(validInput.productIdea);
    }
  });

  it("defaults optional constraints to an empty string", () => {
    const { constraints: _constraints, ...withoutConstraints } = validInput;
    void _constraints;
    const result = briefInputSchema.safeParse(withoutConstraints);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.constraints).toBe("");
    }
  });

  it("defaults optional product context to an empty string", () => {
    const { productContext: _productContext, ...withoutContext } = validInput;
    void _productContext;
    const result = briefInputSchema.safeParse(withoutContext);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.productContext).toBe("");
    }
  });

  it("rejects product context beyond the length limit", () => {
    const result = briefInputSchema.safeParse({
      ...validInput,
      productContext: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path[0]).toBe("productContext");
    }
  });

  it("rejects an epic or feature description that is too short", () => {
    const result = briefInputSchema.safeParse({ ...validInput, productIdea: "too short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path[0]).toBe("productIdea");
    }
  });

  it("rejects empty target users", () => {
    const result = briefInputSchema.safeParse({ ...validInput, targetUsers: "" });
    expect(result.success).toBe(false);
  });
});

describe("productBriefSchema", () => {
  it("accepts a well-formed brief", () => {
    expect(productBriefSchema.safeParse(validBrief).success).toBe(true);
  });

  it("rejects an unknown priority value", () => {
    const broken = {
      ...validBrief,
      requirements: [{ title: "x", rationale: "y", priority: "urgent" }],
    };
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a brief without a problem", () => {
    const { problem: _problem, ...broken } = validBrief;
    void _problem;
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a desired outcome with no success indicators", () => {
    const broken = {
      ...validBrief,
      desiredOutcome: { ...validBrief.desiredOutcome, successIndicators: [] },
    };
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("keeps the JSON schema in parity with the Zod schema", () => {
    expect(productBriefJsonSchema.required).toContain("problem");
    expect(productBriefJsonSchema.required).toContain("desiredOutcome");
    expect(productBriefJsonSchema.properties.problem.required).toEqual([
      "statement",
      "currentState",
      "impact",
    ]);
    expect(productBriefJsonSchema.properties.desiredOutcome.required).toEqual([
      "statement",
      "successIndicators",
    ]);
  });

  it("rejects a brief with no requirements", () => {
    const broken = { ...validBrief, requirements: [] };
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });
});

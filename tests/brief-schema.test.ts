import { describe, expect, it } from "vitest";

import {
  briefInputSchema,
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

  it("rejects a brief with no requirements", () => {
    const broken = { ...validBrief, requirements: [] };
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });
});

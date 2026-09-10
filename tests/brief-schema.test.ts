import { describe, expect, it } from "vitest";

import {
  briefInputSchema,
  productBriefSchema,
} from "@/lib/brief-schema";
import { briefWithoutDependencies, validBrief, validInput } from "./fixtures";

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

  it("accepts a brief whose requirements declare no dependencies", () => {
    expect(productBriefSchema.safeParse(briefWithoutDependencies).success).toBe(true);
  });

  it("rejects an unknown priority value", () => {
    const broken = {
      ...validBrief,
      requirements: [
        { id: "R1", title: "x", rationale: "y", priority: "urgent", dependencies: [] },
      ],
    };
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a brief with no requirements", () => {
    const broken = { ...validBrief, requirements: [] };
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a requirement id that is off the R1, R2, ... scheme", () => {
    const broken = withRequirements([{ ...baseRequirement, id: "REQ-1" }]);
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects duplicate requirement ids", () => {
    const broken = withRequirements([baseRequirement, { ...baseRequirement }]);
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a dependency pointing at an unknown requirement id", () => {
    const broken = withRequirements([
      {
        ...baseRequirement,
        dependencies: [
          {
            type: "requirement",
            requirementId: "R9",
            description: "Depends on something that does not exist.",
            assumption: false,
          },
        ],
      },
    ]);
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a requirement that depends on itself", () => {
    const broken = withRequirements([
      {
        ...baseRequirement,
        dependencies: [
          {
            type: "requirement",
            requirementId: "R1",
            description: "Circular reference.",
            assumption: false,
          },
        ],
      },
    ]);
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a requirement dependency without a reference", () => {
    const broken = withRequirements([
      {
        ...baseRequirement,
        dependencies: [
          {
            type: "requirement",
            requirementId: null,
            description: "Missing reference.",
            assumption: false,
          },
        ],
      },
    ]);
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects an external dependency that carries a requirement reference", () => {
    const broken = withRequirements([
      {
        ...baseRequirement,
        dependencies: [
          {
            type: "external",
            requirementId: "R1",
            description: "External blockers cannot reference requirements.",
            assumption: false,
          },
        ],
      },
    ]);
    expect(productBriefSchema.safeParse(broken).success).toBe(false);
  });
});

const baseRequirement = {
  id: "R1",
  title: "Offline receipt capture",
  rationale: "Signal is unreliable at many sites.",
  priority: "must",
  dependencies: [],
};

function withRequirements(requirements: unknown[]) {
  return { ...validBrief, requirements };
}

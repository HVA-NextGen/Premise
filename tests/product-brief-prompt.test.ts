import { describe, expect, it } from "vitest";

import {
  BRIEF_SYSTEM_PROMPT,
  buildBriefMessages,
  buildBriefUserPrompt,
} from "@/lib/product-brief-prompt";
import { validInput } from "./fixtures";

describe("buildBriefUserPrompt", () => {
  it("includes every provided input field", () => {
    const prompt = buildBriefUserPrompt(validInput);
    expect(prompt).toContain(validInput.productIdea);
    expect(prompt).toContain(validInput.targetUsers);
    expect(prompt).toContain(validInput.evidence);
    expect(prompt).toContain(validInput.constraints);
  });

  it("notes when constraints are absent", () => {
    const prompt = buildBriefUserPrompt({ ...validInput, constraints: "" });
    expect(prompt).toContain("None provided.");
  });
});

describe("BRIEF_SYSTEM_PROMPT", () => {
  it("explains the requirement id scheme and dependency types", () => {
    expect(BRIEF_SYSTEM_PROMPT).toContain("R1, R2, R3");
    expect(BRIEF_SYSTEM_PROMPT).toContain("'external'");
    expect(BRIEF_SYSTEM_PROMPT).toContain("'unknown'");
  });

  it("forbids invented blockers and requires inferred ones to be assumptions", () => {
    expect(BRIEF_SYSTEM_PROMPT).toContain("Do not invent blockers.");
    expect(BRIEF_SYSTEM_PROMPT).toContain("'assumption' to true");
    expect(BRIEF_SYSTEM_PROMPT).toContain("current state, evidence, and constraints");
  });
});

describe("buildBriefMessages", () => {
  it("pairs the system prompt with the user prompt", () => {
    const messages = buildBriefMessages(validInput);
    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      role: "system",
      content: BRIEF_SYSTEM_PROMPT,
    });
    expect(messages[1].role).toBe("user");
  });
});

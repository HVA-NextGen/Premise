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
    expect(prompt).toContain(validInput.productContext);
  });

  it("tells the model not to assume capabilities when context is missing", () => {
    const prompt = buildBriefUserPrompt({ ...validInput, productContext: "" });
    expect(prompt).toContain("## Current product state");
    expect(prompt).toContain("Do not assume any current capabilities");
  });

  it("notes when constraints are absent", () => {
    const prompt = buildBriefUserPrompt({ ...validInput, constraints: "" });
    expect(prompt).toContain("None provided.");
  });
});

describe("BRIEF_SYSTEM_PROMPT", () => {
  it("separates problem from desired outcome and grounds both", () => {
    expect(BRIEF_SYSTEM_PROMPT).toContain("problem and the desired outcome");
    expect(BRIEF_SYSTEM_PROMPT).toContain("Never invent current capabilities.");
    expect(BRIEF_SYSTEM_PROMPT).toContain("record");
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

import { describe, expect, it } from "vitest";

import { briefToMarkdown } from "@/lib/brief-markdown";
import { validBrief, validInput } from "./fixtures";

describe("briefToMarkdown", () => {
  it("renders all sections as headings", () => {
    const markdown = briefToMarkdown(validBrief, validInput);
    expect(markdown).toContain("# Ominaisuussuunnitelma");
    expect(markdown).toContain("## Yhteenveto");
    expect(markdown).toContain("## Ongelma");
    expect(markdown).toContain("## Tavoiteltu lopputulos");
    expect(markdown).toContain("## Oletukset");
    expect(markdown).toContain("## Vaatimukset");
    expect(markdown).toContain("## Hyväksymiskriteerit");
    expect(markdown).toContain("## Riskit");
    expect(markdown).toContain("## Kokeilut");
  });

  it("preserves the problem and the desired outcome", () => {
    const markdown = briefToMarkdown(validBrief, validInput);
    expect(markdown).toContain(validBrief.problem.statement);
    expect(markdown).toContain(`**Nykytila:** ${validBrief.problem.currentState}`);
    expect(markdown).toContain(`**Vaikutus:** ${validBrief.problem.impact}`);
    expect(markdown).toContain(validBrief.desiredOutcome.statement);
    expect(markdown).toContain(validBrief.desiredOutcome.successIndicators[0]);
  });

  it("includes the supplied product context", () => {
    const markdown = briefToMarkdown(validBrief, validInput);
    expect(markdown).toContain(
      `**Tuotteen nykytila:** ${validInput.productContext}`,
    );
  });

  it("uppercases priority and severity tags", () => {
    const markdown = briefToMarkdown(validBrief);
    expect(markdown).toContain("[PAKOLLINEN]");
    expect(markdown).toContain("[KESKITASO]");
  });

  it("includes the epic or feature when input is provided", () => {
    const markdown = briefToMarkdown(validBrief, validInput);
    expect(markdown).toContain(validInput.productIdea);
  });

  it("omits the epic or feature line when no input is given", () => {
    const markdown = briefToMarkdown(validBrief);
    expect(markdown).not.toContain("**Epic tai ominaisuus:**");
  });

  it("ends with a single trailing newline", () => {
    const markdown = briefToMarkdown(validBrief);
    expect(markdown.endsWith("\n")).toBe(true);
    expect(markdown.endsWith("\n\n")).toBe(false);
  });
});

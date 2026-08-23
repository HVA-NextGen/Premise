import { describe, expect, it } from "vitest";

import { briefToMarkdown } from "@/lib/brief-markdown";
import { validBrief, validInput } from "./fixtures";

describe("briefToMarkdown", () => {
  it("renders all sections as headings", () => {
    const markdown = briefToMarkdown(validBrief, validInput);
    expect(markdown).toContain("# Ominaisuussuunnitelma");
    expect(markdown).toContain("## Yhteenveto");
    expect(markdown).toContain("## Oletukset");
    expect(markdown).toContain("## Vaatimukset");
    expect(markdown).toContain("## Hyväksymiskriteerit");
    expect(markdown).toContain("## Riskit");
    expect(markdown).toContain("## Kokeilut");
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
